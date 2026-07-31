import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import {
  BRANDS,
  brandAllColors,
  getBrandBySlug,
  getRelatedBrands,
} from "@/lib/data/brands";
import { analyzeColor } from "@/lib/colors/spaces";
import { ColorSwatch } from "@/components/color/color-swatch";
import { CopyButton } from "@/components/color/copy-button";
import { CodeExportPanel } from "@/components/library/code-export-panel";
import { ShareButtons } from "@/components/library/share-buttons";
import { PaletteStrip } from "@/components/library/palette-strip";
import { BrandCard } from "@/components/library/brand-card";
import { Card, CardContent } from "@/components/ui/card";

export function generateStaticParams() {
  return BRANDS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) return {};
  return createPageMetadata({
    title: `${brand.name} Brand Colors`,
    description: `${brand.name} color palette with HEX, RGB, CMYK, CSS variables, Tailwind classes, and downloads. ${brand.overview}`,
    path: `/brands/${brand.slug}`,
    keywords: [`${brand.name} colors`, `${brand.name} hex`, `${brand.name} brand palette`],
  });
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) notFound();
  const colors = brandAllColors(brand);
  const related = getRelatedBrands(brand);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Brands", href: "/brands" },
    { name: brand.name, href: `/brands/${brand.slug}` },
  ];
  const faqs = [
    {
      question: `What are ${brand.name}'s primary brand colors?`,
      answer: `${brand.name} primary colors include ${brand.primary.join(", ")}.`,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
            {brand.category}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {brand.name} Brand Colors
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">{brand.overview}</p>
        </div>
        <ShareButtons title={`${brand.name} colors`} path={`/brands/${brand.slug}`} />
      </div>

      <div className="card-lift mb-8 overflow-hidden rounded-[1.75rem] border border-border/50 shadow-sm">
        <PaletteStrip colors={colors} height="lg" />
      </div>

      <h2 className="font-display text-2xl font-semibold tracking-tight">Primary colors</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {brand.primary.map((hex, index) => {
          const a = analyzeColor(hex);
          return (
            <Card
              key={`${brand.slug}-primary-${hex}-${index}`}
              className="card-lift overflow-hidden rounded-3xl border-border/50"
            >
              <div
                className="h-28 transition-[filter] duration-500 group-hover:brightness-105"
                style={{ backgroundColor: hex }}
              />
              <CardContent className="space-y-2 pt-4 text-sm">
                <p className="font-mono text-base font-semibold tracking-tight">{a.hex}</p>
                <p className="text-muted-foreground">
                  RGB {a.rgb.r}, {a.rgb.g}, {a.rgb.b}
                </p>
                <p className="text-muted-foreground">{a.cmyk}</p>
                <p className="font-mono text-xs text-muted-foreground">{a.cssVar}</p>
                <p className="font-mono text-xs text-muted-foreground">bg-{a.tailwind}</p>
                <CopyButton value={a.hex} label="Copy HEX" className="w-full" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">Secondary colors</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {brand.secondary.map((hex, index) => (
          <Link
            key={`${brand.slug}-secondary-${hex}-${index}`}
            href={`/color/${hex.slice(1)}`}
            className="card-lift block overflow-hidden rounded-3xl"
          >
            <ColorSwatch hex={hex} size="lg" />
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <CodeExportPanel colors={colors} name={brand.slug} />
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 font-display text-xl font-semibold tracking-tight">Related brands</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((b) => (
              <BrandCard
                key={b.slug}
                slug={b.slug}
                name={b.name}
                overview={b.overview}
                category={b.category}
                colors={brandAllColors(b)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
