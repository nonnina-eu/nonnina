"use client";

import Image from "next/image";
import { photos } from "./media";
import { useLanding } from "./language-provider";

export function Safety() {
  const { t } = useLanding();

  return (
    <section id="sicurezza" className="scroll-mt-24 bg-[#f5f7fb] py-20 md:py-28">
      <div className="container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="max-w-[14ch] text-4xl text-[#202128] sm:text-5xl lg:text-[4rem]">{t.safety.title}</h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#343a46] sm:text-lg">{t.safety.body}</p>
          <ol className="mt-8 space-y-4">
            {t.safety.items.map((item, index) => (
              <li key={item.title} className="rounded-2xl bg-white p-5 sm:p-6">
                <div className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#202128] text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-[#202128]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#343a46] sm:text-base">{item.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-sm font-semibold text-[#343a46]">{t.safety.note}</p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem]">
          <Image src={photos.nurse} alt="" fill className="object-cover object-top" sizes="(min-width: 1024px) 50vw, 100vw" />
        </div>
      </div>
    </section>
  );
}
