import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-config";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { BRANDS, getBrandCategories, brandAllColors, getAllBrandHexEntries } from "@/lib/data/brands";
import { BrandsExplorer } from "@/components/library/brands-explorer";

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
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), brandListLd]} />
      <Breadcrumbs items={crumbs} />
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
          Popular brands
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Brand Hex Color Codes
        </h1>
        <p className="mt-3 text-muted-foreground">
          {BRANDS.length} palettes with logos and official hex colors — including food apps, Premier League teams, and football clubs. Click a brand for every
          color plus tints, shades, and a downloadable palette.
        </p>
      </header>

      <div className="mt-8">
        <BrandsExplorer brands={catalog} categories={categories} />
      </div>

      <nav aria-label="All brand hex color pages" className="mt-16 border-t border-border/40 pt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight">All brand hex color pages</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Index of every brand name paired with its hex color code for search engines and quick lookup.
        </p>
        <ul className="mt-6 columns-1 gap-x-8 text-sm sm:columns-2 lg:columns-3">
          {getAllBrandHexEntries().map((entry) => (
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
