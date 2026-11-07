/**
 * Relief amount (Entlastungsbetrag) budget – pure rules, no I/O, safe for client components.
 *
 * Facts come from the team's fixed rule table (docs/reference/care-copilot-how-it-works.txt,
 * Part 5) and are never invented:
 *  - 131 € per month, from care level 1. Not cash: reimbursed only for recognised services
 *    (in Baden-Württemberg recognised "Angebote zur Unterstützung im Alltag" / approved care services).
 *  - 2026 leftovers are usable until 30 June 2027.
 *
 * Model: unused allowance carries over month to month within the same calendar year, counted from
 * `trackingSince` (the month the family started using Nonnina). The next-year expiry is shown as
 * text only. Months are calendar months in Europe/Berlin.
 */

export const RELIEF_AMOUNT_EUR = 131;
export const RELIEF_MIN_CARE_LEVEL = 1;
/** Rule table: "2026 leftovers usable until 30 June 2027". */
export const RELIEF_LEFTOVER_RULES: Readonly<Record<number, string>> = { 2026: "2027-06-30" };

const TIME_ZONE = "Europe/Berlin";
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

/** A finished job as the budget sees it. */
export interface ReliefJob {
  id: string;
  /** "YYYY-MM-DD" day of the service; falls back to completed_at when missing. */
  service_date: string | null;
  completed_at: string | null;
  amount_eur: number | null;
  /** The helper can be paid via the relief amount. */
  relief_eligible: boolean;
}

export interface ReliefJobLine<J extends ReliefJob = ReliefJob> {
  job: J;
  amount: number;
  /** Part of the amount covered by the relief amount. */
  covered: number;
  /** Part the family pays itself (not eligible, or beyond the budget). */
  familyPays: number;
}

export interface ReliefBudget<J extends ReliefJob = ReliefJob> {
  month: string;
  /** Care level ≥ 1. */
  entitled: boolean;
  /** 131 € or 0. */
  allowance: number;
  /** Unused allowance from earlier months of the same calendar year. */
  carryOver: number;
  /** allowance + carryOver */
  available: number;
  eligibleSpend: number;
  nonEligibleSpend: number;
  totalSpend: number;
  coveredByRelief: number;
  familyPays: number;
  /** available − coveredByRelief */
  remaining: number;
  /** Eligible spend is higher than what is available. */
  overBudget: boolean;
  /** ISO date until which this year's leftovers can be used, when the rule table has one. */
  leftoverDeadline: string | null;
  /** This month's jobs, oldest first, with the coverage split. */
  lines: ReliefJobLine<J>[];
}

/** Round to cents (avoids 0.1 + 0.2 artefacts). */
export function cents(n: number): number {
  return Math.round(n * 100) / 100;
}

export function isMonth(value: unknown): value is string {
  return typeof value === "string" && MONTH_RE.test(value);
}

/** "YYYY-MM-DD" of `date` in Europe/Berlin. */
export function berlinDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** "YYYY-MM" of `date` in Europe/Berlin. */
export function berlinMonth(date: Date): string {
  return berlinDate(date).slice(0, 7);
}

export function addMonths(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const index = y * 12 + (m - 1) + delta;
  const year = Math.floor(index / 12);
  return `${year}-${String((index % 12) + 1).padStart(2, "0")}`;
}

/** Month a job counts in: its service date, else the Berlin month of completed_at. */
export function jobMonth(job: Pick<ReliefJob, "service_date" | "completed_at">): string | null {
  if (job.service_date && /^\d{4}-\d{2}-\d{2}/.test(job.service_date)) return job.service_date.slice(0, 7);
  if (job.completed_at) {
    const d = new Date(job.completed_at);
    if (!Number.isNaN(d.getTime())) return berlinMonth(d);
  }
  return null;
}

function jobDay(job: ReliefJob): string {
  return job.service_date ?? (job.completed_at ? berlinDate(new Date(job.completed_at)) : "");
}

function amountOf(job: ReliefJob): number {
  const n = Number(job.amount_eur ?? 0);
  return Number.isFinite(n) && n > 0 ? cents(n) : 0;
}

