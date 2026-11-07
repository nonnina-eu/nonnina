import type { EmergencyLevel, Language } from "@/lib/db/types";

/**
 * Deterministic keyword safety net. Runs in the browser on every user transcript
 * and on the server when the agent reports what was said. It never depends on
 * the AI: if the agent misses a fall, this catches it.
 *
 * Matching is done on a normalised string: lowercase, accents stripped,
 * "ß" → "ss", punctuation collapsed to spaces. Phrases are matched on word
 * boundaries so that "help" does not match "helpful".
 */
export type KeywordLanguage = Language | "en";

export interface KeywordMatch {
  level: EmergencyLevel;
  phrase: string;
  language: KeywordLanguage;
}

type PhraseList = Record<KeywordLanguage, readonly string[]>;

/** Something serious has happened → notify immediately, no countdown. */
export const EMERGENCY_PHRASES: PhraseList = {
  de: [
    "gesturzt",
    "gestuerzt",
    "hingefallen",
    "bin gefallen",
    "umgefallen",
    "kann nicht aufstehen",
    "komme nicht hoch",
    "komm nicht hoch",
    "komme nicht mehr hoch",
    "brustschmerzen",
    "schmerzen in der brust",
    "druck auf der brust",
    "keine luft",
    "kann nicht atmen",
    "kann nicht mehr atmen",
    "schlaganfall",
    "herzinfarkt",
    "bewusstlos",
    "ohnmachtig",
    "blute stark",
    "blutet stark",
    "starke blutung",
    "es brennt",
    "feuer",
    "rauch in der wohnung",
    "notarzt",
    "notfall",
    "krankenwagen",
    "will nicht mehr leben",
    "mir das leben nehmen",
    "mich umbringen",
  ],
  it: [
    "sono caduta",
    "sono caduto",
    "caduta per terra",
    "caduto per terra",
    "non riesco ad alzarmi",
    "non mi riesco ad alzare",
    "non riesco a rialzarmi",
    "dolore al petto",
    "male al petto",
    "non respiro",
    "non riesco a respirare",
    "mi manca il respiro",
    "ictus",
    "infarto",
    "svenuto",
    "svenuta",
    "perdo sangue",
    "sanguino molto",
    "fuoco",
    "incendio",
    "ambulanza",
    "emergenza",
    "non voglio piu vivere",
    "farla finita",
  ],
  en: [
    "i fell",
    "i have fallen",
    "i've fallen",
    "ive fallen",
    "can't get up",
    "cant get up",
    "cannot get up",
    "chest pain",
    "can't breathe",
    "cant breathe",
    "cannot breathe",
    "stroke",
    "heart attack",
    "unconscious",
    "bleeding badly",
    "bleeding a lot",
    "fire",
    "ambulance",
    "emergency",
    "kill myself",
    "end my life",
  ],
};

/** Something might happen → calm banner, 15 s countdown, then "please check in" SMS. */
export const WARNING_PHRASES: PhraseList = {
  de: [
    "schwindlig",
    "schwindelig",
    "mir ist schwindelig",
    "verwirrt",
    "nichts gegessen",
    "tabletten vergessen",
    "medikamente vergessen",
    "tur geht nicht zu",
    "tuer geht nicht zu",
    "hilfe",
  ],
  it: [
    "giramenti di testa",
    "mi gira la testa",
    "capogiro",
    "confusa",
    "confuso",
    "non ho mangiato",
    "dimenticato le medicine",
    "dimenticato le pastiglie",
    "aiuto",
  ],
  en: ["dizzy", "confused", "haven't eaten", "havent eaten", "missed my medication", "forgot my medication", "help"],
};

export function normaliseText(input: string): string {
  return input
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findPhrase(text: string, lists: PhraseList): { phrase: string; language: KeywordLanguage } | null {
  for (const language of Object.keys(lists) as KeywordLanguage[]) {
    for (const phrase of lists[language]) {
      const re = new RegExp(`(^|[^a-z0-9])${escapeRegex(normaliseText(phrase))}($|[^a-z0-9])`);
      if (re.test(text)) return { phrase, language };
    }
  }
  return null;
}

/**
 * Returns the most severe match in the transcript, or null.
 * Emergency phrases win over warning phrases.
 */
export function detectEmergency(transcript: string): KeywordMatch | null {
  const text = normaliseText(transcript);
  if (!text) return null;
  const emergency = findPhrase(text, EMERGENCY_PHRASES);
  if (emergency) return { level: "emergency", ...emergency };
  const warning = findPhrase(text, WARNING_PHRASES);
  if (warning) return { level: "warning", ...warning };
  return null;
}
