import { describe, expect, it } from "vitest";
import { extractInteriorPalette } from "@/lib/interior/quantize";
import { nameFromHex } from "@/lib/interior/names";
import { verifyAdminToken, createAdminToken } from "@/lib/interior/auth";

function paint(width: number, height: number, colors: number[][]) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const [r, g, b] = colors[i % colors.length];
    const o = i * 4;
    data[o] = r;
    data[o + 1] = g;
    data[o + 2] = b;
    data[o + 3] = 255;
  }
  return data;
}

describe("interior palette extraction", () => {
  it("returns exact averaged HEX values from pixels, not invented codes", () => {
    const swatches = extractInteriorPalette(
      paint(48, 48, [
        [225, 29, 72],
        [15, 23, 42],
        [248, 250, 252],
        [37, 99, 235],
        [16, 185, 129],
        [245, 158, 11],
      ]),
      6
    );
    expect(swatches.length).toBeGreaterThanOrEqual(5);
    expect(swatches.length).toBeLessThanOrEqual(8);
    const hexes = swatches.map((s) => s.hex);
    expect(hexes).toContain("#e11d48");
    expect(hexes.every((hex) => /^#[0-9a-f]{6}$/.test(hex))).toBe(true);
    expect(swatches.every((s) => s.suggestedRole)).toBe(true);
  });

  it("names colors from measured values", () => {
    expect(nameFromHex("#000000")).toBe("Near black");
    expect(nameFromHex("#ffffff")).toBe("Near white");
  });

  it("verifies admin tokens with HMAC", () => {
    const secret = "test-admin-secret-value";
    const token = createAdminToken(secret, 1_000_000);
    expect(verifyAdminToken(token, secret, 1_000_000)).toBe(true);
    expect(verifyAdminToken(token, "other", 1_000_000)).toBe(false);
    expect(verifyAdminToken(token, secret, 1_000_000 + 8 * 24 * 60 * 60 * 1000)).toBe(false);
  });
});
