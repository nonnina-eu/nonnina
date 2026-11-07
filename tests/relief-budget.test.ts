import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DEMO_HELPER_IDS, DEMO_IDS, DEMO_JOB_IDS, demoHelperRequests, demoHelpers, demoSenior } from "@/lib/db/seed";
import {
  addMonths,
  berlinDate,
  berlinMonth,
  completionPatch,
  computeReliefBudget,
  defaultJobAmount,
  jobMonth,
  RELIEF_AMOUNT_EUR,
  recentMonths,
  type ReliefJob,
} from "@/lib/relief-budget";
import { completeJobSchema } from "@/lib/validation";
import { toPublicHelper } from "@/lib/marketplace";

let n = 0;
function job(service_date: string, amount_eur: number | null, relief_eligible = true, completed_at: string | null = null): ReliefJob {
  n += 1;
  return { id: `job-${String(n).padStart(3, "0")}`, service_date, completed_at, amount_eur, relief_eligible };
}

describe("relief amount – facts", () => {
  it("uses the rule-table amount of 131 € per month", () => {
    expect(RELIEF_AMOUNT_EUR).toBe(131);
  });
});

describe("computeReliefBudget", () => {
  it("gives no relief amount without a care level: everything is paid by the family", () => {
    const b = computeReliefBudget({ careLevel: 0, month: "2026-11", jobs: [job("2026-11-03", 40), job("2026-11-04", 20, false)] });
    expect(b.entitled).toBe(false);
    expect(b.allowance).toBe(0);
    expect(b.carryOver).toBe(0);
    expect(b.coveredByRelief).toBe(0);
    expect(b.familyPays).toBe(60);
    expect(b.remaining).toBe(0);
    expect(b.leftoverDeadline).toBeNull();
    expect(b.lines.every((l) => l.covered === 0)).toBe(true);
  });

  it("covers eligible spend up to 131 € and charges non-eligible spend to the family", () => {
    const b = computeReliefBudget({
      careLevel: 1,
      month: "2026-11",
      trackingSince: "2026-11",
      jobs: [job("2026-11-02", 55), job("2026-11-04", 36), job("2026-11-05", 30, false)],
    });
    expect(b.allowance).toBe(131);
    expect(b.carryOver).toBe(0);
    expect(b.eligibleSpend).toBe(91);
    expect(b.nonEligibleSpend).toBe(30);
    expect(b.totalSpend).toBe(121);
    expect(b.coveredByRelief).toBe(91);
    expect(b.familyPays).toBe(30);
    expect(b.remaining).toBe(40);
    expect(b.overBudget).toBe(false);
    expect(b.leftoverDeadline).toBe("2027-06-30");
  });

  it("charges eligible spend beyond the budget to the family and splits the job that crosses it", () => {
    const jobs = [job("2026-11-10", 100), job("2026-11-02", 50), job("2026-11-20", 20)];
    const b = computeReliefBudget({ careLevel: 3, month: "2026-11", trackingSince: "2026-11", jobs });
    expect(b.coveredByRelief).toBe(131);
    expect(b.familyPays).toBe(39);
    expect(b.remaining).toBe(0);
    expect(b.overBudget).toBe(true);
    // Oldest first: 50 covered, 100 → 81 covered + 19 family, 20 → family.
    expect(b.lines.map((l) => [l.job.service_date, l.covered, l.familyPays])).toEqual([
      ["2026-11-02", 50, 0],
      ["2026-11-10", 81, 19],
      ["2026-11-20", 0, 20],
    ]);
  });

  it("carries unused allowance over from earlier months of the same year", () => {
    const jobs = [job("2026-09-05", 31), job("2026-10-10", 66), job("2026-10-20", 54), job("2026-11-03", 200)];
    const b = computeReliefBudget({ careLevel: 2, month: "2026-11", trackingSince: "2026-09", jobs });
    // Sep: 131 − 31 = 100 left. Oct: 231 available − 120 = 111 left.
    expect(b.carryOver).toBe(111);
    expect(b.available).toBe(242);
    expect(b.coveredByRelief).toBe(200);
    expect(b.remaining).toBe(42);
    expect(b.familyPays).toBe(0);
  });

  it("counts from January when no tracking start is given and never across the year boundary", () => {
    const b = computeReliefBudget({ careLevel: 1, month: "2026-03", jobs: [job("2025-12-01", 0)] });
    expect(b.carryOver).toBe(262);
    const jan = computeReliefBudget({ careLevel: 1, month: "2027-01", trackingSince: "2026-01", jobs: [] });
    expect(jan.carryOver).toBe(0);
    expect(jan.available).toBe(131);
    expect(jan.leftoverDeadline).toBeNull();
  });

  it("ignores non-eligible spend for the carry-over and overspending does not go negative", () => {
    const jobs = [job("2026-10-01", 500), job("2026-10-02", 80, false)];
    const b = computeReliefBudget({ careLevel: 1, month: "2026-11", trackingSince: "2026-10", jobs });
    expect(b.carryOver).toBe(0);
    expect(b.available).toBe(131);
  });

  it("uses the Berlin month of completed_at when there is no service date", () => {
    // 31 Oct 23:30 UTC is already 1 Nov in Berlin (CET, +1).
    const j: ReliefJob = { id: "x", service_date: null, completed_at: "2026-10-31T23:30:00Z", amount_eur: 10, relief_eligible: true };
    expect(jobMonth(j)).toBe("2026-11");
    const b = computeReliefBudget({ careLevel: 1, month: "2026-11", trackingSince: "2026-11", jobs: [j] });
    expect(b.coveredByRelief).toBe(10);
  });

  it("treats a missing amount as 0 and rounds to cents", () => {
    const b = computeReliefBudget({ careLevel: 1, month: "2026-11", trackingSince: "2026-11", jobs: [job("2026-11-01", null), job("2026-11-02", 0.1), job("2026-11-03", 0.2)] });
    expect(b.eligibleSpend).toBe(0.3);
    expect(b.remaining).toBe(130.7);
  });

  it("rejects an invalid month", () => {
    expect(() => computeReliefBudget({ careLevel: 1, month: "2026-13", jobs: [] })).toThrow();
  });
});

