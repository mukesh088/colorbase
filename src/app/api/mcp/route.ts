import { NextResponse } from "next/server";
import { homepageMarkdown, llmsTxt, mcpServerCard } from "@/lib/agent/content";
import { SITE_URL } from "@/lib/site-config";
import { getNamedColor, searchNamedColors } from "@/lib/data/color-names";
import { isValidHex, normalizeHex } from "@/lib/colors/convert";
import { TOOLS } from "@/lib/tools-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type JsonRpc = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

function ok(id: JsonRpc["id"], result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, result });
}

function err(id: JsonRpc["id"], code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
}

const TOOL_DEFS = [
  {
    name: "search_tools",
    description: "Search ColorBase tools by keyword.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keyword such as contrast, palette, hex" },
      },
      required: ["query"],
    },
  },
  {
    name: "lookup_color",
    description: "Look up a HEX code or CSS color name.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "HEX like #F5DEB3 or name like wheat" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_site_overview",
    description: "Return a Markdown overview of ColorBase.",
    inputSchema: { type: "object", properties: {} },
  },
] as const;

function runTool(name: string, args: Record<string, unknown>) {
  if (name === "get_site_overview") {
    return { content: [{ type: "text", text: homepageMarkdown() }] };
  }

  if (name === "search_tools") {
    const query = String(args.query ?? "").toLowerCase().trim();
    const hits = TOOLS.filter((t) => {
      const hay = `${t.title} ${t.description} ${t.keywords.join(" ")}`.toLowerCase();
      return query.split(/\s+/).every((part) => hay.includes(part));
    }).slice(0, 10);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            hits.map((t) => ({
              title: t.title,
              url: `${SITE_URL}/${t.slug}`,
              description: t.description,
            })),
            null,
            2
          ),
        },
      ],
    };
  }

  if (name === "lookup_color") {
    const query = String(args.query ?? "").trim();
    if (isValidHex(query)) {
      const hex = normalizeHex(query);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                hex,
                url: `${SITE_URL}/color/${hex.slice(1).toLowerCase()}`,
              },
              null,
              2
            ),
          },
        ],
      };
    }
    const exact = getNamedColor(query.toLowerCase().replace(/\s+/g, "-"));
    const hits = exact ? [exact] : searchNamedColors(query).slice(0, 5);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            hits.map((c) => ({
              name: c.displayName,
              hex: c.hex,
              url: `${SITE_URL}/color-names/${c.slug}`,
            })),
            null,
            2
          ),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}

export async function GET() {
  return NextResponse.json(mcpServerCard(), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept, MCP-Protocol-Version",
    },
  });
}

export async function POST(request: Request) {
  let body: JsonRpc;
  try {
    body = (await request.json()) as JsonRpc;
  } catch {
    return err(null, -32700, "Parse error");
  }

  const id = body.id ?? null;
  const method = body.method ?? "";

  try {
    if (method === "initialize") {
      return ok(id, {
        protocolVersion: "2025-03-26",
        serverInfo: { name: "ColorBase", version: "1.0.0" },
        capabilities: { tools: {}, resources: {} },
      });
    }
    if (method === "notifications/initialized" || method === "ping") {
      return ok(id, {});
    }
    if (method === "tools/list") {
      return ok(id, { tools: TOOL_DEFS });
    }
    if (method === "tools/call") {
      const name = String(body.params?.name ?? "");
      const args = (body.params?.arguments as Record<string, unknown>) ?? {};
      return ok(id, runTool(name, args));
    }
    if (method === "resources/list") {
      return ok(id, {
        resources: [
          {
            uri: "mcp://server-card.json",
            name: "MCP Server Card",
            mimeType: "application/json",
          },
          {
            uri: `${SITE_URL}/llms.txt`,
            name: "llms.txt",
            mimeType: "text/plain",
          },
        ],
      });
    }
    if (method === "resources/read") {
      const uri = String(body.params?.uri ?? "");
      if (uri === "mcp://server-card.json") {
        return ok(id, {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(mcpServerCard(), null, 2),
            },
          ],
        });
      }
      if (uri.endsWith("/llms.txt") || uri === `${SITE_URL}/llms.txt`) {
        return ok(id, {
          contents: [{ uri, mimeType: "text/plain", text: llmsTxt() }],
        });
      }
      return err(id, -32002, "Resource not found");
    }
    return err(id, -32601, `Method not found: ${method}`);
  } catch (e) {
    return err(id, -32603, e instanceof Error ? e.message : "Internal error");
  }
}
