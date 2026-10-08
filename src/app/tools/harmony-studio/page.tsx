import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ToolPageShell } from "@/components/layout/tool-page-shell";
import { getToolBySlug } from "@/lib/tools-registry";
import { createPageMetadata } from "@/lib/seo";
import { HarmonyStudioTool } from "@/components/tools/harmony-studio-tool";

const slug = "tools/harmony-studio";

export function generateMetadata(): Metadata {
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return createPageMetadata({
    title: "Color Harmony Generator — Complementary, Triadic & More",
    description: tool.description,
    path: "/tools/harmony-studio",
    keywords: tool.keywords,
  });
}

export default function HarmonyStudioPage() {
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  return (
    <ToolPageShell tool={tool}>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading studio…</p>}>
        <HarmonyStudioTool />
      </Suspense>
    </ToolPageShell>
  );
}
