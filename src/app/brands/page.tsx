import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-config";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { BRANDS, getBrandCategories, brandAllColors, getAllBrandHexEntries } from "@/lib/data/brands";
import { BrandsExplorer } from "@/components/library/brands-explorer";
import { LibraryHero } from "@/components/library/library-hero";
import { LibraryInsight } from "@/components/library/library-insight";

export const dynamic = "force-static";

export const metadata: Metadata = createPageMetadata({
  title: "Brand Hex Color Codes",
  description:
    "Official brand hex color codes for Google, Apple, Spotify, McDonald's, Swiggy, Zomato, Uber Eats, Premier League clubs, and 100+ brands. Copy logo HEX, RGB, and CSS values.",
  path: "/brands",
  keywords: [
    "brand hex colors",
    "brand color codes",
    "logo hex color",
    "company hex colors",
    "spotify hex",
    "arsenal hex",
    "liverpool hex",
    "premier league colors",
    "swiggy hex",
    "zomato hex",
    "uber eats hex",
    "mcdonalds hex",
  ],
});

export default function BrandsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Brands", href: "/brands" },
  ];
  const categories = getBrandCategories();
  const catalog = BRANDS.map((brand) => ({
    slug: brand.slug,
    name: brand.name,
    overview: brand.overview,
    category: brand.category,
    colors: brandAllColors(brand),
  }));

  const hexEntries = getAllBrandHexEntries();

  const brandListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Brand hex color codes",
    description: "Index of company brand palettes with official hex color codes.",
    url: `${SITE_URL}/brands`,
    numberOfItems: BRANDS.length,
    itemListElement: BRANDS.map((brand, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${brand.name} hex colors ${brandAllColors(brand).join(", ")}`,
      url: `${SITE_URL}/brands/${brand.slug}`,
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), brandListLd]} />
      <Breadcrumbs items={crumbs} />
      <LibraryHero
        eyebrow="Popular brands"
        title="Brand Hex Color Codes"
        description={`${BRANDS.length} palettes with logos and official hexes — food apps, Premier League kits, and tech marks. Open a brand for primary vs secondary roles, tints, and a downloadable palette.`}
        stats={[
          { label: "Brands", value: String(BRANDS.length) },
          { label: "Categories", value: String(categories.length) },
          { label: "Hex pages", value: String(hexEntries.length) },
        ]}
        swatches={["#4285F4", "#FC8019", "#1DB954", "#E11D48", "#000000", "#FFC72C"]}
        actions={[
          { href: "/brand-colors", label: "Brand lookup tool", primary: true },
          { href: "/contrast-checker", label: "Check contrast" },
        ]}
      />

      <div className="mt-8">
        <LibraryInsight id="brands" />
      </div>

      <div className="mt-8">
        <BrandsExplorer brands={catalog} categories={categories} />
      </div>

      <nav
        aria-label="All brand hex color pages"
        className="mt-16 rounded-[1.35rem] border border-border/50 bg-background/70 p-5 sm:rounded-[1.75rem] sm:p-7"
      >
        <h2 className="font-display text-xl font-semibold tracking-tight">All brand hex color pages</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Index of every brand name paired with its hex color code for search engines and quick lookup.
        </p>
        <ul className="mt-6 columns-1 gap-x-8 text-sm sm:columns-2 lg:columns-3">
          {hexEntries.map((entry) => (
            <li key={`${entry.brand.slug}-${entry.hexSlug}`} className="mb-1.5 break-inside-avoid">
              <Link
                href={`/brands/${entry.brand.slug}/${entry.hexSlug}`}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {entry.brand.name} {entry.hex}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
