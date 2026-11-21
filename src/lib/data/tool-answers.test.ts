import { describe, expect, it } from "vitest";
import { PAGE_ANSWERS, TOOL_ANSWERS } from "@/lib/data/tool-answers";
import { TOOLS, getRelatedTools } from "@/lib/tools-registry";
import { getToolGuide } from "@/lib/data/tool-guides";
import { faqsForTool } from "@/lib/data/tool-supplements";
import retiredToolSlugs from "../../../retired-tools";

/** Tool slugs that 308 elsewhere and never render their own page. */
const REDIRECTED = new Set(["css-gradient-generator", "palette-from-image", ...retiredToolSlugs]);
const LIVE_TOOLS = TOOLS.filter((t) => !REDIRECTED.has(t.slug));
const words = (text: string) => text.trim().split(/\s+/).length;

describe("answer-first tool content", () => {
  it("covers every live tool", () => {
    const missing = LIVE_TOOLS.filter((t) => !TOOL_ANSWERS[t.slug]).map((t) => t.slug);
    expect(missing).toEqual([]);
    const unknown = Object.keys(TOOL_ANSWERS).filter((slug) => !TOOLS.some((t) => t.slug === slug));
    expect(unknown).toEqual([]);
  });

  it("keeps each answer 40–60 words with a question heading and key facts", () => {
    for (const [slug, a] of Object.entries({ ...TOOL_ANSWERS, ...PAGE_ANSWERS })) {
      const n = words(a.answer);
      expect(n, `${slug}: ${n} words`).toBeGreaterThanOrEqual(40);
      expect(n, `${slug}: ${n} words`).toBeLessThanOrEqual(60);
      expect(a.question, slug).toMatch(/\?$/);
      expect(a.keyFacts.length, slug).toBeGreaterThanOrEqual(3);
      if (a.explainer?.table) {
        const cols = a.explainer.table.columns.length;
        for (const row of a.explainer.table.rows) expect(row.length, slug).toBe(cols);
      }
    }
    const answers = [...Object.values(TOOL_ANSWERS), ...Object.values(PAGE_ANSWERS)].map((a) => a.answer);
    expect(new Set(answers).size).toBe(answers.length);
  });

  it("gives every live tool a how-to (3–5 steps), 4–6 FAQs and 3–5 related tools", () => {
    for (const tool of LIVE_TOOLS) {
      const guide = getToolGuide(tool.slug);
      expect(guide?.intro, tool.slug).toBeTruthy();
      expect(guide?.steps.length ?? 0, tool.slug).toBeGreaterThanOrEqual(3);
      expect(guide?.steps.length ?? 0, tool.slug).toBeLessThanOrEqual(5);
      const faqs = faqsForTool(tool.slug).length;
      expect(faqs, tool.slug).toBeGreaterThanOrEqual(4);
      expect(faqs, tool.slug).toBeLessThanOrEqual(6);
      const related = getRelatedTools(tool.slug);
      expect(related.length, `${tool.slug} related`).toBeGreaterThanOrEqual(3);
      expect(related.length, `${tool.slug} related`).toBeLessThanOrEqual(5);
      expect(related.every((r) => !REDIRECTED.has(r.slug)), tool.slug).toBe(true);
    }
  });
});
