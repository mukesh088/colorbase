import {
  hexToRgb,
  hslToRgb,
  normalizeHex,
  rgbToCmyk,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  getContrastRatio,
  checkContrast,
  generateHarmony,
  mixColors,
  getTextColor,
} from "@/lib/colors/convert";
import { BOOTSTRAP_COLORS, CSS_NAMED_COLORS, MATERIAL_COLORS, TAILWIND_COLORS } from "@/lib/colors/palettes";
import { clamp } from "@/lib/utils";
import type { RGB } from "@/types/color";

export interface Lab {
  l: number;
  a: number;
  b: number;
}

export interface Lch {
  l: number;
  c: number;
  h: number;
}

export interface Oklab {
  l: number;
  a: number;
  b: number;
}

export interface Oklch {
  l: number;
  c: number;
  h: number;
}

export interface Xyz {
  x: number;
  y: number;
  z: number;
}

function srgbToLinear(c: number) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function rgbToXyz({ r, g, b }: RGB): Xyz {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return {
    x: R * 0.4124564 + G * 0.3575761 + B * 0.1804375,
    y: R * 0.2126729 + G * 0.7151522 + B * 0.072175,
    z: R * 0.0193339 + G * 0.119192 + B * 0.9503041,
  };
}

function pivotLab(t: number) {
  return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
}

export function xyzToLab({ x, y, z }: Xyz): Lab {
  // D65 reference white
  const fx = pivotLab(x / 0.95047);
  const fy = pivotLab(y / 1);
  const fz = pivotLab(z / 1.08883);
  return {
    l: Math.round((116 * fy - 16) * 100) / 100,
    a: Math.round((500 * (fx - fy)) * 100) / 100,
    b: Math.round((200 * (fy - fz)) * 100) / 100,
  };
}

export function labToLch({ l, a, b }: Lab): Lch {
  const c = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return {
    l: Math.round(l * 100) / 100,
    c: Math.round(c * 100) / 100,
    h: Math.round(h * 100) / 100,
  };
}

export function rgbToOklab({ r, g, b }: RGB): Oklab {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  return {
    l: Math.round((0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_) * 10000) / 10000,
    a: Math.round((1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_) * 10000) / 10000,
    b: Math.round((0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_) * 10000) / 10000,
  };
}

export function oklabToOklch({ l, a, b }: Oklab): Oklch {
  const c = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return {
    l: Math.round(l * 10000) / 10000,
    c: Math.round(c * 10000) / 10000,
    h: Math.round(h * 100) / 100,
  };
}

export function formatLab(lab: Lab) {
  return `lab(${lab.l}% ${lab.a} ${lab.b})`;
}

export function formatLch(lch: Lch) {
  return `lch(${lch.l}% ${lch.c} ${lch.h})`;
}

export function formatOklab(ok: Oklab) {
  return `oklab(${ok.l} ${ok.a} ${ok.b})`;
}

export function formatOklch(ok: Oklch) {
  return `oklch(${ok.l} ${ok.c} ${ok.h})`;
}

export function formatXyz(xyz: Xyz) {
  return `xyz(${(xyz.x * 100).toFixed(2)}, ${(xyz.y * 100).toFixed(2)}, ${(xyz.z * 100).toFixed(2)})`;
}

export function getTints(hex: string, count = 8): string[] {
  return Array.from({ length: count }, (_, i) =>
    mixColors(hex, "#ffffff", (i + 1) / (count + 1))
  );
}

export function getShades(hex: string, count = 8): string[] {
  return Array.from({ length: count }, (_, i) =>
    mixColors(hex, "#000000", (i + 1) / (count + 1))
  );
}

export function getTones(hex: string, count = 8): string[] {
  return Array.from({ length: count }, (_, i) =>
    mixColors(hex, "#808080", (i + 1) / (count + 1))
  );
}

export interface NearestMatch {
  token: string;
  hex: string;
  deltaE: number;
  exact: boolean;
  label: string;
}

function flattenShadeTokens(groups: Record<string, Record<string, string>>): { token: string; hex: string }[] {
  const out: { token: string; hex: string }[] = [];
  for (const [family, shades] of Object.entries(groups)) {
    const slug = family.toLowerCase().replace(/\s+/g, "-");
    for (const [shade, hex] of Object.entries(shades)) {
      out.push({ token: `${slug}-${shade}`, hex: normalizeHex(hex) });
    }
  }
  return out;
}

const TAILWIND_TOKENS = flattenShadeTokens(TAILWIND_COLORS);
const MATERIAL_TOKENS = flattenShadeTokens(MATERIAL_COLORS);
const BOOTSTRAP_TOKENS = Object.entries(BOOTSTRAP_COLORS).map(([token, hex]) => ({
  token,
  hex: normalizeHex(hex),
}));
const CSS_NAME_TOKENS = CSS_NAMED_COLORS.map((c) => ({
  token: c.name,
  hex: normalizeHex(c.hex),
}));

