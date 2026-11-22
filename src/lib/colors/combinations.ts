import { generateHarmony, getContrastRatio, hexToHsl, hslToRgb, mixColors, normalizeHex, rgbToHex } from "@/lib/colors/convert";
import { describeHex } from "@/lib/colors/describe";
import { nearestCssName } from "@/lib/colors/spaces";
import COMBINATION_COLORS from "@/lib/data/combination-colors.json";

export type CombinationBase = {
  slug: string;
  name: string;
  hex: string;
  source: string;
  sourceName?: string;
  cssKeyword?: string;
  aliases: string[];
  verified: boolean;
};

export type MatchRole =
  | "complementary"
  | "analogous"
  | "split-complementary"
  | "light-neutral"
  | "dark-neutral"
  | "tint"
  | "shade"
  | "accent";

export type ColorMatch = { hex: string; role: MatchRole; label: string; nearestName: string };

export type ReadyPalette = { name: string; description: string; colors: string[] };

const BASES = COMBINATION_COLORS as CombinationBase[];

export function getCombinationBases() {
  return BASES;
}

export function getCombinationBase(slug: string) {
  return BASES.find((b) => b.slug === slug);
}

/** Classic CSS-keyword accents used when the base has no hue to rotate (grays, black, white). */
const NEUTRAL_ACCENTS: [string, string][] = [
  ["#000080", "navy"],
  ["#008080", "teal"],
  ["#dc143c", "crimson"],
  ["#daa520", "goldenrod"],
  ["#556b2f", "darkolivegreen"],
];

const ROLE_LABELS: Record<MatchRole, string> = {
  complementary: "Complementary accent",
  analogous: "Analogous neighbor",
  "split-complementary": "Split-complementary",
  "light-neutral": "Light neutral",
  "dark-neutral": "Dark neutral",
  tint: "Lighter tint",
  shade: "Deeper shade",
  accent: "Classic accent",
};

function withLightness(hex: string, l: number) {
  const { h, s } = hexToHsl(hex);
  return rgbToHex(hslToRgb({ h, s, l }));
}

function match(hex: string, role: MatchRole): ColorMatch {
  const normalized = normalizeHex(hex).toLowerCase();
  return { hex: normalized, role, label: ROLE_LABELS[role], nearestName: nearestCssName(normalized).token };
}

/**
 * Computed matches for one base color: harmony partners from the color
 * wheel plus neutrals and tonal steps mixed from the base itself.
 */
export function colorMatches(baseHex: string): ColorMatch[] {
  const base = normalizeHex(baseHex).toLowerCase();
  const d = describeHex(base);
  // Very light bases (white, ivory) get a slightly darker neutral instead of mixing to pure white.
  const lightNeutral = d.hsl.l >= 94 ? mixColors(base, "#000000", 0.07) : mixColors(base, "#ffffff", 0.88);
  const darkNeutral = d.hsl.l <= 8 ? mixColors(base, "#ffffff", 0.18) : mixColors(base, "#111111", 0.82);
  const neutrals = [match(lightNeutral, "light-neutral"), match(darkNeutral, "dark-neutral")];
  const unique = (list: ColorMatch[]) => {
    const seen = new Set<string>([base]);
    return list.filter((m) => !seen.has(m.hex) && seen.add(m.hex));
  };
  if (d.isNeutral || d.hsl.s < 12) {
    return unique([...NEUTRAL_ACCENTS.map(([hex]) => match(hex, "accent")), ...neutrals]);
  }
  const [, complement] = generateHarmony(base, "complementary");
  const [left, , right] = generateHarmony(base, "analogous");
  const [, splitA, splitB] = generateHarmony(base, "split-complementary");
  const tint = withLightness(base, Math.min(92, d.hsl.l + 28));
  const shade = withLightness(base, Math.max(12, d.hsl.l - 28));
  const all = [
    match(complement, "complementary"),
    match(left, "analogous"),
    match(right, "analogous"),
    match(splitA, "split-complementary"),
    match(splitB, "split-complementary"),
    ...neutrals,
    match(d.hsl.l > 60 ? shade : tint, d.hsl.l > 60 ? "shade" : "tint"),
  ];
  return unique(all);
}

function pick(matches: ColorMatch[], role: MatchRole, index = 0) {
  return matches.filter((m) => m.role === role)[index]?.hex;
}

/** Three ready-made palettes built from the matches. */
export function readyPalettes(baseHex: string, name: string): ReadyPalette[] {
  const base = normalizeHex(baseHex).toLowerCase();
  const m = colorMatches(base);
  const light = pick(m, "light-neutral")!;
  const dark = pick(m, "dark-neutral")!;
  const accent = pick(m, "complementary") ?? pick(m, "accent")!;
  const second = pick(m, "split-complementary") ?? pick(m, "accent", 1)!;
  const neighbor = pick(m, "analogous") ?? pick(m, "accent", 2)!;
  const step = pick(m, "tint") ?? pick(m, "shade") ?? mixColors(base, "#ffffff", 0.5);
  return [
    {
      name: `Classic ${name}`,
      description: `${name} with a light and a dark neutral, plus one contrasting accent for buttons and links.`,
      colors: [base, light, dark, accent],
    },
    {
      name: `Bold ${name}`,
      description: `High-energy mix of ${name.toLowerCase()} and two split-complementary or accent colors on a dark base.`,
      colors: [base, accent, second, dark],
    },
    {
      name: `Soft ${name}`,
      description: `Calm scheme from ${name.toLowerCase()}, a neighboring hue and a tonal step on a light background.`,
      colors: [light, step, base, neighbor],
    },
  ];
}

/** Best of black/white text on a background, with its ratio. */
export function readableText(bg: string) {
  const onWhite = getContrastRatio("#ffffff", bg);
  const onBlack = getContrastRatio("#000000", bg);
  return onWhite >= onBlack
    ? { color: "#ffffff", ratio: Math.round(onWhite * 100) / 100 }
    : { color: "#000000", ratio: Math.round(onBlack * 100) / 100 };
}
