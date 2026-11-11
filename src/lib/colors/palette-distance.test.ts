import { describe, expect, it } from "vitest";
import { mergePalettes, nearestBrandColor, rgbDistance } from "@/lib/colors/palette-distance";

describe("palette distance", () => {
  it("finds nearest brand color", () => {
    const result = nearestBrandColor("#e11e49", ["#e11d48", "#0f172a"]);
    expect(result.hex).toBe("#e11d48");
    expect(result.distance).toBeLessThan(10);
  });

  it("merges palettes without near-duplicates", () => {
    const merged = mergePalettes([
      ["#e11d48", "#0f172a"],
      ["#e11e49", "#f8fafc"],
    ]);
    expect(merged.length).toBeGreaterThanOrEqual(3);
    expect(rgbDistance("#000000", "#ffffff")).toBeGreaterThan(400);
  });
});
