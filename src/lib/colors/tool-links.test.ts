import { describe, expect, it } from "vitest";
import { colorToolLinks, readHexColor } from "@/lib/colors/tool-links";
import { paletteContrastPairs } from "@/lib/colors/palette-contrast";
import { checkContrast } from "@/lib/colors/convert";

describe("color handoff between tools", () => {
  it("accepts short and long HEX without inventing colors for invalid input", () => {
    expect(readHexColor(" #F80 ")).toBe("#ff8800");
    expect(readHexColor("3B82F6")).toBe("#3b82f6");
    for (const value of ["", "blue", "#12", "#zzzzzz", "#12345678", null]) {
      expect(readHexColor(value)).toBeNull();
    }
  });

  it("carries the selected color to the picker, contrast checker, and palette", () => {
    const links = colorToolLinks("#F80");
    expect(links.picker).toBe("/color-picker?hex=ff8800");
    expect(links.contrast).toBe("/contrast-checker?fg=ff8800&bg=ffffff");
    const colors = new URL(links.palette, "https://colorbase.in").searchParams
      .get("colors")!
      .split("-");
    expect(colors).toContain("ff8800");
    expect(colors.every((color) => /^[0-9a-f]{6}$/.test(color))).toBe(true);
  });

  it("keeps default tool links usable when a color is absent or invalid", () => {
    expect(colorToolLinks("invalid")).toEqual({
      picker: "/color-picker",
      contrast: "/contrast-checker",
      palette: "/palette-generator",
    });
  });

  it("preserves the full palette when editing an existing scheme", () => {
    const links = colorToolLinks("#F00", ["#F00", "#0F0", "#00F"]);
    expect(links.palette).toBe("/palette-generator?colors=ff0000-00ff00-0000ff");
    expect(colorToolLinks("#F00", ["invalid", "#00F"]).palette).not.toContain("invalid");
  });
});

describe("palette contrast guidance", () => {
  it("does not round a failing pair up to a WCAG pass", () => {
    expect(checkContrast("#12aa6e", "#ffffff").largeAA).toBe(false);
    expect(checkContrast("#15866e", "#ffffff").normalAA).toBe(false);
    expect(checkContrast("#15866e", "#ffffff").largeAAA).toBe(false);
    expect(checkContrast("#14626e", "#ffffff").normalAAA).toBe(false);
  });

  it("distinguishes normal-text AA from large-text AA", () => {
    const [pair] = paletteContrastPairs(["#777777", "#ffffff"]);
    expect(pair.contrast.largeAA).toBe(true);
    expect(pair.contrast.normalAA).toBe(false);
    expect(pair.contrast.normalAAA).toBe(false);
  });

  it("includes each color combination and gives black on white its full result", () => {
    const pairs = paletteContrastPairs(["#000000", "#ffffff", "#777777"]);
    expect(pairs).toHaveLength(3);
    expect(pairs[0].contrast.ratio).toBe(21);
    expect(pairs[0].contrast.normalAAA).toBe(true);
    expect(paletteContrastPairs([])).toEqual([]);
  });
});
