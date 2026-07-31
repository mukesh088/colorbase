import type {
  CMYK,
  ColorFormats,
  ContrastResult,
  HSL,
  HSV,
  RGB,
  RGBA,
} from "@/types/color";
import { clamp } from "@/lib/utils";

export function normalizeHex(hex: string): string {
  let h = hex.trim().replace(/^#/, "").toLowerCase();
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length === 4) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("")
      .slice(0, 6);
  }
  if (h.length === 8) h = h.slice(0, 6);
  if (!/^[0-9a-f]{6}$/.test(h)) return "#000000";
  return `#${h}`;
}

export function isValidHex(hex: string): boolean {
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(hex.trim());
}

export function hexToRgb(hex: string): RGB {
  const h = normalizeHex(hex).slice(1);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) =>
    clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
        break;
      case gn:
        h = ((bn - rn) / d + 2) / 6;
        break;
      default:
        h = ((rn - gn) / d + 4) / 6;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let rp = 0;
  let gp = 0;
  let bp = 0;

  if (h < 60) [rp, gp, bp] = [c, x, 0];
  else if (h < 120) [rp, gp, bp] = [x, c, 0];
  else if (h < 180) [rp, gp, bp] = [0, c, x];
  else if (h < 240) [rp, gp, bp] = [0, x, c];
  else if (h < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];

  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

