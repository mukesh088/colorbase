import { homepageMarkdown } from "@/lib/agent/content";
import { SITE_URL } from "@/lib/site-config";

export const runtime = "nodejs";
export const dynamic = "force-static";

export function GET() {
  const link = [
    `<${SITE_URL}/llms.txt>; rel="describedby"; type="text/plain"`,
    `<${SITE_URL}/.well-known/mcp/server-card.json>; rel="alternate"; type="application/json"; title="MCP Server Card"`,
    `<${SITE_URL}/>; rel="alternate"; type="text/html"; title="HTML homepage"`,
  ].join(", ");

  return new Response(homepageMarkdown(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      Vary: "Accept",
      Link: link,
    },
  });
}
