import { describe, expect, it } from "vitest";
import { chartJsConfig, chartPalette } from "@/lib/colors/chart-palettes";
import { extractImagePalette } from "@/lib/colors/image-palette";
import { getContrastRatio } from "@/lib/colors/convert";
import { hexToOklch } from "@/lib/colors/oklch";
import { suggestContrastRepair } from "@/lib/colors/contrast-repair";

describe("chart palettes", () => {
  it("creates distinct, stable categorical colors and bounds the requested size", () => {
    const colors = chartPalette("#635bff", "categorical", 9);
    expect(new Set(colors).size).toBe(9);
    expect(colors.every((color) => /^#[0-9a-f]{6}$/i.test(color))).toBe(true);
    expect(chartPalette("#635bff", "categorical", 9)).toEqual(colors);
    expect(chartPalette("#635bff", "categorical", 100)).toHaveLength(9);
    expect(chartPalette("#635bff", "categorical", 0)).toHaveLength(5);
  });
  it("orders sequential lightness and places a light neutral at the diverging midpoint", () => {
    const lightness = chartPalette("#635bff", "sequential", 7).map((color) => hexToOklch(color).l);
    expect(lightness.every((value, index) => index === 0 || value < lightness[index - 1])).toBe(
      true
    );
    const diverging = chartPalette("#635bff", "diverging", 5).map(hexToOklch);
    expect(diverging[2].l).toBeGreaterThan(0.94);
    expect(diverging[2].c).toBeLessThan(0.01);
    expect(diverging[0].h).not.toBeCloseTo(diverging[4].h, 0);
  });
  it("provides a usable Chart.js dataset for each original color", () => {
    const colors = chartPalette("#635bff", "categorical", 5);
    const config = chartJsConfig(colors, "line");
    expect(config.data.datasets).toHaveLength(5);
    expect(config.data.datasets[0].borderColor).toBe(colors[0]);
    expect(config.data.datasets[1].borderDash).toEqual([6, 3]);
    expect(
      config.data.datasets.every((dataset) => dataset.data.length === config.data.labels.length)
    ).toBe(true);
  });
});

describe("image palette extraction", () => {
  it("excludes translucent pixels rather than presenting them as opaque colors", () => {
    expect(extractImagePalette([255, 0, 0, 128, 0, 0, 255, 254, 255, 255, 255, 255], 6)).toEqual([
      "#ffffff",
    ]);
  });
  it("skips transparent pixels and frequency-ranks distinct opaque colors", () => {
    const colors = extractImagePalette([
      255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 255, 255,
    ]);
    expect(colors).toEqual(["#ffffff", "#0000ff"]);
    expect(extractImagePalette([0, 0, 0, 0])).toEqual([]);
  });
  it("avoids near-duplicate swatches and honors the requested maximum", () => {
    const pixels = [240, 0, 0, 255, 250, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255];
    expect(extractImagePalette(pixels, 6)).toHaveLength(3);
    expect(extractImagePalette(pixels, 2)).toHaveLength(2);
  });
});

describe("contrast repair", () => {
  it("preserves the selected color and checks unrounded contrast", () => {
    for (const adjust of ["foreground", "background"] as const) {
      const result = suggestContrastRepair("#aaaaaa", "#ffffff", 4.5, adjust)!;
      expect(getContrastRatio(result.fg, result.bg)).toBeGreaterThanOrEqual(4.5);
      if (adjust === "foreground") expect(result.bg).toBe("#ffffff");
      else expect(result.fg).toBe("#aaaaaa");
    }
  });
  it("reports impossible AAA repairs and preserves already-passing pairs", () => {
    expect(suggestContrastRepair("#888888", "#777777", 7, "foreground")).toBeNull();
    expect(suggestContrastRepair("#000000", "#ffffff", 7, "foreground")).toEqual({
      fg: "#000000",
      bg: "#ffffff",
    });
  });
});
