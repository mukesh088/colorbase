import type { Metadata } from "next";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import {
  COLOR_FAMILIES,
  FAMILY_LABELS,
  FAMILY_SWATCH,
  type ColorFamily,
} from "@/lib/data/families";
import { UI_KITS, getColorsBySource, getLibraryStats } from "@/lib/data/color-library";
import { KitCard, FamilyCard } from "@/components/library/kit-card";
import { mixColors } from "@/lib/colors/convert";

export const metadata: Metadata = createPageMetadata({
  title: "Complete Color Library",
  description:
    "Explore one of the largest color databases: HTML, CSS, SVG, web-safe, Tailwind, Bootstrap, Material, Fluent, Apple, Android, Chakra, Ant Design, Radix, and PrimeReact.",
  path: "/colors",
  keywords: ["color library", "html colors", "tailwind colors", "material colors"],
});

function familyShades(family: ColorFamily) {
  const base = FAMILY_SWATCH[family];
  return [
    mixColors(base, "#ffffff", 0.55),
    mixColors(base, "#ffffff", 0.28),
    base,
    mixColors(base, "#000000", 0.22),
    mixColors(base, "#000000", 0.45),
  ];
}

export default function ColorsHubPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Library", href: "/colors" },
  ];
  const stats = getLibraryStats();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
          Design systems
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Complete Color Library
        </h1>
        <p className="mt-3 text-muted-foreground">
          Browse {stats.total.toLocaleString()}+ colors across {stats.kits} design systems and{" "}
          {stats.families} families. Every color includes HEX, RGB, HSL, LAB, OKLCH, CMYK, exports, and
          harmonies.
        </p>
      </header>

      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Design systems</h2>
          <p className="text-sm text-muted-foreground">{UI_KITS.length} kits</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {UI_KITS.map((kit, index) => {
            const count = getColorsBySource(kit.source).length;
            return (
              <div
                key={kit.slug}
                className="animate-rise"
                style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
              >
                <KitCard
                  href={`/colors/kits/${kit.slug}`}
                  title={kit.title}
                  blurb={kit.blurb}
                  accent={kit.accent}
                  preview={kit.preview}
                  count={count}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-5 flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Color families</h2>
          <p className="text-sm text-muted-foreground">{COLOR_FAMILIES.length} families</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {COLOR_FAMILIES.map((family, index) => (
            <div
              key={family}
              className="animate-rise"
              style={{ animationDelay: `${Math.min(index, 14) * 30}ms` }}
            >
              <FamilyCard
                href={`/colors/family/${family}`}
                label={FAMILY_LABELS[family]}
                swatch={FAMILY_SWATCH[family]}
                shades={familyShades(family)}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
