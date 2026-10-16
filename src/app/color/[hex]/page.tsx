import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ColorDetailView } from "@/components/library/color-detail-view";
import { getColorByHex, getAllLibraryColors } from "@/lib/data/color-library";
import { getBrandsUsingHex, brandAllColors } from "@/lib/data/brands";
import { getCssNamedColors } from "@/lib/data/color-names";
import { BrandCard } from "@/components/library/brand-card";
import { isValidHex, normalizeHex } from "@/lib/colors/convert";
import { familyFromHex, findSimilarColors } from "@/lib/colors/spaces";
import { getHexReference } from "@/lib/data/hex-references";
import { ToolCtaRow } from "@/components/library/tool-cta-row";

// All RGB colors share this page. Never prebuild or persist HTML/RSC per HEX,
// including when PREBUILD_LIBRARY_PAGES is enabled for the finite catalogs.
export const dynamic = "force-dynamic";
export const dynamicParams = true;

function resolveHex(hex: string) {
  if (!isValidHex(hex)) notFound();
  const value = normalizeHex(hex);
  if (hex !== value.slice(1)) permanentRedirect(`/color/${value.slice(1)}`);
  return value;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hex: string }>;
}): Promise<Metadata> {
  const { hex } = await params;
  const value = resolveHex(hex);
  const reference = getHexReference(value);
  const known = getColorByHex(value);
  const name = known?.name ?? reference?.name ?? value.toUpperCase();
  const brands = getBrandsUsingHex(value);
  const brandNames = brands.map((b) => b.name).slice(0, 4);
  const curated =
    Boolean(reference) ||
    Boolean(known && !known.sources.includes("generated")) ||
    brands.length > 0 ||
    getCssNamedColors().some((c) => c.hex.toLowerCase() === value.toLowerCase());
  const title = `${value.toUpperCase()} Color — RGB, HSL, OKLCH, Shades, Palettes & Code`;
  const description =
    reference?.summary ??
    (brandNames.length
      ? `${value.toUpperCase()} is a brand hex color used by ${brandNames.join(", ")}. Copy HEX, RGB, HSL, LAB, OKLCH, CMYK, CSS, and nearest Tailwind.`
      : `Color details for ${value.toUpperCase()}: HEX, RGB, HSL, LAB, OKLCH, CMYK, nearest Tailwind token, CSS variables, tints, shades, and contrast.`);
  return createPageMetadata({
    title,
    description,
    path: `/color/${value.slice(1)}`,
    keywords: [value, name, "color hex", "hex color code", ...brandNames.map((n) => `${n} hex`)],
    noIndex: !curated,
  });
}

export default async function HexColorPage({ params }: { params: Promise<{ hex: string }> }) {
  const { hex } = await params;
  const value = resolveHex(hex);
  const reference = getHexReference(value);
  const known = getColorByHex(value);
  const name = known?.name ?? reference?.name ?? value.toUpperCase();
  const all = getAllLibraryColors();
  const similar = findSimilarColors(
    value,
    all.map((c) => c.hex),
    12
  )
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
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <div className="mt-4">
        <ColorDetailView
          name={name}
          hex={value}
          family={known?.family ?? reference?.family ?? familyFromHex(value)}
          sources={known?.sources}
          similar={similar}
          sharePath={`/color/${hex}`}
        />
      </div>
      {reference && (
        <section className="border-border bg-card mt-8 rounded-2xl border p-5 sm:p-7">
          <h2 className="font-display text-xl font-semibold">Using {reference.hex} in a theme</h2>
          <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-relaxed">
            {reference.summary}
          </p>
          <ul className="text-muted-foreground mt-4 max-w-3xl list-disc space-y-2 pl-5 text-sm leading-relaxed">
            {reference.usage.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <ToolCtaRow hex={reference.hex} className="mt-5 flex flex-wrap gap-2" />
        </section>
      )}
      {brands.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display mb-2 text-xl font-semibold tracking-tight">
            Brands using {value}
          </h2>
          <p className="text-muted-foreground mb-5 text-sm">
            {value} appears in {brands.length} brand palette{brands.length === 1 ? "" : "s"}.
            {brands.length > 12
              ? " Showing 12 references below. Search the brand library by HEX to find more."
              : " Explore the references below."}
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {brands.slice(0, 12).map((b) => (
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
