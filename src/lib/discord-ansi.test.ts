import { describe, expect, it } from "vitest";
import { buildDiscordAnsi, segmentCodes, visibleAnsi } from "@/lib/discord-ansi";

describe("Discord ANSI output", () => {
  it("wraps segments in an ansi code block with real escape characters", () => {
    const out = buildDiscordAnsi([
      { text: "Hi ", fg: 34, bold: true },
      { text: "there", fg: 32, bg: 40, underline: true },
    ]);
    expect(out.startsWith("```ansi\n")).toBe(true);
    expect(out.endsWith("\u001b[0m\n```")).toBe(true);
    expect(visibleAnsi(out)).toBe("```ansi\n\\u001b[0;1;34mHi \\u001b[0;4;40;32mthere\\u001b[0m\n```");
  });

  it("orders codes reset, format, background, foreground", () => {
    expect(segmentCodes({ text: "x", fg: 31, bg: 41, bold: true, underline: true })).toEqual([0, 1, 4, 41, 31]);
    expect(segmentCodes({ text: "x" })).toEqual([0]);
  });
});
