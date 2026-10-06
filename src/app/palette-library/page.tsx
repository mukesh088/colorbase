import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { PALETTE_CATEGORIES, getAllPalettes, getPalettesByCategory } from "@/lib/data/palette-library";
import { PaletteCard } from "@/components/library/palette-card";
import { GeneratedPaletteShelf } from "@/components/library/generated-palette-shelf";
import { LibraryHero } from "@/components/library/library-hero";
import { LibraryInsight } from "@/components/library/library-insight";

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

  const palettes = getAllPalettes();

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <LibraryHero
        eyebrow="Curated schemes"
        title="Palette Library"
        description={`${palettes.length.toLocaleString("en-US")} UI schemes with accessibility scores, export, and sharing. Heart a palette on this device — counts start between 30 and 2,000.`}
        stats={[
          { label: "Palettes", value: palettes.length.toLocaleString("en-US") },
          { label: "Categories", value: String(PALETTE_CATEGORIES.length) },
        ]}
        swatches={palettes[0]?.colors ?? ["#E11D48", "#0f172a", "#f8fafc", "#2563eb", "#10b981"]}
        actions={[
          { href: "/palette-generator", label: "Generate a palette", primary: true },
          { href: "/contrast-checker", label: "Check contrast" },
        ]}
      />

      <div className="mt-8">
        <LibraryInsight id="palettes" />
      </div>

      <div className="mt-10 space-y-12">
        <GeneratedPaletteShelf />
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
                      id={p.slug}
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
