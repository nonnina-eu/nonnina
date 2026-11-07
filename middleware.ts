import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * One middleware for the whole deployment (landing page + product).
 *
 * Product routes (app/(product)/*): no locale prefix.
 * - /app/*      family area: Supabase session required (demo mode: the signed demo cookie).
 *               /app/join is public because the invite link itself establishes the session.
 * - /helpers/*  public marketplace: only keep the Supabase session fresh, never redirect.
 * - everything else (/demo, /senior, /login, /auth, /family): passed through untouched.
 *
 * Landing page (app/[locale]/*): English lives at "/", German at "/de", Italian at "/it".
 * - "/en/..." redirects to the unprefixed URL (one canonical URL per page).
 * - Unprefixed paths are rewritten internally to "/en/...".
 * - On the home page only, first-time visitors whose browser prefers German or Italian
 *   are redirected; an explicit choice in the switcher is stored in a cookie.
 * - The automatic redirect sets no cookie: it is recomputed from the browser on each visit,
 *   so the only cookie is the one the visitor asks for (see the cookie policy).
 */
const LOCALES = ["en", "de", "it"];
const LOCALE_COOKIE = "nonnina-locale";
const DEMO_COOKIE = "nonnina_family";
const PRODUCT_ROOTS = new Set(["app", "auth", "demo", "family", "helpers", "login", "senior"]);

function hasSupabase(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";

  if (PRODUCT_ROOTS.has(first)) return productMiddleware(request, first);
  return localeMiddleware(request, first);
}

async function productMiddleware(request: NextRequest, first: string) {
  const { pathname, search } = request.nextUrl;

  if (first === "helpers") {
    return hasSupabase() ? (await updateSession(request)).response : NextResponse.next();
  }
  if (first !== "app") return NextResponse.next();

  const isJoin = pathname.startsWith("/app/join");
  const loginUrl = new URL(`/login?next=${encodeURIComponent(pathname + search)}`, request.url);

  if (hasSupabase()) {
    const { response, user } = await updateSession(request);
    if (!user && !isJoin) return NextResponse.redirect(loginUrl);
    return response;
  }
  if (!isJoin && !request.cookies.get(DEMO_COOKIE)?.value) return NextResponse.redirect(loginUrl);
  return NextResponse.next();
}

function localeMiddleware(request: NextRequest, first: string) {
  const { pathname } = request.nextUrl;

  if (first === "en") {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/en/, "") || "/";
    return NextResponse.redirect(url, 308);
  }
  if (LOCALES.includes(first)) return withLocale(request, first);

  if (pathname === "/") {
    const saved = request.cookies.get(LOCALE_COOKIE)?.value;
    const preferred = saved && LOCALES.includes(saved) ? saved : preferredLocale(request.headers.get("accept-language"));
    if (preferred && preferred !== "en") {
      const url = request.nextUrl.clone();
      url.pathname = `/${preferred}`;
      return NextResponse.redirect(url, 307);
    }
  }

  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname}`;
  return NextResponse.rewrite(url, { request: { headers: localeHeaders(request, "en") } });
}

/** Exposes the locale to server components (used by the localized 404 page). */
function localeHeaders(request: NextRequest, locale: string): Headers {
  const headers = new Headers(request.headers);
  headers.set("x-locale", locale);
  return headers;
}

function withLocale(request: NextRequest, locale: string) {
  return NextResponse.next({ request: { headers: localeHeaders(request, locale) } });
}

function preferredLocale(header: string | null): string | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => /^\s*q\s*=\s*([\d.]+)/.exec(p)?.[1]).find(Boolean);
      return { lang: tag.trim().slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter((r) => r.q > 0)
    .sort((a, b) => b.q - a.q);
  return ranked.find((r) => LOCALES.includes(r.lang))?.lang ?? null;
}

export const config = {
  // Skip API routes, Next internals and any file with an extension (images, icons, robots…).
  matcher: ["/((?!api(?:/|$)|_next|.*\\..*).*)"],
};
