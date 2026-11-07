/**
 * Legal pages are plain data so they stay easy to review and translate.
 * Inline links use the markdown form [text](href); hrefs starting with "/" are made locale-aware.
 */
export type LegalBlock = string | { list: string[] } | { table: { head: string[]; rows: string[][] } };

export interface LegalSection {
  heading: string;
  body: LegalBlock[];
}

export interface LegalDoc {
  title: string;
  /** Short description for search results and link previews. */
  description: string;
  intro: string;
  sections: LegalSection[];
}

export const LEGAL_DOCS = ["privacy", "terms", "cookies"] as const;
export type LegalDocId = (typeof LEGAL_DOCS)[number];

/** Labels shared by every legal page in one language. */
export interface LegalChrome {
  /** Name of the legal section (footer column, page navigation). */
  label: string;
  updated: string;
  draft: string;
  back: string;
  nav: Record<LegalDocId, string>;
}
