import { LanguageProvider } from "@/components/landing/language-provider";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Safety } from "@/components/landing/safety";
import { Layers } from "@/components/landing/layers";
import { Trust } from "@/components/landing/trust";
import { Faq } from "@/components/landing/faq";
import { WaitlistForm } from "@/components/landing/waitlist-form";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <LanguageProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Problem />
        <HowItWorks />
        <Safety />
        <Layers />
        <Trust />
        <Faq />
        <WaitlistForm />
      </main>
      <Footer />
    </LanguageProvider>
  );
}
