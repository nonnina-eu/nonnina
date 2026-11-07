"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { photos } from "./media";
import { useLanding } from "./language-provider";

export function Hero() {
  const { t } = useLanding();

  return (
    <section className="pb-6 pt-10 md:pb-10 md:pt-16">
      <div className="container">
        <div className="mx-auto max-w-[18ch] text-center md:max-w-[16ch]">
          <h1 className="text-[2.7rem] text-[#202128] sm:text-6xl lg:text-[5.4rem]">{t.hero.title}</h1>
        </div>
        <p className="mx-auto mt-6 max-w-[46rem] text-center text-base leading-relaxed text-[#343a46] sm:text-lg">{t.hero.subtitle}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="#lista" className="inline-flex items-center gap-2 rounded-lg bg-[#202128] px-7 py-3.5 text-base font-bold text-white hover:bg-black">
            <ArrowRight className="size-4" />
            {t.hero.primary}
          </a>
          <a
            href="#come-funziona"
            className="inline-flex items-center gap-2 rounded-lg border border-[#202128] bg-white px-7 py-3.5 text-base font-bold text-[#202128] hover:bg-[#f5f7fb]"
          >
            <ArrowRight className="size-4" />
            {t.hero.secondary}
          </a>
        </div>

        <div className="relative mx-auto mt-12 h-[420px] overflow-hidden rounded-[1.75rem] sm:h-[520px] md:mt-16 lg:h-[620px]">
          <Image src={photos.tea} alt="" fill priority className="object-cover object-[center_35%]" sizes="(min-width: 1200px) 1120px, 100vw" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#202128]/35 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto -mt-16 max-w-5xl rounded-[1.75rem] bg-[#dff1f3] px-5 py-8 sm:-mt-24 sm:px-10 sm:py-10">
          <p className="text-center text-xs font-extrabold uppercase tracking-[0.16em] text-[#5f7d45] sm:text-sm">{t.award.label}</p>
          <ul className="mt-6 flex gap-3 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible">
            {t.award.items.map((item) => (
              <li
                key={item}
                className="shrink-0 rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-[#202128] shadow-[0_8px_24px_-16px_rgba(32,33,40,0.4)]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
