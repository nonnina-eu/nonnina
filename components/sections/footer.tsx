import { Logo } from "../brand";
import { LanguageSwitcher } from "../language-switcher";
import type { Dictionary, Locale } from "@/lib/i18n";
import { appDemoUrl } from "@/lib/site";

export function Footer({ t, nav, locale }: { t: Dictionary["footer"]; nav: Dictionary["nav"]; locale: Locale }) {
  return (
    <footer className="mt-12 border-t border-line">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr]">
        <div className="grid content-start gap-4">
          <span className="text-[2rem]"><Logo /></span>
          <p className="max-w-xs text-muted">{t.tagline}</p>
          <LanguageSwitcher current={locale} label={nav.language} className="w-fit" />
        </div>
        <nav aria-label={t.product} className="grid content-start gap-2.5 text-[0.9375rem]">
          <p className="mb-1 font-extrabold">{t.product}</p>
          <a href="#how" className="text-muted hover:text-ink">{nav.how}</a>
          <a href="#safety" className="text-muted hover:text-ink">{nav.safety}</a>
          <a href="#families" className="text-muted hover:text-ink">{nav.families}</a>
          <a href="#helpers" className="text-muted hover:text-ink">{nav.helpers}</a>
          <a href={appDemoUrl()} className="text-muted hover:text-ink" rel="noopener">{t.demo}</a>
        </nav>
        <div className="grid content-start gap-2.5 text-[0.9375rem]">
          <p className="mb-1 font-extrabold">{t.company}</p>
          <a href="#faq" className="text-muted hover:text-ink">{nav.faq}</a>
          <a href="#waitlist" className="text-muted hover:text-ink">{nav.cta}</a>
          <p className="text-muted">{t.built}</p>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="wrap flex flex-col gap-2 py-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>© 2026 Nonnina. {t.rights}</p>
          <p className="font-bold text-graphite">{t.emergency}</p>
          <p>{t.advice}</p>
        </div>
      </div>
    </footer>
  );
}
