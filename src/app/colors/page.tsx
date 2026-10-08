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
import { LibraryHero } from "@/components/library/library-hero";
import { LibraryInsight } from "@/components/library/library-insight";
import { mixColors } from "@/lib/colors/convert";
import { kitToDesignPath } from "@/lib/data/design-systems";

export const dynamic = "force-static";

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
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <LibraryHero
        eyebrow="Design systems"
        title="Complete Color Library"
        description={`Browse ${stats.total.toLocaleString("en-US")}+ colors across ${stats.kits} design systems and ${stats.families} families. Every swatch includes HEX, RGB, HSL, OKLCH, contrast, and a job for that exact hex.`}
        stats={[
          { label: "Colors", value: stats.total.toLocaleString("en-US") },
          { label: "Kits", value: String(stats.kits) },
          { label: "Families", value: String(stats.families) },
        ]}
        swatches={["#E11D48", "#7c3aed", "#3b82f6", "#14b8a6", "#f59e0b", "#0f172a"]}
        actions={[
          { href: "/color-picker", label: "Open picker", primary: true },
          { href: "/contrast-checker", label: "Check contrast" },
          { href: "/tailwind-colors", label: "Tailwind scales" },
        ]}
      />

      <div className="mt-8">
        <LibraryInsight id="colors" />
      </div>

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
                  href={kitToDesignPath(kit.slug) ?? `/colors/kits/${kit.slug}`}
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
