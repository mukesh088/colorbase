import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getAllPalettes, getPalette, getRelatedPalettes } from "@/lib/data/palette-library";
import { CodeExportPanel } from "@/components/library/code-export-panel";
import { ShareButtons } from "@/components/library/share-buttons";
import { CopyButton } from "@/components/color/copy-button";
import { Badge } from "@/components/ui/badge";
import { ColorSwatch } from "@/components/color/color-swatch";
import { PaletteStrip } from "@/components/library/palette-strip";
import { PaletteCard } from "@/components/library/palette-card";

export const dynamicParams = true;

export function generateStaticParams() {
  return getAllPalettes().slice(0, 240).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getPalette(slug);
  if (!p) return {};
  return createPageMetadata({
    title: `${p.name}`,
    description: `${p.name} — ${p.colors.join(", ")}. Accessibility score ${p.accessibilityScore}. Export CSS, Tailwind, Flutter, and more.`,
    path: `/palette-library/${p.slug}`,
    keywords: [p.name, `${p.category} palette`, "color scheme"],
  });
}

export default async function PaletteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPalette(slug);
  if (!p) notFound();
  const related = getRelatedPalettes(p);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Palette Library", href: "/palette-library" },
    { name: p.name, href: `/palette-library/${p.slug}` },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
            {p.category}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">{p.name}</h1>
          <div className="mt-3">
            <Badge>Accessibility score {p.accessibilityScore}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton value={p.colors.join(", ")} label="Copy palette" />
          <ShareButtons title={p.name} path={`/palette-library/${p.slug}`} />
        </div>
      </div>

      <div className="card-lift mb-8 overflow-hidden rounded-[1.75rem] border border-border/50">
        <PaletteStrip colors={p.colors} height="lg" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {p.colors.map((c, index) => (
          <Link
            key={`${p.slug}-${c}-${index}`}
            href={`/color/${c.slice(1)}`}
            className="card-lift block overflow-hidden rounded-3xl"
          >
            <ColorSwatch hex={c} size="lg" />
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <CodeExportPanel colors={p.colors} name={p.slug} />
      </div>

      <section className="mt-12">
        <h2 className="mb-5 font-display text-xl font-semibold tracking-tight">Related palettes</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((r) => (
            <PaletteCard
              key={r.slug}
              href={`/palette-library/${r.slug}`}
              name={r.name}
              colors={r.colors}
              meta={`A11y ${r.accessibilityScore}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
