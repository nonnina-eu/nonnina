import type { Metadata } from "next";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getStore } from "@/lib/db";
import { Logo } from "@/components/logo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Nonnina", robots: { index: false } };

type Lang = "de" | "it" | "en";
const copy: Record<Lang, Record<string, string>> = {
  de: {
    title: "Willkommen bei Nonnina.",
    lede: "Geben Sie den Code ein, den Ihre Familie Ihnen gegeben hat. Danach merkt sich dieses Gerät Ihren Bildschirm.",
    label: "Ihr Code",
    open: "Öffnen",
    error: "Diesen Code kennen wir nicht. Bitte prüfen Sie ihn oder fragen Sie Ihre Familie.",
    family: "Für Angehörige: Den Code und einen QR-Code finden Sie im Familienbereich unter „Einstellungen“.",
    familyCta: "Zum Familienbereich",
    demo: "Ausprobieren ohne Code",
    back: "Zur Startseite",
    note: "Nonnina ist kein Notdienst. Im Notfall rufen Sie 112.",
  },
  it: {
    title: "Benvenuto in Nonnina.",
    lede: "Inserisca il codice che Le ha dato la Sua famiglia. Poi questo dispositivo si ricorderà del Suo schermo.",
    label: "Il Suo codice",
    open: "Apri",
    error: "Non conosciamo questo codice. Lo controlli o chieda alla Sua famiglia.",
    family: "Per i familiari: il codice e il QR code sono nell’area famiglia, in «Impostazioni».",
    familyCta: "Area famiglia",
    demo: "Provare senza codice",
    back: "Torna alla home",
    note: "Nonnina non è un servizio di emergenza. In caso di emergenza chiami il 112.",
  },
  en: {
    title: "Welcome to Nonnina.",
    lede: "Enter the code your family gave you. After that, this device remembers your screen.",
    label: "Your code",
    open: "Open",
    error: "We don’t know this code. Please check it or ask your family.",
    family: "For relatives: the code and a QR code are in the family area under “Settings”.",
    familyCta: "Family area",
    demo: "Try it without a code",
    back: "Back to the start",
    note: "Nonnina is not an emergency service. In an emergency call 112.",
  },
};

async function pickLang(): Promise<Lang> {
  const saved = (await cookies()).get("nonnina-locale")?.value;
  if (saved === "de" || saved === "it" || saved === "en") return saved;
  const accept = ((await headers()).get("accept-language") ?? "").toLowerCase();
  const order = accept.split(",").map((p) => p.trim().slice(0, 2));
  return (order.find((l) => l === "de" || l === "it" || l === "en") as Lang | undefined) ?? "de";
}

export default async function SeniorEntry({ searchParams }: { searchParams: Promise<{ error?: string; code?: string }> }) {
  const sp = await searchParams;
  const remembered = (await cookies()).get("nonnina_senior")?.value;
  if (remembered && !sp.error && (await getStore().getSeniorByToken(remembered))) {
    redirect(`/senior/${encodeURIComponent(remembered)}`);
  }
  const t = copy[await pickLang()];

  return (
    <main className="min-h-dvh bg-latte px-5 py-8 text-ink sm:py-14">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <Link href="/" className="self-start text-2xl" aria-label={t.back}><Logo /></Link>
        <div>
          <h1 className="font-display text-[2.75rem] font-extrabold leading-[1.02] sm:text-6xl">{t.title}</h1>
          <p className="mt-4 text-[1.5rem] leading-snug text-graphite">{t.lede}</p>
        </div>
        <form action="/senior/open" method="get" className="grid gap-4 rounded-2xl bg-white p-6 shadow-soft sm:p-8">
          <label htmlFor="code" className="text-[1.5rem] font-extrabold">{t.label}</label>
          <input
            id="code"
            name="code"
            defaultValue={sp.code ?? ""}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            required
            aria-invalid={sp.error ? true : undefined}
            aria-describedby={sp.error ? "code-error" : undefined}
            className="min-h-[88px] rounded-xl border-2 border-ink/20 bg-white px-6 text-[2rem] font-bold tracking-wide outline-none focus:border-ink"
          />
          {sp.error ? <p id="code-error" role="alert" className="rounded-lg bg-allarme-soft px-5 py-4 text-[1.25rem] font-bold text-allarme-deep">{t.error}</p> : null}
          <button type="submit" className="min-h-[88px] rounded-xl bg-ink text-[1.75rem] font-extrabold text-white transition hover:bg-black">{t.open}</button>
        </form>
        <div className="grid gap-3 text-[1.125rem]">
          <p className="font-bold">{t.demo}:</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/senior/maria-demo" className="inline-flex min-h-[64px] items-center rounded-xl bg-menta px-6 text-[1.25rem] font-extrabold">Maria · Deutsch</Link>
            <Link href="/senior/giulia-demo" className="inline-flex min-h-[64px] items-center rounded-xl bg-camomilla px-6 text-[1.25rem] font-extrabold">Giulia · Italiano</Link>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-white/60 p-5 text-[1.0625rem] text-graphite">
          <p>{t.family}</p>
          <Link href="/app" className="mt-3 inline-block font-extrabold text-link underline underline-offset-4">{t.familyCta}</Link>
        </div>
        <p className="text-[1.0625rem] font-bold text-allarme">{t.note}</p>
      </div>
    </main>
  );
}
