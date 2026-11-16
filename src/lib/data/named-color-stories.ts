export interface NamedColorStory {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  meaning: string;
  history: string;
  usage: string;
}

/** Hand-written first-screen copy for named colors that already attract search. */
export const NAMED_COLOR_STORIES: Record<string, NamedColorStory> = {
  "hot-fudge": {
    metaTitle: "Hot Fudge Color Hex Code #5E2912",
    metaDescription:
      "Hot Fudge is a dark chocolate brown: HEX #5E2912, RGB 94, 41, 18. Copy HEX, RGB, RGBA, and CSS. Not a CSS keyword — use the hex in stylesheets.",
    meaning:
      "Hot Fudge is a deep cocoa brown (HEX #5E2912, RGB 94, 41, 18). It reads as chocolate, espresso, or roasted wood — a warm dark, not a cool charcoal. In UI it works as a dessert-brand fill, a footer on cream, or a chart series against sand neutrals. Contrast on white is strong enough for large type; remeasure small text in the contrast checker.",
    history:
      "The name and HEX pairing comes from David Aerne’s Color Names project (MIT). Other paint catalogs may sell a “hot fudge” that is lighter or redder. Treat #5E2912 as this site’s catalog value, not a historical pigment standard.",
    usage:
      "Use background-color: #5E2912 or color: #5E2912. The word hot-fudge is not a CSS keyword. Pair with cream (#F5EDE6) or ivory for packaging; use white labels on the solid fill. For body copy on white, prefer this hex as a heading or button, then check the pair. Copy RGBA rgba(94, 41, 18, 1) when you need an overlay that matches the swatch.",
  },
};
