import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getAllNamedColors, getNamedColor } from "@/lib/data/color-names";
import { ColorDetailView } from "@/components/library/color-detail-view";
import { getTints, getTones, findSimilarColors } from "@/lib/colors/spaces";
import { LibraryColorCard } from "@/components/library/library-color-card";
import { PaletteStrip } from "@/components/library/palette-strip";
import { FAMILY_LABELS, type ColorFamily } from "@/lib/data/families";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamicParams = true;

export function generateStaticParams() {
  return getAllNamedColors().slice(0, 250).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const color = getNamedColor(slug);
  if (!color) return {};
  return createPageMetadata({
    title: `${color.name} Color Name`,
    description: `${color.name} (${color.hex}) — meaning, history, usage, HEX, RGB, HSL, CMYK, tints, and related shades.`,
    path: `/color-names/${color.slug}`,
    keywords: [color.name, `${color.name} hex`, color.family],
  });
}

export default async function NamedColorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const color = getNamedColor(slug);
  if (!color) notFound();
  const pool = getAllNamedColors().map((c) => c.hex);
  const similar = findSimilarColors(color.hex, pool, 8);
  const relatedShades = [...getTints(color.hex, 4), ...getTones(color.hex, 4)];
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Names", href: "/color-names" },
    { name: color.name, href: `/color-names/${color.slug}` },
  ];
  const faqs = [
    {
      question: `What does the color ${color.name} mean?`,
      answer: color.meaning,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />

      <header className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
          {FAMILY_LABELS[color.family as ColorFamily] ?? color.family}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {color.name}
        </h1>
        <p className="mt-3 font-mono text-sm text-muted-foreground">{color.hex}</p>
      </header>

      <div className="card-lift mb-8 overflow-hidden rounded-[1.75rem] border border-border/50">
        <PaletteStrip colors={[color.hex, ...relatedShades.slice(0, 5)]} height="lg" />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        {[
          ["Meaning", color.meaning],
          ["History", color.history],
          ["Usage", color.usage],
        ].map(([title, body]) => (
          <Card key={title} className="card-lift rounded-3xl border-border/50">
            <CardHeader>
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">{body}</CardContent>
          </Card>
        ))}
      </div>

      <ColorDetailView name={color.name} hex={color.hex} family={color.family} />

      <section className="mt-12">
        <h2 className="mb-5 font-display text-xl font-semibold tracking-tight">
          Related shades & tints
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
        <h2 className="mb-5 font-display text-xl font-semibold tracking-tight">Similar colors</h2>
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

      <p className="mt-10 text-sm text-muted-foreground">
        Browse more in the{" "}
        <Link href="/color-names" className="text-primary underline-offset-4 hover:underline">
          color name library
        </Link>
        .
      </p>
    </div>
  );
}
