import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPageShell } from "@/components/layout/tool-page-shell";
import { ToolContent } from "@/components/tools/tool-content";
import { getToolBySlug } from "@/lib/tools-registry";
import { toolMetadata } from "@/lib/seo";

const slug = "png-to-jpg";

export function generateMetadata(): Metadata {
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return toolMetadata(tool);
}

export default function Page() {
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  return (
    <ToolPageShell tool={tool}>
      <ToolContent slug={slug} />
    </ToolPageShell>
  );
}
