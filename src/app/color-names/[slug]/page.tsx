import { ToolFaqs } from "@/components/layout/tool-faqs";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd, namedColorJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getCssNamedColors, getNamedColor } from "@/lib/data/color-names";
import { ColorDetailView } from "@/components/library/color-detail-view";
import { getTints, getTones, findSimilarColors } from "@/lib/colors/spaces";
import { formatRgb, hexToRgb } from "@/lib/colors/convert";
import { LibraryColorCard } from "@/components/library/library-color-card";
import { PaletteStrip } from "@/components/library/palette-strip";
import { FAMILY_LABELS, type ColorFamily } from "@/lib/data/families";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToolCtaRow } from "@/components/library/tool-cta-row";
import { ColorCatalogBrief } from "@/components/library/color-catalog-brief";
import { ColorSwatchImage } from "@/components/library/color-swatch-image";
import { COLOR_AUTHORITY_LINKS } from "@/lib/seo/color-brief";

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return getCssNamedColors().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const color = getNamedColor(slug);
  if (!color) notFound();
  const label = color.displayName;
  const hex = color.hex.toUpperCase();
  return createPageMetadata({
    title: `${label} Color Hex Code ${hex}`,
    description: `${label} color hex code is ${hex}. Copy HEX, RGB, HSL, and CSS. ${color.source === "css" ? `CSS keyword: ${color.name.toLowerCase()}.` : "Attributed color-name reference with preview, shades, harmonies, and contrast."}`,
    path: `/color-names/${color.slug}`,
    keywords: [
      `${label} color`,
      `${label.toLowerCase()} color`,
      `${label} hex`,
      `${label} color code`,
      `${label} colour`,
      `${color.name.toLowerCase()} color`,
      hex,
      color.hex,
    ],
    noIndex: color.source === "catalog",
  });
}

export default async function NamedColorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const color = getNamedColor(slug);
  if (!color) notFound();
  const label = color.displayName;
  const hexUpper = color.hex.toUpperCase();
  const rgbLabel = formatRgb(hexToRgb(color.hex));
  const pool = getCssNamedColors().map((c) => c.hex);
  const similar = findSimilarColors(color.hex, pool, 8);
  const relatedShades = [...getTints(color.hex, 4), ...getTones(color.hex, 4)];
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Names", href: "/color-names" },
    { name: `${label} color`, href: `/color-names/${color.slug}` },
  ];
  const faqs = [
    {
      question: `What is ${label} color?`,
      answer: `${label} color is a ${color.family} named color. The ${label} color hex code is ${hexUpper} (${rgbLabel}). ${color.meaning}`,
    },
    {
      question: `What is the hex code for ${label} color?`,
      answer: `The hex code for ${label} color is ${hexUpper}. ${color.source === "css" ? `In CSS you can also write color: ${color.name.toLowerCase()};` : `Use color: ${color.hex}; in CSS. This catalog name is not a CSS keyword.`}`,
    },
    {
      question: `How do I use ${label} color in CSS?`,
      answer: color.usage,
    },
  ];
  const description = `${label} color hex code is ${hexUpper}. ${color.history}`;

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          faqJsonLd(faqs),
          namedColorJsonLd({
            name: label,
            slug: color.slug,
            hex: hexUpper,
            rgb: rgbLabel,
            description,
          }),
        ]}
      />
      <Breadcrumbs items={crumbs} />

      <header className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-rose-600 uppercase dark:text-rose-400">
          {FAMILY_LABELS[color.family as ColorFamily] ?? color.family}
          {color.source === "css"
            ? " · CSS named color"
            : color.source === "community"
              ? " · Community color name"
              : " · Inspiration name"}
        </p>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
          {label} Color
        </h1>
        <p className="text-muted-foreground mt-3">
          {label} color hex code is{" "}
          <span className="text-foreground font-mono font-semibold">{hexUpper}</span>
          {" · "}
          {rgbLabel}.{" "}
          {color.source === "css" ? (
            <>
              CSS keyword <span className="font-mono">{color.name.toLowerCase()}</span>.
            </>
          ) : (
            "Use its HEX value in CSS; this name is a catalog label."
          )}
        </p>
      </header>

      <div className="mb-6 flex items-center gap-4">
        <ColorSwatchImage
          hex={color.hex}
          name={`${label} color`}
          width={72}
          height={72}
          className="border-border h-[72px] w-[72px] rounded-2xl border"
          priority
        />
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Specs:{" "}
          {COLOR_AUTHORITY_LINKS.slice(0, 2).map((link, index) => (
            <span key={link.href}>
              {index > 0 ? " · " : null}
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                {link.label}
              </a>
            </span>
          ))}
          .
        </p>
      </div>

      <ColorCatalogBrief
        name={`${label} color`}
        hex={color.hex}
        family={color.family}
        path={`/color-names/${color.slug}`}
      />

      <div className="card-lift border-border/50 mb-8 overflow-hidden rounded-[1.75rem] border">
        <PaletteStrip colors={[color.hex, ...relatedShades.slice(0, 5)]} height="lg" />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        {[
          ["Meaning", color.meaning],
          [color.source === "css" ? "History" : "Source", color.history],
          ["Usage", color.usage],
        ].map(([title, body]) => (
          <Card key={title} className="card-lift border-border/50 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm leading-relaxed">
              {body}
            </CardContent>
          </Card>
        ))}
      </div>

      {color.sourceUrl && (
        <p className="text-muted-foreground mb-6 text-sm">
          Name and HEX reference:{" "}
          <a
            href={color.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4"
          >
            Color Names by David Aerne · MIT license
          </a>
          .
        </p>
      )}

      <ToolCtaRow hex={color.hex} className="mb-8 flex flex-wrap gap-2" />

      <ColorDetailView
        name={`${label} color`}
        hex={color.hex}
        family={color.family}
        headingLevel={2}
        sources={[
          color.source === "css"
            ? "CSS named colors"
            : color.source === "community"
              ? "Color Names community dataset"
              : "ColorBase inspiration",
        ]}
        sharePath={`/color-names/${color.slug}`}
      />

      <section className="mt-12">
        <h2 className="font-display mb-5 text-xl font-semibold tracking-tight">
          Related shades & tints of {label} color
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {relatedShades.map((hex, index) => (
            <LibraryColorCard
              key={`${color.slug}-shade-${hex}-${index}`}
              href={`/color/${hex.slice(1)}`}
              hex={hex}
              name={hex}
            />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display mb-5 text-xl font-semibold tracking-tight">Similar colors</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {similar.map((hex, index) => (
            <LibraryColorCard
              key={`${color.slug}-similar-${hex}-${index}`}
              href={`/color/${hex.slice(1)}`}
              hex={hex}
              name={hex}
            />
          ))}
        </div>
      </section>

      <p className="text-muted-foreground mt-10 text-sm">
        Browse more named colors like wheat, salmon, and tomato in the{" "}
        <Link href="/color-names" className="text-primary underline-offset-4 hover:underline">
          color name library
        </Link>
        .
      </p>
      <ToolFaqs faqs={faqs} />
    </div>
  );
}
