import { describe, expect, it } from "vitest";
import { duotoneImageData, recolorImageData } from "@/lib/colors/image-recolor";

function solidImage(r: number, g: number, b: number): ImageData {
  const data = new Uint8ClampedArray([r, g, b, 255, r, g, b, 255, r, g, b, 255, r, g, b, 255]);
  return { data, width: 2, height: 2, colorSpace: "srgb" } as ImageData;
}

describe("image recolor", () => {
  it("shifts near-source pixels toward the target hue", () => {
    // approx blue
    const image = solidImage(59, 130, 246);
    recolorImageData(image, {
      sourceHex: "#3b82f6",
      targetHex: "#e11d48",
      tolerance: 60,
      preserveLuminance: true,
    });
    expect(image.data[0]).not.toBe(59);
  });

  it("applies duotone mapping", () => {
    const image = solidImage(128, 128, 128);
    duotoneImageData(image, "#0f172a", "#f8fafc");
    expect(image.data[0]).toBeGreaterThan(10);
  });
});
