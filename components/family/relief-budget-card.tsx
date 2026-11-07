import Link from "next/link";
import { AlertTriangle, Info, PiggyBank } from "lucide-react";
import { getStore } from "@/lib/db";
import type { Helper, HelperRequest, Senior } from "@/lib/db/types";
import { getMarketplaceT } from "@/lib/i18n/marketplace-locale";
import { formatDay, formatEur, formatHours, formatMonth, reliefT } from "@/lib/i18n/relief";
import { berlinMonth, computeReliefBudget, isMonth, jobMonth, recentMonths, type ReliefJobLine } from "@/lib/relief-budget";
import { cn } from "@/lib/utils";

type Job = HelperRequest & { relief_eligible: boolean; helper_name: string };

/**
 * Relief amount (Entlastungsbetrag) card on /app: how much of the 131 € this month the
 * family's completed helper jobs use, what is left and what the family pays itself.
 * Month and senior come from the query (?budget_month=YYYY-MM&budget_senior=<id>).
 */
export async function ReliefBudgetCard({ familyId, seniors, month: requestedMonth, seniorId }: { familyId: string; seniors: Senior[]; month?: string; seniorId?: string }) {
  const { locale, t: mt } = await getMarketplaceT();
  const t = reliefT(locale);
  const currentMonth = berlinMonth(new Date());
  const month = isMonth(requestedMonth) && requestedMonth <= currentMonth ? requestedMonth : currentMonth;
  const defaultSenior = seniors.find((s) => s.care_level >= 1) ?? seniors[0];
  const senior = seniors.find((s) => s.id === seniorId) ?? defaultSenior;

  const href = (m: string, s: string | undefined) => {
    const q = new URLSearchParams();
    if (m !== currentMonth) q.set("budget_month", m);
    if (s && s !== defaultSenior?.id) q.set("budget_senior", s);
    const qs = q.toString();
    return `/app${qs ? `?${qs}` : ""}#relief-budget`;
  };

  return (
    <section id="relief-budget" aria-labelledby="relief-budget-title" className="mb-6 rounded-xl border border-line bg-white p-5 shadow-soft">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 id="relief-budget-title" className="font-display inline-flex items-center gap-2 text-2xl text-ink">
          <PiggyBank className="size-5" aria-hidden /> {t.title}
        </h2>
      </div>
      <p className="mb-4 text-sm text-muted">{t.subtitle}</p>

      {seniors.length > 1 ? (
        <nav aria-label={t.forSenior} className="mb-4 flex flex-wrap items-center gap-1.5 text-sm">
          <span className="mr-1 text-muted">{t.forSenior}:</span>
          {seniors.map((s) => (
            <Link
              key={s.id}
              href={href(month, s.id)}
              aria-current={s.id === senior?.id ? "true" : undefined}
              className={cn("rounded-full border border-line px-3 py-1 font-bold text-ink hover:bg-mist", s.id === senior?.id && "border-ink bg-ink text-white hover:bg-ink")}
            >
              {s.first_name}
            </Link>
          ))}
        </nav>
      ) : null}

      {!senior ? (
        <p className="text-sm text-muted">{t.noSenior}</p>
      ) : senior.care_level < 1 ? (
        <NoCareLevel name={senior.first_name} t={t} />
      ) : (
        <Budget senior={senior} familyId={familyId} month={month} currentMonth={currentMonth} href={href} locale={locale} t={t} services={mt.services} />
      )}

      <p className="mt-4 flex items-start gap-2 border-t border-line pt-4 text-xs text-muted">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {t.note}
      </p>
    </section>
  );
}

