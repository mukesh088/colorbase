import { describe, expect, it } from "vitest";
import { colorMatches, getCombinationBases, readyPalettes } from "@/lib/colors/combinations";
import { isValidHex } from "@/lib/colors/convert";
import { catalogRouteDecision } from "@/lib/catalog-routes";

describe("colors that go with", () => {
  const bases = getCombinationBases();

  it("has sourced, unique base colors", () => {
    expect(bases.length).toBeGreaterThanOrEqual(100);
    expect(new Set(bases.map((b) => b.slug)).size).toBe(bases.length);
    expect(new Set(bases.map((b) => b.hex)).size).toBe(bases.length);
    for (const b of bases) {
      expect(isValidHex(b.hex), b.slug).toBe(true);
      expect(b.source, b.slug).toMatch(/^https:\/\//);
      expect(b.verified, b.slug).toBe(true);
    }
  });

  it("computes 5–8 distinct matches and three palettes per base", () => {
    for (const b of bases) {
      const matches = colorMatches(b.hex);
      expect(matches.length, b.slug).toBeGreaterThanOrEqual(5);
      expect(matches.length, b.slug).toBeLessThanOrEqual(8);
      expect(new Set(matches.map((m) => m.hex)).size, b.slug).toBe(matches.length);
      expect(matches.some((m) => m.hex === b.hex.toLowerCase()), b.slug).toBe(false);
      expect(readyPalettes(b.hex, b.name)).toHaveLength(3);
    }
  });

  it("returns a real 404 decision for unknown slugs", () => {
    expect(catalogRouteDecision("/colors-that-go-with/navy-blue")).toBeNull();
    expect(catalogRouteDecision("/colors-that-go-with/not-a-color")).toEqual({ status: 404 });
  });

  it("uses the complement of navy blue as its accent", () => {
    const navy = colorMatches("#000080");
    expect(navy.find((m) => m.role === "complementary")?.hex).toBe("#808000");
  });
});
