import { describe, expect, it } from "vitest";
import { TOOLS } from "@/lib/tools-registry";
import { faqsForTool } from "@/lib/data/tool-supplements";
import { getToolGuide, guideWordCount } from "@/lib/data/tool-guides";

const SKIP = new Set(["css-gradient-generator", "palette-from-image", "fancy-text-generator"]);

function faqWords(slug: string) {
  return faqsForTool(slug)
    .flatMap((faq) => [faq.question, faq.answer])
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

describe("tool page copy", () => {
  it("gives every live tool at least 300 words and four FAQs", () => {
    const short: string[] = [];
    for (const tool of TOOLS) {
      if (SKIP.has(tool.slug)) continue;
      const guide = getToolGuide(tool.slug);
      const words = (guide ? guideWordCount(guide) : 0) + faqWords(tool.slug);
      const faqs = faqsForTool(tool.slug).length;
      if (words < 300 || words > 800 || faqs < 4 || faqs > 6)
        short.push(`${tool.slug} words=${words} faqs=${faqs}`);
    }
    expect(short, short.join("\n")).toEqual([]);
  });
});
