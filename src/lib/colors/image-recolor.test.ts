import { describe, expect, it } from "vitest";
import {
  applyDuotonePreview,
  applyRecolorPreview,
  duotoneImageData,
  recolorImageData,
} from "@/lib/colors/image-recolor";

function solidImage(r: number, g: number, b: number): ImageData {
  const data = new Uint8ClampedArray([r, g, b, 255, r, g, b, 255, r, g, b, 255, r, g, b, 255]);
  return { data, width: 2, height: 2, colorSpace: "srgb" } as ImageData;
}

describe("image recolor", () => {
  it("shifts near-source pixels toward the target hue", () => {
    const image = solidImage(59, 130, 246);
    recolorImageData(image, {
      sourceHex: "#3b82f6",
      targetHex: "#e11d48",
      tolerance: 60,
      preserveLuminance: true,
      strength: 1,
    });
    expect(image.data[0]).not.toBe(59);
  });

  it("respects strength so partial mixes stay between source and full recolor", () => {
    const full = solidImage(59, 130, 246);
    const partial = solidImage(59, 130, 246);
    recolorImageData(full, {
      sourceHex: "#3b82f6",
      targetHex: "#e11d48",
      tolerance: 60,
      preserveLuminance: true,
      strength: 1,
    });
    recolorImageData(partial, {
      sourceHex: "#3b82f6",
      targetHex: "#e11d48",
      tolerance: 60,
      preserveLuminance: true,
      strength: 0.4,
    });
    expect(Math.abs(partial.data[0]! - 59)).toBeLessThan(Math.abs(full.data[0]! - 59));
  });

  it("preview helpers do not mutate the base buffer", () => {
    const base = solidImage(59, 130, 246);
    const before = base.data[0];
    applyRecolorPreview(base, {
      sourceHex: "#3b82f6",
      targetHex: "#e11d48",
      tolerance: 60,
      preserveLuminance: true,
    });
    applyDuotonePreview(base, "#0f172a", "#f8fafc", { strength: 1 });
    expect(base.data[0]).toBe(before);
  });

  it("applies duotone mapping", () => {
    const image = solidImage(128, 128, 128);
    duotoneImageData(image, "#0f172a", "#f8fafc", { strength: 1, contrast: 10 });
    expect(image.data[0]).toBeGreaterThan(10);
  });
});
