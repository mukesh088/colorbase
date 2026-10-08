import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
import { SITEMAP_IDS } from "@/lib/sitemaps";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/api", "/api/me/"],
    },
    sitemap: SITEMAP_IDS.map((id) => `${SITE_URL}/sitemap/${id}.xml`),
    host: SITE_URL,
  };
}
