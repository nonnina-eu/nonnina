"use client";

import { Mic } from "lucide-react";
import type { SeniorStrings } from "@/lib/i18n/senior";

export function MicPermission({ t, onAllow, denied }: { t: SeniorStrings; onAllow: () => void; denied: boolean }) {
  return (
    <div className="sky-glow flex h-dvh w-full flex-col items-center justify-center gap-[1em] p-[var(--s-pad)] text-center">
      <span className="flex size-[4.5em] items-center justify-center rounded-full bg-secondary text-primary">
        <Mic className="size-[2.2em]" />
      </span>
      <h1 className="text-[length:var(--s-greet)] font-semibold leading-tight tracking-tight">{t.micTitle}</h1>
      <p className="max-w-2xl text-balance leading-relaxed text-muted-foreground">{t.micBody}</p>
      {denied ? <p className="max-w-2xl font-medium text-amber-800">{t.micDenied}</p> : null}
      <button
        type="button"
        onClick={onAllow}
        className="btn-glossy mt-2 flex h-[var(--s-help)] min-w-[calc(var(--s-help)*3)] items-center justify-center rounded-full px-[1.5em] text-[length:var(--s-help-text)] font-semibold text-white focus-visible:outline-none focus-visible:ring-8 focus-visible:ring-primary/30"
      >
        {t.micAllow}
      </button>
    </div>
  );
}
