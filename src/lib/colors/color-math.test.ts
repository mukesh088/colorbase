import { describe, expect, it } from "vitest";
import { checkContrast, hexToRgb, normalizeHex, parseColor, rgbToHex } from "@/lib/colors/convert";
import {
  deltaE2000Hex,
  describeDeltaE,
  nearestCssName,
  nearestTailwind,
} from "@/lib/colors/spaces";
import { hexToOklch, oklchToHex, perceptualShades, perceptualTints, perceptualTones } from "@/lib/colors/oklch";
import { parseFlexibleColor } from "@/lib/colors/parse";
import { generateHarmonyByOffsets } from "@/lib/colors/convert";
import { getCommonColorRows } from "@/lib/data/color-codes/common";
import { MINECRAFT_COLORS } from "@/lib/data/color-codes/minecraft";
import { uniqueRobloxColors } from "@/lib/data/color-codes/roblox";

describe("color conversions", () => {
  it("round-trips HEX through RGB", () => {
    const hex = "#3b82f6";
    expect(rgbToHex(hexToRgb(hex))).toBe(hex);
  });

  it("parses hex, rgb, and hsl", () => {
    expect(parseColor("#ff0000")?.hex).toBe("#ff0000");
    expect(parseColor("rgb(255, 0, 0)")?.hex).toBe("#ff0000");
    expect(parseColor("hsl(0, 100%, 50%)")?.hex).toBe("#ff0000");
  });

  it("round-trips OKLCH for a mid blue", () => {
    const hex = "#3b82f6";
    const back = oklchToHex(hexToOklch(hex));
    expect(deltaE2000Hex(hex, back)).toBeLessThan(1);
  });
});

describe("contrast", () => {
  it("marks black on white as AAA", () => {
    const result = checkContrast("#000000", "#ffffff");
    expect(result.ratio).toBeGreaterThanOrEqual(7);
    expect(result.level).toBe("AAA");
    expect(result.normalAA).toBe(true);
  });

  it("fails light gray on white for normal text", () => {
    const result = checkContrast("#d4d4d8", "#ffffff");
    expect(result.normalAA).toBe(false);
  });
});

describe("nearest tokens", () => {
  it("maps Tailwind blue-500 as an exact token", () => {
    const match = nearestTailwind("#3b82f6");
    expect(match.token).toBe("blue-500");
    expect(match.exact).toBe(true);
    expect(match.label).toBe("Nearest Tailwind color");
  });

  it("maps CSS red by name", () => {
    const match = nearestCssName("#ff0000");
    expect(match.token.toLowerCase()).toBe("red");
    expect(match.exact).toBe(true);
  });
});

describe("delta E", () => {
  it("is zero for identical hexes", () => {
    expect(deltaE2000Hex("#111827", "#111827")).toBe(0);
    expect(describeDeltaE(0)).toBe("Very similar");
  });

  it("flags far colors as very different", () => {
    expect(deltaE2000Hex("#000000", "#ffffff")).toBeGreaterThan(5);
    expect(describeDeltaE(20)).toBe("Very different");
  });
});

describe("flexible parse", () => {
  it("accepts bare hex and oklch and tailwind tokens", () => {
    expect(parseFlexibleColor("3b82f6")).toBe("#3b82f6");
    expect(normalizeHex(parseFlexibleColor("blue-500") ?? "")).toBe("#3b82f6");
    expect(parseFlexibleColor("oklch(0.623 0.188 259.8)")).toMatch(/^#/);
  });
});

describe("perceptual ramps and harmonies", () => {
  it("builds tints lighter than the seed", () => {
    const tints = perceptualTints("#3b82f6", 4);
    expect(tints).toHaveLength(4);
    expect(hexToOklch(tints[0]!).l).toBeGreaterThan(hexToOklch("#3b82f6").l);
  });

  it("builds shades darker than the seed", () => {
    const shades = perceptualShades("#3b82f6", 4);
    expect(hexToOklch(shades.at(-1)!).l).toBeLessThan(hexToOklch("#3b82f6").l);
  });

  it("reduces chroma for tones", () => {
    const tones = perceptualTones("#3b82f6", 4);
    expect(hexToOklch(tones.at(-1)!).c).toBeLessThan(hexToOklch("#3b82f6").c);
  });

  it("rotates complementary 180 degrees", () => {
    const set = generateHarmonyByOffsets("#ff0000", [0, 180]);
    expect(set).toHaveLength(2);
    expect(set[1]).not.toBe(set[0]);
  });
});

describe("official color-code datasets", () => {
  it("uses CSS named red for common Red", () => {
    const red = getCommonColorRows().find((c) => c.name === "Red");
    expect(red?.hex.toLowerCase()).toBe("#ff0000");
    expect(red?.source).toBe("css-named");
  });

  it("maps Minecraft §c to the published red", () => {
    const red = MINECRAFT_COLORS.find((c) => c.chat === "§c");
    expect(red?.hex).toBe("#FF5555");
  });

  it("keeps unique Roblox BrickColor IDs", () => {
    const ids = uniqueRobloxColors().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
