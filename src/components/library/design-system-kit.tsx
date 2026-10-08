import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { UI_KITS, getColorsBySource } from "@/lib/data/color-library";
import { LibraryColorCard } from "@/components/library/library-color-card";
import { PaletteStrip } from "@/components/library/palette-strip";
import { ToolCtaRow } from "@/components/library/tool-cta-row";
import { getDesignSystem } from "@/lib/data/design-systems";
import type { Metadata } from "next";

export function designSystemMetadata(slug: string): Metadata {
  const system = getDesignSystem(slug);
  if (!system) return {};
  return createPageMetadata({
    title: system.title,
    description: system.description,
    path: system.path,
    keywords: [system.title.toLowerCase(), "design system colors", "hex palette"],
  });
}

export function DesignSystemKit({ slug }: { slug: string }) {
  const system = getDesignSystem(slug);
  const meta = system ? UI_KITS.find((k) => k.slug === system.kit) : undefined;
  if (!system || !meta) notFound();
  const colors = getColorsBySource(meta.source).slice(0, 400);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Library", href: "/colors" },
    { name: system.title, href: system.path },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <header className="overflow-hidden rounded-2xl border border-border/50 bg-background p-5 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Design system</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-5xl">{system.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {system.description} {colors.length} colors in this reference. Shade numbers are official for this system;
          other hex values on ColorBase are labeled as nearest approximations.
        </p>
        <ToolCtaRow className="mt-5 flex flex-wrap gap-2" />
      </header>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border/50">
        <PaletteStrip colors={meta.preview} height="lg" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {colors.map((c) => (
          <LibraryColorCard
            key={c.slug}
            href={`/colors/${c.slug}`}
            hex={c.hex}
            name={c.name}
            meta={c.shade ? `Shade ${c.shade}` : c.family}
          />
        ))}
      </div>
    </div>
  );
}
