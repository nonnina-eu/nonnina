import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["en", "de", "it"];
const COOKIE = "nonnina-locale";

/**
 * English lives at "/", German at "/de", Italian at "/it".
 * - "/en/..." redirects to the unprefixed URL (one canonical URL per page).
 * - Unprefixed paths are rewritten internally to "/en/...".
 * - On the home page only, first-time visitors whose browser prefers German or Italian
 *   are redirected; an explicit choice in the switcher is stored in a cookie.
 * - The automatic redirect sets no cookie: it is recomputed from the browser on each visit,
 *   so the only cookie is the one the visitor asks for (see the cookie policy).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";

  if (first === "en") {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/en/, "") || "/";
    return NextResponse.redirect(url, 308);
  }
  if (LOCALES.includes(first)) return withLocale(request, first);

  if (pathname === "/") {
    const saved = request.cookies.get(COOKIE)?.value;
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