describe("month helpers", () => {
  it("formats Berlin dates and months", () => {
    expect(berlinDate(new Date("2026-06-30T22:30:00Z"))).toBe("2026-07-01");
    expect(berlinMonth(new Date("2026-11-07T12:00:00Z"))).toBe("2026-11");
  });

  it("adds months across years and lists recent months newest first", () => {
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(addMonths("2026-12", 1)).toBe("2027-01");
    expect(recentMonths("2026-02", 3)).toEqual(["2026-02", "2026-01", "2025-12"]);
  });
});

describe("recording a completed job", () => {
  it("defaults the amount to hours × hourly rate, 0 for free helpers", () => {
    expect(defaultJobAmount(2.5, 22)).toBe(55);
    expect(defaultJobAmount(2, null)).toBe(0);
    const now = new Date("2026-11-07T10:00:00Z");
    expect(completionPatch({ service_date: "2026-11-06", hours: 1.5, amount_eur: null }, 20, now)).toEqual({
      status: "done",
      service_date: "2026-11-06",
      hours: 1.5,
      amount_eur: 30,
      completed_at: now.toISOString(),
    });
    expect(completionPatch({ service_date: "2026-11-06", hours: 1.5, amount_eur: 25 }, 20, now).amount_eur).toBe(25);
  });

  it("validates date, hours and amount", () => {
    const schema = completeJobSchema("2026-11-07");
    const id = "b2000000-0000-4000-8000-000000000207";
    const ok = schema.safeParse({ request_id: id, service_date: "2026-11-07", hours: "2,5", amount_eur: "" });
    expect(ok.success && ok.data).toEqual({ request_id: id, service_date: "2026-11-07", hours: 2.5, amount_eur: null });
    expect(schema.safeParse({ request_id: id, service_date: "2026-11-08", hours: "2" }).success).toBe(false);
    expect(schema.safeParse({ request_id: id, service_date: "2026-02-30", hours: "2" }).success).toBe(false);
    expect(schema.safeParse({ request_id: id, service_date: "2026-11-01", hours: "0" }).success).toBe(false);
    expect(schema.safeParse({ request_id: id, service_date: "2026-11-01", hours: "25" }).success).toBe(false);
    expect(schema.safeParse({ request_id: id, service_date: "2026-11-01", hours: "2", amount_eur: "-1" }).success).toBe(false);
    expect(schema.safeParse({ request_id: id, service_date: "2026-11-01", hours: "abc" }).success).toBe(false);
    expect(schema.safeParse({ request_id: "nope", service_date: "2026-11-01", hours: "2" }).success).toBe(false);
  });
});

