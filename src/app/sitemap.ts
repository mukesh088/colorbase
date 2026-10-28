import type { MetadataRoute } from "next";
import { SITEMAP_IDS, sitemapForId } from "@/lib/sitemaps";

/** Split sitemaps so Hostinger can serve them without timing out. */
export async function generateSitemaps() {
  return SITEMAP_IDS.map((_, index) => ({ id: index }));
}

export default function sitemap({ id }: { id: number }): MetadataRoute.Sitemap {
  const key = SITEMAP_IDS[Number(id)] ?? "pages";
  return sitemapForId(key);
}
