import { env } from "./env";
import { localePath, locales, type Locale } from "./i18n";

export const appDemoUrl = (): string => `${env.appUrl()}/demo`;
export const appHelpersUrl = (path = ""): string => `${env.appUrl()}/helpers${path}`;

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
