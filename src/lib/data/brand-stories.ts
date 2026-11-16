import type { BrandPalette } from "@/lib/data/brands";

/** Hand-written first-screen copy for high-interest brand hubs. */
export const BRAND_STORY_OVERRIDES: Partial<BrandPalette>[] = [
  {
    slug: "opencode",
    category: "Developer",
    websiteUrl: "https://opencode.ai",
    related: ["github", "claude-code", "cursor"],
    metaTitle: "OpenCode Hex Color #000000 — Logo Color Code",
    metaDescription:
      "OpenCode logo color is HEX #000000 (RGB 0, 0, 0). Copy HEX, RGB, RGBA, and CSS for the Simple Icons mark, then check contrast on light UI.",
    overview:
      "OpenCode is an open-source coding agent. The Simple Icons mark is catalogued as pure black #000000 — use it as ink or a logo fill on light surfaces, not as 14px body text on a dark canvas. This is a reference swatch from Simple Icons, not a substitute for OpenCode’s own brand files.",
  },
];

export function applyBrandStories(brands: BrandPalette[]): BrandPalette[] {
  const stories = new Map(
    BRAND_STORY_OVERRIDES.filter((story) => story.slug).map((story) => [story.slug as string, story])
  );
  return brands.map((brand) => {
    const story = stories.get(brand.slug);
    return story ? { ...brand, ...story, related: story.related?.length ? story.related : brand.related } : brand;
  });
}
