"use client";

import Image from "next/image";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { photos, type PhotoKey } from "./media";
import { useLanding } from "./language-provider";

export function Moments() {
  const { t } = useLanding();
  const scroller = useRef<HTMLUListElement>(null);

  function move(direction: number) {
    scroller.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  }

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="flex items-end justify-between gap-6">
          <h2 className="max-w-[12ch] text-4xl text-[#202128] sm:text-5xl lg:text-[4rem]">{t.moments.title}</h2>
          <div className="hidden gap-2 sm:flex">
            <button type="button" aria-label="Previous" onClick={() => move(-1)} className="flex size-11 items-center justify-center rounded-full border border-[#202128]">
              <ArrowLeft className="size-4" />
            </button>
            <button type="button" aria-label="Next" onClick={() => move(1)} className="flex size-11 items-center justify-center rounded-full bg-[#202128] text-white">
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
        <ul ref={scroller} className="mt-10 flex snap-x gap-4 overflow-x-auto pb-2">
          {t.moments.items.map((item) => (
            <li key={item.title} className="w-[78vw] shrink-0 snap-start sm:w-[320px]">
              <article className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem]">
                <Image src={photos[item.image as PhotoKey]} alt="" fill className="object-cover" sizes="320px" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#202128] via-[#202128]/70 to-transparent p-5 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">{item.kicker}</p>
                  <h3 className="mt-1 font-display text-3xl font-extrabold tracking-[-0.03em]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/85">{item.note}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
