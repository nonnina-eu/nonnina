import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/lib/db";

/** GET /senior/open?code=… – checks the tablet code and opens that senior screen. */
export async function GET(request: NextRequest) {
  const code = (request.nextUrl.searchParams.get("code") ?? "").trim().toLowerCase().replace(/\s+/g, "-");
  const valid = /^[a-z0-9-]{3,120}$/.test(code) && (await getStore().getSeniorByToken(code));
  const target = valid ? `/senior/${encodeURIComponent(code)}` : `/senior?error=1${code ? `&code=${encodeURIComponent(code)}` : ""}`;
  return NextResponse.redirect(new URL(target, request.url), 303);
}