describe("demo seed – relief amount", () => {
  const now = new Date("2026-11-07T12:00:00Z");
  const helpers = new Map(demoHelpers().map((h) => [h.id, h]));
  const jobs = demoHelperRequests(now)
    .filter((r) => r.status === "done")
    .map((r) => ({ ...r, relief_eligible: helpers.get(r.helper_id)?.relief_eligible ?? false }));

  it("gives Maria a care level and real numbers this month and last month", () => {
    expect(demoSenior().care_level).toBeGreaterThanOrEqual(1);
    const b = computeReliefBudget({ careLevel: demoSenior().care_level, month: "2026-11", trackingSince: "2026-10", jobs });
    expect(b.lines.length).toBeGreaterThanOrEqual(3);
    expect(b.coveredByRelief).toBe(91);
    expect(b.familyPays).toBe(30);
    expect(b.carryOver).toBe(11);
    const prev = computeReliefBudget({ careLevel: 3, month: "2026-10", trackingSince: "2026-10", jobs });
    expect(prev.lines).toHaveLength(2);
    expect(prev.coveredByRelief).toBe(120);
  });

  it("never dates a demo job in the future, even on the first day of the month", () => {
    const early = new Date("2026-12-01T08:00:00Z");
    for (const r of demoHelperRequests(early)) {
      if (r.completed_at) expect(new Date(r.completed_at).getTime()).toBeLessThanOrEqual(early.getTime());
    }
  });

  it("matches hours × rate for every paid demo job and belongs to the demo family", () => {
    for (const r of demoHelperRequests(now)) {
      expect(r.family_id).toBe(DEMO_IDS.family);
      if (r.status !== "done") continue;
      expect(r.amount_eur).toBe(defaultJobAmount(r.hours!, helpers.get(r.helper_id)!.hourly_rate_eur));
    }
  });

  it("marks services and a few verified independents as relief-eligible and exposes the flag publicly", () => {
    const eligible = demoHelpers().filter((h) => h.relief_eligible);
    expect(eligible.map((h) => h.id)).toEqual(expect.arrayContaining([DEMO_HELPER_IDS.sonnenhof, DEMO_HELPER_IDS.alltag]));
    expect(eligible.every((h) => h.verified)).toBe(true);
    expect(demoHelpers().filter((h) => h.kind === "service").every((h) => h.relief_eligible)).toBe(true);
    expect(toPublicHelper(helpers.get(DEMO_HELPER_IDS.elena)!).relief_eligible).toBe(true);
    expect(toPublicHelper(helpers.get(DEMO_HELPER_IDS.mehmet)!).relief_eligible).toBe(false);
  });

  it("keeps supabase/seed.sql in sync (relief flags and demo jobs)", () => {
    const sql = readFileSync(path.join(process.cwd(), "supabase", "seed.sql"), "utf8");
    for (const h of demoHelpers()) {
      const row = sql.split("\n  (").find((chunk) => chunk.startsWith(`'${h.id}'`));
      expect(row, h.name).toContain(`, true, ${h.relief_eligible}, '2026-11-02T09:00:00Z')`);
    }
    for (const r of demoHelperRequests(now)) {
      const line = sql.split("\n").find((l) => l.includes(`'${r.id}'`));
      expect(line, r.id).toBeTruthy();
      expect(line).toContain(r.helper_id);
      if (r.status === "done") expect(line).toContain(`, ${r.hours}, ${r.amount_eur},`);
    }
    expect(Object.values(DEMO_JOB_IDS).every((id) => sql.includes(id))).toBe(true);
  });
});
