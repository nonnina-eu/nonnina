import "server-only";
import { DEMO_IDS, getStore } from "@/lib/db";
import { runEscalationTick } from "@/lib/escalation-runner";

export { demoSecretOk } from "@/lib/demo-secret";

/** Clears events, help requests and sessions of the demo family only. */
export async function resetDemo(): Promise<{ ok: true }> {
  await getStore().resetDemoData(DEMO_IDS.family);
  return { ok: true };
}

/** Makes every live emergency of the demo family due now and runs one escalation tick. */
export async function escalateDemo() {
  const store = getStore();
  const feed = await store.getFamilyFeed(DEMO_IDS.family, 20);
  if (!feed) return { ok: false as const, error: "demo family not found" };
  const now = new Date();
  const live = feed.events.filter(
    (e) => e.level === "emergency" && (e.status === "open" || e.status === "relatives_notified") && e.next_step_at !== null,
  );
  for (const e of live) await store.updateEmergencyEvent(e.id, { next_step_at: now.toISOString() });
  const processed = await runEscalationTick(now);
  return { ok: true as const, advanced: live.length, processed };
}
