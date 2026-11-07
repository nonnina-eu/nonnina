import { de } from "./dictionaries/de";
import { en } from "./dictionaries/en";
import { it } from "./dictionaries/it";
import type { Dictionary } from "./dictionaries/en";

export const locales = ["en", "de", "it"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "nonnina-locale";

const dictionaries: Record<Locale, Dictionary> = { en, de, it };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Public path of a locale's home page: English lives at "/". */
export function localePath(locale: Locale): string {
  return locale === defaultLocale ? "/" : `/${locale}`;
}

export const ogLocale: Record<Locale, string> = { en: "en_GB", de: "de_DE", it: "it_IT" };
export type { Dictionary };
