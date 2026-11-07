import { env } from "./env";
import { localePath, locales, type Locale } from "./i18n";

/** Product routes live in the same deployment, so links stay relative. */
export const appDemoUrl = (): string => "/demo";
export const appHelpersUrl = (path = ""): string => `/helpers${path}`;

/** Absolute URL of a landing page in one locale: absoluteUrl("de", "/pitch") → https://…/de/pitch. */
export function absoluteUrl(locale: Locale, page = ""): string {
  const home = localePath(locale);
  return `${env.siteUrl()}${home === "/" ? "" : home}${page}`;
}

/** hreflang map (en, de, it, x-default) for one page; the home page when `page` is empty. */
export function languageAlternates(page = ""): Record<string, string> {
  const map: Record<string, string> = {};
  for (const l of locales) map[l] = absoluteUrl(l, page);
  map["x-default"] = absoluteUrl("en", page);
  return map;
}

/** Canonical + hreflang alternates for one page in one locale. */
export function pageAlternates(locale: Locale, page = "") {
  return { canonical: absoluteUrl(locale, page), languages: languageAlternates(page) };
}
