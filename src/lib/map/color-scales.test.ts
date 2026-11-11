import { describe, expect, it } from "vitest";
import { buildColorScale, equalBreaks } from "@/lib/map/color-scales";

describe("map color scales", () => {
  it("builds sequential and categorical scales", () => {
    expect(buildColorScale("sequential", 5)).toHaveLength(5);
    expect(buildColorScale("categorical", 4)).toHaveLength(4);
    expect(buildColorScale("diverging", 7).length).toBeGreaterThanOrEqual(5);
  });

  it("computes equal breaks", () => {
    expect(equalBreaks([0, 100], 4)).toEqual([25, 50, 75]);
  });
});
