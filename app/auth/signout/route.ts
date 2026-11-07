import { NextResponse } from "next/server";
import { authMode, clearDemoMemberCookie } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (authMode() === "supabase") {
    const supabase = await createClient();
    await supabase?.auth.signOut();
  } else {
    await clearDemoMemberCookie();
  }
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
