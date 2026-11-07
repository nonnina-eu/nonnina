import { NextResponse } from "next/server";
import { isMarketplaceLocale, LOCALE_COOKIE } from "@/lib/i18n/marketplace";

/** GET /helpers/lang?l=de&next=/helpers – sets the marketplace language cookie and goes back. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const l = url.searchParams.get("l");
  const nextParam = url.searchParams.get("next") ?? "/helpers";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/helpers";
  const response = NextResponse.redirect(new URL(next, url.origin), { status: 303 });
  if (isMarketplaceLocale(l)) {
    response.cookies.set(LOCALE_COOKIE, l, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  }
  return response;
}
