import { NextResponse } from "next/server";
import { DEMO_IDS, getStore } from "@/lib/db";
import { runEscalationTick } from "@/lib/escalation-runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/demo/escalate – demo only: makes every live emergency of the demo family due now
 * and runs one escalation tick, so the 90 s ladder can be shown without waiting.
 */
export async function POST() {
  const store = getStore();
  const feed = await store.getFamilyFeed(DEMO_IDS.family, 20);
  if (!feed) return NextResponse.json({ ok: false, error: "demo family not found" }, { status: 404 });
  const now = new Date();
  const live = feed.events.filter(
    (e) => e.level === "emergency" && (e.status === "open" || e.status === "relatives_notified") && e.next_step_at !== null,
  );
  for (const e of live) {
    await store.updateEmergencyEvent(e.id, { next_step_at: now.toISOString() });
  }
  const processed = await runEscalationTick(now);
  return NextResponse.json({ ok: true, advanced: live.length, processed });
}
