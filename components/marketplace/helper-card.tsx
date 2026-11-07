import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Clock, FlaskConical, HeartHandshake, MapPin, PiggyBank } from "lucide-react";
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

/** Small "Demo profile" label for seeded showcase profiles (helpers.is_demo). */
export function DemoProfileBadge({ isDemo, locale }: { isDemo: boolean; locale: MarketplaceLocale }) {
  if (!isDemo) return null;
  const t = marketplaceT(locale).common;
  return (
    <Badge variant="warning" title={t.demoProfileHint}>
      <FlaskConical className="size-3.5" aria-hidden /> {t.demoProfile}
    </Badge>
  );
}

/** "Payable via relief amount (131 €)" for recognised offers (helpers.relief_eligible). */
export function ReliefBadge({ eligible, locale }: { eligible: boolean; locale: MarketplaceLocale }) {
  if (!eligible) return null;
  const t = marketplaceT(locale).common;
  return (
    <Badge variant="default" className="bg-camomilla text-ink" title={t.reliefEligibleHint}>
      <PiggyBank className="size-3.5" aria-hidden /> {t.reliefEligible}
    </Badge>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? [parts[0][0], parts[parts.length - 1][0]] : [parts[0]?.[0] ?? "?"];
  return letters.join("").toUpperCase();
}

/** Round profile photo, or the helper's initials when there is no photo. */
export function HelperAvatar({ helper, size = 64, className }: { helper: Pick<PublicHelper, "name" | "photo_url">; size?: number; className?: string }) {
  if (helper.photo_url) {
    return (
      <Image
        src={helper.photo_url}
        alt={helper.name}
        width={size}
        height={size}
        sizes={`${size}px`}
        className={cn("shrink-0 rounded-full border border-line object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 select-none items-center justify-center rounded-full bg-glicine font-display text-ink", className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {initials(helper.name)}
    </span>
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
      <div className="flex items-start gap-4">
        <HelperAvatar helper={helper} size={64} />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl leading-tight text-ink">
            <Link href={href} className="after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sole">
              {helper.name}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-muted">
            {t.kinds[helper.kind]} · <MapPin className="inline size-3.5 align-[-2px]" aria-hidden /> {helper.city}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <VerifiedBadge verified={helper.verified} locale={locale} />
            <ReliefBadge eligible={helper.relief_eligible} locale={locale} />
            <DemoProfileBadge isDemo={helper.is_demo} locale={locale} />
          </div>
        </div>
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
