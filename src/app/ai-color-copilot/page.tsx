import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPageShell } from "@/components/layout/tool-page-shell";
import { ToolContent } from "@/components/tools/tool-content";
import { getToolBySlug } from "@/lib/tools-registry";
import { createPageMetadata } from "@/lib/seo";

const slug = "ai-color-copilot";
// generate-pages: skip

export function generateMetadata(): Metadata {
  return createPageMetadata({
    title: "AI Color Copilot — AI Color Generator & Color System Builder",
    description:
      "Create accessible color palettes, design systems, dark modes and production-ready CSS, Tailwind and design tokens with AI.",
    path: "/ai-color-copilot",
    keywords: [
      "ai color copilot",
      "ai color generator",
      "ai color system generator",
      "ai accessible color palette",
      "ai tailwind color generator",
      "ai dark mode generator",
    ],
  });
}

export default function Page() {
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  return (
    <ToolPageShell tool={tool} hideHeader>
      <ToolContent slug={slug} />
    </ToolPageShell>
  );
}
