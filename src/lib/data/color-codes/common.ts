import { CSS_NAMED_COLORS } from "@/lib/colors/palettes";
import { analyzeColor } from "@/lib/colors/spaces";
import { normalizeHex } from "@/lib/colors/convert";

export const COMMON_COLOR_NAMES = [
  "Black",
  "White",
  "Red",
  "Green",
  "Blue",
  "Yellow",
  "Orange",
  "Purple",
  "Pink",
  "Brown",
  "Gray",
  "Navy",
  "Teal",
  "Cyan",
  "Magenta",
  "Lime",
  "Olive",
  "Maroon",
  "Silver",
  "Gold",
] as const;

export type CommonColorRow = {
  name: string;
  hex: string;
  rgb: string;
  hsl: string;
  oklch: string;
  source: "css-named";
};

export function getCommonColorRows(): CommonColorRow[] {
  return COMMON_COLOR_NAMES.map((name) => {
    const hit = CSS_NAMED_COLORS.find((c) => c.name.toLowerCase() === name.toLowerCase());
    const hex = normalizeHex(hit?.hex ?? "#000000");
    const a = analyzeColor(hex);
    return {
      name,
      hex: a.hex.toUpperCase(),
      rgb: `rgb(${a.rgb.r}, ${a.rgb.g}, ${a.rgb.b})`,
      hsl: a.hsl,
      oklch: a.oklch,
      source: "css-named" as const,
    };
  });
}
