"use client";

import Image from "next/image";
import { useState } from "react";
import { photos, tabPhoto } from "./media";
import { useLanding } from "./language-provider";
import { cn } from "@/lib/utils";

export function Features() {
  const { t } = useLanding();
  const [current, setCurrent] = useState(t.features.tabs[0]?.id ?? "voice");
  const tab = t.features.tabs.find((item) => item.id === current) ?? t.features.tabs[0];
  const photo = photos[tabPhoto[tab.id] ?? "tea"];

  return (
    <section id="come-funziona" className="scroll-mt-24 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl text-[#202128] sm:text-5xl lg:text-[4rem]">{t.features.title}</h2>
          <p className="mx-auto mt-5 max-w-[60ch] text-base leading-relaxed text-[#343a46] sm:text-lg">{t.features.body}</p>
        </div>

        <div role="tablist" aria-label={t.features.title} className="mt-12 flex gap-1 overflow-x-auto">
          {t.features.tabs.map((item) => {
            const selected = item.id === tab.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`tab-${item.id}`}
                aria-selected={selected}
                aria-controls={`panel-${item.id}`}
                onClick={() => setCurrent(item.id)}
                className={cn(
                  "shrink-0 rounded-t-2xl px-4 py-3 text-sm font-semibold sm:px-5",
                  selected ? "bg-[#f5f7fb] text-[#202128]" : "bg-transparent text-black/55 hover:text-[#202128]",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          className="grid items-center gap-8 rounded-b-[1.75rem] rounded-tr-[1.75rem] bg-[#f5f7fb] p-5 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-12"
        >
          <div>
            <h3 className="font-display text-3xl font-extrabold leading-[0.95] tracking-[-0.03em] text-[#202128] sm:text-4xl">{tab.title}</h3>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#343a46] sm:text-lg">{tab.body}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {tab.chips.map((chip) => (
                <li key={chip} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-[#202128]">
                  {chip}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image src={photo} alt="" fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
          </div>
        </div>
      </div>
    </section>
  );
}
