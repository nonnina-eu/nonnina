import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["en", "de", "it"];
const COOKIE = "nonnina-locale";

/**
 * English lives at "/", German at "/de", Italian at "/it".
 * - "/en/..." redirects to the unprefixed URL (one canonical URL per page).
 * - Unprefixed paths are rewritten internally to "/en/...".
 * - On the home page only, first-time visitors whose browser prefers German or Italian
 *   are redirected once; an explicit choice in the switcher is stored in a cookie.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";

  if (first === "en") {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/en/, "") || "/";
    return NextResponse.redirect(url, 308);
  }
  if (LOCALES.includes(first)) return NextResponse.next();

  if (pathname === "/" && !request.cookies.has(COOKIE)) {
    const preferred = preferredLocale(request.headers.get("accept-language"));
    if (preferred && preferred !== "en") {
      const url = request.nextUrl.clone();
      url.pathname = `/${preferred}`;
      const res = NextResponse.redirect(url, 307);
      res.cookies.set(COOKIE, preferred, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
      return res;
    }
  }

  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname}`;
  return NextResponse.rewrite(url);
}

function preferredLocale(header: string | null): string | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return ranked.find((r) => LOCALES.includes(r.lang))?.lang ?? null;
}

export const config = {
  // Skip API routes, Next internals and any file with an extension (images, icons, robots…).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
