import { describe, expect, it } from "vitest";
import {
  FONT_STYLE_COUNT,
  composeFancyText,
  filterGeneratedStyles,
  generateFontStyles,
  stylesToTextFile,
} from "./generator";

describe("font generator", () => {
  it("ships a large catalog comparable to fancyText sites", () => {
    expect(FONT_STYLE_COUNT).toBeGreaterThanOrEqual(500);
  });

  it("generates hundreds of unicode styles from plain text", () => {
    const styles = generateFontStyles("ColorBase");
    expect(styles.length).toBeGreaterThanOrEqual(500);
    expect(styles.every((s) => s.value.length > 0)).toBe(true);
    expect(styles.some((s) => s.id === "bold-sans")).toBe(true);
    expect(styles.some((s) => s.id === "script")).toBe(true);
    expect(styles.some((s) => s.category === "emoji")).toBe(true);
    expect(styles.find((s) => s.id === "bold-sans")?.value).not.toBe("ColorBase");
  });

  it("filters by category and search", () => {
    const script = generateFontStyles("Hello", "script");
    expect(script.every((s) => s.category === "script")).toBe(true);
    const emoji = generateFontStyles("Hello", "emoji");
    expect(emoji.length).toBeGreaterThan(50);
    expect(emoji.every((s) => s.category === "emoji")).toBe(true);
    const all = generateFontStyles("Hello");
    expect(filterGeneratedStyles(all, "gothic").some((s) => s.id === "fraktur")).toBe(true);
  });

  it("composes fancyText with cursive, frame, and emoji", () => {
    const value = composeFancyText("Hello", {
      styleId: "script",
      frameId: "e-sparkle",
      emojiLeft: "💕",
      emojiRight: "💕",
    });
    expect(value).toContain("✨");
    expect(value).toContain("💕");
    expect(value).not.toBe("Hello");
  });

  it("exports a plain text dump", () => {
    const styles = generateFontStyles("Hi").slice(0, 3);
    const file = stylesToTextFile(styles, "Hi");
    expect(file).toContain("ColorBase Font Generator");
    expect(file).toContain("Source: Hi");
    expect(file.split("\n").length).toBeGreaterThan(4);
  });

  it("returns empty for blank input", () => {
    expect(generateFontStyles("   ")).toEqual([]);
    expect(composeFancyText("   ")).toBe("");
  });
});
