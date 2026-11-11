import { describe, expect, it } from "vitest";
import { applyTokenMapToCss, auditCssColors } from "@/lib/css/audit-colors";

describe("css color audit", () => {
  it("groups duplicates and suggests tokens", () => {
    const css = `
      .a { color: #0f172a; background: #f8fafc; }
      .b { border-color: #0f172a; }
      .c { background: #1d4ed8; color: #ffffff; }
    `;
    const result = auditCssColors(css);
    expect(result.colors.some((c) => c.hex === "#0f172a" && c.count >= 2)).toBe(true);
    expect(result.tokenSuggestions.length).toBeGreaterThan(0);
    expect(result.tokenCss).toContain(":root");
  });

  it("applies token replacements", () => {
    const out = applyTokenMapToCss(".x{color:#0f172a}", { "--color-ink-1": "#0f172a" });
    expect(out).toContain("var(--color-ink-1)");
    expect(out).toContain(":root");
  });
});
