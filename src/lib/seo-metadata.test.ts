import { describe, expect, it } from "vitest";
import {
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  MAX_TITLE_LENGTH,
  TARGET_PAGE_SEO,
  clampDescription,
  createPageMetadata,
  documentTitle,
  fitDescription,
  fitTitle,
} from "@/lib/seo";
import { META_DESCRIPTIONS, META_TITLES } from "@/lib/data/meta-descriptions";
import { describeHex, hexAnswerSentence } from "@/lib/colors/describe";

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

  it("keeps the planned titles within 60 characters and 140–155 character descriptions", () => {
    for (const [path, seo] of Object.entries(TARGET_PAGE_SEO)) {
      expect(documentTitle(seo.title).length, path).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
      expect(seo.description.length, `${path} ${seo.description.length}`).toBeGreaterThanOrEqual(140);
      expect(seo.description.length, path).toBeLessThanOrEqual(155);
      expect(seo.h1.length, path).toBeGreaterThan(0);
    }
  });

  it("has a unique 140–155 character description for every mapped page", () => {
    const seen = new Map<string, string>();
    for (const [path, text] of Object.entries(META_DESCRIPTIONS)) {
      expect(text.length, `${path} ${text.length}`).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
      expect(text.length, `${path} ${text.length}`).toBeLessThanOrEqual(DESCRIPTION_MAX);
      expect(seen.get(text), `${path} duplicates ${seen.get(text)}`).toBeUndefined();
      seen.set(text, path);
    }
    for (const [path, title] of Object.entries(META_TITLES))
      expect(documentTitle(title).length, path).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
  });

  it("uses the mapped description and title over the caller's", () => {
    const metadata = createPageMetadata({ title: "Bootstrap Colors", description: "x", path: "/colors/bootstrap" });
    expect(metadata.description).toBe(META_DESCRIPTIONS["/colors/bootstrap"]);
    expect(metadata.title).toBe(`${META_TITLES["/colors/bootstrap"]} | ColorBase`);
  });
});

describe("title and description fitting", () => {
  it("drops the brand suffix only when the title would exceed 60 characters", () => {
    expect(documentTitle("Short Title")).toBe("Short Title | ColorBase");
    const long = "Extract a Palette From a Screenshot Without Guessing";
    expect(documentTitle(long)).toBe(long);
    expect(fitTitle("Brighton & Hove Albion Hex Colors & Brand Color Codes", "Brighton & Hove Albion HEX Colors")).toBe(
      "Brighton & Hove Albion HEX Colors"
    );
  });

  it("adds extra sentences only while within 155 characters", () => {
    const out = fitDescription(
      "#FF5733 is a vivid reddish-orange. RGB 255, 87, 51; HSL 11°, 100%, 60%.",
      "See its shades, tints, harmonies and WCAG contrast.",
      "Copy HEX, RGB, HSL, CMYK or CSS.",
      "Copy the code in any format."
    );
    expect(out.length).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
    expect(out.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(clampDescription("word ".repeat(60)).length).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });
});

describe("computed color descriptions", () => {
  it("describes colors from their HSL values", () => {
    expect(hexAnswerSentence("#ff5733")).toBe(
      "#FF5733 is a vivid reddish-orange. RGB 255, 87, 51; HSL 11°, 100%, 60%."
    );
    expect(describeHex("#000000").phrase).toBe("black");
    expect(describeHex("#ffffff").phrase).toBe("white");
    expect(describeHex("#808080").phrase).toBe("medium gray");
    expect(describeHex("#000080").phrase).toBe("dark blue");
    expect(describeHex("#8b4513").hueName).toBe("brown");
    expect(describeHex("#ffc0cb").phrase).toMatch(/pink$/);
    expect(describeHex("#ff5733").temperature).toBe("warm");
    expect(describeHex("#1e90ff").temperature).toBe("cool");
    expect(describeHex("#ee82ee").article).toBe("a");
    expect(describeHex("#ffbf00").phrase).toBe("vivid amber");
    expect(describeHex("#d2691e").article).toBe("an");
  });
});
