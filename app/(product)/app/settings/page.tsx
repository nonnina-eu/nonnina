import type { Metadata } from "next";
import { Mail, QrCode as QrIcon, RefreshCw, Trash2 } from "lucide-react";
import { env } from "@/lib/env";
import { encodeDemoCookie, getMemberOverview, requireMember } from "@/lib/auth";
import { familyT } from "@/lib/i18n/family";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode } from "@/components/family/qr-code";
import { RelativeFields } from "@/components/family/relative-form";
import { SeniorFields } from "@/components/family/senior-form";
import { FamilyShell, Field, FormError, PageTitle, Section } from "@/components/family/shell";
import { addRelative, deleteRelative, inviteRelative, rotateTabletLink, saveSafety, saveSenior, updateRelative } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings", robots: { index: false } };

type Props = { searchParams: Promise<{ error?: string; invited?: string; joinlink?: string; qr?: string }> };

export default async function SettingsPage({ searchParams }: Props) {
  const { error, invited, joinlink, qr } = await searchParams;
  const member = await requireMember();
  const overview = (await getMemberOverview(member))!;
  const t = familyT().settings;
  const senior = overview.seniors[0] ?? null;
  const relatives = [...overview.relatives].sort((a, b) => a.priority - b.priority);
  const here = "/app/settings";
  const appUrl = env.appUrl();
  const joinRelative = joinlink ? relatives.find((r) => r.id === joinlink) : null;
  const joinUrl = joinRelative && member.mode === "demo" ? `${appUrl}/app/join?relative=${joinRelative.id}&key=${encodeURIComponent(encodeDemoCookie(joinRelative.id, overview.family.id))}` : null;

  return (
    <FamilyShell active="settings" seniorName={senior?.first_name ?? null}>
      <PageTitle title={t.title} lede={`Family ${overview.family.name}`} />
      <div className="mb-4">
        <FormError message={error} />
        {invited ? <p className="rounded-sm border border-salvia bg-salvia px-4 py-3 text-sm font-bold text-bene">{t.invited}: {invited}</p> : null}
        {joinUrl ? (
          <div className="rounded-sm border border-line bg-glicine px-4 py-3 text-sm text-ink">
            <p className="font-bold">
              {t.joinLink} for {joinRelative?.name}
            </p>
            <p className="mt-1 break-all font-mono text-xs">{joinUrl}</p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-6">
        <Section title={t.parent}>
          {senior ? (
            <form action={saveSenior} className="grid gap-5">
              <input type="hidden" name="return_to" value={here} />
              <input type="hidden" name="error_to" value={here} />
              <SeniorFields senior={senior} />
              <Button type="submit">{t.save}</Button>
            </form>
          ) : (
            <p className="text-muted">No parent profile yet.</p>
          )}
        </Section>

        <Section title={t.relatives} tone="glicine">
          <div className="grid gap-4">
            {relatives.map((r) => (
              <details key={r.id} className="group rounded-lg border border-line bg-white p-4">
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-bold text-ink">
                    {r.priority}. {r.name} <span className="font-normal text-muted">· {r.relation} · {r.phone}</span>
                    {member.relative?.id === r.id ? <span className="ml-2 rounded-full bg-salvia px-2 py-0.5 text-xs text-bene">you</span> : null}
                    {r.user_id ? <span className="ml-2 rounded-full bg-mist px-2 py-0.5 text-xs text-muted">signed in</span> : null}
                  </span>
                  <span className="text-xs text-muted group-open:hidden">Edit</span>
                </summary>
                <form action={updateRelative} className="mt-4 grid gap-4">
                  <input type="hidden" name="relative_id" value={r.id} />
                  <input type="hidden" name="return_to" value={here} />
                  <RelativeFields relative={r} idPrefix={`rel-${r.id}`} />
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" size="sm">
                      {t.save}
                    </Button>
                    {r.email && !r.user_id ? (
                      <Button type="submit" size="sm" variant="outline" formAction={inviteRelative}>
                        <Mail /> {t.invite}
                      </Button>
                    ) : null}
                    {member.relative?.id !== r.id ? (
                      <Button type="submit" size="sm" variant="ghost" formAction={deleteRelative} className="text-allarme hover:bg-allarme-soft">
                        <Trash2 /> {t.remove}
                      </Button>
                    ) : null}
                  </div>
                </form>
              </details>
            ))}
          </div>
          <details className="mt-4 rounded-lg border border-dashed border-ink/30 bg-white p-4">
            <summary className="cursor-pointer list-none text-sm font-bold text-ink">+ Add a relative</summary>
            <form action={addRelative} className="mt-4 grid gap-4">
              <input type="hidden" name="return_to" value={here} />
              <RelativeFields defaultPriority={relatives.length + 1} idPrefix="rel-new" />
              <Button type="submit" size="sm">
                {t.save}
              </Button>
            </form>
          </details>
        </Section>

        <Section title={t.safety}>
          <form action={saveSafety} className="grid gap-4">
            <input type="hidden" name="return_to" value={here} />
            <Field label={familyT().setup.safety.fallback} hint={familyT().setup.safety.lede} htmlFor="fallback_phone">
              <Input id="fallback_phone" name="fallback_phone" type="tel" inputMode="tel" defaultValue={overview.family.fallback_phone ?? ""} placeholder="+4971112345678" />
            </Field>
            <Button type="submit" className="w-fit">
              {t.save}
            </Button>
          </form>
        </Section>

        {senior ? (
          <Section title={t.tablet} tone="camomilla">
            <details open={qr === "1"}>
              <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-sm border-[1.5px] border-ink bg-white px-4 py-2 text-sm font-bold text-ink hover:bg-mist">
                <QrIcon className="size-4" /> {t.showQr}
              </summary>
              <div className="mt-4 flex flex-col items-start gap-3">
                <QrCode value={`${appUrl}/senior/${senior.device_token}`} label={`QR code for ${senior.first_name}'s tablet`} />
                <p className="break-all rounded-sm bg-white px-3 py-2 font-mono text-xs text-ink">{`${appUrl}/senior/${senior.device_token}`}</p>
              </div>
            </details>
            <form action={rotateTabletLink} className="mt-5 flex flex-wrap items-center gap-3">
              <input type="hidden" name="senior_id" value={senior.id} />
              <input type="hidden" name="return_to" value={here} />
              <Button type="submit" variant="outline" size="sm">
                <RefreshCw /> {t.rotate}
              </Button>
              <p className="text-xs text-muted">{t.rotateHint}</p>
            </form>
          </Section>
        ) : null}
      </div>
    </FamilyShell>
  );
}
