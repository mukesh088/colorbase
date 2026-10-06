import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-config";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getAllNamedColors, getCssNamedColors } from "@/lib/data/color-names";
import { ColorNamesExplorer } from "@/components/library/color-names-explorer";
import { LibraryHero } from "@/components/library/library-hero";
import { LibraryInsight } from "@/components/library/library-insight";

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
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), listLd]} />
      <Breadcrumbs items={crumbs} />

      <LibraryHero
        eyebrow="Named catalog"
        title="Color Names & Hex Codes"
        description={`Search wheat, salmon, tomato, and ${cssColors.length} CSS named colors — plus ${total.toLocaleString("en-US")} catalog names — with HEX, RGB, meaning, and a usage caveat for each keyword.`}
        stats={[
          { label: "CSS names", value: String(cssColors.length) },
          { label: "Catalog", value: total.toLocaleString("en-US") },
        ]}
        swatches={["#F5DEB3", "#FA8072", "#FF6347", "#F0E68C", "#4682B4", "#2F4F4F"]}
        actions={[
          { href: "/css-named-colors", label: "Named color tool", primary: true },
          { href: "/color-picker", label: "Open picker" },
        ]}
      />

      <div className="mt-8">
        <LibraryInsight id="color-names" />
      </div>

      <div className="mt-8">
        <ColorNamesExplorer />
      </div>

      <nav
        aria-label="CSS named color index"
        className="mt-16 rounded-[1.35rem] border border-border/50 bg-background/70 p-5 sm:rounded-[1.75rem] sm:p-7"
      >
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
