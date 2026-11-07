import { beforeEach, describe, expect, it, vi } from "vitest";

// server-only is a no-op outside Next; stub it so lib/notify and the runner import in vitest.
vi.mock("server-only", () => ({}));

import { MemoryStore } from "@/lib/db/memory-store";
import { DEMO_IDS } from "@/lib/db/seed";
import { STEP_INTERVAL_MS, initialSchedule } from "@/lib/escalation-ladder";
import { acknowledgeEvent, runEscalationTick } from "@/lib/escalation-runner";
import { notifyRelatives, alertsUrlFor } from "@/lib/notify";

const g = globalThis as unknown as { __careCopilotMemory?: unknown };

async function createEmergency(store: MemoryStore) {
  const ctx = (await store.getSeniorById(DEMO_IDS.senior))!;
  const event = await store.createEmergencyEvent({
    senior_id: ctx.senior.id,
    level: "emergency",
    reason: "fall, cannot get up",
    quote: "Ich bin gestürzt",
    source: "manual_button",
  });
  const notified = await notifyRelatives({
    senior: ctx.senior,
    relatives: ctx.relatives,
    kind: "emergency",
    reason: event.reason,
    quote: event.quote,
    alertsUrl: alertsUrlFor(ctx.family.id),
    eventId: event.id,
  });
  const schedule = initialSchedule(event, ctx.relatives, ctx.family, new Date());
  return (await store.updateEmergencyEvent(event.id, { notified, status: "relatives_notified", ...schedule }))!;
}

describe("escalation runner (demo mode, in-memory store)", () => {
  beforeEach(() => {
    delete g.__careCopilotMemory;
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("schedules the first step and climbs the ladder tick by tick", async () => {
    const store = new MemoryStore();
    const event = await createEmergency(store);
    expect(event.escalation_step).toBe(0);
    expect(event.next_step_at).not.toBeNull();

    // Not due yet
    expect(await runEscalationTick(new Date())).toEqual([]);

    // Demo family: Anna (p1, notify_call) was "called" at t=0 → step 1 calls Thomas
    const t1 = new Date(new Date(event.next_step_at!).getTime() + 1);
    const r1 = await runEscalationTick(t1);
    expect(r1).toHaveLength(1);
    expect(r1[0].action).toBe("call_relative");
    let e = (await store.getEmergencyEvent(event.id))!;
    expect(e.escalation_step).toBe(1);
    expect(e.notified.at(-1)).toMatchObject({ channel: "call", status: "demo", name: "Thomas" });

    // step 2: fallback number
    const t2 = new Date(t1.getTime() + STEP_INTERVAL_MS + 1);
    const r2 = await runEscalationTick(t2);
    expect(r2[0].action).toBe("call_fallback");
    e = (await store.getEmergencyEvent(event.id))!;
    expect(e.notified.at(-1)).toMatchObject({ channel: "call", status: "demo", relative_id: null });

    // step 3: nobody confirmed → SMS (demo) to everyone, ladder ends
    const t3 = new Date(t2.getTime() + STEP_INTERVAL_MS + 1);
    const r3 = await runEscalationTick(t3);
    expect(r3[0].action).toBe("nobody_confirmed");
    expect(r3[0].nextStepAt).toBeNull();
    e = (await store.getEmergencyEvent(event.id))!;
    expect(e.next_step_at).toBeNull();
    expect(e.notified.filter((n) => n.detail?.includes("Niemand hat bestätigt"))).toHaveLength(2);

    // nothing more to do
    expect(await runEscalationTick(new Date(t3.getTime() + STEP_INTERVAL_MS))).toEqual([]);
  });

  it("acknowledge stops the ladder and tells the other relatives", async () => {
    const store = new MemoryStore();
    const event = await createEmergency(store);
    const updated = await acknowledgeEvent(event, DEMO_IDS.anna);
    expect(updated.status).toBe("acknowledged");
    expect(updated.acknowledged_by).toBe(DEMO_IDS.anna);
    expect(updated.next_step_at).toBeNull();
    const msgs = updated.notified.filter((n) => n.detail?.includes("Anna kümmert sich um Maria"));
    expect(msgs.map((m) => m.name)).toEqual(["Thomas"]);
    expect(await runEscalationTick(new Date(Date.now() + 10 * STEP_INTERVAL_MS))).toEqual([]);
    // idempotent
    const again = await acknowledgeEvent(updated, DEMO_IDS.thomas);
    expect(again.acknowledged_by).toBe(DEMO_IDS.anna);
  });

  it("never schedules a warning", async () => {
    const store = new MemoryStore();
    const ctx = (await store.getSeniorById(DEMO_IDS.senior))!;
    const event = await store.createEmergencyEvent({ senior_id: ctx.senior.id, level: "warning", reason: "dizzy", quote: null, source: "agent_tool" });
    expect(initialSchedule(event, ctx.relatives, ctx.family, new Date()).next_step_at).toBeNull();
  });
});
