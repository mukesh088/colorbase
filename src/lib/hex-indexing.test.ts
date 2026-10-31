import { describe, expect, it } from "vitest";
import { getIndexableHexSlugs, isCuratedLibraryColor, isIndexableHex } from "./hex-indexing";
import { SEARCH_LANDING_HEXES } from "./data/search-landing-hexes";
import { getAllLibraryColors } from "./data/color-library";
import { SITEMAP_IDS, sitemapForId } from "./sitemaps";
import { normalizeHex } from "@/lib/colors/convert";

describe("hex indexing quality", () => {
  it("indexes curated inventory and noindexes thin search-only landings", () => {
    const urls = new Set(sitemapForId("colors").map((entry) => entry.url));
    const curated = new Set(getIndexableHexSlugs());

    for (const hex of SEARCH_LANDING_HEXES) {
      const slug = hex.toLowerCase();
      if (curated.has(slug)) {
        expect(isIndexableHex(hex), hex).toBe(true);
        expect(urls.has(`https://colorbase.in/color/${slug}`), hex).toBe(true);
      } else {
        expect(isIndexableHex(hex), hex).toBe(false);
        expect(urls.has(`https://colorbase.in/color/${slug}`), hex).toBe(false);
      }
    }

    expect(isIndexableHex("ff0000")).toBe(true);
    expect(urls.has("https://colorbase.in/color/ff0000")).toBe(true);
  });

  it("keeps arbitrary hex URLs out of indexing while retaining curated navigation", () => {
    expect(isIndexableHex("123456")).toBe(false);
    expect(isIndexableHex("not-a-color")).toBe(false);
    expect(isIndexableHex("#F00")).toBe(true);
  });

  it("keeps a color with both curated and generated provenance indexable", () => {
    expect(isCuratedLibraryColor({ sources: ["generated", "css-named"] })).toBe(true);
    expect(isCuratedLibraryColor({ sources: ["generated"] })).toBe(false);
    for (const color of getAllLibraryColors().filter(isCuratedLibraryColor)) {
      expect(isIndexableHex(color.hex), color.slug).toBe(true);
    }
  });

  it("uses one finite canonical inventory with shared lastmod dates", () => {
    const slugs = getIndexableHexSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((slug) => /^[0-9a-f]{6}$/.test(slug))).toBe(true);
    expect(slugs.length).toBeLessThan(SEARCH_LANDING_HEXES.length + 2500);
    const hexUrls = sitemapForId("colors").filter((entry) => entry.url.includes("/color/"));
    expect(hexUrls.map((entry) => entry.url.split("/").pop())).toEqual(slugs);
    for (const entry of SITEMAP_IDS.flatMap(sitemapForId)) {
      expect(entry.lastModified).toBeInstanceOf(Date);
    }
    const onlyLanding = SEARCH_LANDING_HEXES.filter(
      (hex) => !slugs.includes(normalizeHex(hex).slice(1))
    );
    expect(onlyLanding.length).toBeGreaterThan(400);
  });
});
