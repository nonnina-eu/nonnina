import Image from "next/image";
import { Bell, CheckBadge, Clock, Phone } from "../icons";
import { FeatureBlock } from "./feature-block";
import type { Dictionary } from "@/lib/i18n";

type T = Dictionary;

export function Companion({ t, cta }: { t: T["companion"]; cta: string }) {
  return (
    <FeatureBlock
      eyebrow={t.eyebrow}
      title={t.title}
      points={t.points}
      tone="bg-menta"
      image={{ src: "/photos/tea.jpg", alt: t.imageAlt, position: "55% 50%" }}
      cta={{ href: "#waitlist", label: cta }}
      card={
        <div aria-hidden="true" className="grid gap-2 rounded-md bg-white p-4 shadow-float">
          <span className="eyebrow text-[0.6875rem]">{t.cardTitle}</span>
          <div className="flex items-center justify-between rounded-sm bg-mist px-3 py-2.5 text-[0.9375rem] font-bold text-muted line-through">
            {t.done}<CheckBadge className="size-[18px]" />
          </div>
          <div className="flex items-center justify-between rounded-sm bg-salvia px-3 py-2.5 text-[0.9375rem] font-bold">
            <span className="inline-flex items-center gap-2"><Clock className="size-4" />{t.next}</span>
            <span className="text-[0.8125rem] font-semibold text-graphite">{t.nextIn}</span>
          </div>
        </div>
      }
    />
  );
}

export function Health({ t, cta }: { t: T["health"]; cta: string }) {
  return (
    <FeatureBlock
      reverse
      eyebrow={t.eyebrow}
      title={t.title}
      points={t.points}
      tone="bg-salvia"
      image={{ src: "/photos/pressure.jpg", alt: t.imageAlt, position: "40% 30%" }}
      cta={{ href: "#waitlist", label: cta }}
      card={
        <div aria-hidden="true" className="flex items-stretch gap-3 rounded-md bg-white p-3 shadow-float">
          <div className="relative hidden w-20 shrink-0 overflow-hidden rounded-sm sm:block">
            <Image src="/photos/oximeter.jpg" alt="" fill sizes="80px" className="object-cover" />
          </div>
          <div className="grid gap-1 py-1">
            <span className="eyebrow text-[0.6875rem]">{t.cardTitle}</span>
            <span className="text-[0.9375rem] font-extrabold">{t.cardItem}</span>
            <span className="text-[0.8125rem] text-muted">{t.cardNote}</span>
          </div>
        </div>
      }
    />
  );
}

export function Families({ t, cta }: { t: T["families"]; cta: string }) {
  return (
    <FeatureBlock
      id="families"
      eyebrow={t.eyebrow}
      title={t.title}
      lede={t.lede}
      points={t.points}
      tone="bg-glicine"
      image={{ src: "/photos/park.jpg", alt: t.imageAlt, position: "40% 75%" }}
      cta={{ href: "#waitlist", label: cta }}
      card={
        <div aria-hidden="true" className="grid gap-2 rounded-md border-l-[6px] border-bene bg-white p-4 shadow-float">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[0.9375rem] font-extrabold">{t.cardTitle}</span>
            <span className="rounded-full bg-salvia px-2.5 py-1 text-xs font-bold text-bene">{t.cardMood}</span>
          </div>
          <p className="text-[0.875rem] leading-snug text-graphite">{t.cardSummary}</p>
          <span className="mt-1 inline-flex w-fit items-center gap-2 rounded-xs bg-ink px-3 py-2 text-[0.8125rem] font-bold text-white"><Bell className="size-4" />{t.cardAction}</span>
        </div>
      }
    />
  );
}

export function Helpers({ t }: { t: T["helpers"] }) {
  return (
    <FeatureBlock
      id="helpers"
      reverse
      eyebrow={t.eyebrow}
      title={t.title}
      lede={t.lede}
      points={t.points}
      tone="bg-camomilla"
      image={{ src: "/photos/nurse.jpg", alt: t.imageAlt, position: "55% 40%" }}
      cta={{ href: "?role=helper#waitlist", label: t.cta }}
      card={
        <div aria-hidden="true" className="flex items-center gap-3 rounded-md bg-white p-3 shadow-float">
          <span className="grid size-10 place-items-center rounded-full bg-salvia"><CheckBadge className="size-6" /></span>
          <span className="text-[0.9375rem] font-extrabold">{t.points[1]}</span>
        </div>
      }
    />
  );
}

export function Safety({ t }: { t: T["safety"] }) {
  return (
    <section id="safety" className="wrap py-6 md:py-8" aria-labelledby="safety-title">
      <div className="grid gap-10 overflow-hidden rounded-xl bg-ink p-6 text-white sm:p-10 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-14 md:p-14">
        <div className="reveal">
          <span className="eyebrow text-white/75"><Phone className="size-4 text-sole" />{t.eyebrow}</span>
          <h2 id="safety-title" className="mt-4 text-balance text-[2.25rem] leading-[0.95] text-white sm:text-5xl">{t.title}</h2>
          <p className="mt-5 text-lg leading-relaxed text-white/80">{t.body}</p>
          <ul className="mt-6 grid gap-3">
            {t.points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-white/90"><CheckBadge className="mt-0.5 size-5 shrink-0" /><span>{p}</span></li>
            ))}
          </ul>
          <p className="mt-6 rounded-md border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/75">{t.note}</p>
        </div>
        <div className="reveal reveal-d1 relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
            <Image src="/photos/walker.jpg" alt={t.imageAlt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
          </div>
          <div aria-hidden="true" className="relative -mt-28 mx-3 grid gap-3 rounded-lg bg-[#7F1D1D] p-5 shadow-device sm:mx-6">
            <span className="font-display text-[2rem] leading-[0.95] text-white">{t.screenTitle}</span>
            <span className="text-[#FDE2DF]">{t.screenBody}</span>
            <span className="flex items-center justify-center gap-2 rounded-full bg-white py-3 text-lg font-extrabold text-allarme"><Phone className="size-5" />{t.call}</span>
            <div className="grid grid-cols-2 gap-2 text-center text-[0.9375rem] font-bold">
              <span className="rounded-full border-2 border-white/70 py-2.5">{t.callRelative}</span>
              <span className="rounded-full bg-white/15 py-2.5">{t.fine}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
