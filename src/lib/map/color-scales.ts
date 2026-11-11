import { hexToHsl, hslToRgb, normalizeHex, rgbToHex, simulateColorBlind } from "@/lib/colors/convert";

export type ScaleKind = "sequential" | "diverging" | "categorical";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mixHex(a: string, b: string, t: number) {
  const A = hexToHsl(a);
  const B = hexToHsl(b);
  // shortest hue path
  let dh = B.h - A.h;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  return rgbToHex(
    hslToRgb({
      h: (A.h + dh * t + 360) % 360,
      s: lerp(A.s, B.s, t),
      l: lerp(A.l, B.l, t),
    })
  );
}

export function buildColorScale(
  kind: ScaleKind,
  stops: number,
  options?: { low?: string; mid?: string; high?: string; seed?: string[] }
): string[] {
  const n = Math.max(3, Math.min(12, stops));
  if (kind === "categorical") {
    const seed =
      options?.seed?.map(normalizeHex) ??
      ["#0ea5e9", "#22c55e", "#eab308", "#f97316", "#e11d48", "#8b5cf6", "#14b8a6", "#64748b"];
    return seed.slice(0, n);
  }
  if (kind === "diverging") {
    const low = normalizeHex(options?.low ?? "#1d4ed8");
    const mid = normalizeHex(options?.mid ?? "#f8fafc");
    const high = normalizeHex(options?.high ?? "#b91c1c");
    const half = Math.floor(n / 2);
    const left = Array.from({ length: half }, (_, i) => mixHex(low, mid, i / Math.max(1, half - 1)));
    const right = Array.from({ length: n - half }, (_, i) =>
      mixHex(mid, high, i / Math.max(1, n - half - 1))
    );
    return [...left, ...right.slice(1)];
  }
  const low = normalizeHex(options?.low ?? "#eff6ff");
  const high = normalizeHex(options?.high ?? "#1e3a8a");
  return Array.from({ length: n }, (_, i) => mixHex(low, high, i / Math.max(1, n - 1)));
}

export function simulateScale(colors: string[], mode: "protanopia" | "deuteranopia" | "tritanopia") {
  return colors.map((hex) => simulateColorBlind(hex, mode));
}

/** Illustrative districts — synthetic, not real geography. */
export const SAMPLE_DISTRICTS = [
  { id: "north", name: "North", path: "M20,30 L120,20 L140,90 L40,110 Z", value: 12 },
  { id: "east", name: "East", path: "M140,20 L240,40 L230,130 L140,90 Z", value: 48 },
  { id: "south", name: "South", path: "M40,110 L140,90 L160,180 L60,190 Z", value: 72 },
  { id: "west", name: "West", path: "M20,30 L40,110 L60,190 L10,120 Z", value: 33 },
  { id: "central", name: "Central", path: "M90,70 L150,65 L155,120 L95,125 Z", value: 91 },
] as const;

export function classIndex(value: number, breaks: number[]) {
  for (let i = 0; i < breaks.length; i++) {
    if (value <= breaks[i]) return i;
  }
  return breaks.length;
}

export function equalBreaks(values: number[], classes: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / classes;
  return Array.from({ length: classes - 1 }, (_, i) => Number((min + step * (i + 1)).toFixed(2)));
}
