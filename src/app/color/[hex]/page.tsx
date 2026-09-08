import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ColorDetailView } from "@/components/library/color-detail-view";
import { getColorByHex, getAllLibraryColors } from "@/lib/data/color-library";
import { getBrandsUsingHex, brandAllColors, getAllBrandHexEntries } from "@/lib/data/brands";
import { getCssNamedColors } from "@/lib/data/color-names";
import { BrandCard } from "@/components/library/brand-card";
import { isValidHex, normalizeHex } from "@/lib/colors/convert";
import { familyFromHex, findSimilarColors } from "@/lib/colors/spaces";

export const dynamicParams = true;

export function generateStaticParams() {
  const hexes = new Set<string>();
  for (const c of getCssNamedColors()) hexes.add(c.hex.slice(1).toLowerCase());
  for (const e of getAllBrandHexEntries()) hexes.add(e.hexSlug);
  return [...hexes].map((hex) => ({ hex }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hex: string }>;
}): Promise<Metadata> {
  const { hex } = await params;
  if (!isValidHex(hex)) return {};
  const value = normalizeHex(hex);
  const known = getColorByHex(value);
  const name = known?.name ?? value.toUpperCase();
  const brands = getBrandsUsingHex(value);
  const brandNames = brands.map((b) => b.name).slice(0, 4);
  const title = brandNames.length
    ? `${value} Hex Color — ${brandNames.join(", ")}`
    : `${name} — ${value}`;
  const description = brandNames.length
    ? `${value} is a brand hex color used by ${brandNames.join(", ")}. Copy HEX, RGB, HSL, LAB, OKLCH, CMYK, CSS, and Tailwind.`
    : `Color details for ${value}: HEX, RGB, HSL, LAB, OKLCH, CMYK, Tailwind class, CSS variables, tints, shades, and contrast.`;
  return createPageMetadata({
    title,
    description,
    path: `/color/${hex}`,
    keywords: [value, name, "color hex", "hex color code", ...brandNames.map((n) => `${n} hex`)],
  });
}

export default async function HexColorPage({ params }: { params: Promise<{ hex: string }> }) {
  const { hex } = await params;
  if (!isValidHex(hex)) notFound();
  const value = normalizeHex(hex);
  const known = getColorByHex(value);
  const name = known?.name ?? value.toUpperCase();
  const all = getAllLibraryColors();
  const similar = findSimilarColors(value, all.map((c) => c.hex), 12)
    .map((h) => all.find((c) => c.hex.toLowerCase() === h.toLowerCase()))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => ({ slug: c.slug, name: c.name, hex: c.hex }));
  const brands = getBrandsUsingHex(value);

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Colors", href: "/colors" },
    { name: name, href: `/color/${hex}` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <div className="mt-4">
        <ColorDetailView
          name={name}
          hex={value}
          family={known?.family ?? familyFromHex(value)}
          sources={known?.sources}
          similar={similar}
          sharePath={`/color/${hex}`}
        />
      </div>
      {brands.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-2 font-display text-xl font-semibold tracking-tight">
            Brands using {value}
          </h2>
          <p className="mb-5 text-sm text-muted-foreground">
            {value} appears in {brands.length} brand palette{brands.length === 1 ? "" : "s"}:{" "}
            {brands.map((b) => b.name).join(", ")}.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((b) => (
              <BrandCard
                key={b.slug}
                slug={b.slug}
                name={b.name}
                overview={b.overview}
                category={b.category}
                colors={brandAllColors(b)}
                hexHref={`/brands/${b.slug}/${value.slice(1).toLowerCase()}`}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
