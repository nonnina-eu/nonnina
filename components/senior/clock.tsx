"use client";

import { useEffect, useState } from "react";
import type { Language } from "@/lib/db/types";
import { localeFor, partOfDay, type PartOfDay } from "@/lib/time";

export function useNow(intervalMs = 15_000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function Greeting({ name, language, greetings }: { name: string; language: Language; greetings: Record<PartOfDay, string> }) {
  const now = useNow(60_000);
  const word = now ? greetings[partOfDay(now)] : language === "de" ? "Hallo" : "Ciao";
  return (
    <h1 className="font-display text-[length:var(--s-greet)] leading-none text-ink">
      {word}, {name}!
    </h1>
  );
}

export function Clock({ language }: { language: Language }) {
  const now = useNow(15_000);
  if (!now) return <p className="h-[1.4em]" aria-hidden />;
  const locale = localeFor(language);
  const date = now.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
  const time = now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  return (
    <p className="mt-[0.3em] text-[length:var(--s-clock)] text-graphite">
      <span className="capitalize">{date}</span>
      <span className="mx-3 text-sole">·</span>
      <time dateTime={now.toISOString()} className="font-bold tabular-nums text-ink">
        {time}
      </time>
    </p>
  );
}
