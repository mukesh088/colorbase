import { describe, expect, it } from "vitest";
import { catalogRouteDecision } from "@/lib/catalog-routes";
import { SITEMAP_IDS, sitemapForId } from "@/lib/sitemaps";

describe("catalog request validation", () => {
  it("allows every published sitemap URL", () => {
    for (const entry of SITEMAP_IDS.flatMap((id) => sitemapForId(id))) {
      expect(catalogRouteDecision(new URL(entry.url).pathname), entry.url).toBeNull();
    }
  });

  it("identifies missing resources and invalid categories before rendering", () => {
    for (const path of [
      "/color/not-a-color",
      "/colors/missing-color",
      "/brands/missing-brand",
      "/brands/meta/invalid",
      "/color-names/missing-name",
      "/palette-library/missing-palette",
      "/gradient-library/missing-gradient",
      "/blog/missing-post",
      "/colors/family/invalid",
      "/palette-library/category/invalid",
      "/gradient-library/category/invalid",
      "/developers/invalid",
      "/color-codes/roblox/invalid",
      "/blog/category/%25",
    ]) {
      expect(catalogRouteDecision(path), path).toEqual({ status: 404 });
    }
  });

  it("normalizes HEX aliases and leaves the supplied reference page valid", () => {
    expect(catalogRouteDecision("/color/3B82F6")).toEqual({
      status: 308,
      pathname: "/color/3b82f6",
    });
    expect(catalogRouteDecision("/color/fff")).toEqual({ status: 308, pathname: "/color/ffffff" });
    expect(catalogRouteDecision("/color/438052")).toBeNull();
  });

  it("redirects plural HEX URLs directly to the canonical color page", () => {
    for (const [alias, hex] of [
      ["ffd700", "ffd700"],
      ["FFD700", "ffd700"],
      ["f80", "ff8800"],
      ["000000", "000000"],
      ["ffffff", "ffffff"],
      ["12ab34", "12ab34"],
      ["%23FFD700", "ffd700"],
    ]) {
      expect(catalogRouteDecision(`/colors/${alias}`)).toEqual({
        status: 308,
        pathname: `/color/${hex}`,
      });
      expect(catalogRouteDecision(`/color/${hex}`)).toBeNull();
    }
  });

  it("keeps named colors and design systems available and rejects malformed colors", () => {
    for (const path of ["/colors/red", "/colors/tailwind", "/colors/material", "/colors/css"])
      expect(catalogRouteDecision(path), path).toBeNull();
    for (const value of ["zzzzzz", "ff", "fffff", "1234567", "ffd700.css"])
      expect(catalogRouteDecision(`/colors/${value}`), value).toEqual({ status: 404 });
  });

  it("handles malformed encoding without throwing and leaves non-catalog routes alone", () => {
    expect(catalogRouteDecision("/colors/%E0%A4")).toEqual({ status: 404 });
    expect(catalogRouteDecision("/color/missing.txt")).toEqual({ status: 404 });
    expect(catalogRouteDecision("/api/me/palettes")).toBeNull();
    expect(catalogRouteDecision("/color-picker")).toBeNull();
  });
});
