/**
 * Discord ```ansi code blocks understand a small set of SGR escape codes.
 * Preview colors are the values Discord's desktop client renders, as
 * documented by the community reference below (Discord publishes no official
 * table), so treat them as approximations.
 */
export const DISCORD_ANSI_SOURCE = "https://gist.github.com/kkrypt0nn/a02506f3712ff2d1c8ca7c9e0aed7c06";

export type AnsiColor = { code: number; name: string; preview: string };

export const ANSI_TEXT_COLORS: AnsiColor[] = [
  { code: 30, name: "Gray", preview: "#4f545c" },
  { code: 31, name: "Red", preview: "#dc322f" },
  { code: 32, name: "Green", preview: "#859900" },
  { code: 33, name: "Yellow", preview: "#b58900" },
  { code: 34, name: "Blue", preview: "#268bd2" },
  { code: 35, name: "Pink", preview: "#d33682" },
  { code: 36, name: "Cyan", preview: "#2aa198" },
  { code: 37, name: "White", preview: "#ffffff" },
];

export const ANSI_BACKGROUND_COLORS: AnsiColor[] = [
  { code: 40, name: "Firefly dark blue", preview: "#002b36" },
  { code: 41, name: "Orange", preview: "#cb4b16" },
  { code: 42, name: "Marble blue", preview: "#586e75" },
  { code: 43, name: "Greyish turquoise", preview: "#657b83" },
  { code: 44, name: "Gray", preview: "#839496" },
  { code: 45, name: "Indigo", preview: "#6c71c4" },
  { code: 46, name: "Light gray", preview: "#93a1a1" },
  { code: 47, name: "White", preview: "#fdf6e3" },
];

export type AnsiSegment = { text: string; fg?: number; bg?: number; bold?: boolean; underline?: boolean };

const ESC = "\u001b";

/** SGR parameters for one segment, e.g. [1, 40, 32]. Always starts from a reset. */
export function segmentCodes(seg: AnsiSegment): number[] {
  return [0, ...(seg.bold ? [1] : []), ...(seg.underline ? [4] : []), ...(seg.bg ? [seg.bg] : []), ...(seg.fg ? [seg.fg] : [])];
}

/** The message to paste into Discord: an ```ansi block with real ESC characters. */
export function buildDiscordAnsi(segments: AnsiSegment[]): string {
  const body = segments
    .filter((s) => s.text.length > 0)
    .map((s) => `${ESC}[${segmentCodes(s).join(";")}m${s.text}`)
    .join("");
  return `\`\`\`ansi\n${body}${ESC}[0m\n\`\`\``;
}

/** Same output with ESC shown as \u001b, for reading and documentation. */
export function visibleAnsi(output: string) {
  return output.replaceAll(ESC, "\\u001b");
}
