import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
import { SITEMAP_IDS } from "@/lib/sitemaps";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      ...SITEMAP_IDS.map((_, index) => `${SITE_URL}/sitemap/${index}.xml`),
    ],
    host: SITE_URL,
  };
}
