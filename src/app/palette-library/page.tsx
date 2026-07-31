import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { PALETTE_CATEGORIES, getAllPalettes, getPalettesByCategory } from "@/lib/data/palette-library";
import { PaletteCard } from "@/components/library/palette-card";

export const metadata: Metadata = createPageMetadata({
  title: "Palette Library",
  description:
    "Thousands of curated color palettes for business, startup, dashboard, gaming, healthcare, fashion, cyberpunk, and more.",
  path: "/palette-library",
  keywords: ["color palettes", "palette library", "ui palettes"],
});

export default function PaletteLibraryPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Palette Library", href: "/palette-library" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
          Curated schemes
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Palette Library
        </h1>
        <p className="mt-3 text-muted-foreground">
          {getAllPalettes().length.toLocaleString()} curated palettes with accessibility scores, export, and
          sharing.
        </p>
      </header>

      <div className="mt-10 space-y-12">
        {PALETTE_CATEGORIES.map((category) => {
          const items = getPalettesByCategory(category).slice(0, 6);
          return (
            <section key={category}>
              <div className="mb-4 flex items-end justify-between gap-3">
                <h2 className="font-display text-2xl font-semibold capitalize tracking-tight">
                  {category}
                </h2>
                <Link
                  href={`/palette-library/category/${category}`}
                  className="text-sm font-medium text-primary transition-all duration-300 hover:translate-x-0.5 hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p, index) => (
                  <div
                    key={p.slug}
                    className="animate-rise"
                    style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                  >
                    <PaletteCard
                      href={`/palette-library/${p.slug}`}
                      name={p.name}
                      colors={p.colors}
                      meta={`A11y ${p.accessibilityScore}`}
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
