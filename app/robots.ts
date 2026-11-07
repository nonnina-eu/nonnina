import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/senior/", "/family/", "/app/", "/demo", "/login", "/auth/", "/helpers/me"] }], sitemap: `${env.siteUrl()}/sitemap.xml` };
}
