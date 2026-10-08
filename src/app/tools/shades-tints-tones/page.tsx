import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ToolPageShell } from "@/components/layout/tool-page-shell";
import { getToolBySlug } from "@/lib/tools-registry";
import { createPageMetadata } from "@/lib/seo";
import { ShadesTintsTonesTool } from "@/components/tools/shades-tints-tones-tool";

const slug = "tools/shades-tints-tones";

export function generateMetadata(): Metadata {
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return createPageMetadata({
    title: "Color Shades, Tints & Tones Generator",
    description: tool.description,
    path: "/tools/shades-tints-tones",
    keywords: tool.keywords,
  });
}

export default function ShadesTintsTonesPage() {
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  return (
    <ToolPageShell tool={tool}>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading tool…</p>}>
        <ShadesTintsTonesTool />
      </Suspense>
    </ToolPageShell>
  );
}
