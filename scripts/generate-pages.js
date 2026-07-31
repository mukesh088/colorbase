/**
 * Generate App Router pages for every registered tool slug.
 * Usage: node scripts/generate-pages.js
 */
const fs = require("fs");
const path = require("path");

const registryPath = path.join(process.cwd(), "src", "lib", "tools-registry.ts");
const suitePath = path.join(process.cwd(), "src", "lib", "suite-tools.ts");

function extractSlugs(...files) {
  const slugs = new Set();
  for (const filePath of files) {
    const src = fs.readFileSync(filePath, "utf8");
    for (const m of src.matchAll(/slug:\s*"([a-z0-9-]+)"/g)) slugs.add(m[1]);
    // suite helper: t("slug", ...)
    for (const m of src.matchAll(/\bt\(\s*"([a-z0-9-]+)"/g)) slugs.add(m[1]);
  }
  return [...slugs];
}

const tools = extractSlugs(registryPath, suitePath).sort();
const root = path.join(process.cwd(), "src", "app");
let written = 0;

for (const slug of tools) {
  const dir = path.join(root, slug);
  fs.mkdirSync(dir, { recursive: true });
  const pagePath = path.join(dir, "page.tsx");
  if (fs.existsSync(pagePath)) {
    const existing = fs.readFileSync(pagePath, "utf8");
    if (!existing.includes("ToolContent") && !existing.includes("getToolBySlug")) {
      console.log(`skip non-tool page: ${slug}`);
      continue;
    }
  }
  const content = `import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPageShell } from "@/components/layout/tool-page-shell";
import { ToolContent } from "@/components/tools/tool-content";
import { getToolBySlug } from "@/lib/tools-registry";
import { toolMetadata } from "@/lib/seo";

const slug = "${slug}";

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
`;
  fs.writeFileSync(pagePath, content);
  written++;
}

console.log(`Generated/updated ${written} tool pages from ${tools.length} slugs`);
