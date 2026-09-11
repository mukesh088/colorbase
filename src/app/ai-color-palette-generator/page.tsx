import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AI Color Palette Generator — Semantic Palettes from a Prompt",
  description:
    "Describe the product you are building and generate a full UI color palette: primary, surfaces, text, borders, and status colors — not five random swatches.",
  path: "/ai-color-palette-generator",
  keywords: ["ai color palette generator", "ai palette generator", "semantic color palette", "ui color system"],
});

const crumbs = [
  { name: "Home", href: "/" },
  { name: "AI Color Palette Generator", href: "/ai-color-palette-generator" },
];

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
        ColorBase AI
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
        AI Color Palette Generator
      </h1>
      <p className="mt-3 text-muted-foreground">
        Most AI palettes dump five unrelated hex codes. ColorBase starts from what you are building — a fintech dashboard,
        a gaming landing page, a SaaS settings screen — then a deterministic engine expands that intent into primary,
        hover, surfaces, text, and status roles you can paste into CSS.
      </p>
      <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>Natural language in, semantic tokens out (primary, surface, muted text, success, focus).</li>
        <li>HEX, RGB, HSL, and OKLCH on every role — calculated locally, not guessed by the model.</li>
        <li>Live product preview so you see buttons, tables, and alerts before you export.</li>
      </ul>
      <Link
        href="/ai-color-copilot?prompt=Create%20a%20modern%20fintech%20dashboard%20with%20trustworthy%20blue%20colors"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-500/20"
      >
        Open AI Color Copilot
        <ArrowRight className="h-4 w-4" />
      </Link>
      <p className="mt-6 text-sm text-muted-foreground">
        Related:{" "}
        <Link href="/palette-generator" className="text-rose-600 underline-offset-4 hover:underline">
          Palette Generator
        </Link>{" "}
        ·{" "}
        <Link href="/ai-accessible-color-palette" className="text-rose-600 underline-offset-4 hover:underline">
          Accessible palettes
        </Link>
      </p>
    </div>
  );
}
