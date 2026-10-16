/** Selected reference pages with usage notes, beyond the named-color catalogs. */
export const HEX_REFERENCES = [
  {
    hex: "#438052",
    name: "Muted green #438052",
    family: "green",
    summary:
      "#438052 is a muted, medium green with RGB values 67, 128, and 82. Use it as a starting accent for nature-inspired interfaces, packaging mockups, or a restrained product theme.",
    usage: [
      "Try it beside a warm off-white such as #FAFAF9 and an ink neutral such as #111827. Check the exact foreground and background combination before using it for text.",
      "For a success message, pair the green with a label or icon so the meaning does not depend on color alone.",
      "Build lighter surfaces and darker interaction states from the tints and shades below, then export the chosen values as CSS or Tailwind tokens.",
    ],
  },
] as const;

export function getHexReference(hex: string) {
  return HEX_REFERENCES.find((reference) => reference.hex === hex.toLowerCase());
}
