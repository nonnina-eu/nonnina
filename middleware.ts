import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const DEMO_COOKIE = "nonnina_family";

function hasSupabase(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Protects the family area (/app/*). Supabase mode: refresh the session and require a user.
 * Demo mode (no keys): require the signed demo cookie; the pages verify its signature.
 * /app/join is public because the invite link itself establishes the session.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Marketplace (/helpers/*) is public: only keep the Supabase session fresh, never redirect.
  // The helper pages check the helper session themselves.
  if (pathname === "/helpers" || pathname.startsWith("/helpers/")) {
    return hasSupabase() ? (await updateSession(request)).response : NextResponse.next();
  }

  const isJoin = pathname.startsWith("/app/join");
  const loginUrl = new URL(`/login?next=${encodeURIComponent(pathname + search)}`, request.url);

  if (hasSupabase()) {
    const { response, user } = await updateSession(request);
    if (!user && !isJoin) return NextResponse.redirect(loginUrl);
    return response;
  }

  if (!isJoin && !request.cookies.get(DEMO_COOKIE)?.value) {
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/helpers", "/helpers/:path*"],
};
