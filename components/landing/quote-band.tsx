"use client";

import Image from "next/image";
import { photos } from "./media";
import { useLanding } from "./language-provider";

export function QuoteBand() {
  const { t } = useLanding();

  return (
    <section className="relative min-h-[70vh] overflow-hidden">
      <Image src={photos.hands} alt="" fill className="object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-[#202128]/45" />
      <div className="container relative flex min-h-[70vh] items-end py-16 md:py-24">
        <p className="max-w-4xl font-display text-3xl font-extrabold leading-[0.95] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
          {t.quote}
        </p>
      </div>
    </section>
  );
}
