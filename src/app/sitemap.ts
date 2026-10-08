import type { MetadataRoute } from "next";
import { SITEMAP_IDS, sitemapForId } from "@/lib/sitemaps";

export async function generateSitemaps() {
  return SITEMAP_IDS.map((id) => ({ id }));
}

export default function sitemap({ id }: { id: string }): MetadataRoute.Sitemap {
  return sitemapForId(id);
}
