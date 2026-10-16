import { describe, expect, it } from "vitest";
import {
  generateStudioPalette,
  movePaletteSwatch,
  paletteHistory,
  parsePaletteUrl,
  type PaletteHistory,
} from "@/lib/palettes/studio";

describe("palette studio", () => {
  const initial = parsePaletteUrl("3355aa-ee9988-123456-abcdef-ffeedd")!;
  it("validates whole palette links instead of converting invalid colors to black", () => {
    expect(parsePaletteUrl("f80-fff")?.[0].hex).toBe("#ff8800");
    for (const input of [
      null,
      "abc",
      "zzzzzz-ffffff",
      "12345678-ffffff",
      "abc--fff",
      Array(11).fill("fff").join("-"),
    ])
      expect(parsePaletteUrl(input)).toBeNull();
  });
  it("keeps locked colors unchanged and varies repeated harmony slots", () => {
    const current = initial.map((swatch, index) => ({ ...swatch, locked: index === 1 }));
    const generated = generateStudioPalette(current, "analogous", () => "#663399");
    expect(generated[1]).toEqual(current[1]);
    expect(new Set(generated.map((swatch) => swatch.hex.toLowerCase())).size).toBe(5);
    expect(current).toEqual(initial.map((swatch, index) => ({ ...swatch, locked: index === 1 })));
  });
  it("creates ten distinct colors from a small complementary harmony", () => {
    const generated = generateStudioPalette(
      Array.from({ length: 10 }, () => ({ hex: "#000000", locked: false })),
      "complementary",
      () => "#4488aa"
    );
    expect(new Set(generated.map((swatch) => swatch.hex)).size).toBe(10);
  });
  it("moves the entire swatch, including its lock, and bounds reordering", () => {
    const current = initial.map((swatch, i) => ({ ...swatch, locked: i === 0 }));
    expect(movePaletteSwatch(current, 0, 3)[3]).toEqual(current[0]);
    expect(movePaletteSwatch(current, 0, -1)).toBe(current);
    expect(current[0].locked).toBe(true);
  });
  it("undoes, redoes, clears the redo branch, and bounds history", () => {
    let state: PaletteHistory = { past: [], present: initial, future: [] };
    const changed = movePaletteSwatch(initial, 0, 2);
    state = paletteHistory(state, { type: "set", swatches: changed });
    state = paletteHistory(state, { type: "undo" });
    expect(state.present).toEqual(initial);
    state = paletteHistory(state, { type: "redo" });
    expect(state.present).toEqual(changed);
    state = paletteHistory(state, { type: "undo" });
    state = paletteHistory(state, { type: "set", swatches: initial.slice(0, 3) });
    expect(state.future).toEqual([]);
    for (let i = 0; i < 60; i++)
      state = paletteHistory(state, {
        type: "set",
        swatches: [{ hex: `#${i.toString(16).padStart(6, "0")}`, locked: false }],
      });
    expect(state.past).toHaveLength(50);
  });
});
