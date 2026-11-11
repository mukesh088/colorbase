import { describe, expect, it } from "vitest";
import { SITEMAP_IDS, sitemapForId } from "@/lib/sitemaps";
import { BRANDS, isSitemapWorthyBrand } from "@/lib/data/brands";

describe("published sitemap inventory", () => {
  it("keeps only unique canonical public URLs with shared lastmod dates", () => {
    const entries = SITEMAP_IDS.flatMap((id) => sitemapForId(id));
    const urls = entries.map((entry) => entry.url);
    expect(entries.length).toBeGreaterThan(0);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.some((url) => new URL(url).pathname === "/search")).toBe(false);
    expect(entries.every((entry) => entry.lastModified instanceof Date)).toBe(true);
    expect(urls.every((url) => new URL(url).search === "")).toBe(true);
    expect(urls.some((url) => new URL(url).pathname === "/color/438052")).toBe(true);
  });

  it("includes the studios and updated tools within one sitemap's URL limit", () => {
    const paths = new Set(sitemapForId("pages").map((entry) => new URL(entry.url).pathname));
    for (const route of [
      "theme-builder",
      "chart-palette-generator",
      "palette-generator",
      "color-picker",
      "contrast-checker",
      "image-color-picker",
      "image-palette-extractor",
      "gradient-generator",
    ])
      expect(paths.has(`/${route}`), route).toBe(true);
    expect(paths.has("/css-gradient-generator")).toBe(false);
    expect(paths.has("/palette-from-image")).toBe(false);
    expect(SITEMAP_IDS.flatMap(sitemapForId).length).toBeLessThan(50_000);
  });

  it("limits brand sitemap entries to sitemap-worthy brands", () => {
    const brandPaths = sitemapForId("brands").map((entry) => new URL(entry.url).pathname);
    const hubPaths = brandPaths.filter((p) => /^\/brands\/[^/]+$/.test(p));
    const worthy = new Set(
      BRANDS.filter(isSitemapWorthyBrand).map((b) => `/brands/${b.slug}`)
    );
    expect(hubPaths.every((p) => worthy.has(p))).toBe(true);
    expect(hubPaths.length).toBe(worthy.size);
    expect(hubPaths.length).toBeLessThan(BRANDS.length);
    // Wave 1 snapshot: stubs without guidelines dropped from sitemap (~13.3k → ~10.9k total).
    expect(SITEMAP_IDS.flatMap(sitemapForId).length).toBeLessThan(12_000);
    expect(hubPaths.length).toBeLessThan(1_200);
  });
});
