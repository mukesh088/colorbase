"use client";

import { useEffect } from "react";
import { SITE_URL } from "@/lib/site-config";

type ToolArgs = Record<string, unknown>;

type ModelContext = {
  registerTool: (tool: {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    execute: (args: ToolArgs) => Promise<unknown> | unknown;
  }) => void | (() => void);
};

declare global {
  interface Navigator {
    modelContext?: ModelContext;
  }
}

async function postMcp(method: string, params?: Record<string, unknown>) {
  const res = await fetch("/api/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: crypto.randomUUID(), method, params }),
  });
  const data = (await res.json()) as { result?: unknown; error?: { message?: string } };
  if (data.error) throw new Error(data.error.message || "MCP tool failed");
  return data.result;
}

export function WebMcpTools() {
  useEffect(() => {
    const ctx = navigator.modelContext;
    if (!ctx?.registerTool) return;

    const disposers: Array<void | (() => void)> = [];

    disposers.push(
      ctx.registerTool({
        name: "colorbase_search_tools",
        description: "Search ColorBase color tools by keyword and return matching tool URLs.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Keyword such as contrast, palette, hex" },
          },
          required: ["query"],
        },
        execute: async (args) =>
          postMcp("tools/call", { name: "search_tools", arguments: args }),
      })
    );

    disposers.push(
      ctx.registerTool({
        name: "colorbase_lookup_color",
        description: "Look up a HEX code or CSS named color on ColorBase.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "HEX like #F5DEB3 or name like wheat" },
          },
          required: ["query"],
        },
        execute: async (args) =>
          postMcp("tools/call", { name: "lookup_color", arguments: args }),
      })
    );

    disposers.push(
      ctx.registerTool({
        name: "colorbase_site_overview",
        description: "Get a Markdown overview of ColorBase for agents.",
        inputSchema: { type: "object", properties: {} },
        execute: async () =>
          postMcp("tools/call", { name: "get_site_overview", arguments: {} }),
      })
    );

    disposers.push(
      ctx.registerTool({
        name: "colorbase_open_llms_txt",
        description: "Return the URL of ColorBase llms.txt for agent discovery.",
        inputSchema: { type: "object", properties: {} },
        execute: () => ({ url: `${SITE_URL}/llms.txt` }),
      })
    );

    return () => {
      for (const dispose of disposers) {
        if (typeof dispose === "function") dispose();
      }
    };
  }, []);

  return null;
}
