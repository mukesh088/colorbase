import { describe, expect, it } from "vitest";
import { SITEMAP_IDS, sitemapForId } from "@/lib/sitemaps";

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
    expect(SITEMAP_IDS.flatMap(sitemapForId).length).toBeLessThan(50_000);
  });
});
