import type { MetadataRoute } from "next";
import { SITEMAP_IDS, sitemapForId } from "@/lib/sitemaps";

export default function sitemap(): MetadataRoute.Sitemap {
  return SITEMAP_IDS.flatMap((id) => sitemapForId(id));
}
