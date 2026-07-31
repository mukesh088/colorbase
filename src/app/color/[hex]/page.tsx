import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ColorDetailView } from "@/components/library/color-detail-view";
import { getColorByHex, getAllLibraryColors } from "@/lib/data/color-library";
import { isValidHex, normalizeHex } from "@/lib/colors/convert";
import { familyFromHex } from "@/lib/colors/spaces";

export const dynamicParams = true;

export function generateStaticParams() {
  return getAllLibraryColors()
    .slice(0, 200)
    .map((c) => ({ hex: c.hex.slice(1) }));
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
  return createPageMetadata({
    title: `${name} — ${value}`,
    description: `Color details for ${value}: HEX, RGB, HSL, LAB, OKLCH, CMYK, Tailwind class, CSS variables, tints, shades, and contrast.`,
    path: `/color/${hex}`,
    keywords: [value, name, "color hex", "oklch"],
  });
}

export default async function HexColorPage({ params }: { params: Promise<{ hex: string }> }) {
  const { hex } = await params;
  if (!isValidHex(hex)) notFound();
  const value = normalizeHex(hex);
  const known = getColorByHex(value);
  const name = known?.name ?? value.toUpperCase();
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Colors", href: "/colors" },
    { name: name, href: `/color/${hex}` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mb-6 font-display text-4xl font-semibold">{name}</h1>
      <ColorDetailView
        name={name}
        hex={value}
        family={known?.family ?? familyFromHex(value)}
        sources={known?.sources}
      />
    </div>
  );
}
