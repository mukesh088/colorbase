import type { MetadataRoute } from "next";
import { listPublishedInteriorSitemap } from "@/lib/db/interior";
import { SITE_URL } from "@/lib/site-config";
import { newestLastModified, sitemapFileByName, sitemapFiles } from "@/lib/sitemaps";

type Entries = MetadataRoute.Sitemap;

export const SITEMAP_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
} as const;

/** DB-backed section; listed in the index only while it has published pages. */
export const INTERIOR_SITEMAP = "interior";

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function lastmod(value: Date | string | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : `<lastmod>${date.toISOString().slice(0, 10)}</lastmod>`;
}

export function urlsetXml(entries: Entries) {
  const urls = entries.map((e) => {
    const freq = e.changeFrequency ? `<changefreq>${e.changeFrequency}</changefreq>` : "";
    const priority = typeof e.priority === "number" ? `<priority>${e.priority}</priority>` : "";
    return `<url><loc>${xmlEscape(e.url)}</loc>${lastmod(e.lastModified)}${freq}${priority}</url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

export function sitemapUrl(name: string) {
  return `${SITE_URL}/sitemaps/${name}.xml`;
}

async function interiorEntries(): Promise<Entries> {
  const published = await listPublishedInteriorSitemap().catch(() => []);
  return published.map((item) => ({
    url: `${SITE_URL}/interior-colors/${item.slug}`,
    lastModified: item.lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
}

export async function sitemapIndexXml() {
  const files = sitemapFiles().map((f) => ({ loc: sitemapUrl(f.name), lastModified: newestLastModified(f.entries) }));
  const interior = await interiorEntries();
  if (interior.length) files.push({ loc: sitemapUrl(INTERIOR_SITEMAP), lastModified: newestLastModified(interior) });
  const items = files.map((f) => `<sitemap><loc>${xmlEscape(f.loc)}</loc>${lastmod(f.lastModified)}</sitemap>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join("\n")}\n</sitemapindex>\n`;
}

/** URL entries for `/sitemaps/<name>.xml`, or undefined for an unknown file. */
export async function sitemapEntriesForFile(name: string): Promise<Entries | undefined> {
  if (name === INTERIOR_SITEMAP) {
    const interior = await interiorEntries();
    return interior.length ? interior : undefined;
  }
  return sitemapFileByName(name)?.entries;
}
