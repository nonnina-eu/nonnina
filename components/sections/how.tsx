import { Mic, Heart, Bell } from "../icons";
import { SectionHeading } from "./heading";
import type { Dictionary } from "@/lib/i18n";

export function HowItWorks({ t }: { t: Dictionary["how"] }) {
  const icons = [Mic, Heart, Bell];
  return (
    <section id="how" className="bg-latte py-16 md:py-28" aria-labelledby="how-title">
      <div className="wrap">
        <SectionHeading id="how-title" eyebrow={t.eyebrow} title={t.title} />
        <ol className="grid gap-4 md:grid-cols-3">
          {t.steps.map((step, i) => {
            const Icon = icons[i];
            return (
              <li key={step.title} className={`reveal reveal-d${i + 1} relative rounded-lg bg-white p-7`}>
                <span className="font-display text-5xl leading-none text-ink/15">{String(i + 1).padStart(2, "0")}</span>
                <Icon className="absolute right-7 top-7 size-6" />
                <h3 className="mt-6 text-[1.75rem] leading-none">{step.title}</h3>
                <p className="mt-2 text-[0.9375rem] text-muted">{step.body}</p>
              </li>
            );
          })}
        </ol>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="reveal rounded-lg border-2 border-bene/25 bg-salvia p-6">
            <p className="font-display text-2xl leading-none">{t.yes.label}</p>
            <p className="mt-2 text-[0.9375rem] text-graphite">{t.yes.body}</p>
          </div>
          <div className="reveal reveal-d1 rounded-lg border-2 border-sole/50 bg-camomilla p-6">
            <p className="font-display text-2xl leading-none">{t.no.label}</p>
            <p className="mt-2 text-[0.9375rem] text-graphite">{t.no.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
