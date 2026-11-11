import { describe, expect, it } from "vitest";
import { BRANDS, isSitemapWorthyBrand } from "@/lib/data/brands";

describe("isSitemapWorthyBrand", () => {
  it("keeps non–Simple Icons brands", () => {
    const curated = BRANDS.find((b) => b.sourceName !== "Simple Icons");
    expect(curated).toBeTruthy();
    expect(isSitemapWorthyBrand(curated!)).toBe(true);
  });

  it("requires guidelinesUrl for Simple Icons stubs", () => {
    const stub = BRANDS.find((b) => b.sourceName === "Simple Icons" && !b.guidelinesUrl);
    const guided = BRANDS.find((b) => b.sourceName === "Simple Icons" && b.guidelinesUrl);
    expect(stub).toBeTruthy();
    expect(guided).toBeTruthy();
    expect(isSitemapWorthyBrand(stub!)).toBe(false);
    expect(isSitemapWorthyBrand(guided!)).toBe(true);
  });
});
