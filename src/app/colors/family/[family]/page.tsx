import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import {
  COLOR_FAMILIES,
  FAMILY_LABELS,
  FAMILY_SWATCH,
  psychologyForFamily,
  type ColorFamily,
} from "@/lib/data/families";
import { getColorsByFamily } from "@/lib/data/color-library";
import { LibraryColorCard } from "@/components/library/library-color-card";
import { PaletteStrip } from "@/components/library/palette-strip";
import { mixColors } from "@/lib/colors/convert";

export function generateStaticParams() {
  return COLOR_FAMILIES.map((family) => ({ family }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ family: string }>;
}): Promise<Metadata> {
  const { family } = await params;
  const label = FAMILY_LABELS[family as ColorFamily] ?? family;
  return createPageMetadata({
    title: `${label} Colors`,
    description: `Browse ${label.toLowerCase()} colors with HEX, RGB, HSL, OKLCH, and accessibility details.`,
    path: `/colors/family/${family}`,
    keywords: [`${label} colors`, `${family} hex`, `${family} palette`],
  });
}

export default async function FamilyPage({ params }: { params: Promise<{ family: string }> }) {
  const { family } = await params;
  if (!COLOR_FAMILIES.includes(family as ColorFamily)) notFound();
  const colors = getColorsByFamily(family).slice(0, 120);
  const label = FAMILY_LABELS[family as ColorFamily];
  const base = FAMILY_SWATCH[family as ColorFamily];
  const strip = [
    mixColors(base, "#ffffff", 0.55),
    mixColors(base, "#ffffff", 0.28),
    base,
    mixColors(base, "#000000", 0.22),
    mixColors(base, "#000000", 0.45),
  ];
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Library", href: "/colors" },
    { name: label, href: `/colors/family/${family}` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
          Color family
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {label} Colors
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">{psychologyForFamily(family)}</p>
      </header>

      <div className="card-lift mt-8 overflow-hidden rounded-[1.75rem] border border-border/50">
        <PaletteStrip colors={strip} height="md" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {colors.map((c, index) => (
          <div
            key={c.slug}
            className="animate-rise"
            style={{ animationDelay: `${Math.min(index, 24) * 22}ms` }}
          >
            <LibraryColorCard
              href={`/colors/${c.slug}`}
              hex={c.hex}
              name={c.name}
              meta={c.sources.slice(0, 2).join(" · ")}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
