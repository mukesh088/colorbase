import { hexToHsl, hexToRgb, hslToRgb, normalizeHex, rgbToHex, rgbToHsl } from "@/lib/colors/convert";

export interface RecolorOptions {
  sourceHex: string;
  targetHex: string;
  /** Hue tolerance in degrees (roughly 1–180). */
  tolerance: number;
  preserveLuminance: boolean;
  /** 0–1 mix toward the remapped color. */
  strength?: number;
  /** Also match by RGB distance for flat brand fills. */
  matchRgb?: boolean;
}

export interface DuotoneOptions {
  shadowHex: string;
  highlightHex: string;
  /** 0–1 how hard to push toward the duotone map. */
  strength?: number;
  /** Contrast around midtones (−50…50). */
  contrast?: number;
}

function hueDistance(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function clampByte(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function cloneImageData(image: ImageData): ImageData {
  const data = new Uint8ClampedArray(image.data);
  if (typeof ImageData !== "undefined") {
    return new ImageData(data, image.width, image.height);
  }
  return { data, width: image.width, height: image.height, colorSpace: "srgb" } as ImageData;
}

/**
 * Recolor pixels near sourceHex toward targetHex.
 * Mutates `image` in place and returns it. Pass a clone if you need to keep the base.
 */
export function recolorImageData(image: ImageData, options: RecolorOptions): ImageData {
  const sourceHex = normalizeHex(options.sourceHex);
  const targetHex = normalizeHex(options.targetHex);
  const source = hexToHsl(sourceHex);
  const target = hexToHsl(targetHex);
  const sourceRgb = hexToRgb(sourceHex);
  const tol = Math.max(1, Math.min(180, options.tolerance));
  const strength = Math.max(0, Math.min(1, options.strength ?? 1));
  const matchRgb = options.matchRgb ?? true;
  const rgbTol = 18 + tol * 1.1;
  const data = image.data;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]!;
    if (a < 8) continue;

    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const hsl = rgbToHsl({ r, g, b });

    // Skip near-gray unless the source is also gray/low-sat.
    if (hsl.s < 10 && source.s >= 14) continue;

    const hueOk = hueDistance(hsl.h, source.h) <= tol;
    // Soft saturation gate — was too strict and missed photo hues.
    const satOk = Math.abs(hsl.s - source.s) <= Math.max(28, tol * 1.15);
    const rgbOk =
      matchRgb &&
      Math.hypot(r - sourceRgb.r, g - sourceRgb.g, b - sourceRgb.b) <= rgbTol;

    if (!(rgbOk || (hueOk && satOk))) continue;

    const nextH = target.h;
    const nextS = Math.min(100, Math.max(0, hsl.s + (target.s - source.s) * 0.45));
    const nextL = options.preserveLuminance
      ? hsl.l
      : Math.min(100, Math.max(0, hsl.l + (target.l - source.l) * 0.35));
    const rgb = hslToRgb({ h: nextH, s: nextS, l: nextL });

    data[i] = clampByte(r + (rgb.r - r) * strength);
    data[i + 1] = clampByte(g + (rgb.g - g) * strength);
    data[i + 2] = clampByte(b + (rgb.b - b) * strength);
  }
  return image;
}

/** Map luminance to a shadow→highlight duotone ramp. */
export function duotoneImageData(
  image: ImageData,
  shadowHex: string,
  highlightHex: string,
  options: Omit<DuotoneOptions, "shadowHex" | "highlightHex"> = {}
): ImageData {
  const shadow = hexToRgb(normalizeHex(shadowHex));
  const highlight = hexToRgb(normalizeHex(highlightHex));
  const strength = Math.max(0, Math.min(1, options.strength ?? 1));
  const contrast = Math.max(-50, Math.min(50, options.contrast ?? 0)) / 100;
  const data = image.data;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3]! < 8) continue;
    let y = (0.2126 * data[i]! + 0.7152 * data[i + 1]! + 0.0722 * data[i + 2]!) / 255;
    // Simple contrast around 0.5
    y = Math.max(0, Math.min(1, (y - 0.5) * (1 + contrast) + 0.5));
    const tr = shadow.r + (highlight.r - shadow.r) * y;
    const tg = shadow.g + (highlight.g - shadow.g) * y;
    const tb = shadow.b + (highlight.b - shadow.b) * y;
    data[i] = clampByte(data[i]! + (tr - data[i]!) * strength);
    data[i + 1] = clampByte(data[i + 1]! + (tg - data[i + 1]!) * strength);
    data[i + 2] = clampByte(data[i + 2]! + (tb - data[i + 2]!) * strength);
  }
  return image;
}

export function applyRecolorPreview(base: ImageData, options: RecolorOptions): ImageData {
  return recolorImageData(cloneImageData(base), options);
}

export function applyDuotonePreview(
  base: ImageData,
  shadowHex: string,
  highlightHex: string,
  options: Omit<DuotoneOptions, "shadowHex" | "highlightHex"> = {}
): ImageData {
  return duotoneImageData(cloneImageData(base), shadowHex, highlightHex, options);
}

export const RECOLOR_PRESETS = [
  { id: "rose-brand", label: "Rose brand", source: "#3b82f6", target: "#e11d48", tolerance: 48 },
  { id: "teal-shift", label: "Teal shift", source: "#22c55e", target: "#0d9488", tolerance: 55 },
  { id: "violet-pop", label: "Violet pop", source: "#f59e0b", target: "#7c3aed", tolerance: 52 },
  { id: "sky-ink", label: "Sky → ink", source: "#38bdf8", target: "#0f172a", tolerance: 50 },
  { id: "coral-gold", label: "Coral → gold", source: "#fb7185", target: "#d97706", tolerance: 46 },
] as const;

export const DUOTONE_PRESETS = [
  { id: "ink-paper", label: "Ink & paper", shadow: "#0f172a", highlight: "#f8fafc" },
  { id: "rose-cream", label: "Rose cream", shadow: "#9f1239", highlight: "#fff1f2" },
  { id: "navy-gold", label: "Navy gold", shadow: "#1e3a8a", highlight: "#fef3c7" },
  { id: "forest-mist", label: "Forest mist", shadow: "#14532d", highlight: "#ecfdf5" },
  { id: "cyanotype", label: "Cyanotype", shadow: "#0c4a6e", highlight: "#e0f2fe" },
  { id: "neon", label: "Neon wash", shadow: "#4c1d95", highlight: "#f0abfc" },
] as const;

export { cloneImageData, rgbToHex };
