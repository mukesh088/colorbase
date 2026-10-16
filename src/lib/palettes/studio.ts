import { generateHarmony, randomHex } from "@/lib/colors/convert";
import { hexToOklch, withOklch } from "@/lib/colors/oklch";
import { readHexColor } from "@/lib/colors/tool-links";

export type PaletteSwatch = { hex: string; locked: boolean };
export const PALETTE_MIN = 2;
export const PALETTE_MAX = 10;
export const PALETTE_HARMONIES = [
  "analogous",
  "complementary",
  "triadic",
  "tetradic",
  "split-complementary",
  "monochromatic",
  "random",
] as const;
export type PaletteHarmony = (typeof PALETTE_HARMONIES)[number];

export function parsePaletteUrl(raw: string | null): PaletteSwatch[] | null {
  if (!raw) return null;
  const parts = raw.split("-");
  if (parts.length < PALETTE_MIN || parts.length > PALETTE_MAX) return null;
  const colors = parts.map(readHexColor);
  if (colors.some((color) => !color)) return null;
  return colors.map((hex) => ({ hex: hex!, locked: false }));
}

/** Keep locked slots exact, and derive unlocked colors from the same harmony. */
export function generateStudioPalette(
  current: PaletteSwatch[],
  harmony: PaletteHarmony,
  random = randomHex
): PaletteSwatch[] {
  const anchor = current.find((swatch) => swatch.locked)?.hex ?? random();
  const scheme = generateHarmony(anchor, harmony);
  const used = new Set(
    current.filter((swatch) => swatch.locked).map((swatch) => swatch.hex.toLowerCase())
  );
  let slot = 0;
  return current.map((swatch) => {
    if (swatch.locked) return swatch;
    let hex = harmony === "random" ? random() : scheme[slot % scheme.length];
    const seed = hexToOklch(hex);
    for (let attempt = 0; used.has(hex.toLowerCase()) && attempt < 20; attempt++) {
      hex = withOklch(hex, {
        l: 0.27 + ((slot * 0.137 + attempt * 0.09) % 0.58),
        c: Math.max(0.035, seed.c),
        h: seed.h,
      });
    }
    used.add(hex.toLowerCase());
    slot++;
    return { ...swatch, hex: hex.toLowerCase() };
  });
}

export function movePaletteSwatch(
  swatches: PaletteSwatch[],
  from: number,
  to: number
): PaletteSwatch[] {
  if (from < 0 || to < 0 || from >= swatches.length || to >= swatches.length || from === to)
    return swatches;
  const next = [...swatches];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export type PaletteHistory = {
  past: PaletteSwatch[][];
  present: PaletteSwatch[];
  future: PaletteSwatch[][];
};
export type PaletteAction = { type: "set"; swatches: PaletteSwatch[] } | { type: "undo" | "redo" };
export function paletteHistory(state: PaletteHistory, action: PaletteAction): PaletteHistory {
  if (action.type === "set") {
    if (JSON.stringify(state.present) === JSON.stringify(action.swatches)) return state;
    return {
      past: [...state.past, state.present].slice(-50),
      present: action.swatches,
      future: [],
    };
  }
  if (action.type === "undo" && state.past.length)
    return {
      past: state.past.slice(0, -1),
      present: state.past[state.past.length - 1],
      future: [state.present, ...state.future],
    };
  if (action.type === "redo" && state.future.length)
    return {
      past: [...state.past, state.present].slice(-50),
      present: state.future[0],
      future: state.future.slice(1),
    };
  return state;
}
