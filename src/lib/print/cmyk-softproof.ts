import { hexToRgb, normalizeHex, rgbToHex } from "@/lib/colors/convert";

export type SoftProofProfile = "coated-fogra39-approx" | "uncoated-approx" | "newsprint-approx";

/**
 * Educational soft-proof approximation — NOT a substitute for ICC-based
 * Adobe/Acrobat proofs. Documents gamut compression toward CMYK-like inks.
 */
export function softProofRgb(hex: string, profile: SoftProofProfile = "coated-fogra39-approx") {
  const { r, g, b } = hexToRgb(normalizeHex(hex));
  // Simple RGB→CMY
  let c = 1 - r / 255;
  let m = 1 - g / 255;
  let y = 1 - b / 255;
  const k = Math.min(c, m, y);
  if (k < 1) {
    c = (c - k) / (1 - k);
    m = (m - k) / (1 - k);
    y = (y - k) / (1 - k);
  } else {
    c = m = y = 0;
  }

  // Profile-ish ink limits / paper tone
  const limits =
    profile === "newsprint-approx"
      ? { tac: 2.2, paper: { r: 235, g: 230, b: 210 } }
      : profile === "uncoated-approx"
        ? { tac: 2.6, paper: { r: 248, g: 246, b: 240 } }
        : { tac: 3.0, paper: { r: 255, g: 255, b: 255 } };

  const tac = c + m + y + k;
  if (tac > limits.tac) {
    const scale = limits.tac / tac;
    c *= scale;
    m *= scale;
    y *= scale;
  }

  // Reconstruct RGB on paper (very rough)
  const inkR = (1 - c) * (1 - k);
  const inkG = (1 - m) * (1 - k);
  const inkB = (1 - y) * (1 - k);
  const out = {
    r: Math.round(limits.paper.r * inkR),
    g: Math.round(limits.paper.g * inkG),
    b: Math.round(limits.paper.b * inkB),
  };

  const original = normalizeHex(hex);
  const proof = rgbToHex(out);
  const gamutShift =
    Math.abs(r - out.r) + Math.abs(g - out.g) + Math.abs(b - out.b) > 48;

  return {
    original,
    proof,
    cmyk: {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100),
    },
    gamutWarning: gamutShift,
    disclaimer:
      "Approximate educational soft-proof only. Real print requires ICC profiles, paper, ink, and press conditions.",
  };
}
