import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { absoluteUrl, languageAlternates } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map((l) => ({
    url: absoluteUrl(l),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: l === "en" ? 1 : 0.9,
    alternates: { languages: languageAlternates() },
  }));
}
