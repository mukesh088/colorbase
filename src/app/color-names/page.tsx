import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-config";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getAllNamedColors, getCssNamedColors } from "@/lib/data/color-names";
import { ColorNamesExplorer } from "@/components/library/color-names-explorer";

export const dynamic = "force-static";

export const metadata: Metadata = createPageMetadata({
  title: "Color Names — Wheat, Salmon, Tomato Hex Codes",
  description:
    "Look up wheat color, salmon color, tomato color, and every CSS named color with HEX, RGB, and CSS keywords. Copy hex codes for design and development.",
  path: "/color-names",
  keywords: [
    "wheat color",
    "salmon color",
    "tomato color",
    "named colors",
    "css color names",
    "color hex code",
    "beige color",
    "khaki color",
  ],
});

export default function ColorNamesPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Names", href: "/color-names" },
  ];
  const total = getAllNamedColors().length;
  const cssColors = getCssNamedColors();
  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "CSS named colors hex codes",
    description: "Index of named colors such as wheat color, salmon color, and tomato color with hex codes.",
    url: `${SITE_URL}/color-names`,
    numberOfItems: cssColors.length,
    itemListElement: cssColors.map((c, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${c.displayName} color ${c.hex.toUpperCase()}`,
      url: `${SITE_URL}/color-names/${c.slug}`,
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), listLd]} />
      <Breadcrumbs items={crumbs} />

      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
          Named catalog
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Color Names & Hex Codes
        </h1>
        <p className="mt-3 text-muted-foreground">
          Search wheat color, salmon color, and {cssColors.length} CSS named colors — plus{" "}
          {total.toLocaleString()} catalog names — with HEX, RGB, meaning, and copy-ready CSS.
        </p>
      </header>

      <div className="mt-8">
        <ColorNamesExplorer />
      </div>

      <nav aria-label="CSS named color index" className="mt-16 border-t border-border/40 pt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          All CSS named colors
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Keyword index for Google and quick lookup — each name is a “color” search phrase with its hex code.
        </p>
        <ul className="mt-6 columns-1 gap-x-8 text-sm sm:columns-2 lg:columns-3">
          {cssColors.map((c) => (
            <li key={c.slug} className="mb-1.5 break-inside-avoid">
              <Link
                href={`/color-names/${c.slug}`}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {c.displayName} color {c.hex.toUpperCase()}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
