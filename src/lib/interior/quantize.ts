import { hexToRgb, rgbToHex, rgbToHsl } from "@/lib/colors/convert";
import { nameFromHex } from "@/lib/interior/names";
import {
  INTERIOR_SWATCH_MAX,
  INTERIOR_SWATCH_MIN,
  type InteriorSwatch,
  type SuggestedRole,
} from "@/lib/interior/catalog";

const STEP = 24;
const MIN_DISTANCE = 42;

function assignRoles(swatches: Omit<InteriorSwatch, "suggestedRole">[]): InteriorSwatch[] {
  const byShare = [...swatches].sort((a, b) => b.share - a.share);
  const darkest = [...swatches].sort((a, b) => a.hsl.l - b.hsl.l)[0];
  const punchiest = [...swatches].sort((a, b) => b.hsl.s - a.hsl.s)[0];
  const wall = byShare[0];
  return swatches.map((swatch, index) => {
    let suggestedRole: SuggestedRole = "secondary";
    if (wall && swatch.hex === wall.hex) suggestedRole = "wall/base";
    else if (darkest && swatch.hex === darkest.hex && swatch.hsl.l < 35) suggestedRole = "dark contrast";
    else if (punchiest && swatch.hex === punchiest.hex && swatch.hsl.s > 28 && index !== 0)
      suggestedRole = "accent";
    return { ...swatch, suggestedRole };
  });
}

/** Quantize opaque pixels, then average the original samples in each kept cluster. */
export function extractInteriorPalette(
  data: ArrayLike<number>,
  count = 6
): InteriorSwatch[] {
  const want = Math.min(INTERIOR_SWATCH_MAX, Math.max(INTERIOR_SWATCH_MIN, count));
  const buckets = new Map<string, { r: number; g: number; b: number; n: number }>();
  let opaque = 0;
  for (let i = 0; i + 3 < data.length; i += 4) {
    if (data[i + 3] < 250) continue;
    opaque += 1;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = rgbToHex({
      r: Math.round(r / STEP) * STEP,
      g: Math.round(g / STEP) * STEP,
      b: Math.round(b / STEP) * STEP,
    });
    const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    bucket.n += 1;
    buckets.set(key, bucket);
  }
  if (!opaque) return [];

  const ranked = [...buckets.entries()].sort((a, b) => b[1].n - a[1].n);
  const averaged = ranked.map(([, bucket]) => {
    const hex = rgbToHex({
      r: Math.round(bucket.r / bucket.n),
      g: Math.round(bucket.g / bucket.n),
      b: Math.round(bucket.b / bucket.n),
    });
    return { hex, n: bucket.n };
  });

  let selected: { hex: string; n: number }[] = [];
  for (let minDist = MIN_DISTANCE; minDist >= 12 && selected.length < INTERIOR_SWATCH_MIN; minDist -= 10) {
    selected = [];
    for (const item of averaged) {
      const rgb = hexToRgb(item.hex);
      if (
        selected.every((existing) => {
          const other = hexToRgb(existing.hex);
          return Math.hypot(rgb.r - other.r, rgb.g - other.g, rgb.b - other.b) > minDist;
        })
      ) {
        selected.push(item);
      }
      if (selected.length >= want) break;
    }
  }

  const total = selected.reduce((sum, item) => sum + item.n, 0) || 1;
  const swatches = selected.map((item) => {
    const rgb = hexToRgb(item.hex);
    return {
      hex: item.hex,
      name: nameFromHex(item.hex),
      rgb,
      hsl: rgbToHsl(rgb),
      share: Number((item.n / total).toFixed(4)),
    };
  });
  return assignRoles(swatches);
}
