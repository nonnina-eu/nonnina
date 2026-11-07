"use client";

import { useEffect, useState } from "react";
import { Logo } from "./brand";
import { Close, MenuIcon } from "./icons";
import { LanguageSwitcher } from "./language-switcher";
import { localePath, type Dictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Header({ t, locale }: { t: Dictionary["nav"]; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [
    { href: "#how", label: t.how },
    { href: "#safety", label: t.safety },
    { href: "#families", label: t.families },
    { href: "#helpers", label: t.helpers },
    { href: "#faq", label: t.faq },
  ];

  return (
    <header className={cn("sticky top-0 z-50 transition-colors", scrolled || open ? "border-b border-line bg-white/90 backdrop-blur-md" : "bg-white")}>
      <div className="wrap flex h-16 items-center justify-between gap-4 md:h-20">
        <a href={localePath(locale)} aria-label="Nonnina" className="text-[1.75rem]">
          <Logo />
        </a>
        <nav aria-label="Main" className="hidden items-center gap-7 text-[0.9375rem] font-bold lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-ink/80 transition-colors hover:text-ink">{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher current={locale} label={t.language} className="hidden sm:inline-flex" />
          <a href="#waitlist" className="btn btn-outline btn-sm hidden md:inline-flex">{t.cta}</a>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-xs border border-line lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.close : t.menu}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <Close className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>
      <div id="mobile-menu" hidden={!open} className="border-t border-line bg-white lg:hidden">
        <nav aria-label="Mobile" className="wrap flex flex-col gap-1 py-4">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-xs px-2 py-3 text-lg font-bold hover:bg-mist">{l.label}</a>
          ))}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <LanguageSwitcher current={locale} label={t.language} />
            <a href="#waitlist" onClick={() => setOpen(false)} className="btn btn-ink btn-sm">{t.cta}</a>
          </div>
        </nav>
      </div>
    </header>
  );
}
