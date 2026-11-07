import { NextResponse } from "next/server";
import { clientIp, jsonError, parseJson } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { waitlistSchema } from "@/lib/validation";
import { addToWaitlist } from "@/lib/waitlist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/waitlist – landing page sign-ups. */
export async function POST(request: Request) {
  if (!rateLimit(`waitlist:${clientIp(request)}`, 5, 60_000).ok) {
    return jsonError(429, "Too many attempts, please try again in a minute");
  }
  const parsed = await parseJson(request, waitlistSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const result = await addToWaitlist(parsed.data);
    return NextResponse.json({ ok: true, created: result.created }, { status: result.created ? 201 : 200 });
  } catch (e) {
    console.error("[waitlist]", e);
    return jsonError(500, "Could not save your sign-up, please try again");
  }
}
