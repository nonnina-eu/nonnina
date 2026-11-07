import { beforeEach, describe, expect, it } from "vitest";
import { MemoryStore } from "@/lib/db/memory-store";
import { DEMO_IDS, DEMO_TOKEN, DEMO_TOKEN_IT } from "@/lib/db/seed";

const g = globalThis as unknown as { __careCopilotMemory?: unknown };

function fresh() {
  delete g.__careCopilotMemory;
  return new MemoryStore();
}

describe("MemoryStore – family management", () => {
  let store: MemoryStore;
  beforeEach(() => {
    store = fresh();
  });

  it("seeds the demo family with fallback phone and unlinked relatives", async () => {
    const ctx = await store.getSeniorByToken(DEMO_TOKEN);
    expect(ctx?.family.fallback_phone).toMatch(/^\+/);
    expect(ctx?.relatives.every((r) => r.user_id === null)).toBe(true);
  });

  it("creates a family, senior and relative and resolves the family for a linked user", async () => {
    const family = await store.createFamily({ name: "Rossi", email: null, fallback_phone: "+393331234567" });
    const senior = await store.createSenior({
      family_id: family.id,
      first_name: "Giulia",
      language: "it",
      city: "Torino",
      address_note: null,
      care_level: 2,
      medication_times: [{ time: "08:00", label: "Pillole" }],
    });
    expect(senior.device_token).toMatch(/^[0-9a-f]{24}$/);
    const relative = await store.createRelative({
      family_id: family.id,
      name: "Luca",
      relation: "son",
      phone: "+393331234568",
      email: null,
      notify_sms: true,
      notify_call: true,
      priority: 1,
      user_id: null,
    });

    expect(await store.getFamilyForUser("user-1")).toBeNull();
    const linked = await store.linkRelativeToUser(relative.id, "user-1");
    expect(linked?.user_id).toBe("user-1");

    const overview = await store.getFamilyForUser("user-1");
    expect(overview?.family.id).toBe(family.id);
    expect(overview?.seniors.map((s) => s.id)).toEqual([senior.id]);
    expect(overview?.relatives.map((r) => r.id)).toEqual([relative.id]);

    const byToken = await store.getSeniorByToken(senior.device_token);
    expect(byToken?.family.name).toBe("Rossi");
  });

  it("rotates the device token so the old one no longer resolves", async () => {
    const before = await store.getSeniorByToken(DEMO_TOKEN);
    expect(before).not.toBeNull();
    const rotated = await store.rotateDeviceToken(DEMO_IDS.senior);
    expect(rotated?.device_token).not.toBe(DEMO_TOKEN);
    expect(await store.getSeniorByToken(DEMO_TOKEN)).toBeNull();
    expect((await store.getSeniorByToken(rotated!.device_token))?.senior.id).toBe(DEMO_IDS.senior);
  });

  it("updates and deletes relatives", async () => {
    const updated = await store.updateRelative(DEMO_IDS.thomas, { priority: 3, notify_call: true });
    expect(updated?.priority).toBe(3);
    await store.deleteRelative(DEMO_IDS.thomas);
    const overview = await store.getFamilyOverview(DEMO_IDS.family);
    expect(overview?.relatives.map((r) => r.id)).toEqual([DEMO_IDS.anna]);
    expect(await store.getRelative(DEMO_IDS.thomas)).toBeNull();
  });
});

