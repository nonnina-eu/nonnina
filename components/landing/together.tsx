"use client";

import Image from "next/image";
import { photos } from "./media";
import { useLanding } from "./language-provider";

export function Together() {
  const { t } = useLanding();

  return (
    <section id="famiglia" className="scroll-mt-24 relative min-h-[78vh] overflow-hidden text-white">
      <Image src={photos.park} alt="" fill className="object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-[#1e1a35]/55" />
      <div className="container relative py-20 md:py-28">
        <div className="max-w-3xl">
          <h2 className="text-4xl text-white sm:text-5xl lg:text-[4.4rem]">{t.together.title}</h2>
          <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-white/80 sm:text-lg">{t.together.body}</p>
        </div>
        <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {t.together.cards.map((card) => (
            <li key={card.title} className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <h3 className="text-lg font-bold leading-tight">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{card.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
