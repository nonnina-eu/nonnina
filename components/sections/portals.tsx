import Link from "next/link";
import { Spark } from "../brand";
import { ArrowRight, Hand, Heart, Mic, Users } from "../icons";
import type { Dictionary } from "@/lib/i18n";

const look: Record<string, { tone: string; icon: typeof Mic; btn: string }> = {
  senior: { tone: "bg-ink text-white", icon: Mic, btn: "btn-sole" },
  family: { tone: "bg-menta", icon: Users, btn: "btn-ink" },
  find: { tone: "bg-camomilla", icon: Hand, btn: "btn-ink" },
  offer: { tone: "bg-glicine", icon: Heart, btn: "btn-ink" },
};

/** Four doors into the product, right below the hero: senior, family, find a helper, offer help. */
export function Portals({ t }: { t: Dictionary["portals"] }) {
  return (
    <section id="start" className="wrap scroll-mt-24 py-10 md:py-14" aria-labelledby="start-title">
      <span className="eyebrow"><Spark className="size-3.5" />{t.eyebrow}</span>
      <h2 id="start-title" className="h-section mt-4 max-w-3xl text-balance">{t.title}</h2>
      <p className="lede mt-3 max-w-2xl">{t.lede}</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {t.items.map((item) => {
          const l = look[item.key] ?? look.find;
          const Icon = l.icon;
          const dark = item.key === "senior";
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className={`group flex h-full min-h-[17rem] flex-col rounded-lg p-6 transition-transform hover:-translate-y-1 ${l.tone}`}
              >
                <span className={`grid size-14 place-items-center rounded-md ${dark ? "bg-white/10" : "bg-white"}`}>
                  <Icon className="size-7" />
                </span>
                <span className="mt-5 font-display text-[1.75rem] leading-[1.02]">{item.title}</span>
                <span className={`mt-3 flex-1 text-[1.0625rem] leading-snug ${dark ? "text-white/80" : "text-graphite"}`}>{item.body}</span>
                <span className={`btn btn-sm mt-6 self-start ${l.btn}`}>
                  {item.cta}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
