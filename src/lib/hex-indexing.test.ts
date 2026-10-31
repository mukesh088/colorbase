import { describe, expect, it, vi } from "vitest";
import { getIndexableHexSlugs, isCuratedLibraryColor, isIndexableHex } from "./hex-indexing";
import { SEARCH_LANDING_HEXES } from "./data/search-landing-hexes";
import { getAllLibraryColors } from "./data/color-library";
import { SITEMAP_IDS, sitemapForId } from "./sitemaps";
import { generateMetadata } from "@/app/color/[hex]/page";
import { normalizeHex } from "@/lib/colors/convert";

// Metadata checks do not need browser components or their CSS pipeline.
vi.mock("@/components/library/color-detail-view", () => ({ ColorDetailView: () => null }));
vi.mock("@/components/library/brand-card", () => ({ BrandCard: () => null }));
vi.mock("@/components/library/color-catalog-brief", () => ({ ColorCatalogBrief: () => null }));

describe("hex indexing quality", () => {
  it("indexes curated inventory and noindexes thin search-only landings", async () => {
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
        const metadata = await generateMetadata({ params: Promise.resolve({ hex: slug }) });
        expect(metadata.robots).toEqual({ index: false, follow: true });
      }
    }

    for (const hex of ["ff0000"]) {
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
    // Thin landings that are not curated stay out of the sitemap.
    const onlyLanding = SEARCH_LANDING_HEXES.filter(
      (hex) => !slugs.includes(normalizeHex(hex).slice(1))
    );
    expect(onlyLanding.length).toBeGreaterThan(400);
  });
});
