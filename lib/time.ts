import type { Language, MedicationTime } from "@/lib/db/types";

export type PartOfDay = "morning" | "afternoon" | "evening" | "night";

export function partOfDay(date: Date): PartOfDay {
  const h = date.getHours();
  if (h >= 5 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "afternoon";
  if (h >= 17 && h < 22) return "evening";
  return "night";
}

export interface NextReminder {
  time: string;
  label: string;
  /** true when the reminder belongs to tomorrow (all of today's are in the past) */
  tomorrow: boolean;
}

/** Picks the next medication time after `now` (wraps to tomorrow's first slot). */
export function nextReminder(times: MedicationTime[], now: Date): NextReminder | null {
  if (!times || times.length === 0) return null;
  const sorted = [...times]
    .filter((t) => /^\d{1,2}:\d{2}$/.test(t.time))
    .sort((a, b) => a.time.localeCompare(b.time));
  if (sorted.length === 0) return null;
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  for (const t of sorted) {
    const [h, m] = t.time.split(":").map(Number);
    if (h * 60 + m > minutesNow) return { time: t.time, label: t.label, tomorrow: false };
  }
  return { time: sorted[0].time, label: sorted[0].label, tomorrow: true };
}

export function formatReminder(r: NextReminder | null, language: Language): string {
  if (!r) return language === "de" ? "Keine Erinnerungen heute" : "Nessun promemoria oggi";
  if (language === "de") return `${r.label} um ${r.time}${r.tomorrow ? " (morgen)" : ""}`;
  return `${r.label} alle ${r.time}${r.tomorrow ? " (domani)" : ""}`;
}

export function localeFor(language: Language): string {
  return language === "de" ? "de-DE" : "it-IT";
}
