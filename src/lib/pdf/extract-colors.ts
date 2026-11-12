import { normalizeHex, rgbToHex } from "@/lib/colors/convert";
import { rgbDistance } from "@/lib/colors/palette-distance";

/** pdf.js OPS ids used for solid color paint (stable across recent pdfjs-dist builds). */
export const PDF_COLOR_OPS = {
  setStrokeGray: 56,
  setFillGray: 57,
  setStrokeRGBColor: 58,
  setFillRGBColor: 59,
  setStrokeCMYKColor: 60,
  setFillCMYKColor: 61,
} as const;

function clampByte(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function rgbFromUnit(r: number, g: number, b: number) {
  // PDF color ops are usually 0–1; tolerate 0–255 inputs.
  const scale = r > 1 || g > 1 || b > 1 ? 1 : 255;
  return rgbToHex({
    r: clampByte(r * scale),
    g: clampByte(g * scale),
    b: clampByte(b * scale),
  });
}

function grayFromUnit(g: number) {
  const scale = g > 1 ? 1 : 255;
  const v = clampByte(g * scale);
  return rgbToHex({ r: v, g: v, b: v });
}

function cmykFromUnit(c: number, m: number, y: number, k: number) {
  const to01 = (n: number) => (n > 1 ? n / 255 : n);
  const C = to01(c);
  const M = to01(m);
  const Y = to01(y);
  const K = to01(k);
  return rgbToHex({
    r: clampByte(255 * (1 - C) * (1 - K)),
    g: clampByte(255 * (1 - M) * (1 - K)),
    b: clampByte(255 * (1 - Y) * (1 - K)),
  });
}

function pushUnique(list: string[], hex: string, minDistance = 12) {
  const n = normalizeHex(hex);
  if (list.some((existing) => existing === n || rgbDistance(existing, n) < minDistance)) return;
  list.push(n);
}

/**
 * Pull solid colors from a pdf.js operator list (fnArray + argsArray).
 * Covers DeviceGray / DeviceRGB / DeviceCMYK paint ops used by most brand PDFs.
 */
export function extractColorsFromOperatorList(
  fnArray: ArrayLike<number>,
  argsArray: ArrayLike<unknown>,
  max = 64
): string[] {
  const out: string[] = [];
  const len = Math.min(fnArray.length, argsArray.length);
  for (let i = 0; i < len; i++) {
    if (out.length >= max) break;
    const fn = fnArray[i];
    const args = argsArray[i];
    const nums = Array.isArray(args)
      ? args.filter((v): v is number => typeof v === "number" && Number.isFinite(v))
      : [];

    try {
      if (
        (fn === PDF_COLOR_OPS.setFillRGBColor || fn === PDF_COLOR_OPS.setStrokeRGBColor) &&
        nums.length >= 3
      ) {
        pushUnique(out, rgbFromUnit(nums[0]!, nums[1]!, nums[2]!));
      } else if (
        (fn === PDF_COLOR_OPS.setFillGray || fn === PDF_COLOR_OPS.setStrokeGray) &&
        nums.length >= 1
      ) {
        pushUnique(out, grayFromUnit(nums[0]!));
      } else if (
        (fn === PDF_COLOR_OPS.setFillCMYKColor || fn === PDF_COLOR_OPS.setStrokeCMYKColor) &&
        nums.length >= 4
      ) {
        pushUnique(out, cmykFromUnit(nums[0]!, nums[1]!, nums[2]!, nums[3]!));
      }
    } catch {
      /* ignore malformed op */
    }
  }
  return out;
}

export type SamplePaletteOptions = {
  count?: number;
  /** Quantization step in 0–255 (smaller = more distinct colors). */
  bucket?: number;
  /** Minimum RGB distance between kept swatches. */
  minDistance?: number;
  /** Skip near-white paper fills when building accent samples. */
  skipNearWhite?: boolean;
  /** Skip near-black body text when building accent samples. */
  skipNearBlack?: boolean;
};

/**
 * Denser pixel sampling for PDF pages — keeps more brand accents than the generic image helper.
 */
export function samplePdfPalette(
  data: ArrayLike<number>,
  options: SamplePaletteOptions = {}
): { accents: string[]; neutrals: string[]; all: string[] } {
  const count = options.count ?? 16;
  const bucket = options.bucket ?? 16;
  const minDistance = options.minDistance ?? 28;
  const skipNearWhite = options.skipNearWhite ?? true;
  const skipNearBlack = options.skipNearBlack ?? true;

  const buckets = new Map<string, number>();
  for (let i = 0; i + 3 < data.length; i += 4) {
    const a = data[i + 3]!;
    if (a < 250) continue;
    const r = Math.round(data[i]! / bucket) * bucket;
    const g = Math.round(data[i + 1]! / bucket) * bucket;
    const b = Math.round(data[i + 2]! / bucket) * bucket;
    const hex = rgbToHex({
      r: Math.min(255, r),
      g: Math.min(255, g),
      b: Math.min(255, b),
    });
    buckets.set(hex, (buckets.get(hex) ?? 0) + 1);
  }

  const ranked = [...buckets].sort((a, b) => b[1] - a[1]).map(([hex]) => hex);
  const accents: string[] = [];
  const neutrals: string[] = [];

  for (const hex of ranked) {
    const { r, g, b } = {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    };
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const isWhite = luma > 245 && Math.max(r, g, b) - Math.min(r, g, b) < 18;
    const isBlack = luma < 18;
    const isGray = Math.max(r, g, b) - Math.min(r, g, b) < 14;

    if ((skipNearWhite && isWhite) || (skipNearBlack && isBlack) || isGray) {
      if (neutrals.length < 6) pushUnique(neutrals, hex, minDistance);
      continue;
    }
    if (accents.length < count) pushUnique(accents, hex, minDistance);
  }

  // If the page is mostly neutrals, still return useful greys/paper.
  if (accents.length < 3) {
    for (const hex of ranked) {
      if (accents.length >= count) break;
      pushUnique(accents, hex, minDistance);
    }
  }

  const all: string[] = [];
  for (const hex of [...accents, ...neutrals]) pushUnique(all, hex, 10);
  return { accents, neutrals, all };
}

export function mergePdfPalettes(sets: string[][], max = 36, minDistance = 22) {
  const out: string[] = [];
  for (const set of sets) {
    for (const hex of set) {
      pushUnique(out, hex, minDistance);
      if (out.length >= max) return out;
    }
  }
  return out;
}
