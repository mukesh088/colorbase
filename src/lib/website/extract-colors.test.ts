import { describe, expect, it } from "vitest";
import { analyzeWebsiteMarkup } from "@/lib/website/extract-colors";

describe("analyzeWebsiteMarkup", () => {
  it("extracts and roles colors from HTML and CSS", () => {
    const html = `<html><head><style>.btn{background:#1d4ed8;color:#fff}body{background:#f8fafc;color:#0f172a}</style></head><body style="border-color:#64748b"></body></html>`;
    const result = analyzeWebsiteMarkup(html, [], "https://example.com/");
    const hexes = result.colors.map((c) => c.hex);
    expect(hexes).toContain("#1d4ed8");
    expect(hexes).toContain("#0f172a");
    expect(result.colors.find((c) => c.hex === "#1d4ed8")?.role).toBe("button");
    expect(result.pairs.length).toBeGreaterThan(0);
  });
});
