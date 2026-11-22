import { describe, expect, it } from "vitest";
import { getAllFlags, getIndexableFlags } from "@/lib/data/flags";
import { isValidHex } from "@/lib/colors/convert";
import { allSitemapEntries } from "@/lib/sitemaps";
import { catalogRouteDecision } from "@/lib/catalog-routes";

describe("flag color data", () => {
  it("cites a source for every entry and uses valid HEX codes", () => {
    for (const f of getAllFlags()) {
      expect(f.source, f.slug).toMatch(/^https:\/\//);
      expect(f.sourceNote.length, f.slug).toBeGreaterThan(10);
      expect(typeof f.verified, f.slug).toBe("boolean");
      for (const c of f.colors) expect(isValidHex(c.hex), `${f.slug} ${c.hex}`).toBe(true);
    }
  });

  it("keeps unverified flags out of the sitemap", () => {
    const paths = new Set(allSitemapEntries().map((e) => new URL(e.url).pathname));
    for (const f of getAllFlags()) expect(paths.has(`/flags/${f.slug}`), f.slug).toBe(f.verified);
    expect(paths.has("/flags")).toBe(getIndexableFlags().length > 0);
  });

  it("404s unknown countries", () => {
    expect(catalogRouteDecision("/flags/india")).toBeNull();
    expect(catalogRouteDecision("/flags/atlantis")).toEqual({ status: 404 });
  });
});