function monthTotals(jobs: ReliefJob[], month: string): { eligible: number; nonEligible: number } {
  let eligible = 0;
  let nonEligible = 0;
  for (const job of jobs) {
    if (jobMonth(job) !== month) continue;
    if (job.relief_eligible) eligible += amountOf(job);
    else nonEligible += amountOf(job);
  }
  return { eligible: cents(eligible), nonEligible: cents(nonEligible) };
}

export interface ReliefBudgetInput<J extends ReliefJob> {
  careLevel: number;
  /** "YYYY-MM" */
  month: string;
  /** The senior's completed (status "done") jobs; other months are used for the carry-over. */
  jobs: J[];
  /** First month to count the allowance from (default: January of `month`'s year). */
  trackingSince?: string | null;
}

export function computeReliefBudget<J extends ReliefJob>({ careLevel, month, jobs, trackingSince }: ReliefBudgetInput<J>): ReliefBudget<J> {
  if (!isMonth(month)) throw new Error(`invalid month: ${month}`);
  const entitled = careLevel >= RELIEF_MIN_CARE_LEVEL;
  const allowance = entitled ? RELIEF_AMOUNT_EUR : 0;
  const year = month.slice(0, 4);

  // Carry-over: walk the earlier months of the same calendar year.
  let carryOver = 0;
  if (entitled) {
    const january = `${year}-01`;
    let cursor = isMonth(trackingSince) && trackingSince > january ? trackingSince : january;
    while (cursor < month) {
      const available = RELIEF_AMOUNT_EUR + carryOver;
      const covered = Math.min(monthTotals(jobs, cursor).eligible, available);
      carryOver = cents(available - covered);
      cursor = addMonths(cursor, 1);
    }
  }

  const available = cents(allowance + carryOver);
  const thisMonth = jobs.filter((j) => jobMonth(j) === month).sort((a, b) => jobDay(a).localeCompare(jobDay(b)) || a.id.localeCompare(b.id));

  // Allocate the budget to eligible jobs in date order.
  let left = available;
  const lines: ReliefJobLine<J>[] = thisMonth.map((job) => {
    const amount = amountOf(job);
    const covered = job.relief_eligible ? cents(Math.min(amount, left)) : 0;
    left = cents(left - covered);
    return { job, amount, covered, familyPays: cents(amount - covered) };
  });

  const { eligible, nonEligible } = monthTotals(thisMonth, month);
  const coveredByRelief = cents(Math.min(eligible, available));
  return {
    month,
    entitled,
    allowance,
    carryOver,
    available,
    eligibleSpend: eligible,
    nonEligibleSpend: nonEligible,
    totalSpend: cents(eligible + nonEligible),
    coveredByRelief,
    familyPays: cents(nonEligible + (eligible - coveredByRelief)),
    remaining: cents(available - coveredByRelief),
    overBudget: eligible > available,
    leftoverDeadline: entitled ? (RELIEF_LEFTOVER_RULES[Number(year)] ?? null) : null,
    lines,
  };
}

/** Default amount for a job: hours × hourly rate (free / volunteer = 0). */
export function defaultJobAmount(hours: number, hourlyRate: number | null): number {
  if (!Number.isFinite(hours) || hours <= 0 || hourlyRate === null) return 0;
  return cents(hours * hourlyRate);
}

/** The latest `count` months up to and including `current`, newest first (for the month switcher). */
export function recentMonths(current: string, count = 6): string[] {
  return Array.from({ length: count }, (_, i) => addMonths(current, -i));
}

/** Store patch for "mark as done": amount left empty → hours × hourly rate. */
export function completionPatch(
  input: { service_date: string; hours: number; amount_eur: number | null },
  hourlyRate: number | null,
  now: Date = new Date(),
): { status: "done"; service_date: string; hours: number; amount_eur: number; completed_at: string } {
  return {
    status: "done",
    service_date: input.service_date,
    hours: cents(input.hours),
    amount_eur: input.amount_eur === null ? defaultJobAmount(input.hours, hourlyRate) : cents(input.amount_eur),
    completed_at: now.toISOString(),
  };
}
