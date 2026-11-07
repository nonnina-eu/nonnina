import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Lock, LogIn, MapPin } from "lucide-react";
import { z } from "zod";
import { getCurrentMember, getMemberOverview } from "@/lib/auth";
import { getStore } from "@/lib/db";
import type { HelperRequest } from "@/lib/db/types";
import { getHelperSession } from "@/lib/helper-auth";
import { getMarketplaceT } from "@/lib/i18n/marketplace-locale";
import { isHelperService, toPublicHelper } from "@/lib/marketplace";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/family/shell";
import { languageList, RateLabel, ServiceChips, VerifiedBadge } from "@/components/marketplace/helper-card";
import { HelperRequestForm } from "@/components/marketplace/helper-request-form";
import { NotificationList } from "@/components/marketplace/notification-list";
import { MarketplaceShell } from "@/components/marketplace/shell";
import { sendHelperRequest } from "../actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ service?: string; request?: string; sent?: string }> };

const uuid = z.string().uuid();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!uuid.safeParse(id).success) return { title: "Helper" };
  const helper = await getStore().getHelper(id);
  return { title: helper?.active ? helper.name : "Helper" };
}

export default async function HelperDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  if (!uuid.safeParse(id).success) notFound();
  const store = getStore();
  const full = await store.getHelper(id);
  if (!full || !full.active) notFound();
  // Render only the public projection: phone and email never reach this page.
  const helper = toPublicHelper(full);
  const { locale, t } = await getMarketplaceT();
  const d = t.detail;

  const [member, helperSession] = await Promise.all([getCurrentMember(), getHelperSession()]);
  const overview = member ? await getMemberOverview(member) : null;
  const service = isHelperService(sp.service) ? sp.service : null;

  // Linked help request (from the family feed), only when it belongs to the member's family.
  let helpRequest: { id: string; summary: string } | null = null;
  if (sp.request && member?.family && uuid.safeParse(sp.request).success) {
    const feed = await store.getFamilyFeed(member.family.id, 200);
    const found = feed?.helpRequests.find((h) => h.id === sp.request);
    if (found) helpRequest = { id: found.id, summary: found.summary };
  }

  let sent: HelperRequest | null = null;
  if (sp.sent && member?.family && uuid.safeParse(sp.sent).success) {
    const req = await store.getHelperRequest(sp.sent);
    if (req && req.family_id === member.family.id && req.helper_id === helper.id) sent = req;
  }

  const query = new URLSearchParams();
  if (service) query.set("service", service);
  if (helpRequest) query.set("request", helpRequest.id);
  const here = `/helpers/${helper.id}${query.toString() ? `?${query.toString()}` : ""}`;
  const backHref = `/helpers${query.toString() ? `?${query.toString()}` : ""}`;
  const isOwn = helperSession?.helper?.id === helper.id;

  return (
    <MarketplaceShell locale={locale} active="find" isHelper={Boolean(helperSession?.helper)} isFamily={Boolean(member?.family)} here={here} narrow>
      <Link href={backHref} className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-link underline-offset-4 hover:underline">
        <ArrowLeft className="size-4" aria-hidden /> {t.common.back}
      </Link>

      <div className="mb-6">
        <p className="eyebrow mb-2">{t.kinds[helper.kind]}</p>
        <h1 className="font-display text-[2.25rem] leading-[1.02] text-ink sm:text-5xl">{helper.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-4" aria-hidden /> {helper.city}
          </span>
          <VerifiedBadge verified={helper.verified} locale={locale} />
          <RateLabel helper={helper} locale={locale} />
        </div>
      </div>

      {sent ? (
        <Section tone="salvia" className="mb-6" title={d.sent(helper.name)}>
          <p className="inline-flex items-start gap-2 text-ink">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-bene" aria-hidden /> {d.sentBody}
          </p>
          <NotificationList records={sent.notified} locale={locale} />
          <Button asChild className="mt-4">
            <Link href="/app#helper-requests">{d.toFamily}</Link>
          </Button>
        </Section>
      ) : null}

      <div className="grid gap-6">
        <Section title={d.about}>
          <p className="whitespace-pre-line text-ink">{helper.bio}</p>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="mb-1.5 font-bold text-ink">{d.offers}</dt>
              <dd>
                <ServiceChips services={helper.services} locale={locale} highlight={service} />
              </dd>
            </div>
            <div>
              <dt className="font-bold text-ink">{d.speaks}</dt>
              <dd className="text-ink">{languageList(helper.languages, locale)}</dd>
            </div>
          </dl>
          <p className="mt-5 text-xs text-muted">{helper.verified ? d.verifiedNote : d.unverifiedNote}</p>
          <p className="mt-2 inline-flex items-center gap-2 text-xs text-muted">
            <Lock className="size-3.5" aria-hidden /> {d.contactHidden}
          </p>
        </Section>

        {isOwn ? (
          <Section tone="camomilla">
            <p className="mb-3 text-ink">{d.ownProfile}</p>
            <Button asChild variant="outline">
              <Link href="/helpers/me">{t.nav.myProfile}</Link>
            </Button>
          </Section>
        ) : !member ? (
          <Section tone="glicine" title={d.signInTitle}>
            <p className="mb-4 text-ink">{d.signInBody}</p>
            <Button asChild size="lg">
              <Link href={`/login?next=${encodeURIComponent(here)}`}>
                <LogIn aria-hidden /> {d.signIn}
              </Link>
            </Button>
          </Section>
        ) : !overview || overview.seniors.length === 0 ? (
          <Section tone="glicine" title={d.signInTitle}>
            <p className="mb-4 text-ink">{d.setupFirst}</p>
            <Button asChild>
              <Link href="/app/setup">{t.nav.family}</Link>
            </Button>
          </Section>
        ) : !sent ? (
          <Section tone="glicine" title={d.sendTitle}>
            <p className="mb-5 text-sm text-ink">{d.sendLede}</p>
            <HelperRequestForm
              action={sendHelperRequest}
              locale={locale}
              helperId={helper.id}
              services={helper.services}
              seniors={overview.seniors.map((s) => ({ id: s.id, first_name: s.first_name }))}
              defaultService={service}
              helpRequestId={helpRequest?.id ?? null}
              defaultMessage={helpRequest?.summary ?? ""}
            />
          </Section>
        ) : null}
      </div>
    </MarketplaceShell>
  );
}
