import { SITEMAP_HEADERS, sitemapIndexXml } from "@/lib/sitemap-xml";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Sitemap index pointing at /sitemaps/<section>.xml files. */
export async function GET() {
  return new Response(await sitemapIndexXml(), { headers: SITEMAP_HEADERS });
}
