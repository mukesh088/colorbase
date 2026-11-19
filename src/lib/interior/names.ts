import { hexToRgb, rgbToHsl } from "@/lib/colors/convert";
import { familyFromHex } from "@/lib/colors/spaces";
import { FAMILY_LABELS, type ColorFamily } from "@/lib/data/families";

const TONE: [number, string][] = [
  [12, "Near-black"],
  [28, "Deep"],
  [42, "Rich"],
  [58, "Mid"],
  [72, "Soft"],
  [86, "Pale"],
  [101, "Near-white"],
];

export function nameFromHex(hex: string) {
  const hsl = rgbToHsl(hexToRgb(hex));
  const family = familyFromHex(hex) as ColorFamily;
  const familyLabel = FAMILY_LABELS[family] ?? "Neutral";
  if (hsl.s < 8) {
    if (hsl.l < 12) return "Near black";
    if (hsl.l > 92) return "Near white";
    if (hsl.l > 70) return "Light gray";
    if (hsl.l < 35) return "Charcoal";
    return "Warm gray";
  }
  const tone = TONE.find(([max]) => hsl.l < max)?.[1] ?? "Mid";
  return `${tone} ${familyLabel.toLowerCase()}`;
}
