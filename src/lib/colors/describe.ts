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
