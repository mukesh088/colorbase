import { describe, expect, it } from "vitest";
import {
  PDF_COLOR_OPS,
  extractColorsFromOperatorList,
  mergePdfPalettes,
  samplePdfPalette,
} from "./extract-colors";

describe("pdf extract colors", () => {
  it("reads RGB gray and CMYK paint operators", () => {
    const fnArray = [
      PDF_COLOR_OPS.setFillRGBColor,
      PDF_COLOR_OPS.setStrokeGray,
      PDF_COLOR_OPS.setFillCMYKColor,
    ];
    const argsArray = [
      [0.87, 0.11, 0.28],
      [0.2],
      [0, 0.8, 0.9, 0.1],
    ];
    const colors = extractColorsFromOperatorList(fnArray, argsArray);
    expect(colors.length).toBe(3);
    expect(colors[0]).toMatch(/^#/);
  });

  it("samples accents separately from paper neutrals", () => {
    const pixels: number[] = [];
    // white paper
    for (let i = 0; i < 40; i++) pixels.push(255, 255, 255, 255);
    // brand rose
    for (let i = 0; i < 30; i++) pixels.push(225, 29, 72, 255);
    // navy
    for (let i = 0; i < 20; i++) pixels.push(30, 58, 138, 255);
    const { accents, neutrals, all } = samplePdfPalette(pixels, { count: 8 });
    expect(accents.length).toBeGreaterThanOrEqual(2);
    expect(neutrals.length).toBeGreaterThanOrEqual(1);
    expect(all.length).toBeGreaterThanOrEqual(accents.length);
  });

  it("merges page palettes without collapsing everything", () => {
    const merged = mergePdfPalettes(
      [
        ["#e11d48", "#ffffff", "#0f172a"],
        ["#1d4ed8", "#e11d48", "#f8fafc"],
      ],
      12
    );
    expect(merged.length).toBeGreaterThanOrEqual(4);
  });
});
