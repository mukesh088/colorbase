import { describe, expect, it } from "vitest";
import brandRecords from "./expanded-brands.json";
import nameRecords from "./expanded-color-names.json";
import { BRANDS, getBrandBySlug, getBrandHexEntry } from "./brands";
import { getAllNamedColors, getIndexableNamedColors, getNamedColor } from "./color-names";
import { SITEMAP_IDS, sitemapForId } from "@/lib/sitemaps";
import { catalogRouteDecision } from "@/lib/catalog-routes";

describe("source-backed catalog expansion", () => {
  it("contains 2,000 unique expanded brands and 1,000 published color names", () => {
    expect(brandRecords).toHaveLength(2000);
    expect(nameRecords).toHaveLength(1000);
    expect(new Set(BRANDS.map((brand) => brand.slug)).size).toBe(BRANDS.length);
    const names = getAllNamedColors();
    expect(new Set(names.map((color) => color.slug)).size).toBe(names.length);
    expect(names.filter((color) => color.source === "community")).toHaveLength(1000);
  });

  it("retains source links and only imports the published brand swatch", () => {
    for (const record of brandRecords) {
      const brand = getBrandBySlug(record.slug)!;
      expect(brand.name).toBe(record.name);
      expect(brand.primary).toEqual([record.hex]);
      expect(brand.secondary).toEqual([]);
      expect(record.hex).toMatch(/^#[a-f0-9]{6}$/);
      expect(new URL(brand.sourceUrl!).protocol).toBe("https:");
      expect(brand.sourceName).toBe("Simple Icons");
      expect(getBrandHexEntry(record.slug, record.hex.slice(1))?.hex).toBe(record.hex);
    }
  });

  it("attributes community names and uses valid CSS rather than invented keywords", () => {
    for (const record of nameRecords) {
      const color = getNamedColor(record.slug)!;
      expect(color.hex).toBe(record.hex);
      expect(color.source).toBe("community");
      expect(color.sourceUrl).toContain("meodai/color-names");
      expect(color.usage).toContain(`color: ${record.hex};`);
      expect(color.usage).toContain("not a browser-supported CSS color keyword");
    }
  });

  it("publishes every new canonical route while excluding generated inspiration names", () => {
    const urls = new Set(
      SITEMAP_IDS.flatMap(sitemapForId).map((entry) => new URL(entry.url).pathname)
    );
    for (const record of brandRecords) {
      for (const path of [
        `/brands/${record.slug}`,
        `/brands/${record.slug}/${record.hex.slice(1)}`,
      ]) {
        expect(urls.has(path), path).toBe(true);
        expect(catalogRouteDecision(path), path).toBeNull();
      }
    }
    for (const record of nameRecords) expect(urls.has(`/color-names/${record.slug}`)).toBe(true);
    for (const color of getAllNamedColors().filter((c) => c.source === "catalog"))
      expect(urls.has(`/color-names/${color.slug}`)).toBe(false);
    expect(getIndexableNamedColors().length).toBeGreaterThanOrEqual(1100);
  });
});
