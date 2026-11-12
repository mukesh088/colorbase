import { describe, expect, it } from "vitest";
import {
  BLEND_MODES,
  BLEND_PRESETS,
  buildBlendCss,
  getBlendMeta,
  sceneBackground,
} from "./blend-modes";

describe("css blend modes helpers", () => {
  it("has metadata for every mode", () => {
    for (const mode of BLEND_MODES) {
      expect(getBlendMeta(mode).id).toBe(mode);
      expect(getBlendMeta(mode).blurb.length).toBeGreaterThan(8);
    }
  });

  it("builds mix and background CSS snippets", () => {
    const mix = buildBlendCss({
      kind: "mix",
      mode: "multiply",
      a: "#e11d48",
      b: "#1d4ed8",
      opacity: 0.8,
      isolate: true,
      scene: "solids",
    });
    expect(mix).toContain("mix-blend-mode: multiply");
    expect(mix).toContain("isolation: isolate");

    const bg = buildBlendCss({
      kind: "background",
      mode: "screen",
      a: "#fff",
      b: "#000",
      opacity: 1,
      isolate: false,
      scene: "mesh",
    });
    expect(bg).toContain("background-blend-mode: screen");
  });

  it("presets stay on known modes", () => {
    for (const preset of BLEND_PRESETS) {
      expect(BLEND_MODES).toContain(preset.mode);
      expect(sceneBackground(preset.scene, preset.b).length).toBeGreaterThan(4);
    }
  });
});
