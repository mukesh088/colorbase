import { SITEMAP_HEADERS, sitemapEntriesForFile, urlsetXml } from "@/lib/sitemap-xml";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ file: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const { file } = await params;
  const name = file.endsWith(".xml") ? file.slice(0, -4) : undefined;
  const entries = name ? await sitemapEntriesForFile(name) : undefined;
  if (!entries) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  return new Response(urlsetXml(entries), { headers: SITEMAP_HEADERS });
}
