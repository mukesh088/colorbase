import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AI Tailwind Color Generator — Semantic Tokens & 50–950 Scales",
  description:
    "Turn a product description into Tailwind theme colors, CSS variables, and OKLCH 50–950 shade scales you can drop into tailwind.config.",
  path: "/ai-tailwind-color-generator",
  keywords: ["ai tailwind color generator", "tailwind palette generator", "tailwind theme colors", "design tokens"],
});

const crumbs = [
  { name: "Home", href: "/" },
  { name: "AI Tailwind Color Generator", href: "/ai-tailwind-color-generator" },
];

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
        Developer export
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
        AI Tailwind Color Generator
      </h1>
      <p className="mt-3 text-muted-foreground">
        Ask for Tailwind colors for a gaming site or a banking app and ColorBase returns named theme keys
        (<code className="text-foreground">primary</code>, <code className="text-foreground">surface</code>,{" "}
        <code className="text-foreground">textMuted</code>) plus perceptual 50–950 ramps — not{" "}
        <code className="text-foreground">palette-1</code> through <code className="text-foreground">palette-5</code>.
      </p>
      <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>Export CSS variables, Tailwind config, SCSS, JSON tokens, TypeScript, React theme, and Flutter.</li>
        <li>Copy for AI produces a compact block for Cursor, Claude, or Copilot.</li>
        <li>Shades are OKLCH-based so 50 stays light and 950 stays deep without muddy RGB mixes.</li>
      </ul>
      <Link
        href="/ai-color-copilot?prompt=Generate%20Tailwind%20colors%20for%20a%20gaming%20website"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-500/20"
      >
        Generate Tailwind colors
        <ArrowRight className="h-4 w-4" />
      </Link>
      <p className="mt-6 text-sm text-muted-foreground">
        Browse preset scales in the{" "}
        <Link href="/tailwind-colors" className="text-rose-600 underline-offset-4 hover:underline">
          Tailwind color library
        </Link>
        .
      </p>
    </div>
  );
}
