import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import {
  PALETTE_CATEGORIES,
  getPalettesByCategory,
  type PaletteCategory,
} from "@/lib/data/palette-library";
import { PaletteCard } from "@/components/library/palette-card";

export function generateStaticParams() {
  return PALETTE_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  return createPageMetadata({
    title: `${category[0].toUpperCase()}${category.slice(1)} Palettes`,
    description: `Browse ${category} color palettes with accessibility scores and exports.`,
    path: `/palette-library/category/${category}`,
    keywords: [`${category} palettes`, "color schemes"],
  });
}

export default async function PaletteCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!PALETTE_CATEGORIES.includes(category as PaletteCategory)) notFound();
  const items = getPalettesByCategory(category);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Palette Library", href: "/palette-library" },
    { name: category, href: `/palette-library/category/${category}` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="font-display text-4xl font-semibold capitalize tracking-tight">
        {category} Palettes
      </h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p, index) => (
          <div
            key={p.slug}
            className="animate-rise"
            style={{ animationDelay: `${Math.min(index, 24) * 25}ms` }}
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
    </div>
  );
}
