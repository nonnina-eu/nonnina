import type { Metadata } from "next";
import Link from "next/link";
import { HandHelping, Search, UserPlus } from "lucide-react";
import { getCurrentMember } from "@/lib/auth";
import { getStore } from "@/lib/db";
import type { HelpRequest } from "@/lib/db/types";
import { getHelperSession } from "@/lib/helper-auth";
import { getMarketplaceT } from "@/lib/i18n/marketplace-locale";
import { DEFAULT_CITY, HELPER_LANGUAGES, HELPER_SERVICES, isHelperService } from "@/lib/marketplace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageTitle, Section } from "@/components/family/shell";
import { HelperCard } from "@/components/marketplace/helper-card";
import { MarketplaceShell } from "@/components/marketplace/shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Find a helper",
  description: "Verified helpers, care services and volunteers for older people: shopping, cooking, company, appointments.",
};

type Props = { searchParams: Promise<{ service?: string; city?: string; language?: string; verified?: string; request?: string }> };

const selectClass =
  "flex h-12 w-full rounded-sm border border-line bg-white px-4 text-base text-ink focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sole/50";

export default async function HelpersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const { locale, t } = await getMarketplaceT();
  const service = isHelperService(sp.service) ? sp.service : undefined;
  const city = (sp.city ?? DEFAULT_CITY).trim().slice(0, 80);
  const language = (HELPER_LANGUAGES as readonly string[]).includes(sp.language ?? "") ? sp.language : undefined;
  const verifiedOnly = sp.verified === "1";

  const [member, helperSession] = await Promise.all([getCurrentMember(), getHelperSession()]);
  const store = getStore();
  const helpers = await store.listHelpers({ service, city: city || undefined, language, verifiedOnly });

  // "Find a helper" from a help request: show what it is about (only for the member's own family).
  let forRequest: { request: HelpRequest; seniorName: string } | null = null;
  if (sp.request && member?.family) {
    const feed = await store.getFamilyFeed(member.family.id, 200);
    const request = feed?.helpRequests.find((h) => h.id === sp.request);
    if (request) forRequest = { request, seniorName: feed!.seniors.find((s) => s.id === request.senior_id)?.first_name ?? "" };
  }

  const carry = new URLSearchParams();
  if (service) carry.set("service", service);
  if (forRequest) carry.set("request", forRequest.request.id);
  const detailQuery = carry.toString() ? `?${carry.toString()}` : "";
  const here = `/helpers${(() => {
    const q = new URLSearchParams();
    for (const [k, val] of Object.entries(sp)) if (typeof val === "string" && val) q.set(k, val);
    return q.toString() ? `?${q.toString()}` : "";
  })()}`;

  return (
    <MarketplaceShell locale={locale} active="find" isHelper={Boolean(helperSession?.helper)} isFamily={Boolean(member?.family)} here={here}>
      <PageTitle eyebrow={t.directory.eyebrow} title={t.directory.title} lede={t.directory.lede} />

      {forRequest ? (
        <div className="mb-6 rounded-xl border border-line bg-glicine p-5 shadow-soft">
          <p className="inline-flex items-center gap-2 text-sm font-bold text-ink">
            <HandHelping className="size-4" aria-hidden /> {t.directory.forRequest(forRequest.seniorName)}
          </p>
          <p className="mt-1 text-base text-ink">“{forRequest.request.summary}”</p>
        </div>
      ) : null}

      <Section className="mb-6">
        <form method="get" action="/helpers" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-end">
          {forRequest ? <input type="hidden" name="request" value={forRequest.request.id} /> : null}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-service" className="text-sm font-bold text-ink">
              {t.directory.service}
            </label>
            <select id="f-service" name="service" defaultValue={service ?? ""} className={selectClass}>
              <option value="">{t.directory.anyService}</option>
              {HELPER_SERVICES.map((s) => (
                <option key={s} value={s}>
                  {t.services[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-city" className="text-sm font-bold text-ink">
              {t.directory.city}
            </label>
            <Input id="f-city" name="city" defaultValue={city} maxLength={80} autoComplete="address-level2" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-language" className="text-sm font-bold text-ink">
              {t.directory.language}
            </label>
            <select id="f-language" name="language" defaultValue={language ?? ""} className={selectClass}>
              <option value="">{t.directory.anyLanguage}</option>
              {HELPER_LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {t.languages[l]}
                </option>
              ))}
            </select>
          </div>
          <label className="flex h-12 cursor-pointer items-center gap-3 text-sm font-bold text-ink">
            <input type="checkbox" name="verified" value="1" defaultChecked={verifiedOnly} className="size-5 accent-ink" />
            {t.directory.verifiedOnly}
          </label>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4">
            <Button type="submit">
              <Search aria-hidden /> {t.directory.apply}
            </Button>
            <Link href={forRequest ? `/helpers?request=${forRequest.request.id}` : "/helpers"} className="text-sm font-bold text-link underline-offset-4 hover:underline">
              {t.directory.reset}
            </Link>
          </div>
        </form>
      </Section>

      <p className="mb-3 text-sm text-muted" role="status">
        {t.directory.count(helpers.length)}
        {city ? ` · ${city}` : ""}
      </p>

      {helpers.length === 0 ? (
        <div className="rounded-xl border border-line bg-white p-8 text-center text-sm text-ink">{t.directory.empty}</div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {helpers.map((h) => (
            <li key={h.id}>
              <HelperCard helper={h} locale={locale} href={`/helpers/${h.id}${detailQuery}`} highlight={service ?? null} />
            </li>
          ))}
        </ul>
      )}

      <Section tone="camomilla" className="mt-8" title={t.directory.offerCta}>
        <p className="mb-4 text-ink">{t.directory.offerCtaBody}</p>
        <Button asChild variant="outline">
          <Link href={helperSession?.helper ? "/helpers/me" : "/helpers/join"}>
            <UserPlus aria-hidden /> {helperSession?.helper ? t.nav.myProfile : t.nav.offer}
          </Link>
        </Button>
      </Section>
    </MarketplaceShell>
  );
}
