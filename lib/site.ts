import { env } from "./env";
import { localePath, locales, type Locale } from "./i18n";

/** Product routes live in the same deployment, so links stay relative. */
export const appDemoUrl = (): string => "/demo";
export const appHelpersUrl = (path = ""): string => `/helpers${path}`;

export function absoluteUrl(locale: Locale): string {
  const path = localePath(locale);
  return `${env.siteUrl()}${path === "/" ? "" : path}`;
}

export function languageAlternates(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const l of locales) map[l] = absoluteUrl(l);
  map["x-default"] = absoluteUrl("en");
  return map;
}
