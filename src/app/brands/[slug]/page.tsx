import { ToolFaqs } from "@/components/layout/tool-faqs";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd, brandPaletteJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import {
  brandAllColors,
  getBrandBySlug,
  getRelatedBrands,
  isUnverifiedBrandHex,
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
import { ToolCtaRow } from "@/components/library/tool-cta-row";
import { BrandReferenceSource } from "@/components/library/brand-reference-source";

// Catalog size must not create a prebuilt/ISR file for each entry.
export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) notFound();
  const colors = brandAllColors(brand);
  return createPageMetadata({
    title: brand.metaTitle ?? `${brand.name} Hex Colors & Brand Color Codes`,
    description:
      brand.metaDescription ??
      `${brand.name} brand hex colors: ${colors.join(", ")}. Copy HEX, RGB, CMYK, CSS variables, and Tailwind classes for the ${brand.name} logo and UI.`,
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
  const indexableColors = colors.filter((hex) => !isUnverifiedBrandHex(brand, hex));
  const faqs = [
    {
      question: `What are ${brand.name}'s brand hex colors?`,
      answer: `${brand.name} reference colors are ${colors.join(", ")}. Primary colors: ${brand.primary.join(", ")}.${
        brand.unverified?.length
          ? " Swatches marked unverified are estimates, not published guideline colors."
          : " Treat them as commonly published brand colors, not a legal specification."
      }`,
    },
    {
      question: `What is the ${brand.name} logo color code?`,
      answer: isUnverifiedBrandHex(brand, brand.primary[0] ?? "")
        ? `The displayed ${brand.name} primary ${brand.primary.join(", ")} is an unverified estimate. Confirm it against the brand's own guidelines before treating it as a logo color.`
        : `The main ${brand.name} logo / primary hex color${brand.primary.length === 1 ? " is" : "s are"} ${brand.primary.join(", ")}.`,
    },
    {
      question: `Can I download the ${brand.name} color palette?`,
      answer: `Yes. Download the ${brand.name} palette as PNG, SVG, CSS, JSON, or Tailwind from this page, then copy tints and shades for each brand hex.`,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 pb-28 sm:px-4 sm:py-8 sm:pb-10 lg:px-6">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          faqJsonLd(faqs),
          ...(indexableColors.length
            ? [
                brandPaletteJsonLd({
                  name: brand.name,
                  slug: brand.slug,
                  description: `${brand.name} brand hex color codes: ${indexableColors.join(", ")}.`,
                  colors: indexableColors,
                }),
              ]
            : []),
        ]}
      />
      <Breadcrumbs items={crumbs} />
      <BrandReferenceSource brand={brand} />

      <header className="border-border/50 dark:bg-card mt-4 overflow-hidden rounded-[1.75rem] border bg-white shadow-sm">
        <div className="grid gap-6 p-4 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="bg-muted/40 flex h-28 w-28 items-center justify-center rounded-3xl sm:h-40 sm:w-40">
            <BrandLogo
              slug={brand.slug}
              name={brand.name}
              colors={colors}
              size="xl"
              logoUrl={brand.logoUrl}
              priority
              className="h-24 w-24 sm:h-36 sm:w-36"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.16em] text-rose-600 uppercase dark:text-rose-400">
              {brand.category}
            </p>
            <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              {brand.name} Hex Colors
            </h1>
            <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-relaxed sm:text-base">
              {brand.overview} Commonly published {brand.name} hex values: {colors.join(", ")}.
              These are curated reference swatches, not a substitute for the brand&apos;s official
              guidelines.
            </p>
            {brand.websiteUrl ? (
              <a
                href={brand.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary mt-3 inline-flex text-sm font-medium underline-offset-4 hover:underline"
              >
                Visit {brand.name}
              </a>
            ) : null}
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <BrandPaletteDownload name={brand.name} colors={colors} />
            <ShareButtons title={`${brand.name} colors`} path={`/brands/${brand.slug}`} />
          </div>
        </div>
        <div className="flex min-h-16 overflow-x-auto">
          {colors.map((hex, i) => (
            <BrandHexChip
              key={`${brand.slug}-hero-${hex}-${i}`}
              hex={hex}
              estimated={isUnverifiedBrandHex(brand, hex)}
              className="min-w-[4.75rem] flex-none"
            />
          ))}
        </div>
      </header>

      <section className="border-border/50 bg-background/80 mt-8 rounded-[1.35rem] border p-5 sm:rounded-[1.75rem] sm:p-7">
        <p className="text-xs font-semibold tracking-[0.14em] text-rose-600 uppercase dark:text-rose-400">
          Using {brand.name} in UI
        </p>
        <h2 className="font-display mt-1 text-xl font-semibold tracking-tight">
          Logo hex vs product ramp
        </h2>
        <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-relaxed sm:text-base">
          Keep {brand.primary[0] ?? colors[0]} for the mark and a single CTA if it passes contrast.
          Use the tints below for surfaces and the shades for icons on light canvases. Logo colors
          are rarely safe as 14px body text on white — check the pair before a marketing page floods
          every surface with the brand fill.
        </p>
        <ToolCtaRow hex={brand.primary[0] ?? colors[0]} className="mt-5 flex flex-wrap gap-2" />
      </section>

      <section className="mt-12 space-y-10">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            All {brand.name} colors
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Every brand hex with tints and shades. Click a swatch to copy. Verified colors also have
            a dedicated page.
          </p>
        </div>

        {colors.map((hex, index) => {
          const a = analyzeColor(hex);
          const role = brand.primary.some((c) => c.toLowerCase() === hex.toLowerCase())
            ? "Primary"
            : "Secondary";
          const estimated = isUnverifiedBrandHex(brand, hex);
          const tints = getTints(hex, 8);
          const shades = [...getShades(hex, 8)].reverse();
          return (
            <article
              key={`${brand.slug}-color-${hex}-${index}`}
              className="border-border/50 dark:bg-card overflow-hidden rounded-[1.5rem] border bg-white shadow-sm"
            >
              <div className="grid lg:grid-cols-[minmax(0,280px)_1fr]">
                {estimated ? (
                  <div
                    className="flex min-h-36 items-end p-5 sm:min-h-44"
                    style={{ backgroundColor: hex, color: getTextColor(hex) }}
                  >
                    <span className="font-mono text-2xl font-semibold tracking-tight">{a.hex}</span>
                  </div>
                ) : (
                  <Link
                    href={`/brands/${brand.slug}/${a.hex.slice(1).toLowerCase()}`}
                    className="flex min-h-36 items-end p-5 transition-opacity hover:opacity-95 sm:min-h-44"
                    style={{ backgroundColor: hex, color: getTextColor(hex) }}
                  >
                    <span className="font-mono text-2xl font-semibold tracking-tight">{a.hex}</span>
                  </Link>
                )}
                <div className="space-y-4 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.14em] text-rose-600 uppercase dark:text-rose-400">
                        {estimated ? "Unverified estimate" : `${role} color`}
                      </p>
                      <h3 className="font-display mt-1 text-xl font-semibold">
                        {brand.name} {a.hex}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        RGB {a.rgb.r}, {a.rgb.g}, {a.rgb.b} · {a.cmyk}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <CopyButton value={a.hex} label="Copy HEX" />
                      {estimated ? null : (
                        <Link
                          href={`/brands/${brand.slug}/${a.hex.slice(1).toLowerCase()}`}
                          className="border-input hover:bg-accent inline-flex h-11 items-center rounded-md border px-3 text-xs font-medium sm:h-8"
                        >
                          Color page
                        </Link>
                      )}
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
          <h2 className="font-display mb-5 text-xl font-semibold tracking-tight">Related brands</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((b) => (
              <BrandCard
                key={b.slug}
                slug={b.slug}
                name={b.name}
                overview={b.overview}
                category={b.category}
                colors={brandAllColors(b)}
                logoUrl={b.logoUrl}
                unverified={b.unverified}
              />
            ))}
          </div>
        </section>
      )}
      <ToolFaqs faqs={faqs} />
    </div>
  );
}
