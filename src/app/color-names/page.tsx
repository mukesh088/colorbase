import type { Metadata } from "next";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getAllNamedColors } from "@/lib/data/color-names";
import { ColorNamesExplorer } from "@/components/library/color-names-explorer";

export const metadata: Metadata = createPageMetadata({
  title: "Color Name Library",
  description:
    "Search thousands of color names with HEX, RGB, HSL, CMYK, meaning, history, usage, tints, and related shades.",
  path: "/color-names",
  keywords: ["color names", "named colors", "color meaning"],
});

export default function ColorNamesPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Names", href: "/color-names" },
  ];
  const total = getAllNamedColors().length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
          Named catalog
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Color Name Library
        </h1>
        <p className="mt-3 text-muted-foreground">
          {total.toLocaleString()}+ searchable color names with meanings, history, usage notes, and
          copy-ready formats.
        </p>
      </header>

      <div className="mt-8">
        <ColorNamesExplorer />
      </div>
    </div>
  );
}
