import Link from "next/link";
import { Logo } from "@/components/logo";
import { familyT } from "@/lib/i18n/family";
import { MARKETPLACE_LOCALES, marketplaceT, type MarketplaceLocale } from "@/lib/i18n/marketplace";
import { cn } from "@/lib/utils";

interface MarketplaceShellProps {
  children: React.ReactNode;
  locale: MarketplaceLocale;
  active?: "find" | "offer" | "none";
  /** A helper session exists (shows "My helper profile" and sign out). */
  isHelper?: boolean;
  /** A family member is signed in (shows the family area link). */
  isFamily?: boolean;
  /** Path to come back to after switching the language. */
  here: string;
  narrow?: boolean;
}

/** Page frame of the marketplace, same look as FamilyShell (Latte page, white header, disclaimer). */
export function MarketplaceShell({ children, locale, active = "none", isHelper = false, isFamily = false, here, narrow = false }: MarketplaceShellProps) {
  const t = marketplaceT(locale);
  const nav = [
    { key: "find" as const, href: "/helpers", label: t.nav.find },
    { key: "offer" as const, href: isHelper ? "/helpers/me" : "/helpers/join", label: isHelper ? t.nav.myProfile : t.nav.offer },
  ];
  return (
    <div className="flex min-h-dvh flex-col bg-latte">
      <header className="border-b border-line bg-white/85 backdrop-blur">
        <div className="container flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2">
          <Link href="/" aria-label="Nonnina – home">
            <Logo />
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm font-bold" aria-label="Marketplace">
            {nav.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active === item.key ? "page" : undefined}
                className={cn("rounded-sm px-3 py-2 text-ink transition hover:bg-mist", active === item.key && "bg-ink text-white hover:bg-ink")}
              >
                {item.label}
              </Link>
            ))}
            {isFamily ? (
              <Link href="/app" className="rounded-sm px-3 py-2 text-ink transition hover:bg-mist">
                {t.nav.family}
              </Link>
            ) : null}
          </nav>
        </div>
      </header>
      <main className={cn("container flex-1 py-8", narrow ? "max-w-2xl" : "max-w-5xl")}>{children}</main>
      <footer className="border-t border-line py-6 text-center text-sm text-muted">
        <p>{familyT().footer}</p>
        <p className="mt-3 inline-flex items-center gap-1" aria-label={t.nav.language}>
          {MARKETPLACE_LOCALES.map((l) => (
            <a
              key={l}
              href={`/helpers/lang?l=${l}&next=${encodeURIComponent(here)}`}
              lang={l}
              aria-current={l === locale ? "true" : undefined}
              className={cn("rounded-sm px-2 py-1 font-bold uppercase hover:bg-mist", l === locale ? "text-ink underline underline-offset-4" : "text-muted")}
            >
              {l}
            </a>
          ))}
        </p>
      </footer>
    </div>
  );
}
