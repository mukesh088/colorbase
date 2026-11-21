import { hexToHsl, hexToRgb, normalizeHex } from "@/lib/colors/convert";

/** Hue bands (degrees, upper bound exclusive) → plain-language hue name. */
const HUE_NAMES: [number, string][] = [
  [10, "red"],
  [22, "reddish-orange"],
  [38, "orange"],
  [50, "amber"],
  [64, "yellow"],
  [80, "yellow-green"],
  [150, "green"],
  [175, "teal"],
  [195, "cyan"],
  [220, "azure blue"],
  [250, "blue"],
  [270, "indigo"],
  [290, "violet"],
  [320, "magenta"],
  [345, "pink"],
  [361, "red"],
];

export type ColorTemperature = "warm" | "cool" | "neutral";

export type HexDescription = {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  /** e.g. "vivid reddish-orange", "dark muted blue", "light gray". */
  phrase: string;
  /** "a" or "an" for the phrase. */
  article: "a" | "an";
  hueName: string;
  temperature: ColorTemperature;
  isNeutral: boolean;
};

function hueName(h: number) {
  return HUE_NAMES.find(([max]) => h < max)?.[1] ?? "red";
}

/** Deterministic, computed description of a HEX color (no invented data). */
export function describeHex(input: string): HexDescription {
  const hex = normalizeHex(input).toUpperCase();
  const rgb = hexToRgb(hex);
  const hsl = hexToHsl(hex);
  const { h, s, l } = hsl;
  const isNeutral = s < 10 || l <= 3 || l >= 98;

  let phrase: string;
  let name: string;
  if (l <= 3) {
    phrase = name = l === 0 ? "black" : "near-black";
  } else if (l >= 98) {
    phrase = name = l === 100 ? "white" : "near-white";
  } else if (isNeutral) {
    name = "gray";
    const tint = s >= 4 ? (h < 70 || h >= 330 ? "warm " : h >= 150 && h < 300 ? "cool " : "") : "";
    const shade = l < 20 ? "very dark " : l < 38 ? "dark " : l < 62 ? "medium " : l < 85 ? "light " : "very light ";
    phrase = `${shade}${tint}gray`;
  } else {
    const isBrown = h >= 12 && h < 45 && l < 42 && s < 85;
    const base = hueName(h);
    name = isBrown ? "brown" : base === "red" && l >= 75 ? "pink" : base;
    const lightness = l < 20 ? "very dark" : l < 38 ? "dark" : l < 62 ? "" : l < 80 ? "light" : "pale";
    const chroma = s < 30 ? "muted" : s >= 80 && l >= 30 && l <= 70 ? "vivid" : "";
    phrase = [lightness, chroma, name].filter(Boolean).join(" ");
  }

  const temperature: ColorTemperature = isNeutral
    ? "neutral"
    : h < 70 || h >= 330
      ? "warm"
      : h >= 150 && h < 300
        ? "cool"
        : "neutral";

  return {
    hex,
    rgb,
    hsl,
    phrase,
    article: /^[aeiou]/i.test(phrase) ? "an" : "a",
    hueName: name,
    temperature,
    isNeutral,
  };
}

/** "#FF5733 is a vivid reddish-orange. RGB 255, 87, 51; HSL 11°, 100%, 60%." */
export function hexAnswerSentence(input: string) {
  const d = describeHex(input);
  return `${d.hex} is ${d.article} ${d.phrase}. RGB ${d.rgb.r}, ${d.rgb.g}, ${d.rgb.b}; HSL ${d.hsl.h}°, ${d.hsl.s}%, ${d.hsl.l}%.`;
}

export type ContrastVerdict = {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
};

/** WCAG 2.x thresholds for a ratio (normal text 4.5 / 7, large text 3 / 4.5). */
export function contrastVerdict(ratio: number): ContrastVerdict {
  const r = Math.round(ratio * 100) / 100;
  return { ratio: r, aaNormal: r >= 4.5, aaLarge: r >= 3, aaaNormal: r >= 7, aaaLarge: r >= 4.5 };
}

/**
 * Computed sentences that vary with temperature and measured contrast,
 * used as the intro under the answer sentence on color pages.
 */
export function hexUsageSentences(input: string, onWhite: number, onBlack: number) {
  const d = describeHex(input);
  const sentences: string[] = [];
  if (d.temperature === "warm") sentences.push("It is a warm color, so it reads as energetic and draws attention.");
  else if (d.temperature === "cool") sentences.push("It is a cool color, so it reads as calm and steady.");
  else sentences.push("It is a neutral, so it suits surfaces, borders and text without competing with accents.");

  const white = contrastVerdict(onWhite);
  const black = contrastVerdict(onBlack);
  if (white.aaNormal) {
    sentences.push(
      `As text on white it reaches ${white.ratio}:1, which passes WCAG AA${white.aaaNormal ? " and AAA" : ""} for body copy, and white labels on it are just as readable.`
    );
  } else if (black.aaNormal && white.aaLarge) {
    sentences.push(
      `Black text on it reaches ${black.ratio}:1 (AA); as text on white it reaches ${white.ratio}:1, enough for large headings but not body text.`
    );
  } else if (black.aaNormal) {
    sentences.push(
      `It is light, so pair it with dark text: black on it reaches ${black.ratio}:1, while it fails as text on white at ${white.ratio}:1.`
    );
  } else {
    sentences.push(
      `Neither black (${black.ratio}:1) nor white (${white.ratio}:1) text reaches 4.5:1 on it, so use it for fills and accents rather than behind body text.`
    );
  }
  return sentences;
}
