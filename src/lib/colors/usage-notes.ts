import { hexToRgb, rgbToHsl } from "@/lib/colors/convert";
import type { FullColorAnalysis } from "@/lib/colors/spaces";
import { FAMILY_LABELS, type ColorFamily } from "@/lib/data/families";

export function colorUsageNotes(
  analysis: FullColorAnalysis,
  name: string,
  family?: string
): { summary: string; uses: string[]; watchouts: string[] } {
  const hsl = rgbToHsl(hexToRgb(analysis.hex));
  const familyLabel = FAMILY_LABELS[(family ?? "blue") as ColorFamily] ?? family ?? "this";
  const onWhite = analysis.contrastOnWhite;
  const onBlack = analysis.contrastOnBlack;
  const text = analysis.textOnColor === "#ffffff" ? "white" : "near-black";

  const roles: string[] = [];
  if (hsl.l >= 88) roles.push("page or card backgrounds");
  else if (hsl.l >= 72) roles.push("subtle surfaces, chips, and table stripes");
  else if (hsl.l <= 18) roles.push("body text, chrome, and dark-mode surfaces");
  else if (hsl.s >= 55 && hsl.l >= 38 && hsl.l <= 58) roles.push("primary buttons and key accents");
  else roles.push("supporting UI accents");

  if (onWhite >= 4.5) roles.push("text or icons on a white canvas");
  else if (onWhite >= 3) roles.push("large titles on light backgrounds (WCAG AA Large)");
  if (onBlack >= 4.5) roles.push("text or icons on charcoal / dark mode");

  const summary = `${name} (${analysis.hex}) sits in the ${familyLabel.toLowerCase()} family at about ${hsl.h}° hue, ${hsl.s}% saturation, and ${hsl.l}% lightness. Contrast is ${onWhite}:1 on white and ${onBlack}:1 on black, so ${text} labels read more clearly on the swatch itself. Closest Tailwind token in our matcher: ${analysis.tailwind}.`;

  const watchouts: string[] = [];
  if (onWhite < 4.5) {
    watchouts.push(
      `Do not use ${analysis.hex} as small body text on white — ${onWhite}:1 misses WCAG AA (4.5:1). Pair it with a darker shade from the scale below, or check pairs in the contrast checker.`
    );
  }
  if (onBlack < 4.5) {
    watchouts.push(
      `On a black or near-black UI, ${analysis.hex} is ${onBlack}:1. Prefer it as a fill, border, or large heading rather than 16px copy.`
    );
  }
  if (hsl.s < 12 && hsl.l > 20 && hsl.l < 80) {
    watchouts.push(
      "Low saturation makes this easy to overuse as a neutral. Keep one chromatic accent elsewhere so the interface does not go muddy."
    );
  }
  if (hsl.s > 80 && hsl.l > 45 && hsl.l < 60) {
    watchouts.push(
      "High chroma can vibrate against complementary hues. If a pairing feels noisy, drop saturation on the background rather than the brand accent."
    );
  }
  if (!watchouts.length) {
    watchouts.push(
      `Verify real text sizes in the contrast checker — ratios here are for the raw swatch ${analysis.hex}, not for every tint in the scale.`
    );
  }

  return { summary, uses: [...new Set(roles)], watchouts };
}
