import { LanguageProvider } from "@/components/landing/language-provider";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Together } from "@/components/landing/together";
import { Ask } from "@/components/landing/ask";
import { Safety } from "@/components/landing/safety";
import { Moments } from "@/components/landing/moments";
import { QuoteBand } from "@/components/landing/quote-band";
import { Faq } from "@/components/landing/faq";
import { WaitlistForm } from "@/components/landing/waitlist-form";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <LanguageProvider>
      <div className="site">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[#202128] focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">
          <Hero />
          <Features />
          <Together />
          <Ask />
          <Safety />
          <Moments />
          <QuoteBand />
          <Faq />
          <WaitlistForm />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
