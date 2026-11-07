"use client";

import Image from "next/image";
import { photos } from "./media";
import { ScreenPreview } from "./screen-preview";

export function Hero() {
  return (
    <section className="px-5 pb-8 pt-8 sm:pt-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#476adb]">For families with a parent at home</p>
        <h1 className="mt-3 max-w-[12ch] text-[2.6rem] text-[#202128] sm:text-6xl">One tap at home. A clear text for you.</h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#343a46]">
          Nonnina is a voice companion on a tablet. Your parent talks. You find out, in seconds, if they need you.
        </p>
        <a href="#join" className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-full bg-[#202128] px-6 text-base font-bold text-white sm:w-auto">
          Join the waitlist
        </a>

        <div className="mt-8">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] sm:aspect-[16/8]">
            <Image
              src={photos.tea}
              alt="A carer pouring tea for an older woman at home"
              fill
              priority
              className="object-cover object-[center_35%]"
              sizes="(min-width: 1024px) 960px, 100vw"
            />
          </div>
          <div className="mt-4 sm:mx-auto sm:max-w-sm">
            <ScreenPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
