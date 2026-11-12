import { describe, expect, it } from "vitest";
import {
  MAP_SCALE_PRESETS,
  buildColorScale,
  classBreaks,
  equalBreaks,
  legendRanges,
  quantileBreaks,
  scaleToCssVars,
} from "@/lib/map/color-scales";

describe("map color scales", () => {
  it("builds sequential, diverging, and categorical scales", () => {
    expect(buildColorScale("sequential", 5)).toHaveLength(5);
    expect(buildColorScale("categorical", 4)).toHaveLength(4);
    expect(buildColorScale("diverging", 7)).toHaveLength(7);
  });

  it("computes equal and quantile breaks", () => {
    expect(equalBreaks([0, 100], 4)).toEqual([25, 50, 75]);
    expect(quantileBreaks([10, 20, 30, 40], 2)).toHaveLength(1);
    expect(classBreaks([0, 50, 100], 3, "equal")).toHaveLength(2);
  });

  it("builds legend ranges and css vars from presets", () => {
    const preset = MAP_SCALE_PRESETS[0]!;
    const colors = buildColorScale(preset.kind, 5, {
      low: preset.low,
      high: preset.high,
      mid: preset.mid,
      seed: preset.seed,
    });
    expect(colors).toHaveLength(5);
    const breaks = equalBreaks([0, 100], 5);
    expect(legendRanges(breaks, [0, 100])).toHaveLength(5);
    expect(scaleToCssVars(colors)).toContain("--map-class-1:");
  });
});
