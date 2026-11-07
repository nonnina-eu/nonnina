import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { clientIp, jsonError, parseJson } from "@/lib/api";
import { waitlistSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/waitlist – landing page sign-ups. */
export async function POST(request: Request) {
  if (!rateLimit(`waitlist:${clientIp(request)}`, 5, 60_000).ok) {
    return jsonError(429, "Too many attempts, please try again in a minute");
  }
  const parsed = await parseJson(request, waitlistSchema);
  if (!parsed.ok) return parsed.response;
  const { email, role, city, message } = parsed.data;

  const result = await getStore().addToWaitlist({
    email,
    role,
    city: city || null,
    message: message || null,
  });

  return NextResponse.json({ ok: true, created: result.created }, { status: result.created ? 201 : 200 });
}
