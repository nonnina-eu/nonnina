import { NextResponse } from "next/server";
import { runEscalationTick } from "@/lib/escalation-runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/escalate – Vercel Cron, every minute (vercel.json).
 * Moves every due emergency one step up the ladder. Protected by CRON_SECRET in production.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  if (secret) {
    if (auth !== `Bearer ${secret}`) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  } else if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ ok: false, error: "CRON_SECRET is not configured" }, { status: 401 });
  }

  const processed = await runEscalationTick(new Date());
  return NextResponse.json({ ok: true, processed, at: new Date().toISOString() });
}
