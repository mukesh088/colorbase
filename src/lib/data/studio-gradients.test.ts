import { describe, expect, it } from "vitest";
import {
  GRADIENT_CATEGORIES,
  getAllGradients,
  getGradient,
  getGradientsByCategory,
  getStudioGradients,
  searchGradients,
} from "./gradient-library";
import { sitemapForId } from "@/lib/sitemaps";

describe("named studio gradients", () => {
  it("adds 100 unique recipes alongside the existing 1,762 gradients", () => {
    const studio = getStudioGradients();
    const library = getAllGradients();
    expect(studio).toHaveLength(100);
    expect(library).toHaveLength(1862);
    expect(new Set(library.map((g) => g.slug)).size).toBe(library.length);
    expect(new Set(studio.map((g) => g.css)).size).toBe(100);
  });

  it("provides valid stops, categories and matching code exports", () => {
    for (const gradient of getStudioGradients()) {
      expect(GRADIENT_CATEGORIES).toContain(gradient.category);
      expect(gradient.colors.length).toBeGreaterThanOrEqual(2);
      expect(gradient.colors.every((color) => /^#[0-9A-F]{6}$/.test(color))).toBe(true);
      expect(gradient.angle).toBeGreaterThanOrEqual(0);
      expect(gradient.angle).toBeLessThan(360);
      expect(gradient.css).toBe(
        `linear-gradient(${gradient.angle}deg, ${gradient.colors.join(", ")})`
      );
      expect(gradient.tailwind).toBe(
        `bg-[linear-gradient(${gradient.angle}deg,${gradient.colors.join(",")})]`
      );
      expect(gradient.scss).toBe(`$gradient-${gradient.slug}: ${gradient.css};`);
    }
  });

  it("makes every new recipe discoverable by name, category, route and sitemap", () => {
    const paths = new Set(sitemapForId("libraries").map((entry) => new URL(entry.url).pathname));
    for (const gradient of getStudioGradients()) {
      expect(searchGradients(gradient.name)).toContain(gradient);
      expect(getGradient(gradient.slug)).toBe(gradient);
      expect(getGradientsByCategory(gradient.category)).toContain(gradient);
      expect(paths.has(`/gradient-library/${gradient.slug}`)).toBe(true);
    }
    expect(getGradient("no-such-studio-gradient")).toBeUndefined();
  });
});
