import { SITE_URL } from "@/lib/site-config";

/** Private or duplicate paths every crawler skips. */
export const ROBOTS_DISALLOW = ["/api/", "/admin/", "/search?", "/*?*utm_"] as const;

/**
 * Search and AI crawlers we explicitly welcome. A crawler obeys only the most
 * specific group that names it, so each gets the full rule set.
 */
export const ROBOTS_ALLOWED_AGENTS = [
  "Googlebot",
  "Bingbot",
  "Google-Extended",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Applebot",
  "Applebot-Extended",
] as const;

const CONTENT_SIGNAL = "Content-Signal: search=yes, ai-input=yes, ai-train=no";

function group(agent: string) {
  return [
    `User-agent: ${agent}`,
    CONTENT_SIGNAL,
    "Allow: /",
    ...ROBOTS_DISALLOW.map((path) => `Disallow: ${path}`),
  ].join("\n");
}

export function robotsTxt(siteUrl = SITE_URL) {
  return `# ColorBase (colorbase.in) robots.txt
# Content Signals: https://contentsignals.org/
# search = indexing / link results
# ai-input = grounding / RAG / agent retrieval
# ai-train = model training / fine-tuning

${["*", ...ROBOTS_ALLOWED_AGENTS].map(group).join("\n\n")}

Sitemap: ${siteUrl}/sitemap.xml
`;
}
