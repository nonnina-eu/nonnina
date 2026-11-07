import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { RevealObserver } from "@/components/reveal-observer";
import { Hero } from "@/components/sections/hero";
import { Portals } from "@/components/sections/portals";
import { SeniorTab } from "@/components/senior-tab";
import { TrustStrip } from "@/components/sections/strip";
import { Features } from "@/components/sections/features";
import { HowItWorks } from "@/components/sections/how";
import { Companion, Families, Health, Helpers, Safety } from "@/components/sections/blocks";
import { Marketplace } from "@/components/sections/marketplace";
import { PromiseBand } from "@/components/sections/promise";
import { Faq } from "@/components/sections/faq";
import { Waitlist } from "@/components/sections/waitlist";
import { Footer } from "@/components/sections/footer";
import { getDictionary, isLocale } from "@/lib/i18n";
import { legalPath } from "@/lib/legal";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xs focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        {t.skip}
      </a>
      <Header t={t.nav} locale={locale} />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero t={t.hero} />
        <Portals t={t.portals} />
        <TrustStrip items={t.strip} />
        <Features t={t.features} />
        <HowItWorks t={t.how} />
        <div className="py-10 md:py-16">
          <Companion t={t.companion} cta={t.nav.cta} />
          <Health t={t.health} cta={t.nav.cta} />
          <Safety t={t.safety} />
          <Families t={t.families} cta={t.nav.cta} />
          <Marketplace t={t.marketplace} />
          <Helpers t={t.helpers} />
        </div>
        <PromiseBand t={t.promise} />
        <Faq t={t.faq} />
        <Waitlist t={t.waitlist} privacyHref={legalPath(locale, "privacy")} />
      </main>
      <Footer t={t.footer} nav={t.nav} locale={locale} cookies={t.cookies} />
      <SeniorTab t={t.seniorTab} />
      <RevealObserver />
    </>
  );
}
