import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd, brandPaletteJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import {
  BRANDS,
  brandAllColors,
  getBrandBySlug,
  getRelatedBrands,
} from "@/lib/data/brands";
import { analyzeColor, getShades, getTints } from "@/lib/colors/spaces";
import { getTextColor } from "@/lib/colors/convert";
import { CopyButton } from "@/components/color/copy-button";
import { CodeExportPanel } from "@/components/library/code-export-panel";
import { ShareButtons } from "@/components/library/share-buttons";
import { BrandCard } from "@/components/library/brand-card";
import { BrandLogo } from "@/components/library/brand-logo";
import { BrandPaletteDownload } from "@/components/library/brand-palette-download";
import { BrandScaleRow } from "@/components/library/brand-scale-row";
import { BrandHexChip } from "@/components/library/brand-hex-chip";
import { maybeStaticParams } from "@/lib/static-params";

export const dynamicParams = true;

export function generateStaticParams() {
  return maybeStaticParams(BRANDS.map((b) => ({ slug: b.slug })));
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
    title: `${brand.name} Hex Colors & Brand Color Codes`,
    description: `${brand.name} brand hex colors: ${brandAllColors(brand).join(", ")}. Copy HEX, RGB, CMYK, CSS variables, and Tailwind classes for the ${brand.name} logo and UI.`,
    path: `/brands/${brand.slug}`,
    keywords: [
      `${brand.name} colors`,
      `${brand.name} hex`,
      `${brand.name} hex color`,
      `${brand.name} color code`,
      `${brand.name} logo color`,
      `${brand.name} brand palette`,
      ...brandAllColors(brand),
    ],
  });
}

function uniqueColors(list: string[]) {
  const seen = new Set<string>();
  return list.filter((hex) => {
    const key = hex.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) notFound();
  const colors = uniqueColors(brandAllColors(brand));
  const related = getRelatedBrands(brand);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Brands", href: "/brands" },
    { name: brand.name, href: `/brands/${brand.slug}` },
  ];
  const faqs = [
    {
      question: `What are ${brand.name}'s brand hex colors?`,
      answer: `${brand.name} brand hex colors are ${colors.join(", ")}. Primary colors: ${brand.primary.join(", ")}.`,
    },
    {
      question: `What is the ${brand.name} logo color code?`,
      answer: `The main ${brand.name} logo / primary hex color${brand.primary.length === 1 ? " is" : "s are"} ${brand.primary.join(", ")}.`,
    },
    {
      question: `Can I download the ${brand.name} color palette?`,
      answer: `Yes. Download the ${brand.name} palette as PNG, SVG, CSS, JSON, or Tailwind from this page, then copy tints and shades for each brand hex.`,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          faqJsonLd(faqs),
          brandPaletteJsonLd({
            name: brand.name,
            slug: brand.slug,
            description: `${brand.name} brand hex color codes: ${colors.join(", ")}.`,
            colors,
          }),
        ]}
      />
      <Breadcrumbs items={crumbs} />

      <header className="mt-4 overflow-hidden rounded-[1.75rem] border border-border/50 bg-white shadow-sm dark:bg-card">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="flex h-40 w-40 items-center justify-center rounded-3xl bg-muted/40">
            <BrandLogo slug={brand.slug} name={brand.name} colors={colors} size="xl" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
              {brand.category}
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {brand.name} Hex Colors
            </h1>
            <p className="mt-3 max-w-3xl text-muted-foreground">
              {brand.overview} Official {brand.name} hex color codes: {colors.join(", ")}.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <BrandPaletteDownload name={brand.name} colors={colors} />
            <ShareButtons title={`${brand.name} colors`} path={`/brands/${brand.slug}`} />
          </div>
        </div>
        <div className="flex min-h-[5.5rem]">
          {colors.map((hex, i) => (
            <BrandHexChip key={`${brand.slug}-hero-${hex}-${i}`} hex={hex} />
          ))}
        </div>
      </header>

      <section className="mt-12 space-y-10">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">All {brand.name} colors</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every brand hex with tints and shades. Click a swatch to copy, or open the dedicated color page.
          </p>
        </div>

        {colors.map((hex, index) => {
          const a = analyzeColor(hex);
          const role = brand.primary.some((c) => c.toLowerCase() === hex.toLowerCase())
            ? "Primary"
            : "Secondary";
          const tints = getTints(hex, 8);
          const shades = [...getShades(hex, 8)].reverse();
          return (
            <article
              key={`${brand.slug}-color-${hex}-${index}`}
              className="overflow-hidden rounded-[1.5rem] border border-border/50 bg-white shadow-sm dark:bg-card"
            >
              <div className="grid lg:grid-cols-[minmax(0,280px)_1fr]">
                <Link
                  href={`/brands/${brand.slug}/${a.hex.slice(1).toLowerCase()}`}
                  className="flex min-h-44 items-end p-5 transition-opacity hover:opacity-95"
                  style={{ backgroundColor: hex, color: getTextColor(hex) }}
                >
                  <span className="font-mono text-2xl font-semibold tracking-tight">{a.hex}</span>
                </Link>
                <div className="space-y-4 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                        {role} color
                      </p>
                      <h3 className="mt-1 font-display text-xl font-semibold">{brand.name} {a.hex}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        RGB {a.rgb.r}, {a.rgb.g}, {a.rgb.b} · {a.cmyk}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <CopyButton value={a.hex} label="Copy HEX" />
                      <Link
                        href={`/brands/${brand.slug}/${a.hex.slice(1).toLowerCase()}`}
                        className="inline-flex h-8 items-center rounded-md border border-input px-3 text-xs font-medium hover:bg-accent"
                      >
                        Color page
                      </Link>
                    </div>
                  </div>
                  <BrandScaleRow label="Tints" colors={tints} />
                  <BrandScaleRow label="Shades" colors={shades} />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <div className="mt-12">
        <CodeExportPanel colors={colors} name={brand.slug} />
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 font-display text-xl font-semibold tracking-tight">Related brands</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
