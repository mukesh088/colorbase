import {
  cmykToRgb,
  hexToRgb,
  hslToRgb,
  hsvToRgb,
  rgbToCmyk,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
} from "@/lib/colors/convert";
import { hexToOklch } from "@/lib/colors/oklch";
import { readHexColor } from "@/lib/colors/tool-links";
import type { CMYK, HSL, HSV, RGB } from "@/types/color";

export type ChannelMode = "rgb" | "hsl" | "hsv" | "cmyk";
export type ColorSelection = { hex: string; hsv: HSV; hsl: HSL; cmyk: CMYK };

export function selectHex(input: string, previous?: ColorSelection): ColorSelection | null {
  const hex = readHexColor(input);
  if (!hex) return null;
  const rgb = hexToRgb(hex);
  const hsv = rgbToHsv(rgb),
    hsl = rgbToHsl(rgb);
  if (hsv.s === 0 && previous) {
    hsv.h = previous.hsv.h;
    hsl.h = previous.hsl.h;
  }
  return { hex, hsv, hsl, cmyk: rgbToCmyk(rgb) };
}

export const CHANNELS = {
  rgb: [
    { key: "r", label: "Red", max: 255 },
    { key: "g", label: "Green", max: 255 },
    { key: "b", label: "Blue", max: 255 },
  ],
  hsl: [
    { key: "h", label: "Hue", max: 360 },
    { key: "s", label: "Saturation", max: 100 },
    { key: "l", label: "Lightness", max: 100 },
  ],
  hsv: [
    { key: "h", label: "Hue", max: 360 },
    { key: "s", label: "Saturation", max: 100 },
    { key: "v", label: "Brightness", max: 100 },
  ],
  cmyk: [
    { key: "c", label: "Cyan", max: 100 },
    { key: "m", label: "Magenta", max: 100 },
    { key: "y", label: "Yellow", max: 100 },
    { key: "k", label: "Key / black", max: 100 },
  ],
} as const;

export function selectionChannels(
  selection: ColorSelection,
  mode: ChannelMode
): Record<string, number> {
  if (mode === "rgb") return { ...hexToRgb(selection.hex) };
  return { ...selection[mode] };
}

/** Preserve the active representation at degenerate colors (black/white/gray). */
export function selectChannels(
  previous: ColorSelection,
  mode: ChannelMode,
  values: Record<string, number>
): ColorSelection | null {
  if (
    CHANNELS[mode].some(
      ({ key, max }) => !Number.isFinite(values[key]) || values[key] < 0 || values[key] > max
    )
  )
    return null;
  const rgb =
    mode === "rgb"
      ? (values as unknown as RGB)
      : mode === "hsv"
        ? hsvToRgb(values as unknown as HSV)
        : mode === "hsl"
          ? hslToRgb(values as unknown as HSL)
          : cmykToRgb(values as unknown as CMYK);
  const next = selectHex(rgbToHex(rgb), previous)!;
  if (mode === "hsv") {
    next.hsv = { h: values.h, s: values.s, v: values.v };
    if (next.hsl.s === 0) next.hsl.h = values.h;
  }
  if (mode === "hsl") {
    next.hsl = { h: values.h, s: values.s, l: values.l };
    if (next.hsv.s === 0) next.hsv.h = values.h;
  }
  if (mode === "cmyk") next.cmyk = { c: values.c, m: values.m, y: values.y, k: values.k };
  return next;
}

/** Opaque sRGB input only. Invalid, out-of-range, and alpha syntax stay uncommitted. */
export function parseWorkbenchColor(
  input: string,
  previous?: ColorSelection
): ColorSelection | null {
  const direct = selectHex(input, previous);
  if (direct) return direct;
  const match = input
    .trim()
    .match(/^(rgb|hsl)\(\s*([\d.]+)[,\s]+([\d.]+)(%?)[,\s]+([\d.]+)(%?)\s*\)$/i);
  if (!match) return null;
  const mode = match[1].toLowerCase() as "rgb" | "hsl";
  if (mode === "rgb" && (match[4] || match[6])) return null;
  if (mode === "hsl" && (!match[4] || !match[6])) return null;
  const values: Record<string, number> =
    mode === "rgb"
      ? { r: Number(match[2]), g: Number(match[3]), b: Number(match[5]) }
      : { h: Number(match[2]), s: Number(match[3]), l: Number(match[5]) };
  return selectChannels(previous ?? selectHex("#000000")!, mode, values);
}

export function shortOklch(hex: string) {
  const { l, c, h } = hexToOklch(hex);
  return `oklch(${Number(l.toFixed(4))} ${Number(c.toFixed(4))} ${Number(h.toFixed(2))})`;
}

export type ColorHistory = {
  past: ColorSelection[];
  present: ColorSelection;
  future: ColorSelection[];
};
export type ColorAction =
  | { type: "set" | "preview"; selection: ColorSelection }
  | { type: "finish"; before: ColorSelection }
  | { type: "undo" | "redo" };
export function colorHistory(state: ColorHistory, action: ColorAction): ColorHistory {
  if (action.type === "preview") return { ...state, present: action.selection };
  if (action.type === "finish") {
    if (JSON.stringify(action.before) === JSON.stringify(state.present)) return state;
    return { past: [...state.past, action.before].slice(-50), present: state.present, future: [] };
  }
  if (action.type === "set") {
    if (JSON.stringify(action.selection) === JSON.stringify(state.present)) return state;
    return {
      past: [...state.past, state.present].slice(-50),
      present: action.selection,
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
