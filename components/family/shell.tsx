import Link from "next/link";
import { Logo } from "@/components/logo";
import { familyT } from "@/lib/i18n/family";
import { cn } from "@/lib/utils";

interface ShellProps {
  children: React.ReactNode;
  /** Current nav item. */
  active?: "alerts" | "helpers" | "settings" | "setup" | "none";
  seniorName?: string | null;
  signedIn?: boolean;
  narrow?: boolean;
}

/** Page frame of the family area: Latte page, white header with the logo, footer disclaimer. */
export function FamilyShell({ children, active = "none", seniorName, signedIn = true, narrow = true }: ShellProps) {
  const t = familyT();
  const nav = [
    { key: "alerts" as const, href: "/app", label: t.nav.alerts },
    { key: "helpers" as const, href: "/helpers", label: t.nav.findHelp },
    { key: "settings" as const, href: "/app/settings", label: t.nav.settings },
  ];
  return (
    <div className="flex min-h-dvh flex-col bg-latte">
      <header className="border-b border-line bg-white/85 backdrop-blur">
        <div className="container flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="Nonnina – home">
              <Logo />
            </Link>
            {seniorName ? (
              <span className="hidden items-center gap-2 rounded-full bg-glicine px-3 py-1 text-sm font-bold text-ink sm:inline-flex">
                {seniorName}
              </span>
            ) : null}
          </div>
          {signedIn ? (
            <nav className="flex flex-wrap items-center gap-1 text-sm font-bold" aria-label="Family area">
              {nav.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={active === item.key ? "page" : undefined}
                  className={cn(
                    "rounded-sm px-3 py-2 text-ink transition hover:bg-mist",
                    active === item.key && "bg-ink text-white hover:bg-ink",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <form action="/auth/signout" method="post">
                <button type="submit" className="rounded-sm px-3 py-2 text-muted transition hover:bg-mist hover:text-ink">
                  {t.nav.signOut}
                </button>
              </form>
            </nav>
          ) : null}
        </div>
      </header>
      <main className={cn("container flex-1 py-8", narrow && "max-w-2xl")}>{children}</main>
      <footer className="border-t border-line py-6 text-center text-sm text-muted">{t.footer}</footer>
    </div>
  );
}

export function PageTitle({ title, lede, eyebrow }: { title: string; lede?: string; eyebrow?: string }) {
  return (
    <div className="mb-6">
      {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
      <h1 className="font-display text-[2.25rem] leading-[1.02] text-ink sm:text-5xl">{title}</h1>
      {lede ? <p className="lede mt-3">{lede}</p> : null}
    </div>
  );
}

export function Section({ title, tone = "white", children, className }: { title?: string; tone?: "white" | "glicine" | "camomilla" | "menta" | "cielo" | "salvia"; children: React.ReactNode; className?: string }) {
  const bg = { white: "bg-white", glicine: "bg-glicine", camomilla: "bg-camomilla", menta: "bg-menta", cielo: "bg-cielo", salvia: "bg-salvia" }[tone];
  return (
    <section className={cn("rounded-xl border border-line p-5 shadow-soft sm:p-6", bg, className)}>
      {title ? <h2 className="font-display mb-4 text-2xl text-ink">{title}</h2> : null}
      {children}
    </section>
  );
}

export function Field({ label, hint, htmlFor, children, error }: { label: string; hint?: string; htmlFor?: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-bold text-ink">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? (
        <p className="text-sm font-bold text-allarme" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-sm border border-allarme/30 bg-allarme-soft px-4 py-3 text-sm font-bold text-allarme">
      {message}
    </p>
  );
}
