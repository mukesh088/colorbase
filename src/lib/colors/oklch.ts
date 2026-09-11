import { hexToRgb, rgbToHex } from "@/lib/colors/convert";
import { oklabToOklch, rgbToOklab, type Oklab, type Oklch } from "@/lib/colors/spaces";
import { clamp } from "@/lib/utils";

function linearToSrgb(c: number) {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  return clamp(Math.round(v * 255), 0, 255);
}

export function oklchToOklab({ l, c, h }: Oklch): Oklab {
  const rad = (h * Math.PI) / 180;
  return {
    l,
    a: c * Math.cos(rad),
    b: c * Math.sin(rad),
  };
}

export function oklabToRgb({ l, a, b }: Oklab) {
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;
  const L = l_ * l_ * l_;
  const M = m_ * m_ * m_;
  const S = s_ * s_ * s_;
  return {
    r: linearToSrgb(+4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S),
    g: linearToSrgb(-1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S),
    b: linearToSrgb(-0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S),
  };
}

export function oklchToHex(ok: Oklch): string {
  return rgbToHex(oklabToRgb(oklchToOklab(ok)));
}

export function hexToOklch(hex: string): Oklch {
  return oklabToOklch(rgbToOklab(hexToRgb(hex)));
}

export function oklchMix(a: Oklch, b: Oklch, t: number): Oklch {
  let dh = b.h - a.h;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  return {
    l: a.l + (b.l - a.l) * t,
    c: a.c + (b.c - a.c) * t,
    h: (a.h + dh * t + 360) % 360,
  };
}

export function withOklch(hex: string, patch: Partial<Oklch>): string {
  const base = hexToOklch(hex);
  return oklchToHex({
    l: clamp(patch.l ?? base.l, 0, 1),
    c: Math.max(0, patch.c ?? base.c),
    h: ((patch.h ?? base.h) + 360) % 360,
  });
}

export const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type ShadeStep = (typeof SHADE_STEPS)[number];

const SHADE_L: Record<ShadeStep, number> = {
  50: 0.97,
  100: 0.93,
  200: 0.87,
  300: 0.8,
  400: 0.71,
  500: 0.62,
  600: 0.545,
  700: 0.465,
  800: 0.385,
  900: 0.305,
  950: 0.22,
};

function chromaForStep(seedC: number, step: ShadeStep) {
  const peak = step <= 400 ? 0.55 + (step / 400) * 0.45 : 1 - (step - 500) / 900;
  return Math.max(0.02, seedC * clamp(peak, 0.35, 1.05));
}

export type ShadeScale = Record<ShadeStep, string>;

export function oklchShadeScale(hex: string): ShadeScale {
  const seed = hexToOklch(hex);
  const scale = {} as ShadeScale;
  for (const step of SHADE_STEPS) {
    scale[step] = oklchToHex({
      l: SHADE_L[step],
      c: chromaForStep(seed.c, step),
      h: seed.h,
    });
  }
  return scale;
}

export function nearestShadeStep(hex: string): ShadeStep {
  const l = hexToOklch(hex).l;
  let best: ShadeStep = 500;
  let dist = Infinity;
  for (const step of SHADE_STEPS) {
    const d = Math.abs(SHADE_L[step] - l);
    if (d < dist) {
      dist = d;
      best = step;
    }
  }
  return best;
}
