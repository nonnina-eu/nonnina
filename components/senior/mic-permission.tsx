"use client";

import { Mic } from "lucide-react";
import { Mark } from "@/components/logo";
import type { SeniorStrings } from "@/lib/i18n/senior";

export function MicPermission({ t, onAllow, denied }: { t: SeniorStrings; onAllow: () => void; denied: boolean }) {
  return (
    <div className="sky-glow relative flex h-dvh w-full flex-col items-center justify-center gap-[1em] p-[var(--s-pad)] text-center">
      <Mark className="absolute left-[var(--s-pad)] top-[var(--s-pad)] size-[2em]" />
      <span className="flex size-[4.5em] items-center justify-center rounded-full bg-menta text-ink">
        <Mic className="size-[2.2em]" />
      </span>
      <h1 className="font-display text-[length:var(--s-greet)] leading-tight text-ink">{t.micTitle}</h1>
      <p className="max-w-2xl text-balance leading-relaxed text-graphite">{t.micBody}</p>
      {denied ? <p className="max-w-2xl rounded-xl bg-camomilla px-[1em] py-[0.5em] font-semibold text-sole-deep">{t.micDenied}</p> : null}
      <button
        type="button"
        onClick={onAllow}
        className="btn-glossy mt-2 flex h-[var(--s-help)] min-w-[calc(var(--s-help)*3)] items-center justify-center rounded-full px-[1.5em] text-[length:var(--s-help-text)] font-bold text-white focus-visible:outline-none focus-visible:ring-8 focus-visible:ring-sole/40"
      >
        {t.micAllow}
      </button>
    </div>
  );
}