function nearestFromPool(
  hex: string,
  pool: { token: string; hex: string }[],
  label: string
): NearestMatch {
  const n = normalizeHex(hex);
  let best = pool[0]!;
  let bestD = Infinity;
  for (const item of pool) {
    if (item.hex === n) {
      return { token: item.token, hex: item.hex, deltaE: 0, exact: true, label };
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
    label,
  };
}

export function nearestTailwind(hex: string): NearestMatch {
  return nearestFromPool(hex, TAILWIND_TOKENS, "Nearest Tailwind color");
}

export function nearestMaterial(hex: string): NearestMatch {
  return nearestFromPool(hex, MATERIAL_TOKENS, "Nearest Material color");
}

export function nearestBootstrap(hex: string): NearestMatch {
  return nearestFromPool(hex, BOOTSTRAP_TOKENS, "Nearest Bootstrap color");
}

export function nearestCssName(hex: string): NearestMatch {
  return nearestFromPool(hex, CSS_NAME_TOKENS, "Nearest CSS named color");
}

export function nearestTailwindClass(hex: string): string {
  return nearestTailwind(hex).token;
}

export function findTailwindToken(query: string): { token: string; hex: string } | null {
  const q = query.trim().toLowerCase().replace(/^(bg|text|border|from|to|via)-/, "");
  const hit = TAILWIND_TOKENS.find((item) => item.token === q);
  return hit ?? null;
}

function hypot2(a: number, b: number) {
  return Math.sqrt(a * a + b * b);
}

export function deltaE76(a: Lab, b: Lab): number {
  return Math.sqrt((a.l - b.l) ** 2 + (a.a - b.a) ** 2 + (a.b - b.b) ** 2);
}

export function deltaE94(a: Lab, b: Lab): number {
  const dL = a.l - b.l;
  const c1 = hypot2(a.a, a.b);
  const c2 = hypot2(b.a, b.b);
  const dC = c1 - c2;
  const dH = Math.sqrt(Math.max(0, (a.a - b.a) ** 2 + (a.b - b.b) ** 2 - dC * dC));
  const sl = 1;
  const sc = 1 + 0.045 * c1;
  const sh = 1 + 0.015 * c1;
  return Math.sqrt((dL / sl) ** 2 + (dC / sc) ** 2 + (dH / sh) ** 2);
}

export function deltaE2000(a: Lab, b: Lab): number {
  const { l: l1, a: a1, b: b1 } = a;
  const { l: l2, a: a2, b: b2 } = b;
  const kL = 1;
  const kC = 1;
  const kH = 1;
  const c1 = hypot2(a1, b1);
  const c2 = hypot2(a2, b2);
  const cBar = (c1 + c2) / 2;
  const cBar7 = cBar ** 7;
  const g = 0.5 * (1 - Math.sqrt(cBar7 / (cBar7 + 25 ** 7)));
  const a1p = (1 + g) * a1;
  const a2p = (1 + g) * a2;
  const c1p = hypot2(a1p, b1);
  const c2p = hypot2(a2p, b2);
  const h1p = Math.atan2(b1, a1p) * (180 / Math.PI) + (Math.atan2(b1, a1p) < 0 ? 360 : 0);
  const h2p = Math.atan2(b2, a2p) * (180 / Math.PI) + (Math.atan2(b2, a2p) < 0 ? 360 : 0);
  const dLp = l2 - l1;
  const dCp = c2p - c1p;
  let dhp = 0;
  if (c1p * c2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(c1p * c2p) * Math.sin((dhp * Math.PI) / 180 / 2);
  const lBar = (l1 + l2) / 2;
  const cBarP = (c1p + c2p) / 2;
  let hBar = h1p + h2p;
  if (c1p * c2p !== 0) {
    if (Math.abs(h1p - h2p) > 180) hBar += h1p + h2p < 360 ? 360 : -360;
    hBar /= 2;
  } else {
    hBar = h1p + h2p;
  }
  const t =
    1 -
    0.17 * Math.cos(((hBar - 30) * Math.PI) / 180) +
    0.24 * Math.cos((2 * hBar * Math.PI) / 180) +
    0.32 * Math.cos(((3 * hBar + 6) * Math.PI) / 180) -
    0.2 * Math.cos(((4 * hBar - 63) * Math.PI) / 180);
  const sl = 1 + (0.015 * (lBar - 50) ** 2) / Math.sqrt(20 + (lBar - 50) ** 2);
  const sc = 1 + 0.045 * cBarP;
  const sh = 1 + 0.015 * cBarP * t;
  const dTheta = 30 * Math.exp(-(((hBar - 275) / 25) ** 2));
  const rc = 2 * Math.sqrt(cBarP ** 7 / (cBarP ** 7 + 25 ** 7));
  const rt = -Math.sin((2 * dTheta * Math.PI) / 180) * rc;
  const lTerm = dLp / (kL * sl);
  const cTerm = dCp / (kC * sc);
  const hTerm = dHp / (kH * sh);
  return Math.sqrt(lTerm ** 2 + cTerm ** 2 + hTerm ** 2 + rt * cTerm * hTerm);
}

export function deltaE2000Hex(a: string, b: string): number {
  return deltaE2000(xyzToLab(rgbToXyz(hexToRgb(a))), xyzToLab(rgbToXyz(hexToRgb(b))));
}

export function describeDeltaE(d: number): string {
  if (d < 1) return "Very similar";
  if (d < 2) return "Similar";
  if (d < 5) return "Noticeably different";
  return "Very different";
}

export interface FullColorAnalysis {
  hex: string;
  rgb: RGB;
  rgba: string;
  hsl: string;
  hsla: string;
  hsv: string;
  cmyk: string;
  lab: string;
  lch: string;
  oklab: string;
  oklch: string;
  xyz: string;
  css: string;
  cssVar: string;
  scss: string;
  tailwind: string;
  contrastOnWhite: number;
  contrastOnBlack: number;
  accessibility: ReturnType<typeof checkContrast>;
  textOnColor: string;
  tints: string[];
  shades: string[];
  tones: string[];
  complementary: string[];
  analogous: string[];
  triadic: string[];
  splitComplementary: string[];
  monochromatic: string[];
}

export function analyzeColor(input: string): FullColorAnalysis {
  const hex = normalizeHex(input);
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  const hsv = rgbToHsv(rgb);
  const cmyk = rgbToCmyk(rgb);
  const xyz = rgbToXyz(rgb);
  const lab = xyzToLab(xyz);
  const lch = labToLch(lab);
  const oklab = rgbToOklab(rgb);
  const oklch = oklabToOklch(oklab);
  const slug = hex.slice(1);

  return {
    hex,
    rgb,
    rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`,
    hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
    cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    lab: formatLab(lab),
    lch: formatLch(lch),
    oklab: formatOklab(oklab),
    oklch: formatOklch(oklch),
    xyz: formatXyz(xyz),
    css: `color: ${hex};`,
    cssVar: `--color-${slug}: ${hex};`,
    scss: `$color-${slug}: ${hex};`,
    tailwind: nearestTailwindClass(hex),
    contrastOnWhite: Math.round(getContrastRatio(hex, "#ffffff") * 100) / 100,
    contrastOnBlack: Math.round(getContrastRatio(hex, "#000000") * 100) / 100,
    accessibility: checkContrast(getTextColor(hex) === "#ffffff" ? "#ffffff" : "#000000", hex),
    textOnColor: getTextColor(hex),
    tints: getTints(hex, 11),
    shades: getShades(hex, 11),
    tones: getTones(hex, 11),
    complementary: generateHarmony(hex, "complementary"),
    analogous: generateHarmony(hex, "analogous"),
    triadic: generateHarmony(hex, "triadic"),
    splitComplementary: generateHarmony(hex, "split-complementary"),
    monochromatic: generateHarmony(hex, "monochromatic"),
  };
}

export function colorDistance(a: string, b: string): number {
  return deltaE2000Hex(a, b);
}

export function findSimilarColors(hex: string, pool: string[], count = 8): string[] {
  const n = normalizeHex(hex);
  return pool
    .filter((c) => normalizeHex(c) !== n)
    .map((c) => ({ c, d: colorDistance(n, c) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, count)
    .map((x) => x.c);
}

export function hueToFamily(h: number, s: number, l: number): string {
  if (l < 8) return "black";
  if (l > 95 && s < 10) return "white";
  if (s < 8) return l < 45 ? "grey" : "grey";
  if (h < 15 || h >= 345) return "red";
  if (h < 35) return "deep-orange";
  if (h < 45) return "orange";
  if (h < 55) return "amber";
  if (h < 70) return "yellow";
  if (h < 90) return "lime";
  if (h < 130) return "light-green";
  if (h < 155) return "green";
  if (h < 175) return "teal";
  if (h < 195) return "cyan";
  if (h < 210) return "light-blue";
  if (h < 235) return "blue";
  if (h < 255) return "indigo";
  if (h < 275) return "deep-purple";
  if (h < 295) return "purple";
  if (h < 325) return "pink";
  return "red";
}

export function familyFromHex(hex: string): string {
  const { h, s, l } = rgbToHsl(hexToRgb(hex));
  if (s < 12 && l >= 25 && l <= 55 && h >= 190 && h <= 230) return "blue-grey";
  if (s < 25 && h >= 15 && h <= 45 && l < 55) return "brown";
  return hueToFamily(h, s, l);
}

export function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function seededHex(seed: number): string {
  const rand = seededRandom(seed);
  return rgbToHex({
    r: Math.floor(rand() * 256),
    g: Math.floor(rand() * 256),
    b: Math.floor(rand() * 256),
  });
}

export function hslSeedHex(seed: number, opts?: { sMin?: number; sMax?: number; lMin?: number; lMax?: number }) {
  const rand = seededRandom(seed);
  const h = Math.floor(rand() * 360);
  const s = Math.floor((opts?.sMin ?? 35) + rand() * ((opts?.sMax ?? 90) - (opts?.sMin ?? 35)));
  const l = Math.floor((opts?.lMin ?? 28) + rand() * ((opts?.lMax ?? 72) - (opts?.lMin ?? 28)));
  return rgbToHex(hslToRgb({ h, s: clamp(s, 0, 100), l: clamp(l, 0, 100) }));
}
