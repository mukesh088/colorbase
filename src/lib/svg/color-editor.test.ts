import { describe, expect, it } from "vitest";
import { listSvgColors, replaceSvgColor } from "@/lib/svg/color-editor";

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><script>alert(1)</script><rect fill="#1d4ed8" stroke="#0f172a" width="100" height="100"/><circle style="fill:#e11d48" cx="50" cy="50" r="20"/></svg>`;

describe("svg color editor", () => {
  it("lists fills and strokes and strips scripts via sanitize path", () => {
    const colors = listSvgColors(SAMPLE);
    expect(colors.some((c) => c.hex === "#1d4ed8")).toBe(true);
    expect(colors.some((c) => c.hex === "#e11d48")).toBe(true);
  });

  it("replaces a color without leaving script tags", () => {
    const out = replaceSvgColor(SAMPLE, "#1d4ed8", "#22c55e");
    expect(out).toContain("#22c55e");
    expect(out).not.toContain("#1d4ed8");
    expect(out.toLowerCase()).not.toContain("<script");
  });
});
