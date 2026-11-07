import Link from "next/link";
import { Spark } from "../brand";
import { ArrowRight, CheckBadge } from "../icons";
import type { Dictionary } from "@/lib/i18n";
import { appHelpersUrl } from "@/lib/site";

const tones = ["bg-camomilla", "bg-salvia", "bg-glicine", "bg-menta", "bg-cielo", "bg-camomilla", "bg-cielo", "bg-salvia"];
const serviceKeys = ["shopping", "cooking", "company", "household", "transport", "appointments", "paperwork", "tech_help"];

export function Marketplace({ t }: { t: Dictionary["marketplace"] }) {
  return (
    <section id="marketplace" className="wrap py-6 md:py-8" aria-labelledby="marketplace-title">
      <div className="grid gap-10 rounded-xl border border-line bg-white p-6 sm:p-10 md:grid-cols-[1fr_1.1fr] md:items-center md:p-14">
        <div className="reveal">
          <span className="eyebrow"><Spark className="size-3.5" />{t.eyebrow}</span>
          <h2 id="marketplace-title" className="mt-4 text-balance text-[2.25rem] leading-[1.02] sm:text-5xl">{t.title}</h2>
          <p className="lede mt-4">{t.lede}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={appHelpersUrl()} className="btn btn-ink">{t.browse}<ArrowRight className="size-[18px]" /></Link>
            <Link href={appHelpersUrl("/join")} className="btn btn-outline">{t.offer}</Link>
          </div>
          <p className="mt-5 flex items-start gap-2 text-sm text-muted"><CheckBadge className="mt-0.5 size-4 shrink-0" />{t.note}</p>
        </div>
        <ul className="reveal reveal-d1 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {t.services.map((s, i) => (
            <li key={s}>
              <a
                href={appHelpersUrl(`?service=${serviceKeys[i]}`)}
                className={`flex min-h-[96px] items-end break-words rounded-lg ${tones[i]} p-4 font-display text-[1.25rem] leading-none hyphens-auto transition-transform hover:-translate-y-0.5`}
              >
                {s}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
