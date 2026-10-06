import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getColorBySlug, getAllLibraryColors } from "@/lib/data/color-library";
import { ColorDetailView } from "@/components/library/color-detail-view";
import { findSimilarColors } from "@/lib/colors/spaces";
import { maybeStaticParams } from "@/lib/static-params";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return maybeStaticParams(
    getAllLibraryColors()
      .filter((c) => !c.sources.includes("generated"))
      .map((c) => ({ slug: c.slug }))
  );
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

  const all = getAllLibraryColors();
  const pool = all.map((c) => c.hex);
  const similar = findSimilarColors(color.hex, pool, 12)
    .map((hex) => all.find((c) => c.hex.toLowerCase() === hex.toLowerCase()))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => ({ slug: c.slug, name: c.name, hex: c.hex }));

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Library", href: "/colors" },
    { name: color.name, href: `/colors/${color.slug}` },
  ];
  const faqs = [
    {
      question: `What is the HEX code for ${color.name}?`,
      answer: `${color.name} uses ${color.hex}. Copy HEX for design tools, or the CSS variable and Tailwind token from this page. Verify 14px text contrast before using it as body copy on white.`,
    },
    {
      question: `Which color family does ${color.name} belong to?`,
      answer: `${color.name} is in the ${color.family} family. Use the tints for surfaces and the shades for icons; the family psychology note is a starting mood, not a license to skip WCAG.`,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />
      <div className="mt-4">
        <ColorDetailView
          name={color.name}
          hex={color.hex}
          family={color.family}
          sources={color.sources}
          similar={similar}
          sharePath={`/colors/${color.slug}`}
        />
      </div>
    </div>
  );
}
