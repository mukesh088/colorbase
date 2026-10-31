import { SITE_URL } from "@/lib/site-config";
import { SITEMAP_IDS } from "@/lib/sitemaps";

export const runtime = "nodejs";
export const dynamic = "force-static";

export function GET() {
  const sitemaps = [
    `${SITE_URL}/sitemap.xml`,
    ...SITEMAP_IDS.map((_, index) => `${SITE_URL}/sitemap/${index}.xml`),
  ];

  const body = `# ColorBase robots.txt
# Content Signals: https://contentsignals.org/
# search = indexing / link results
# ai-input = grounding / RAG / agent retrieval
# ai-train = model training / fine-tuning

User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /
Disallow: /api/

User-agent: GPTBot
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

User-agent: ChatGPT-User
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

User-agent: ClaudeBot
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

User-agent: Claude-User
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

User-agent: Google-Extended
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

User-agent: PerplexityBot
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

User-agent: Applebot-Extended
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

Host: ${SITE_URL}
${sitemaps.map((url) => `Sitemap: ${url}`).join("\n")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
