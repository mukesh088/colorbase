import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-config";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { BRANDS, getBrandCategories, brandAllColors, getAllBrandHexEntries } from "@/lib/data/brands";
import { BrandSearch } from "@/components/library/brand-search";
import { BrandCard } from "@/components/library/brand-card";

export const dynamic = "force-static";

export const metadata: Metadata = createPageMetadata({
  title: "Brand Hex Color Codes",
  description:
    "Official brand hex color codes for Google, Apple, Spotify, Netflix, Nike, Facebook, and 70+ companies. Copy logo HEX, RGB, and CSS values.",
  path: "/brands",
  keywords: [
    "brand hex colors",
    "brand color codes",
    "logo hex color",
    "company hex colors",
    "spotify hex",
    "facebook hex color",
  ],
});

export default function BrandsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Brands", href: "/brands" },
  ];
  const categories = getBrandCategories();

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
          Brand systems
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Brand Hex Color Codes
        </h1>
        <p className="mt-3 text-muted-foreground">
          {BRANDS.length} company palettes with official logo hex colors, RGB, CMYK, CSS variables, and
          Tailwind classes. Search a brand name or hex code.
        </p>
      </header>

      <div className="mt-8">
        <BrandSearch />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <span
            key={cat}
            className="rounded-full border border-border/60 bg-background/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground"
          >
            {cat}
          </span>
        ))}
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {BRANDS.map((brand, index) => (
          <div
            key={brand.slug}
            className="animate-rise"
            style={{ animationDelay: `${Math.min(index, 18) * 35}ms` }}
          >
            <BrandCard
              slug={brand.slug}
              name={brand.name}
              overview={brand.overview}
              category={brand.category}
              colors={brandAllColors(brand)}
            />
          </div>
        ))}
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
