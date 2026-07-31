import type { Metadata } from "next";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { BRANDS, getBrandCategories, brandAllColors } from "@/lib/data/brands";
import { BrandSearch } from "@/components/library/brand-search";
import { BrandCard } from "@/components/library/brand-card";

export const metadata: Metadata = createPageMetadata({
  title: "Brand Color Library",
  description:
    "Search publicly recognized brand color palettes for Meta, Google, Apple, Netflix, Spotify, Nike, and 70+ more companies.",
  path: "/brands",
  keywords: ["brand colors", "logo colors", "company color palette"],
});

export default function BrandsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Brands", href: "/brands" },
  ];
  const categories = getBrandCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
          Brand systems
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Brand Color Library
        </h1>
        <p className="mt-3 text-muted-foreground">
          {BRANDS.length} searchable brand palettes with primary/secondary colors, HEX/RGB/CMYK, CSS
          variables, Tailwind classes, and downloads.
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
    </div>
  );
}
