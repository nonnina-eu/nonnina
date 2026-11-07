import { Logo } from "../brand";
import { LanguageSwitcher } from "../language-switcher";
import { localePath, type Dictionary, type Locale } from "@/lib/i18n";
import { appDemoUrl } from "@/lib/site";
import { LEGAL_DOCS, getLegal, legalPath } from "@/lib/legal";
import { CookieSettingsButton } from "../cookie-banner";

export function Footer({ t, nav, locale, cookies }: { t: Dictionary["footer"]; nav: Dictionary["nav"]; locale: Locale; cookies: Dictionary["cookies"] }) {
  // Section anchors point at the home page so they also work from the legal pages.
  const home = localePath(locale);
  const legal = getLegal(locale).chrome;
  return (
    <footer className="mt-12 border-t border-line">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="grid content-start gap-4">
          <span className="text-[2.5rem] leading-none"><Logo /></span>
          <p className="max-w-xs text-muted">{t.tagline}</p>
          <LanguageSwitcher current={locale} label={nav.language} className="w-fit" />
        </div>
        <nav aria-label={t.product} className="grid content-start gap-2.5 text-[0.9375rem]">
          <p className="mb-1 font-extrabold">{t.product}</p>
          <a href={`${home}#how`} className="text-muted hover:text-ink">{nav.how}</a>
          <a href={`${home}#safety`} className="text-muted hover:text-ink">{nav.safety}</a>
          <a href={`${home}#families`} className="text-muted hover:text-ink">{nav.families}</a>
          <a href={`${home}#helpers`} className="text-muted hover:text-ink">{nav.helpers}</a>
          <a href={appDemoUrl()} className="text-muted hover:text-ink" rel="noopener">{t.demo}</a>
        </nav>
        <div className="grid content-start gap-2.5 text-[0.9375rem]">
          <p className="mb-1 font-extrabold">{t.company}</p>
          <a href={`${home}#faq`} className="text-muted hover:text-ink">{nav.faq}</a>
          <a href={`${home}#waitlist`} className="text-muted hover:text-ink">{nav.cta}</a>
          <p className="text-muted">{t.built}</p>
        </div>
        <nav aria-label={legal.label} className="grid content-start gap-2.5 text-[0.9375rem]">
          <p className="mb-1 font-extrabold">{legal.label}</p>
          {LEGAL_DOCS.map((id) => (
            <a key={id} href={legalPath(locale, id)} className="text-muted hover:text-ink">{legal.nav[id]}</a>
          ))}
          <CookieSettingsButton label={cookies.settings} />
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="wrap flex flex-col gap-2 py-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>© 2026 Nonnina. {t.rights}</p>
          <p className="font-bold text-graphite">{t.emergency}</p>
          <p>{t.advice}</p>
          <a href="/brand/nonnina-brand-identity.html" className="text-muted underline-offset-4 hover:text-ink hover:underline">{t.brand}</a>
        </div>
      </div>
    </footer>
  );
}
