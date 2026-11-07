import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Story } from "@/components/landing/story";
import { Safety } from "@/components/landing/safety";
import { Faq } from "@/components/landing/faq";
import { WaitlistForm } from "@/components/landing/waitlist-form";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="site">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[#202128] focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Story />
        <Safety />
        <Faq />
        <WaitlistForm />
      </main>
      <Footer />
    </div>
  );
}
