"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { useLanding } from "./language-provider";
import { cn } from "@/lib/utils";
import type { LandingLocale } from "@/lib/i18n/landing";

const locales: LandingLocale[] = ["it", "en", "de"];

export function Header() {
  const { t, locale, setLocale } = useLanding();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { href: "#come-funziona", label: t.nav.how },
    { href: "#sicurezza", label: t.nav.safety },
    { href: "#famiglia", label: t.nav.family },
    { href: "#domande", label: t.nav.faq },
  ];

  return (
    <header className="sticky top-0 z-40">
      <div
        className={cn(
          "border-b transition-colors",
          scrolled ? "border-black/5 bg-white/95 shadow-[0_2px_5px_rgba(0,0,0,0.06)] backdrop-blur" : "border-transparent bg-white",
        )}
      >
        <div className="container flex h-[4.5rem] items-center justify-between gap-4">
          <Link href="/" aria-label="Nonnina, nonnina.eu" className="shrink-0" onClick={() => setOpen(false)}>
            <Logo wordmark />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-8 text-sm font-semibold text-[#202128] lg:flex">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="transition-opacity hover:opacity-60">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div role="group" aria-label="Language" className="hidden items-center gap-1 text-xs font-bold uppercase text-[#8b94a7] sm:flex">
              {locales.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLocale(code)}
                  aria-pressed={locale === code}
                  className={cn("rounded px-1.5 py-1", locale === code ? "text-[#202128]" : "hover:text-[#202128]")}
                >
                  {code}
                </button>
              ))}
            </div>
            <a
              href="#lista"
              className="hidden items-center gap-2 rounded-lg border border-[#202128] px-4 py-2 text-sm font-bold text-[#202128] transition-colors hover:bg-[#f5f7fb] sm:inline-flex"
            >
              {t.nav.cta}
              <ArrowRight className="size-4" />
            </a>
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-lg lg:hidden"
              aria-expanded={open}
              aria-label={open ? t.nav.close : t.nav.menu}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-6" /> : <Burger />}
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 top-[4.5rem] z-30 overflow-y-auto bg-white lg:hidden">
          <nav className="container flex flex-col gap-2 py-8" aria-label="Main">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-display text-4xl font-extrabold tracking-[-0.04em] text-[#202128]"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#lista"
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-[#202128] px-5 py-3 text-base font-bold text-white"
            >
              {t.nav.cta}
              <ArrowRight className="size-4" />
            </a>
            <div role="group" aria-label="Language" className="mt-8 flex gap-3 text-sm font-bold uppercase">
              {locales.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLocale(code)}
                  aria-pressed={locale === code}
                  className={locale === code ? "text-[#202128]" : "text-[#8b94a7]"}
                >
                  {code}
                </button>
              ))}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function Burger() {
  return (
    <span className="flex w-6 flex-col gap-1.5" aria-hidden>
      <span className="h-0.5 w-full bg-[#202128]" />
      <span className="h-0.5 w-full bg-[#202128]" />
      <span className="h-0.5 w-3/4 bg-[#202128]" />
    </span>
  );
}