function NoCareLevel({ name, t }: { name: string; t: ReturnType<typeof reliefT> }) {
  return (
    <div className="rounded-lg border border-line bg-latte p-4">
      <p className="font-bold text-ink">{t.noCareLevel.title(name)}</p>
      <p className="mt-1 text-sm text-ink">{t.noCareLevel.body}</p>
      <p className="mt-3 text-sm font-bold text-ink">{t.noCareLevel.stepsTitle}</p>
      <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-ink">
        {t.noCareLevel.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <Link href="/app/settings" className="mt-3 inline-block text-sm font-bold text-link underline-offset-4 hover:underline">
        {t.noCareLevel.settings}
      </Link>
    </div>
  );
}

async function Budget({
  senior,
  familyId,
  month,
  currentMonth,
  href,
  locale,
  t,
  services,
}: {
  senior: Senior;
  familyId: string;
  month: string;
  currentMonth: string;
  href: (m: string, s: string | undefined) => string;
  locale: Awaited<ReturnType<typeof getMarketplaceT>>["locale"];
  t: ReturnType<typeof reliefT>;
  services: Awaited<ReturnType<typeof getMarketplaceT>>["t"]["services"];
}) {
  const store = getStore();
  const done = (await store.listHelperRequestsForFamily(familyId)).filter((r) => r.senior_id === senior.id && r.status === "done");
  const helpers = new Map<string, Helper | null>();
  await Promise.all([...new Set(done.map((r) => r.helper_id))].map(async (id) => helpers.set(id, await store.getHelper(id))));
  const jobs: Job[] = done.map((r) => ({ ...r, relief_eligible: helpers.get(r.helper_id)?.relief_eligible ?? false, helper_name: helpers.get(r.helper_id)?.name ?? "–" }));

  // Count the allowance from the month the family started with Nonnina (or its first recorded job).
  const months = [berlinMonth(new Date(senior.created_at)), ...jobs.map(jobMonth).filter((m): m is string => m !== null)];
  const trackingSince = months.sort()[0];
  const b = computeReliefBudget({ careLevel: senior.care_level, month, jobs, trackingSince });
  const pct = b.available > 0 ? Math.min(100, Math.round((b.coveredByRelief / b.available) * 100)) : 0;
  const eur = (n: number) => formatEur(n, locale);

  return (
    <div>
      <nav aria-label={t.monthLabel} className="mb-4 flex flex-wrap gap-1.5 text-sm">
        {recentMonths(currentMonth, 6).map((m) => (
          <Link
            key={m}
            href={href(m, senior.id)}
            aria-current={m === month ? "true" : undefined}
            className={cn("rounded-sm border border-line px-3 py-1.5 font-bold text-ink hover:bg-mist", m === month && "border-ink bg-ink text-white hover:bg-ink")}
          >
            {formatMonth(m, locale)}
          </Link>
        ))}
      </nav>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label={t.usedLabel} big={eur(b.coveredByRelief)} />
        <Stat label={t.remaining} big={eur(b.remaining)} />
        <Stat label={t.familyPays} big={eur(b.familyPays)} tone={b.familyPays > 0 ? "warn" : undefined} />
      </div>

      <div className="mt-4">
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-camomilla"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={b.available}
          aria-valuenow={b.coveredByRelief}
          aria-label={t.used(eur(b.coveredByRelief), eur(b.available))}
        >
          <div className={cn("h-full rounded-full", b.overBudget ? "bg-allarme" : "bg-sole")} style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-sm text-ink">{t.used(eur(b.coveredByRelief), eur(b.available))}</p>
        {b.carryOver > 0 ? <p className="text-xs text-muted">{t.carryOver(eur(b.allowance), eur(b.carryOver))}</p> : null}
        {b.overBudget ? (
          <p role="status" className="mt-2 flex items-start gap-2 rounded-sm bg-allarme-soft px-3 py-2 text-sm font-bold text-allarme">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {t.overBudget}
          </p>
        ) : null}
      </div>

      <h3 className="mb-2 mt-5 text-sm font-bold text-ink">{t.jobsTitle}</h3>
      {b.lines.length === 0 ? (
        <p className="text-sm text-muted">{t.noJobs}</p>
      ) : (
        <ul className="grid gap-2">
          {b.lines.map((line) => (
            <JobRow key={line.job.id} line={line} locale={locale} t={t} service={services[line.job.service]} />
          ))}
        </ul>
      )}

      <p className="mt-3 text-xs text-muted">
        {trackingSince > `${month.slice(0, 4)}-01` ? `${t.trackedSince(formatMonth(trackingSince, locale))} ` : ""}
        {b.leftoverDeadline ? t.leftover(formatDay(b.leftoverDeadline, locale, "long")) : ""}
      </p>
    </div>
  );
}

function Stat({ label, big, tone }: { label: string; big: string; tone?: "warn" }) {
  return (
    <div className="rounded-lg border border-line bg-latte p-3">
      <p className="text-xs font-bold text-muted">{label}</p>
      <p className={cn("font-display mt-1 text-3xl leading-none text-ink", tone === "warn" && "text-sole-deep")}>{big}</p>
    </div>
  );
}

function JobRow({ line, locale, t, service }: { line: ReliefJobLine<Job>; locale: Awaited<ReturnType<typeof getMarketplaceT>>["locale"]; t: ReturnType<typeof reliefT>; service: string }) {
  const { job } = line;
  const day = job.service_date ?? (job.completed_at ? job.completed_at.slice(0, 10) : null);
  const tag =
    line.amount === 0
      ? { label: t.free, className: "bg-salvia text-bene" }
      : line.covered > 0 && line.familyPays === 0
      ? { label: t.covered, className: "bg-salvia text-bene" }
      : line.covered > 0
        ? { label: `${t.partly(formatEur(line.covered, locale))} · ${t.familyPaysTag}`, className: "bg-camomilla text-sole-deep" }
        : { label: t.familyPaysTag, className: "bg-camomilla text-sole-deep" };
  return (
    <li className="rounded-lg border border-line bg-white p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-bold text-ink">{job.helper_name}</p>
        <p className="font-bold tabular-nums text-ink">{formatEur(line.amount, locale)}</p>
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <span>
          {day ? formatDay(day, locale) : "–"} · {service}
          {job.hours !== null ? ` · ${t.hours(formatHours(job.hours, locale))}` : ""}
        </span>
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", tag.className)}>{tag.label}</span>
      </div>
    </li>
  );
}
