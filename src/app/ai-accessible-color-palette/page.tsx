import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AI Accessible Color Palette — WCAG AA & AAA Systems",
  description:
    "Generate accessible UI palettes with WCAG contrast checks, automatic text repair, and AA or AAA targets built into the color engine.",
  path: "/ai-accessible-color-palette",
  keywords: [
    "ai accessible color palette",
    "wcag color palette",
    "accessible color system",
    "color contrast checker",
  ],
});

const crumbs = [
  { name: "Home", href: "/" },
  { name: "AI Accessible Color Palette", href: "/ai-accessible-color-palette" },
];

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
        Accessibility first
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
        AI Accessible Color Palette
      </h1>
      <p className="mt-3 text-muted-foreground">
        Accessibility is not a badge bolted on after generation. ColorBase measures WCAG contrast for text, muted text,
        primary actions, and status colors, then nudges OKLCH lightness until pairs pass AA (or AAA when you ask).
      </p>
      <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>Pass / AA-only / fail badges on every semantic role.</li>
        <li>Failed pairs get a corrected hex that keeps the original hue.</li>
        <li>Deep contrast debugging still lives in the dedicated Contrast Checker.</li>
      </ul>
      <Link
        href="/ai-color-copilot?prompt=Create%20an%20accessible%20purple%20color%20system"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-500/20"
      >
        Generate an accessible system
        <ArrowRight className="h-4 w-4" />
      </Link>
      <p className="mt-6 text-sm text-muted-foreground">
        Also use the{" "}
        <Link href="/contrast-checker" className="text-rose-600 underline-offset-4 hover:underline">
          Contrast Checker
        </Link>{" "}
        for any two hex values.
      </p>
    </div>
  );
}