export function rgbToHsv({ r, g, b }: RGB): HSV {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (d !== 0) {
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
        break;
      case gn:
        h = ((bn - rn) / d + 2) / 6;
        break;
      default:
        h = ((rn - gn) / d + 4) / 6;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

export function hsvToRgb({ h, s, v }: HSV): RGB {
  const sn = s / 100;
  const vn = v / 100;
  const c = vn * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vn - c;
  let rp = 0;
  let gp = 0;
  let bp = 0;

  if (h < 60) [rp, gp, bp] = [c, x, 0];
  else if (h < 120) [rp, gp, bp] = [x, c, 0];
  else if (h < 180) [rp, gp, bp] = [0, c, x];
  else if (h < 240) [rp, gp, bp] = [0, x, c];
  else if (h < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];

  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

export function rgbToCmyk({ r, g, b }: RGB): CMYK {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - rn - k) / (1 - k)) * 100),
    m: Math.round(((1 - gn - k) / (1 - k)) * 100),
    y: Math.round(((1 - bn - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

export function cmykToRgb({ c, m, y, k }: CMYK): RGB {
  return {
    r: Math.round(255 * (1 - c / 100) * (1 - k / 100)),
    g: Math.round(255 * (1 - m / 100) * (1 - k / 100)),
    b: Math.round(255 * (1 - y / 100) * (1 - k / 100)),
  };
}

export function getLuminance({ r, g, b }: RGB): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function getContrastRatio(fg: string, bg: string): number {
  const l1 = getLuminance(hexToRgb(fg));
  const l2 = getLuminance(hexToRgb(bg));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function checkContrast(fg: string, bg: string): ContrastResult {
  const ratio = Math.round(getContrastRatio(fg, bg) * 100) / 100;
  const normalAAA = ratio >= 7;
  const normalAA = ratio >= 4.5;
  const largeAAA = ratio >= 4.5;
  const largeAA = ratio >= 3;
  let level: ContrastResult["level"] = "Fail";
  if (normalAAA) level = "AAA";
  else if (normalAA) level = "AA";
  else if (largeAA) level = "AA Large";
  return { ratio, level, normalAA, normalAAA, largeAA, largeAAA };
}

export function isLightColor(hex: string): boolean {
  return getLuminance(hexToRgb(hex)) > 0.179;
}

export function getTextColor(bg: string): string {
  return isLightColor(bg) ? "#000000" : "#ffffff";
}

export function parseColor(input: string): ColorFormats | null {
  const trimmed = input.trim();
  if (isValidHex(trimmed)) {
    const hex = normalizeHex(trimmed);
    const rgb = hexToRgb(hex);
    return buildFormats(hex, rgb);
  }

  const rgbMatch = trimmed.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i
  );
  if (rgbMatch) {
    const rgb = {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
    };
    return buildFormats(rgbToHex(rgb), rgb, Number(rgbMatch[4] ?? 1));
  }

  const hslMatch = trimmed.match(
    /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)$/i
  );
  if (hslMatch) {
    const hsl = {
      h: Number(hslMatch[1]),
      s: Number(hslMatch[2]),
      l: Number(hslMatch[3]),
    };
    const rgb = hslToRgb(hsl);
    return buildFormats(rgbToHex(rgb), rgb, Number(hslMatch[4] ?? 1));
  }

  return null;
}

function buildFormats(hex: string, rgb: RGB, a = 1): ColorFormats {
  const hsl = rgbToHsl(rgb);
  return {
    hex,
    rgb,
    rgba: { ...rgb, a },
    hsl,
    hsla: { ...hsl, a },
    hsv: rgbToHsv(rgb),
    cmyk: rgbToCmyk(rgb),
  };
}

export function formatRgb(rgb: RGB | RGBA): string {
  if ("a" in rgb && rgb.a !== 1) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
  }
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

export function formatHsl(hsl: HSL | (HSL & { a: number })): string {
  if ("a" in hsl && hsl.a !== 1) {
    return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${hsl.a})`;
  }
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

export function randomHex(): string {
  return rgbToHex({
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
  });
}

export function generateHarmony(hex: string, type: string): string[] {
  const { h, s, l } = rgbToHsl(hexToRgb(hex));
  const rotate = (deg: number) =>
    rgbToHex(hslToRgb({ h: (h + deg + 360) % 360, s, l }));

  switch (type) {
    case "complementary":
      return [hex, rotate(180)];
    case "analogous":
      return [rotate(-30), hex, rotate(30)];
    case "triadic":
      return [hex, rotate(120), rotate(240)];
    case "tetradic":
      return [hex, rotate(90), rotate(180), rotate(270)];
    case "split-complementary":
      return [hex, rotate(150), rotate(210)];
    case "monochromatic":
      return [0.2, 0.35, 0.5, 0.65, 0.8].map((factor) =>
        rgbToHex(hslToRgb({ h, s, l: Math.round(factor * 100) }))
      );
    default:
      return [hex];
  }
}

export function simulateColorBlind(
  hex: string,
  type: string
): string {
  const { r, g, b } = hexToRgb(hex);
  // Simplified matrices for color-blind simulation (Brettel/Viénot approximations)
  const matrices: Record<string, number[][]> = {
    protanopia: [
      [0.567, 0.433, 0],
      [0.558, 0.442, 0],
      [0, 0.242, 0.758],
    ],
    deuteranopia: [
      [0.625, 0.375, 0],
      [0.7, 0.3, 0],
      [0, 0.3, 0.7],
    ],
    tritanopia: [
      [0.95, 0.05, 0],
      [0, 0.433, 0.567],
      [0, 0.475, 0.525],
    ],
    achromatopsia: [
      [0.299, 0.587, 0.114],
      [0.299, 0.587, 0.114],
      [0.299, 0.587, 0.114],
    ],
    protanomaly: [
      [0.817, 0.183, 0],
      [0.333, 0.667, 0],
      [0, 0.125, 0.875],
    ],
    deuteranomaly: [
      [0.8, 0.2, 0],
      [0.258, 0.742, 0],
      [0, 0.142, 0.858],
    ],
    tritanomaly: [
      [0.967, 0.033, 0],
      [0, 0.733, 0.267],
      [0, 0.183, 0.817],
    ],
  };

  const m = matrices[type] ?? matrices.protanopia;
  return rgbToHex({
    r: clamp(Math.round(m[0][0] * r + m[0][1] * g + m[0][2] * b), 0, 255),
    g: clamp(Math.round(m[1][0] * r + m[1][1] * g + m[1][2] * b), 0, 255),
    b: clamp(Math.round(m[2][0] * r + m[2][1] * g + m[2][2] * b), 0, 255),
  });
}

export function mixColors(a: string, b: string, weight = 0.5): string {
  const c1 = hexToRgb(a);
  const c2 = hexToRgb(b);
  return rgbToHex({
    r: Math.round(c1.r * (1 - weight) + c2.r * weight),
    g: Math.round(c1.g * (1 - weight) + c2.g * weight),
    b: Math.round(c1.b * (1 - weight) + c2.b * weight),
  });
}
