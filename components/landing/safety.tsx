"use client";

import { Phone, ShieldCheck } from "lucide-react";
import { Eyebrow, Reveal, Section } from "./section";
import { useLanding } from "./language-provider";

export function Safety() {
  const { t } = useLanding();
  return (
    <Section id="safety">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>{t.safety.eyebrow}</Eyebrow>
          <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">{t.safety.title}</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t.safety.body}</p>
          <ul className="mt-6 space-y-3">
            {t.safety.bullets.map((b) => (
              <li key={b} className="flex gap-3 text-base">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">{t.safety.note}</p>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            role="img"
            aria-label="Emergency mode on the senior screen"
            className="mx-auto aspect-[4/3] w-full max-w-[560px] rounded-[2rem] border-[10px] border-slate-900 bg-slate-900 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)]"
          >
            <div className="flex h-full flex-col justify-between rounded-[1.4rem] bg-[#7F1D1D] p-[6%] text-white">
              <div>
                <p className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">{t.safety.screenTitle}</p>
                <p className="mt-2 text-base text-red-100 sm:text-lg">{t.safety.screenBody}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3 rounded-full bg-white py-4 text-xl font-bold text-red-700 shadow-lg sm:text-2xl">
                  <Phone className="size-6" />
                  {t.safety.screenCall}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-center gap-2 rounded-full border-2 border-white/60 py-3 text-base font-semibold sm:text-lg">
                    <Phone className="size-5" />
                    {t.safety.screenRelative}
                  </div>
                  <div className="flex items-center justify-center rounded-full bg-white/15 py-3 text-base font-semibold sm:text-lg">{t.safety.screenFine}</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