describe("MemoryStore – escalation and help requests", () => {
  let store: MemoryStore;
  beforeEach(() => {
    store = fresh();
  });

  it("initialises escalation columns on new events", async () => {
    const event = await store.createEmergencyEvent({
      senior_id: DEMO_IDS.senior,
      level: "emergency",
      reason: "fall",
      quote: null,
      source: "manual_button",
    });
    expect(event.escalation_step).toBe(0);
    expect(event.next_step_at).toBeNull();
    expect(event.acknowledged_by).toBeNull();
  });

  it("returns only due, live, emergency-level events ordered by next_step_at", async () => {
    const now = new Date("2026-11-07T12:00:00Z");
    const mk = (reason: string, level: "emergency" | "warning" = "emergency") =>
      store.createEmergencyEvent({ senior_id: DEMO_IDS.senior, level, reason, quote: null, source: "manual_button" });

    const later = await mk("later");
    const earlier = await mk("earlier");
    const future = await mk("future");
    const warning = await mk("warning", "warning");
    const acked = await mk("acked");
    const noTimer = await mk("no timer");

    await store.updateEmergencyEvent(later.id, { status: "relatives_notified", next_step_at: "2026-11-07T11:59:00Z" });
    await store.updateEmergencyEvent(earlier.id, { status: "relatives_notified", next_step_at: "2026-11-07T11:50:00Z" });
    await store.updateEmergencyEvent(future.id, { status: "relatives_notified", next_step_at: "2026-11-07T12:01:00Z" });
    await store.updateEmergencyEvent(warning.id, { status: "relatives_notified", next_step_at: "2026-11-07T11:00:00Z" });
    await store.updateEmergencyEvent(acked.id, { status: "acknowledged", next_step_at: "2026-11-07T11:00:00Z", acknowledged_by: DEMO_IDS.anna });
    expect(noTimer.next_step_at).toBeNull();

    const due = await store.findEventsDueForEscalation(now);
    expect(due.map((e) => e.reason)).toEqual(["earlier", "later"]);
    expect((await store.findEventsDueForEscalation(now, 1)).map((e) => e.reason)).toEqual(["earlier"]);
  });

  it("resolves help requests", async () => {
    const req = await store.createHelpRequest({ senior_id: DEMO_IDS.senior, category: "daily_help", summary: "Shopping", status: "escalated" });
    expect(req.resolved_at).toBeNull();
    const at = new Date().toISOString();
    const done = await store.updateHelpRequest(req.id, { status: "matched", resolved_at: at });
    expect(done?.status).toBe("matched");
    expect(done?.resolved_at).toBe(at);
    expect(await store.updateHelpRequest("missing", { status: "open" })).toBeNull();
  });

  it("acknowledges a help request and finds the latest taken, unresolved one for the tablet", async () => {
    const since = new Date(Date.now() - 60_000);
    const req = await store.createHelpRequest({ senior_id: DEMO_IDS.senior, category: "legal", summary: "Brief der Pflegekasse", status: "escalated" });
    expect(req.acknowledged_by).toBeNull();
    expect(req.acknowledged_at).toBeNull();
    expect(await store.findAcknowledgedHelpRequest(DEMO_IDS.senior, since)).toBeNull();

    const at = new Date().toISOString();
    const taken = await store.updateHelpRequest(req.id, { acknowledged_by: DEMO_IDS.anna, acknowledged_at: at });
    expect(taken?.acknowledged_by).toBe(DEMO_IDS.anna);
    expect(taken?.status).toBe("escalated");

    const found = await store.findAcknowledgedHelpRequest(DEMO_IDS.senior, since);
    expect(found?.id).toBe(req.id);
    // other senior and a later `since` see nothing
    expect(await store.findAcknowledgedHelpRequest(DEMO_IDS.giulia, since)).toBeNull();
    expect(await store.findAcknowledgedHelpRequest(DEMO_IDS.senior, new Date(Date.now() + 60_000))).toBeNull();

    // marked done → no longer shown on the tablet
    await store.updateHelpRequest(req.id, { resolved_at: new Date().toISOString() });
    expect(await store.findAcknowledgedHelpRequest(DEMO_IDS.senior, since)).toBeNull();
  });

  it("returns the most recently acknowledged request first", async () => {
    const since = new Date(Date.now() - 60_000);
    const a = await store.createHelpRequest({ senior_id: DEMO_IDS.senior, category: "daily_help", summary: "Einkauf", status: "open" });
    const b = await store.createHelpRequest({ senior_id: DEMO_IDS.senior, category: "money", summary: "Rechnung", status: "open" });
    await store.updateHelpRequest(b.id, { acknowledged_by: DEMO_IDS.thomas, acknowledged_at: new Date(Date.now() - 10_000).toISOString() });
    await store.updateHelpRequest(a.id, { acknowledged_by: DEMO_IDS.anna, acknowledged_at: new Date().toISOString() });
    expect((await store.findAcknowledgedHelpRequest(DEMO_IDS.senior, since))?.id).toBe(a.id);
  });

  it("seeds Giulia (Italian, Stuttgart) in the demo family", async () => {
    const ctx = await store.getSeniorByToken(DEMO_TOKEN_IT);
    expect(ctx?.senior.first_name).toBe("Giulia");
    expect(ctx?.senior.language).toBe("it");
    expect(ctx?.senior.city).toBe("Stuttgart");
    expect(ctx?.family.id).toBe(DEMO_IDS.family);
    expect(ctx?.senior.medication_times.map((m) => m.time)).toEqual(["08:00", "18:00"]);
    const feed = await store.getFamilyFeed(DEMO_IDS.family);
    expect(feed?.seniors.map((s) => s.first_name)).toEqual(["Maria", "Giulia"]);
  });
});
