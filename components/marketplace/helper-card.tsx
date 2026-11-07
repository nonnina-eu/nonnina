import Link from "next/link";
import { BadgeCheck, Clock, HeartHandshake, MapPin } from "lucide-react";
import type { HelperService, PublicHelper } from "@/lib/db/types";
import { formatRate, marketplaceT, type MarketplaceLocale } from "@/lib/i18n/marketplace";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ verified, locale }: { verified: boolean; locale: MarketplaceLocale }) {
  const t = marketplaceT(locale).common;
  return verified ? (
    <Badge variant="success">
      <BadgeCheck className="size-3.5" aria-hidden /> {t.verified}
    </Badge>
  ) : (
    <Badge variant="outline">
      <Clock className="size-3.5" aria-hidden /> {t.notVerified}
    </Badge>
  );
}

export function RateLabel({ helper, locale }: { helper: Pick<PublicHelper, "hourly_rate_eur" | "kind">; locale: MarketplaceLocale }) {
  const t = marketplaceT(locale).common;
  if (helper.hourly_rate_eur === null) {
    return (
      <span className="inline-flex items-center gap-1 font-bold text-bene">
        <HeartHandshake className="size-4" aria-hidden /> {helper.kind === "volunteer" ? t.volunteer : t.free}
      </span>
    );
  }
  return <span className="font-bold text-ink">{formatRate(helper.hourly_rate_eur, locale)}</span>;
}

export function ServiceChips({ services, locale, highlight }: { services: HelperService[]; locale: MarketplaceLocale; highlight?: HelperService | null }) {
  const t = marketplaceT(locale).services;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {services.map((s) => (
        <li key={s} className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", s === highlight ? "bg-sole text-ink" : "bg-glicine text-ink")}>
          {t[s]}
        </li>
      ))}
    </ul>
  );
}

export function languageList(languages: string[], locale: MarketplaceLocale): string {
  const names = marketplaceT(locale).languages;
  return languages.map((l) => names[l] ?? l.toUpperCase()).join(", ");
}

/** Directory card. Never receives contact data (PublicHelper). */
export function HelperCard({ helper, locale, href, highlight }: { helper: PublicHelper; locale: MarketplaceLocale; href: string; highlight?: HelperService | null }) {
  const t = marketplaceT(locale);
  return (
    <article className="relative flex h-full flex-col rounded-xl border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl leading-tight text-ink">
            <Link href={href} className="after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sole">
              {helper.name}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-muted">
            {t.kinds[helper.kind]} · <MapPin className="inline size-3.5 align-[-2px]" aria-hidden /> {helper.city}
          </p>
        </div>
        <VerifiedBadge verified={helper.verified} locale={locale} />
      </div>
      <p className="mt-3 line-clamp-3 text-sm text-ink">{helper.bio}</p>
      <div className="mt-4">
        <ServiceChips services={helper.services} locale={locale} highlight={highlight} />
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 text-sm">
        <span className="text-muted">
          {t.detail.speaks}: {languageList(helper.languages, locale)}
        </span>
        <RateLabel helper={helper} locale={locale} />
      </div>
    </article>
  );
}
