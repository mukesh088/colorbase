import { describe, expect, it } from "vitest";
import { createPageMetadata, TARGET_PAGE_SEO } from "@/lib/seo";

describe("page metadata", () => {
  it("does not emit a keywords meta tag", () => {
    const metadata = createPageMetadata({
      title: "Color Picker",
      description: "Pick a color.",
      path: "/color-picker",
      keywords: ["color picker"],
    });
    expect(metadata.keywords).toBeUndefined();
    expect(metadata.title).toBe("Color Picker | ColorBase");
    expect(metadata.alternates?.canonical).toBe("https://colorbase.in/color-picker");
  });

  it("keeps the planned titles and 140–155 character descriptions", () => {
    for (const [path, seo] of Object.entries(TARGET_PAGE_SEO)) {
      const title = `${seo.title} | ColorBase`;
      expect(title.length, path).toBeLessThanOrEqual(70);
      expect(seo.description.length, `${path} ${seo.description.length}`).toBeGreaterThanOrEqual(140);
      expect(seo.description.length, path).toBeLessThanOrEqual(155);
      expect(seo.h1.length, path).toBeGreaterThan(0);
    }
  });
});
