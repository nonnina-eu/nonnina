import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { absoluteUrl, languageAlternates } from "@/lib/site";
import { env } from "@/lib/env";
import { LEGAL_DOCS, legalPath } from "@/lib/legal";

export default function sitemap(): MetadataRoute.Sitemap {
  const legal = LEGAL_DOCS.flatMap((doc) =>
    locales.map((l) => ({
      url: `${env.siteUrl()}${legalPath(l, doc)}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
      alternates: { languages: languageAlternates(`/${doc}`) },
    })),
  );
  const home = locales.map((l) => ({
    url: absoluteUrl(l),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: l === "en" ? 1 : 0.9,
    alternates: { languages: languageAlternates() },
  }));
  const helpers = [{ url: `${env.siteUrl()}/helpers`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 }];
  return [...home, ...helpers, ...legal];
}
