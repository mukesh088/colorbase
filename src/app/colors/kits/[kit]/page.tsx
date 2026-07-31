import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { UI_KITS, getColorsBySource } from "@/lib/data/color-library";
import { LibraryColorCard } from "@/components/library/library-color-card";
import { PaletteStrip } from "@/components/library/palette-strip";

export function generateStaticParams() {
  return UI_KITS.map((kit) => ({ kit: kit.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kit: string }>;
}): Promise<Metadata> {
  const { kit } = await params;
  const meta = UI_KITS.find((k) => k.slug === kit);
  if (!meta) return {};
  return createPageMetadata({
    title: meta.title,
    description: `Browse ${meta.title} with HEX values, copy buttons, and detailed color pages.`,
    path: `/colors/kits/${kit}`,
    keywords: [meta.title.toLowerCase(), "color palette", "design system colors"],
  });
}

export default async function KitPage({ params }: { params: Promise<{ kit: string }> }) {
  const { kit } = await params;
  const meta = UI_KITS.find((k) => k.slug === kit);
  if (!meta) notFound();
  const colors = getColorsBySource(meta.source).slice(0, 200);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Library", href: "/colors" },
    { name: meta.title, href: `/colors/kits/${kit}` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
          Design system
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {meta.title}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {colors.length} colors from the {meta.title} system. Click any swatch for full formats and
          harmonies.
        </p>
      </header>

      <div
        className="card-lift mt-8 overflow-hidden rounded-[1.75rem] border border-border/50"
        style={{ boxShadow: `0 24px 60px -36px ${meta.accent}88` }}
      >
        <PaletteStrip colors={meta.preview} height="lg" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {colors.map((c, index) => (
          <div
            key={c.slug}
            className="animate-rise"
            style={{ animationDelay: `${Math.min(index, 24) * 22}ms` }}
          >
            <LibraryColorCard
              href={`/colors/${c.slug}`}
              hex={c.hex}
              name={c.name}
              meta={c.shade ? `Shade ${c.shade}` : c.family}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
