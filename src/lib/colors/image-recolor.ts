import { hexToHsl, hexToRgb, hslToRgb, normalizeHex, rgbToHex } from "@/lib/colors/convert";

export interface RecolorOptions {
  sourceHex: string;
  targetHex: string;
  tolerance: number; // 0–100 hue distance-ish
  preserveLuminance: boolean;
}

function hueDistance(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/** Recolor pixels near sourceHex toward targetHex in-place on ImageData. */
export function recolorImageData(image: ImageData, options: RecolorOptions): ImageData {
  const source = hexToHsl(options.sourceHex);
  const target = hexToHsl(options.targetHex);
  const tol = Math.max(1, Math.min(180, options.tolerance));
  const data = image.data;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a === 0) continue;
    const hex = rgbToHex({ r: data[i], g: data[i + 1], b: data[i + 2] });
    const hsl = hexToHsl(hex);
    // Near-gray: skip unless source is also gray
    if (hsl.s < 8 && source.s >= 12) continue;
    if (hueDistance(hsl.h, source.h) > tol) continue;
    if (Math.abs(hsl.s - source.s) > tol * 0.9) continue;

    const nextH = target.h;
    const nextS = Math.min(100, Math.max(0, hsl.s + (target.s - source.s) * 0.35));
    const nextL = options.preserveLuminance
      ? hsl.l
      : Math.min(100, Math.max(0, hsl.l + (target.l - source.l) * 0.25));
    const rgb = hslToRgb({ h: nextH, s: nextS, l: nextL });
    data[i] = rgb.r;
    data[i + 1] = rgb.g;
    data[i + 2] = rgb.b;
  }
  return image;
}

export function duotoneImageData(image: ImageData, shadowHex: string, highlightHex: string) {
  const shadow = hexToRgb(normalizeHex(shadowHex));
  const highlight = hexToRgb(normalizeHex(highlightHex));
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const y = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
    data[i] = Math.round(shadow.r + (highlight.r - shadow.r) * y);
    data[i + 1] = Math.round(shadow.g + (highlight.g - shadow.g) * y);
    data[i + 2] = Math.round(shadow.b + (highlight.b - shadow.b) * y);
  }
  return image;
}

export const RECOLOR_PRESETS = [
  { id: "rose-brand", label: "Rose brand", source: "#3b82f6", target: "#e11d48", tolerance: 42 },
  { id: "teal-shift", label: "Teal shift", source: "#22c55e", target: "#0d9488", tolerance: 50 },
  { id: "violet-pop", label: "Violet pop", source: "#f59e0b", target: "#7c3aed", tolerance: 48 },
] as const;
