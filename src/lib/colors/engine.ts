import {
  analyzeColor,
  deltaE2000Hex,
  nearestBootstrap,
  nearestCssName,
  nearestMaterial,
  nearestTailwind,
  type NearestMatch,
} from "@/lib/colors/spaces";
import { generateHarmony, generateHarmonyByOffsets, hexToRgb, normalizeHex, rgbToHsl } from "@/lib/colors/convert";
import { perceptualShades, perceptualTints, perceptualTones } from "@/lib/colors/oklch";
import { BRANDS, brandAllColors } from "@/lib/data/brands";

export {
  analyzeColor,
  nearestBootstrap,
  nearestCssName,
  nearestMaterial,
  nearestTailwind,
  generateHarmony,
  generateHarmonyByOffsets,
  perceptualShades,
  perceptualTints,
  perceptualTones,
};

const BRAND_TOKENS = BRANDS.flatMap((brand) =>
  brandAllColors(brand).map((hex) => ({ token: brand.name, hex: normalizeHex(hex) }))
);

export function nearestBrand(hex: string): NearestMatch | null {
  if (!BRAND_TOKENS.length) return null;
  const n = normalizeHex(hex);
  let best = BRAND_TOKENS[0]!;
  let bestD = Infinity;
  for (const item of BRAND_TOKENS) {
    if (item.hex === n) {
      return { token: item.token, hex: item.hex, deltaE: 0, exact: true, label: "Nearest brand color" };
    }
    const d = deltaE2000Hex(n, item.hex);
    if (d < bestD) {
      bestD = d;
      best = item;
    }
  }
  return {
    token: best.token,
    hex: best.hex,
    deltaE: Math.round(bestD * 100) / 100,
    exact: false,
    label: "Nearest brand color",
  };
}

export const HARMONY_PRESETS = [
  { id: "complementary", label: "Complementary", offsets: [0, 180] },
  { id: "analogous", label: "Analogous", offsets: [-30, 0, 30] },
  { id: "monochromatic", label: "Monochromatic", offsets: [0] },
  { id: "triadic", label: "Triadic", offsets: [0, 120, 240] },
  { id: "tetradic", label: "Tetradic", offsets: [0, 60, 180, 240] },
  { id: "split-complementary", label: "Split complementary", offsets: [0, 150, 210] },
  { id: "square", label: "Square", offsets: [0, 90, 180, 270] },
  { id: "double-complementary", label: "Double complementary", offsets: [0, 30, 180, 210] },
] as const;

export function formatsForHex(hex: string) {
  const a = analyzeColor(hex);
  const rgb = hexToRgb(a.hex);
  const hsl = rgbToHsl(rgb);
  return { ...a, rgbParts: rgb, hslParts: hsl };
}
