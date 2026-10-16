import { describe, expect, it } from "vitest";
import {
  colorHistory,
  parseWorkbenchColor,
  selectChannels,
  selectionChannels,
  selectHex,
  shortOklch,
  type ColorHistory,
} from "@/lib/colors/workbench";
import { rgbToHex, hsvToRgb } from "@/lib/colors/convert";

describe("color workbench", () => {
  it("accepts opaque HEX, RGB, and HSL with channel validation", () => {
    expect(parseWorkbenchColor("#f80")?.hex).toBe("#ff8800");
    expect(parseWorkbenchColor("rgb(255, 128, 0)")?.hex).toBe("#ff8000");
    expect(parseWorkbenchColor("hsl(120 100% 50%)")?.hex).toBe("#00ff00");
    for (const input of [
      "#nope",
      "#123456ff",
      "rgba(1,2,3,.5)",
      "rgb(256,0,0)",
      "rgb(30%,20%,0%)",
      "hsl(10, 101%, 50%)",
      "hsl(30,40,50)",
      "rgb(1..0,2,3)",
    ])
      expect(parseWorkbenchColor(input), input).toBeNull();
  });
  it("keeps HSV saturation distinct from HSL saturation across edits", () => {
    const initial = selectHex("#3b82f6")!;
    expect(initial.hsv.s).not.toBe(initial.hsl.s);
    const hsv = { ...initial.hsv, v: 70 };
    const result = selectChannels(initial, "hsv", hsv)!;
    expect(result.hex).toBe(rgbToHex(hsvToRgb(hsv)));
    expect(result.hsv).toEqual(hsv);
    expect(selectionChannels(result, "hsv").s).toBe(hsv.s);
  });
  it("preserves the hue and saturation needed to move away from black", () => {
    const black = selectChannels(selectHex("#3b82f6")!, "hsv", { h: 220, s: 80, v: 0 })!;
    expect(black.hex).toBe("#000000");
    const revived = selectChannels(black, "hsv", { ...black.hsv, v: 80 })!;
    expect(revived.hex).toBe(rgbToHex(hsvToRgb({ h: 220, s: 80, v: 80 })));
    expect(selectHex("#888888", revived)?.hsv.h).toBe(220);
  });
  it("retains HSL and CMYK controls at their degenerate endpoints", () => {
    const seed = selectHex("#336699")!;
    const white = selectChannels(seed, "hsl", { h: 120, s: 60, l: 100 })!;
    expect(white.hex).toBe("#ffffff");
    expect(white.hsl).toEqual({ h: 120, s: 60, l: 100 });
    const black = selectChannels(seed, "cmyk", { c: 50, m: 20, y: 10, k: 100 })!;
    expect(black.cmyk.c).toBe(50);
    expect(black.hex).toBe("#000000");
    expect(selectChannels(seed, "rgb", { r: NaN, g: 0, b: 0 })).toBeNull();
  });
  it("undoes an entire drag as one change", () => {
    const first = selectHex("#336699")!,
      second = selectHex("#ef3344")!;
    let state: ColorHistory = { past: [], present: first, future: [] };
    state = colorHistory(state, { type: "preview", selection: selectHex("#abcdef")! });
    state = colorHistory(state, { type: "preview", selection: second });
    state = colorHistory(state, { type: "finish", before: first });
    expect(state.past).toHaveLength(1);
    state = colorHistory(state, { type: "undo" });
    expect(state.present).toEqual(first);
    expect(colorHistory(state, { type: "redo" }).present).toEqual(second);
  });
  it("formats valid, compact OKLCH output", () => {
    expect(shortOklch("#3b82f6")).toMatch(/^oklch\([\d.]+ [\d.]+ [\d.]+\)$/);
    expect(shortOklch("#3b82f6").length).toBeLessThan(40);
  });
});
