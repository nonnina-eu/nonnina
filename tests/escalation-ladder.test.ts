import { describe, expect, it } from "vitest";
import type { EmergencyEvent, Family, Relative } from "@/lib/db/types";
import { STEP_INTERVAL_MS, initialSchedule, ladderActions, planNextStep } from "@/lib/escalation-ladder";

const now = new Date("2026-11-07T10:00:00Z");
const family = (fallback: string | null = "+4915100000003"): Family => ({
  id: "f1",
  name: "Weber",
  email: null,
  fallback_phone: fallback,
  created_at: now.toISOString(),
});
const rel = (id: string, priority: number, phone: string | null = `+49151000000${priority}`, notify_call = false): Relative => ({
  id,
  family_id: "f1",
  name: id,
  relation: "child",
  phone,
  email: null,
  notify_sms: true,
  notify_call,
  priority,
  user_id: null,
});
const event = (step: number, level: EmergencyEvent["level"] = "emergency"): EmergencyEvent => ({
  id: "e1",
  senior_id: "s1",
  level,
  reason: "fall",
  quote: null,
  source: "manual_button",
  status: "relatives_notified",
  notified: [],
  escalation_step: step,
  next_step_at: null,
  acknowledged_by: null,
  created_at: now.toISOString(),
  updated_at: now.toISOString(),
});

describe("ladderActions", () => {
  it("orders relatives by priority, then fallback, then nobody_confirmed", () => {
    const actions = ladderActions([rel("thomas", 2), rel("anna", 1)], family());
    expect(actions.map((a) => (a.kind === "call_relative" ? a.relative.id : a.kind))).toEqual([
      "anna",
      "thomas",
      "call_fallback",
      "nobody_confirmed",
    ]);
  });

  it("skips the priority-1 relative when they were already called at t=0", () => {
    const actions = ladderActions([rel("anna", 1, "+491", true), rel("thomas", 2)], family());
    expect(actions.map((a) => (a.kind === "call_relative" ? a.relative.id : a.kind))).toEqual([
      "thomas",
      "call_fallback",
      "nobody_confirmed",
    ]);
  });

  it("skips relatives without a phone and the fallback when unset", () => {
    const actions = ladderActions([rel("anna", 1, null), rel("thomas", 2)], family(null));
    expect(actions.map((a) => a.kind)).toEqual(["call_relative", "nobody_confirmed"]);
  });

  it("is empty when nobody can be reached", () => {
    expect(ladderActions([rel("anna", 1, null)], family(null))).toEqual([]);
  });
});

describe("planNextStep", () => {
  const relatives = [rel("anna", 1, "+491", true), rel("thomas", 2), rel("lisa", 3)];

  it("walks the ladder step by step and ends with done", () => {
    const p1 = planNextStep(event(0), relatives, family(), now);
    expect(p1.action).toMatchObject({ kind: "call_relative", relative: { id: "thomas" } });
    expect(p1.nextStep).toBe(1);
    expect(p1.nextStepAt).toBe(new Date(now.getTime() + STEP_INTERVAL_MS).toISOString());

    const p2 = planNextStep(event(1), relatives, family(), now);
    expect(p2.action).toMatchObject({ kind: "call_relative", relative: { id: "lisa" } });

    const p3 = planNextStep(event(2), relatives, family(), now);
    expect(p3.action).toEqual({ kind: "call_fallback", phone: "+4915100000003" });

    const p4 = planNextStep(event(3), relatives, family(), now);
    expect(p4.action).toEqual({ kind: "nobody_confirmed" });
    expect(p4.nextStep).toBe(4);
    expect(p4.nextStepAt).toBeNull();

    const p5 = planNextStep(event(4), relatives, family(), now);
    expect(p5.action).toEqual({ kind: "done" });
    expect(p5.nextStep).toBe(4);
    expect(p5.nextStepAt).toBeNull();
  });

  it("goes straight to nobody_confirmed when only the initial call was possible", () => {
    const plan = planNextStep(event(0), [rel("anna", 1, "+491", true)], family(null), now);
    expect(plan.action).toEqual({ kind: "nobody_confirmed" });
    expect(plan.nextStepAt).toBeNull();
  });
});

describe("initialSchedule", () => {
  it("schedules the first step 90 s later for an emergency", () => {
    const s = initialSchedule(event(0), [rel("anna", 1), rel("thomas", 2)], family(), now);
    expect(s).toEqual({ escalation_step: 0, next_step_at: new Date(now.getTime() + STEP_INTERVAL_MS).toISOString() });
  });

  it("never schedules a warning", () => {
    expect(initialSchedule(event(0, "warning"), [rel("anna", 1)], family(), now)).toEqual({ escalation_step: 0, next_step_at: null });
  });

  it("does not schedule when nobody can be reached", () => {
    expect(initialSchedule(event(0), [rel("anna", 1, null)], family(null), now)).toEqual({ escalation_step: 0, next_step_at: null });
  });
});
