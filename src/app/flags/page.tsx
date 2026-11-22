import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SwatchCardBrowser } from "@/components/library/swatch-card-browser";
import { CollectionHero } from "@/components/library/collection-hero";
import { flagImage, getAllFlags, getIndexableFlags } from "@/lib/data/flags";
import { createPageMetadata } from "@/lib/seo";
import { letterOf } from "@/lib/utils";

export const metadata: Metadata = createPageMetadata({
  title: "Flag Colors – HEX, RGB & CMYK Codes by Country",
  description: "Flag color codes by country.",
  path: "/flags",
  noIndex: getIndexableFlags().length === 0,
});

export default function FlagsHub() {
  const flags = getAllFlags();
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Flag Colors", href: "/flags" },
  ];
  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <Breadcrumbs items={crumbs} withJsonLd />
      <CollectionHero
        eyebrow="Flag colors"
        title="Flag Colors by Country"
        stripe={["#FF671F", "#C8102E", "#012169", "#009440", "#FFCB00", "#000000", "#FFFFFF"]}
      >
        HEX, RGB and CMYK codes for {flags.length} national and regional flags, each with a ready color palette. Search by
        country or paste a HEX code to find flags that use it. National specifications usually define flag colors with
        Pantone, dyes or CIE values, so every page names the source of its screen values.
      </CollectionHero>
      <div className="mt-8">
        <SwatchCardBrowser
          placeholder="Search a country or HEX (e.g. #FF9933)"
          items={flags.map((f) => ({
            href: `/flags/${f.slug}`,
            title: f.country,
            image: { src: flagImage(f.code, 320), alt: `Flag of ${f.country}` },
            colors: f.colors.map((c) => c.hex),
            letter: letterOf(f.country),
          }))}
        />
      </div>
    </div>
  );
}
