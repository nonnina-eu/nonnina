import type { Metadata } from "next";
import { env } from "@/lib/env";
import { localePath, locales, type Locale } from "@/lib/i18n";
import * as de from "./de";
import * as en from "./en";
import * as it from "./it";
import type { LegalChrome, LegalDoc, LegalDocId } from "./types";

export { LEGAL_DOCS, type LegalBlock, type LegalDocId } from "./types";
export { operator, operatorIsComplete } from "./operator";

const content: Record<Locale, { chrome: LegalChrome; docs: Record<LegalDocId, LegalDoc> }> = { en, de, it };

export function getLegal(locale: Locale) {
  return content[locale];
}

/** "/privacy", "/de/privacy", "/it/privacy". */
export function legalPath(locale: Locale, doc: LegalDocId): string {
  const home = localePath(locale);
  return `${home === "/" ? "" : home}/${doc}`;
}

/** Makes a site-relative link ("/cookies") point to the same locale. */
export function localizeHref(locale: Locale, href: string): string {
  const doc = href.replace(/^\//, "") as LegalDocId;
  return href.startsWith("/") && doc in content[locale].docs ? legalPath(locale, doc) : href;
}

export function legalMetadata(locale: Locale, doc: LegalDocId): Metadata {
  const d = content[locale].docs[doc];
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${env.siteUrl()}${legalPath(l, doc)}`;
  languages["x-default"] = languages.en;
  return {
    title: `${d.title} · Nonnina`,
    description: d.description,
    alternates: { canonical: languages[locale], languages },
    openGraph: { title: `${d.title} · Nonnina`, description: d.description, url: languages[locale] },
  };
}
