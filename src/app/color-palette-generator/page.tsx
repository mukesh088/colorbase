import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPageShell } from "@/components/layout/tool-page-shell";
import { ToolContent } from "@/components/tools/tool-content";
import { getToolBySlug } from "@/lib/tools-registry";
import { createPageMetadata, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

const slug = "palette-generator";

const faqs = [
  {
    question: "How does the Color Palette Generator work?",
    answer: "Our palette generator computes deterministic harmonic relationships (analogous, monochromatic, complementary, split-complementary, and triadic) directly from a base HEX seed color. You can lock colors, adjust hues, and export directly to CSS variables or Tailwind tokens.",
  },
  {
    question: "Can I export color palettes to CSS and design software?",
    answer: "Yes, you can copy individual HEX and RGB codes with one click, or export the entire palette as CSS custom properties (:root variables), JSON tokens, or URL share links.",
  },
  {
    question: "How do I ensure my generated color palette is accessible?",
    answer: "ColorBase automatically calculates WCAG 2.1 contrast ratios (AAA, AA, or Fail) for text against light and dark background combinations within your generated palette.",
  },
];

export function generateMetadata(): Metadata {
  return createPageMetadata({
    title: "Color Palette Generator — Create & Export Harmonious Palettes",
    description: "Generate beautiful, accessible color palettes in one click. Explore complementary, analogous, triadic, monochromatic, pastel, and neon harmonies with instant CSS export.",
    path: "/color-palette-generator",
    keywords: ["color palette", "palettes", "color palette generator", "palette maker", "hex color palette", "accessible color schemes"],
  });
}

export default function ColorPaletteGeneratorPage() {
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <ToolPageShell tool={tool}>
        <ToolContent slug={slug} />
      </ToolPageShell>
    </>
  );
}
