import { allSitemapEntries } from "@/lib/sitemaps";
import { SITE_URL } from "@/lib/site-config";
import { listPublishedInteriorSitemap } from "@/lib/db/interior";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatLastmod(value: Date | string | undefined) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export async function GET() {
  const entries = [...allSitemapEntries()];
  const published = await listPublishedInteriorSitemap();
  for (const item of published) {
    entries.push({
      url: `${SITE_URL}/interior-colors/${item.slug}`,
      lastModified: item.lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map((entry) => {
    const lastmod = formatLastmod(entry.lastModified);
    const changefreq = entry.changeFrequency
      ? `\n<changefreq>${entry.changeFrequency}</changefreq>`
      : "";
    const priority =
      typeof entry.priority === "number" ? `\n<priority>${entry.priority}</priority>` : "";
    return `<url>
<loc>${xmlEscape(entry.url)}</loc>${lastmod ? `\n<lastmod>${lastmod}</lastmod>` : ""}${changefreq}${priority}
</url>`;
  })
  .join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
