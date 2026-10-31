import { SITE_CONTENT_UPDATED, SITE_URL } from "@/lib/site-config";
import { SITEMAP_IDS } from "@/lib/sitemaps";

export const runtime = "nodejs";
export const dynamic = "force-static";

export function GET() {
  const lastmod = SITE_CONTENT_UPDATED;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SITEMAP_IDS.map(
    (_, index) => `  <sitemap>
    <loc>${SITE_URL}/sitemap/${index}.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`
  ).join("\n")}
</sitemapindex>
`;
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
