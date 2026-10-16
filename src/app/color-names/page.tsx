import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-config";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getAllNamedColors,
  getCssNamedColors,
  getIndexableNamedColors,
} from "@/lib/data/color-names";
import { ColorNamesExplorer } from "@/components/library/color-names-explorer";
import { LibraryHero } from "@/components/library/library-hero";
import { LibraryInsight } from "@/components/library/library-insight";

export const dynamic = "force-static";

export const metadata: Metadata = createPageMetadata({
  title: "Color Names — CSS & Community HEX Color Library",
  description:
    "Explore CSS keywords and 1,000 attributed community color names with HEX, RGB, shades, live previews, and contrast checks. Copy a color into your next design.",
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
  const publishedColors = getIndexableNamedColors();
  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "CSS and community color names with HEX codes",
    description:
      "Index of named colors such as wheat color, salmon color, and tomato color with hex codes.",
    url: `${SITE_URL}/color-names`,
    numberOfItems: publishedColors.length,
    itemListElement: publishedColors.map((c, index) => ({
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
        description={`Explore ${cssColors.length} browser-supported CSS colors and 1,000 attributed names from the Color Names community dataset, plus ColorBase inspiration names. Copy HEX codes, compare shades, and check your pairings.`}
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
        aria-label="Published color name index"
        className="border-border/50 bg-background/70 mt-16 rounded-[1.35rem] border p-5 sm:rounded-[1.75rem] sm:p-7"
      >
        <h2 className="font-display text-xl font-semibold tracking-tight">
          CSS & community color name index
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Browse the published name and HEX references. Community names use HEX in CSS; only CSS
          names are browser keywords.
        </p>
        <ul className="mt-6 columns-1 gap-x-8 text-sm sm:columns-2 lg:columns-3">
          {publishedColors.map((c) => (
            <li key={c.slug} className="mb-1.5 break-inside-avoid">
              <Link
                href={`/color-names/${c.slug}`}
                className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
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
