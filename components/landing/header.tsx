"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useLanding } from "./language-provider";
import { cn } from "@/lib/utils";

export function Header() {
  const { t, locale, setLocale } = useLanding();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors",
        scrolled ? "border-b border-border/70 bg-background/80 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4 md:h-20">
        <Link href="/" aria-label="Care Copilot home" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-foreground">{t.nav.how}</a>
          <a href="#safety" className="transition-colors hover:text-foreground">{t.nav.safety}</a>
          <a href="#layers" className="transition-colors hover:text-foreground">{t.nav.helpers}</a>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <div role="group" aria-label="Language" className="flex rounded-full border border-border bg-card p-0.5 text-xs font-semibold">
            {(["en", "de"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLocale(l)}
                aria-pressed={locale === l}
                className={cn(
                  "rounded-full px-2.5 py-1.5 uppercase transition-colors",
                  locale === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href="#waitlist">
              {t.nav.cta}
              <ArrowRight />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
