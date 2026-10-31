import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, SUPPORT_EMAIL, SUPPORT_PHONE } from "@/lib/site-config";
import { formatBusinessAddress } from "@/lib/site-config";
import { TOOLS } from "@/lib/tools-registry";

const KEY_PAGES = [
  { path: "/", title: "Home", summary: "Color picker, palettes, contrast tools, and libraries." },
  { path: "/color-picker", title: "Color Picker", summary: "HEX/RGB/HSL picker with harmonies and contrast." },
  { path: "/palette-generator", title: "Palette Generator", summary: "Build and export color palettes." },
  { path: "/contrast-checker", title: "Contrast Checker", summary: "WCAG AA/AAA contrast checks." },
  { path: "/color-names", title: "Color Names", summary: "CSS named colors with HEX codes." },
  { path: "/brands", title: "Brand Colors", summary: "Brand palette library." },
  { path: "/gradient-library", title: "Gradient Library", summary: "Named CSS gradients." },
  { path: "/ai-color-copilot", title: "AI Color Copilot", summary: "Prompt-to-semantic color system." },
  { path: "/tools", title: "All Tools", summary: "Full ColorBase tool directory." },
  { path: "/contact", title: "Contact", summary: "Support email and business address." },
  { path: "/llms.txt", title: "llms.txt", summary: "Machine-readable site summary for AI agents." },
  { path: "/.well-known/mcp/server-card.json", title: "MCP Server Card", summary: "Discovery card for MCP clients." },
] as const;

export function homepageMarkdown() {
  const featured = TOOLS.filter((t) => t.featured || t.popular).slice(0, 12);
  const lines = [
    `# ${SITE_NAME}`,
    "",
    SITE_DESCRIPTION,
    "",
    "## Contact",
    "",
    `- Website: ${SITE_URL}`,
    `- Email: ${SUPPORT_EMAIL}`,
    `- Phone: ${SUPPORT_PHONE}`,
    `- Address: ${formatBusinessAddress()}`,
    "",
    "## Key pages",
    "",
    ...KEY_PAGES.map((p) => `- [${p.title}](${SITE_URL}${p.path}) — ${p.summary}`),
    "",
    "## Featured tools",
    "",
    ...featured.map((t) => `- [${t.title}](${SITE_URL}/${t.slug}) — ${t.description}`),
    "",
    "## Agent resources",
    "",
    `- [llms.txt](${SITE_URL}/llms.txt)`,
    `- [robots.txt](${SITE_URL}/robots.txt)`,
    `- [sitemap.xml](${SITE_URL}/sitemap.xml)`,
    `- [MCP server card](${SITE_URL}/.well-known/mcp/server-card.json)`,
    `- Markdown homepage: request \`Accept: text/markdown\` on ${SITE_URL}/`,
    "",
    "## Content use",
    "",
    "Content-Signal preference: search=yes, ai-input=yes, ai-train=no.",
    "",
  ];
  return lines.join("\n");
}

export function llmsTxt() {
  const featured = TOOLS.filter((t) => t.featured || t.popular).slice(0, 20);
  return [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    `${SITE_NAME} is a free developer color toolkit: pickers, converters, palettes, gradients, brand colors, accessibility checks, and an AI Color Copilot.`,
    "",
    "## Contact",
    "",
    `- Email: ${SUPPORT_EMAIL}`,
    `- Phone: ${SUPPORT_PHONE}`,
    `- Address: ${formatBusinessAddress()}`,
    `- Contact page: ${SITE_URL}/contact`,
    "",
    "## Primary pages",
    "",
    ...KEY_PAGES.map((p) => `- [${p.title}](${SITE_URL}${p.path}): ${p.summary}`),
    "",
    "## Tools",
    "",
    ...featured.map((t) => `- [${t.title}](${SITE_URL}/${t.slug}): ${t.description}`),
    "",
    "## Optional",
    "",
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    `- [MCP Server Card](${SITE_URL}/.well-known/mcp/server-card.json)`,
    `- [Privacy](${SITE_URL}/privacy)`,
    `- [Terms](${SITE_URL}/terms)`,
    "",
  ].join("\n");
}

export function mcpServerCard() {
  return {
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    version: "1.0.0",
    website: SITE_URL,
    documentation: `${SITE_URL}/llms.txt`,
    endpoint: `${SITE_URL}/api/mcp`,
    transport: ["streamable-http", "http"],
    protocolVersion: "2025-03-26",
    capabilities: {
      tools: true,
      resources: true,
      prompts: false,
    },
    tools: [
      {
        name: "search_tools",
        description: "Search ColorBase tools by keyword and return matching tool pages.",
      },
      {
        name: "lookup_color",
        description: "Look up a HEX or CSS named color and return formats plus a detail URL.",
      },
      {
        name: "get_site_overview",
        description: "Return a short Markdown overview of ColorBase for agents.",
      },
    ],
    authentication: {
      required: false,
      schemes: [],
    },
    contact: {
      email: SUPPORT_EMAIL,
      telephone: SUPPORT_PHONE,
      url: `${SITE_URL}/contact`,
    },
  };
}
