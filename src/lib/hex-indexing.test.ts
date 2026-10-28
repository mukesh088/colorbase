import { describe, expect, it, vi } from "vitest";
import { getIndexableHexSlugs, isCuratedLibraryColor, isIndexableHex } from "./hex-indexing";
import { SEARCH_LANDING_HEXES } from "./data/search-landing-hexes";
import { getAllLibraryColors } from "./data/color-library";
import { SITEMAP_IDS, sitemapForId } from "./sitemaps";
import { generateMetadata } from "@/app/color/[hex]/page";

// Metadata checks do not need browser components or their CSS pipeline.
vi.mock("@/components/library/color-detail-view", () => ({ ColorDetailView: () => null }));
vi.mock("@/components/library/brand-card", () => ({ BrandCard: () => null }));

describe("hex search landing recovery", () => {
  it("preserves all observed search landings in metadata and sitemap discovery", async () => {
    const urls = new Set(sitemapForId("colors").map((entry) => entry.url));
    for (const hex of SEARCH_LANDING_HEXES) {
      expect(isIndexableHex(hex), hex).toBe(true);
      expect(urls.has(`https://colorbase.in/color/${hex}`), hex).toBe(true);
    }
    for (const hex of ["584930", "346249", "ff0000"]) {
      const metadata = await generateMetadata({ params: Promise.resolve({ hex }) });
      expect(metadata.robots).toMatchObject({ index: true, follow: true });
      expect(metadata.alternates?.canonical).toBe(`https://colorbase.in/color/${hex}`);
    }
  });

  it("keeps arbitrary hex URLs out of indexing while retaining curated navigation", async () => {
    expect(isIndexableHex("123456")).toBe(false);
    expect(isIndexableHex("not-a-color")).toBe(false);
    expect(isIndexableHex("#F00")).toBe(true);
    const metadata = await generateMetadata({ params: Promise.resolve({ hex: "123456" }) });
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it("keeps a color with both curated and generated provenance indexable", () => {
    expect(isCuratedLibraryColor({ sources: ["generated", "css-named"] })).toBe(true);
    expect(isCuratedLibraryColor({ sources: ["generated"] })).toBe(false);
    for (const color of getAllLibraryColors().filter(isCuratedLibraryColor)) {
      expect(isIndexableHex(color.hex), color.slug).toBe(true);
    }
  });

  it("uses one finite canonical inventory without artificial modification dates", () => {
    const slugs = getIndexableHexSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((slug) => /^[0-9a-f]{6}$/.test(slug))).toBe(true);
    const hexUrls = sitemapForId("colors").filter((entry) => entry.url.includes("/color/"));
    expect(hexUrls.map((entry) => entry.url.split("/").pop())).toEqual(slugs);
    for (const entry of SITEMAP_IDS.flatMap(sitemapForId)) {
      expect(entry.lastModified).toBeUndefined();
    }
  });
});
