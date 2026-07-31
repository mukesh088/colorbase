import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getColorBySlug, getAllLibraryColors } from "@/lib/data/color-library";
import { ColorDetailView } from "@/components/library/color-detail-view";
import { findSimilarColors } from "@/lib/colors/spaces";
import { ColorSwatch } from "@/components/color/color-swatch";
import Link from "next/link";

export const dynamicParams = true;

export function generateStaticParams() {
  return getAllLibraryColors()
    .filter((c) => !c.sources.includes("generated"))
    .slice(0, 400)
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const color = getColorBySlug(slug);
  if (!color) return {};
  return createPageMetadata({
    title: `${color.name} Color — ${color.hex}`,
    description: `${color.name} color codes: HEX ${color.hex}, RGB, HSL, LAB, OKLCH, CMYK, Tailwind, CSS variables, tints, shades, and accessibility.`,
    path: `/colors/${color.slug}`,
    keywords: [color.name, color.hex, `${color.name} hex`, `${color.family} color`],
  });
}

export default async function ColorSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const color = getColorBySlug(slug);
  if (!color) notFound();
  const pool = getAllLibraryColors().map((c) => c.hex);
  const similar = findSimilarColors(color.hex, pool, 8)
    .map((hex) => getAllLibraryColors().find((c) => c.hex.toLowerCase() === hex.toLowerCase()))
    .filter(Boolean);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Library", href: "/colors" },
    { name: color.name, href: `/colors/${color.slug}` },
  ];
  const faqs = [
    {
      question: `What is the HEX code for ${color.name}?`,
      answer: `${color.name} uses ${color.hex}.`,
    },
    {
      question: `Which color family does ${color.name} belong to?`,
      answer: `${color.name} is categorized in the ${color.family} family.`,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mb-6 font-display text-4xl font-semibold">{color.name}</h1>
      <ColorDetailView name={color.name} hex={color.hex} family={color.family} sources={color.sources} />
      <section className="mt-10">
        <h2 className="mb-3 font-display text-xl font-semibold">Similar & related colors</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {similar.map((c) =>
            c ? (
              <Link key={c.slug} href={`/colors/${c.slug}`}>
                <ColorSwatch hex={c.hex} name={c.name} size="sm" />
              </Link>
            ) : null
          )}
        </div>
      </section>
    </div>
  );
}
