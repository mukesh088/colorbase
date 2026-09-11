import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd, brandHexJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getAllBrandHexEntries,
  getBrandHexEntry,
  getBrandsUsingHex,
  brandAllColors,
} from "@/lib/data/brands";
import { analyzeColor, getShades, getTints } from "@/lib/colors/spaces";
import { formatRgb, formatHsl, rgbToHsl, hexToRgb } from "@/lib/colors/convert";
import { CopyButton } from "@/components/color/copy-button";
import { CodeExportPanel } from "@/components/library/code-export-panel";
import { ShareButtons } from "@/components/library/share-buttons";
import { BrandCard } from "@/components/library/brand-card";
import { BrandLogo } from "@/components/library/brand-logo";
import { BrandPaletteDownload } from "@/components/library/brand-palette-download";
import { BrandScaleRow } from "@/components/library/brand-scale-row";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllBrandHexEntries().map((e) => ({ slug: e.brand.slug, hex: e.hexSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; hex: string }>;
}): Promise<Metadata> {
  const { slug, hex } = await params;
  const entry = getBrandHexEntry(slug, hex);
  if (!entry) return {};
  const hexDisplay = entry.hex.toUpperCase();
  const { brand } = entry;
  return createPageMetadata({
    title: `${brand.name} Hex Color ${hexDisplay}`,
    description: `${brand.name} ${entry.role} brand hex color ${hexDisplay}. Copy the official ${brand.name} color code in HEX, RGB, HSL, CMYK, CSS, and Tailwind.`,
    path: `/brands/${brand.slug}/${entry.hexSlug}`,
    keywords: [
      `${brand.name} hex`,
      `${brand.name} hex color`,
      `${brand.name} color code`,
      `${brand.name} logo color`,
      `${brand.name} brand color`,
      hexDisplay,
      entry.hex,
      entry.hexSlug,
    ],
  });
}

export default async function BrandHexPage({
  params,
}: {
  params: Promise<{ slug: string; hex: string }>;
}) {
  const { slug, hex } = await params;
  const entry = getBrandHexEntry(slug, hex);
  if (!entry) notFound();

  const { brand, role } = entry;
  const a = analyzeColor(entry.hex);
  const rgbLabel = formatRgb(a.rgb);
  const hslLabel = formatHsl(rgbToHsl(hexToRgb(entry.hex)));
  const palette = brandAllColors(brand);
  const others = palette.filter((c) => c.toLowerCase() !== entry.hex.toLowerCase());
  const alsoUsedBy = getBrandsUsingHex(entry.hex).filter((b) => b.slug !== brand.slug);
  const path = `/brands/${brand.slug}/${entry.hexSlug}`;
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Brands", href: "/brands" },
    { name: brand.name, href: `/brands/${brand.slug}` },
    { name: entry.hex, href: path },
  ];
  const faqs = [
    {
      question: `What is the ${brand.name} hex color code?`,
      answer: `The ${brand.name} ${role} brand hex color is ${entry.hex}. RGB is ${rgbLabel}. HSL is ${hslLabel}.`,
    },
    {
      question: `What RGB values are used for ${brand.name}?`,
      answer: `${brand.name} ${role} color ${entry.hex} is ${rgbLabel}.`,
    },
    {
      question: `Is ${entry.hex} an official ${brand.name} brand color?`,
      answer: `Yes. ${entry.hex} is listed as a ${role} color in the ${brand.name} brand palette on colorBase, alongside ${palette.join(", ")}.`,
    },
  ];
  const description = `${brand.name} uses ${entry.hex} as a ${role} brand color. ${brand.overview}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          faqJsonLd(faqs),
          brandHexJsonLd({
            brandName: brand.name,
            slug: brand.slug,
            hex: entry.hex,
            rgb: rgbLabel,
            hsl: hslLabel,
            role,
            description,
          }),
        ]}
      />
      <Breadcrumbs items={crumbs} />

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex max-w-3xl gap-4">
          <Link
            href={`/brands/${brand.slug}`}
            className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-white sm:flex dark:bg-card"
            aria-label={`${brand.name} palette`}
          >
            <BrandLogo slug={brand.slug} name={brand.name} colors={palette} size="sm" />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
              {brand.name} · {role} brand color
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {brand.name} Hex Color {entry.hex.toUpperCase()}
            </h1>
            <p className="mt-3 text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <BrandPaletteDownload name={brand.name} colors={palette} />
          <ShareButtons title={`${brand.name} hex ${entry.hex}`} path={path} />
        </div>
      </div>

      <div
        className="card-lift mb-8 overflow-hidden rounded-[1.75rem] border border-border/50"
        style={{ backgroundColor: entry.hex, color: a.textOnColor }}
      >
        <div className="flex min-h-[200px] flex-col justify-end p-6 sm:min-h-[240px] sm:p-8">
          <p className="font-mono text-3xl font-semibold tracking-tight sm:text-4xl">{entry.hex.toUpperCase()}</p>
          <p className="mt-1 font-mono text-sm opacity-80">{rgbLabel}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["HEX", entry.hex],
          ["RGB", rgbLabel],
          ["HSL", hslLabel],
          ["CMYK", a.cmyk],
        ].map(([label, value]) => (
          <Card key={label} className="card-lift rounded-3xl border-border/50">
            <CardContent className="space-y-2 pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                {label}
              </p>
              <p className="font-mono text-sm font-semibold">{value}</p>
              <CopyButton value={value} label={`Copy ${label}`} className="w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mt-10 space-y-5 rounded-[1.5rem] border border-border/50 bg-white p-5 dark:bg-card sm:p-6">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Tints and shades of {entry.hex.toUpperCase()}
        </h2>
        <BrandScaleRow label="Tints" colors={getTints(entry.hex, 8)} />
        <BrandScaleRow label="Shades" colors={[...getShades(entry.hex, 8)].reverse()} />
      </section>

      <div className="mt-8 grid gap-3 font-mono text-sm text-muted-foreground sm:grid-cols-2">
        <p>CSS {a.cssVar}</p>
        <p>Tailwind bg-{a.tailwind}</p>
        <p>OKLCH {a.oklch}</p>
        <p>
          <Link href={`/color/${entry.hexSlug}`} className="text-primary underline-offset-4 hover:underline">
            Full color details for {entry.hex}
          </Link>
        </p>
      </div>

      <div className="mt-10">
        <CodeExportPanel colors={[entry.hex]} name={`${brand.slug}-${entry.hexSlug}`} />
      </div>

      {others.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            More {brand.name} hex colors
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The full {brand.name} brand palette includes {palette.join(", ")}.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((color) => (
              <Link
                key={color}
                href={`/brands/${brand.slug}/${color.slice(1).toLowerCase()}`}
                className="card-lift overflow-hidden rounded-3xl border border-border/50"
              >
                <div className="h-20" style={{ backgroundColor: color }} />
                <p className="px-4 py-3 font-mono text-sm font-semibold">{color}</p>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-sm">
            <Link href={`/brands/${brand.slug}`} className="text-primary underline-offset-4 hover:underline">
              View the full {brand.name} brand color palette
            </Link>
          </p>
        </section>
      )}

      {alsoUsedBy.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 font-display text-xl font-semibold tracking-tight">
            Other brands using {entry.hex}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {alsoUsedBy.slice(0, 6).map((b) => (
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
