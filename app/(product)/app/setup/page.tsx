import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { env } from "@/lib/env";
import { getMemberOverview, requireMember } from "@/lib/auth";
import { familyT } from "@/lib/i18n/family";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode } from "@/components/family/qr-code";
import { RelativeFields } from "@/components/family/relative-form";
import { SeniorFields } from "@/components/family/senior-form";
import { FamilyShell, Field, FormError, PageTitle, Section } from "@/components/family/shell";
import { addRelative, createFamilyAndMember, saveSafety, saveSenior } from "../actions";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Set up", robots: { index: false } };

type Props = { searchParams: Promise<{ step?: string; error?: string }> };

export default async function SetupPage({ searchParams }: Props) {
  const { step: stepParam, error } = await searchParams;
  const member = await requireMember({ allowNoFamily: true });
  const overview = await getMemberOverview(member);
  const t = familyT().setup;

  // The furthest step the data allows; a smaller step can always be revisited.
  const maxStep = !overview ? 1 : overview.seniors.length === 0 ? 2 : 5;
  const requested = Number(stepParam ?? maxStep);
  const step = Number.isFinite(requested) ? Math.min(Math.max(1, requested), maxStep) : maxStep;
  if (stepParam && Number(stepParam) !== step) redirect(`/app/setup?step=${step}`);

  const senior = overview?.seniors[0] ?? null;
  const relatives = overview ? [...overview.relatives].sort((a, b) => a.priority - b.priority) : [];
  const tabletUrl = senior ? `${env.appUrl()}/senior/${senior.device_token}` : null;

  return (
    <FamilyShell active="setup" signedIn={Boolean(overview)} seniorName={senior?.first_name ?? null}>
      <PageTitle eyebrow={t.title} title={t.steps[step - 1]} />
      <ol className="mb-6 flex flex-wrap gap-2" aria-label="Steps">
        {t.steps.map((label, i) => {
          const n = i + 1;
          const done = n < step;
          const reachable = n <= maxStep;
          const inner = (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold",
                n === step ? "border-ink bg-ink text-white" : done ? "border-salvia bg-salvia text-bene" : "border-line bg-white text-muted",
              )}
            >
              {done ? <Check className="size-3.5" /> : <span>{n}</span>}
              {label}
            </span>
          );
          return <li key={label}>{reachable && n !== step ? <Link href={`/app/setup?step=${n}`}>{inner}</Link> : inner}</li>;
        })}
      </ol>
      <div className="mb-4">
        <FormError message={error} />
      </div>

      {step === 1 ? (
        <Section>
          <p className="lede mb-5">{t.you.lede}</p>
          <form action={createFamilyAndMember} className="grid gap-5">
            <Field label={t.you.familyName} hint={t.you.familyNameHint} htmlFor="family_name">
              <Input id="family_name" name="family_name" required minLength={2} maxLength={80} placeholder="Weber" />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t.you.name} htmlFor="name">
                <Input id="name" name="name" required maxLength={60} placeholder="Anna" autoComplete="given-name" />
              </Field>
              <Field label={t.you.relation} htmlFor="relation">
                <Input id="relation" name="relation" required maxLength={40} placeholder="daughter" />
              </Field>
            </div>
            <Field label={t.you.phone} hint={t.you.phoneHint} htmlFor="phone">
              <Input id="phone" name="phone" type="tel" inputMode="tel" required placeholder="+4915112345678" autoComplete="tel" />
            </Field>
            <Field label={t.you.email} htmlFor="email">
              <Input id="email" name="email" type="email" defaultValue={member.email ?? ""} maxLength={120} autoComplete="email" />
            </Field>
            <Button type="submit" size="lg">
              {t.you.next} <ArrowRight />
            </Button>
          </form>
        </Section>
      ) : null}

      {step === 2 ? (
        <Section>
          <p className="lede mb-5">{t.parent.lede}</p>
          <form action={saveSenior} className="grid gap-5">
            <input type="hidden" name="return_to" value="/app/setup?step=3" />
            <input type="hidden" name="error_to" value="/app/setup?step=2" />
            <SeniorFields senior={senior} />
            <Button type="submit" size="lg">
              {t.parent.next} <ArrowRight />
            </Button>
          </form>
        </Section>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-4">
          <Section tone="glicine">
            <p className="text-ink">{t.relatives.lede}</p>
            <ol className="mt-4 grid gap-2">
              {relatives.map((r) => (
                <li key={r.id} className="flex items-center justify-between rounded-sm bg-white px-4 py-3 text-sm">
                  <span className="font-bold text-ink">
                    {r.priority}. {r.name} <span className="font-normal text-muted">· {r.relation}</span>
                  </span>
                  <span className="text-muted">{r.phone}</span>
                </li>
              ))}
            </ol>
          </Section>
          <Section title={t.relatives.add}>
            <form action={addRelative} className="grid gap-5">
              <input type="hidden" name="return_to" value="/app/setup?step=3" />
              <RelativeFields defaultPriority={relatives.length + 1} />
              <div className="flex flex-wrap gap-3">
                <Button type="submit" variant="outline" size="lg">
                  {t.relatives.add}
                </Button>
                <Button asChild size="lg">
                  <Link href="/app/setup?step=4">
                    {relatives.length > 1 ? t.relatives.next : t.relatives.skip} <ArrowRight />
                  </Link>
                </Button>
              </div>
            </form>
          </Section>
        </div>
      ) : null}

      {step === 4 ? (
        <Section>
          <p className="lede mb-5">{t.safety.lede}</p>
          <form action={saveSafety} className="grid gap-5">
            <input type="hidden" name="setup" value="1" />
            <input type="hidden" name="return_to" value="/app/setup?step=5" />
            <Field label={t.safety.fallback} htmlFor="fallback_phone" hint="+49… or +39…, no spaces">
              <Input id="fallback_phone" name="fallback_phone" type="tel" inputMode="tel" defaultValue={overview?.family.fallback_phone ?? ""} placeholder="+4971112345678" />
            </Field>
            <label className="flex items-start gap-3 rounded-sm border border-line bg-white px-4 py-3 text-sm text-ink">
              <input type="checkbox" name="consent_parent" value="on" required className="mt-0.5 size-5 shrink-0 accent-ink" />
              {t.safety.consentParent}
            </label>
            <label className="flex items-start gap-3 rounded-sm border border-line bg-white px-4 py-3 text-sm text-ink">
              <input type="checkbox" name="consent_no112" value="on" required className="mt-0.5 size-5 shrink-0 accent-ink" />
              {t.safety.consentNo112}
            </label>
            <Button type="submit" size="lg">
              {t.safety.next} <ArrowRight />
            </Button>
          </form>
        </Section>
      ) : null}

      {step === 5 && senior && tabletUrl ? (
        <Section tone="camomilla">
          <p className="text-ink">{t.tablet.lede}</p>
          <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <QrCode value={tabletUrl} label={`QR code for ${senior.first_name}'s tablet`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">{t.tablet.orType}</p>
              <p className="mt-1 break-all rounded-sm bg-white px-3 py-2 font-mono text-sm text-ink">{tabletUrl}</p>
              <p className="mt-3 text-xs text-muted">You can show this QR code again or replace it under Settings → Tablet link.</p>
            </div>
          </div>
          <div className="mt-6">
            <Button asChild size="lg">
              <Link href="/app">
                {t.tablet.done} <ArrowRight />
              </Link>
            </Button>
          </div>
        </Section>
      ) : null}
    </FamilyShell>
  );
}
