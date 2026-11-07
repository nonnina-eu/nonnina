"use client";

import { useLanding } from "./language-provider";

export function Ask() {
  const { t } = useLanding();

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="grid items-center gap-10 rounded-[1.75rem] bg-[#1e1a35] px-6 py-10 text-white md:px-12 md:py-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#b0d4fe]">{t.ask.kicker}</p>
            <h2 className="mt-4 max-w-[12ch] text-4xl text-white sm:text-6xl">{t.ask.title}</h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">{t.ask.body}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 text-[#202128] sm:p-7">
            <p className="font-display text-3xl font-extrabold tracking-[-0.03em]">{t.ask.hi}</p>
            <p className="mt-1 text-sm font-semibold text-[#8b94a7]">{t.ask.here}</p>
            <ul className="mt-6 flex flex-col gap-2">
              {t.ask.prompts.map((prompt) => (
                <li key={prompt}>
                  <a href="#lista" className="block rounded-full border border-[#e7ecec] px-4 py-3 text-sm font-semibold hover:border-[#202128]">
                    {prompt}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
