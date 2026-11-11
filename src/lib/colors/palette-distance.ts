import { hexToRgb, normalizeHex } from "@/lib/colors/convert";

/** Relative Euclidean distance in sRGB (0–≈441). Not CIEDE2000 — good enough for brand flags. */
export function rgbDistance(a: string, b: string) {
  const A = hexToRgb(normalizeHex(a));
  const B = hexToRgb(normalizeHex(b));
  return Math.hypot(A.r - B.r, A.g - B.g, A.b - B.b);
}

export function nearestBrandColor(sample: string, palette: string[]) {
  let best = palette[0] ?? "#000000";
  let dist = Infinity;
  for (const hex of palette) {
    const d = rgbDistance(sample, hex);
    if (d < dist) {
      dist = d;
      best = hex;
    }
  }
  return { hex: best, distance: dist };
}

export function mergePalettes(sets: string[][], max = 12) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const set of sets) {
    for (const hex of set) {
      const n = normalizeHex(hex);
      if (seen.has(n)) continue;
      if ([...seen].some((s) => rgbDistance(s, n) < 28)) continue;
      seen.add(n);
      out.push(n);
      if (out.length >= max) return out;
    }
  }
  return out;
}
