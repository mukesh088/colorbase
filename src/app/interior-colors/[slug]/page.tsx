import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ShareButtons } from "@/components/library/share-buttons";
import { InteriorSwatchCard } from "@/components/interior/interior-swatch";
import { SITE_URL } from "@/lib/site-config";
import { getInteriorBySlug, relatedInteriorPalettes } from "@/lib/db/interior";
import { isAdminRequest } from "@/lib/interior/auth";
import { ROOM_LABELS, STYLE_LABELS } from "@/lib/interior/catalog";
import { interiorImageUrl } from "@/lib/interior/paths";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

async function loadPalette(slug: string) {
  const published = await getInteriorBySlug(slug, false).catch(() => null);
  if (published) return published;
  if (await isAdminRequest()) return getInteriorBySlug(slug, true).catch(() => null);
  return null;
}

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { slug } = await params;
  const item = await loadPalette(slug);
  if (!item) notFound();
  const meta = createPageMetadata({
    title: item.title,
    description: item.description.slice(0, 160),
    path: `/interior-colors/${item.slug}`,
    keywords: [ROOM_LABELS[item.roomType], STYLE_LABELS[item.style], "interior palette"],
    noIndex: item.status !== "published",
  });
  const image = absoluteUrl(interiorImageUrl(item).split("?")[0]);
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      images: [{ url: image, alt: item.altText, width: item.imageWidth, height: item.imageHeight }],
    },
    twitter: {
      ...meta.twitter,
      images: [image],
    },
  };
}

export default async function InteriorPaletteDetailPage({ params }: Ctx) {
  const { slug } = await params;
  const item = await loadPalette(slug);
  if (!item) notFound();
  const related = item.status === "published" ? await relatedInteriorPalettes(item) : [];
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Interior colors", href: "/interior-colors" },
    { name: item.title, href: `/interior-colors/${item.slug}` },
  ];
  const imageUrl = `${SITE_URL}${interiorImageUrl(item).split("?")[0]}`;

  return (
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          {
            "@context": "https://schema.org",
            "@type": "ImageObject",
            name: item.title,
            description: item.description,
            contentUrl: imageUrl,
            thumbnailUrl: imageUrl,
            caption: item.altText,
            representativeOfPage: true,
          },
        ]}
      />
      <Breadcrumbs items={crumbs} />
      {item.status !== "published" ? (
        <p className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
          Draft preview — this page is not indexed until you publish it.
        </p>
      ) : null}
      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {ROOM_LABELS[item.roomType]} · {STYLE_LABELS[item.style]}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{item.title}</h1>
        </div>
        <ShareButtons title={item.title} path={`/interior-colors/${item.slug}`} />
      </header>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">{item.description}</p>
      <figure className="mt-6 overflow-hidden rounded-3xl border border-border/70">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={interiorImageUrl(item)}
          alt={item.altText}
          width={item.imageWidth}
          height={item.imageHeight}
          className="w-full object-cover"
        />
        <figcaption className="px-4 py-2 text-xs text-muted-foreground">{item.altText}</figcaption>
      </figure>
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Colors from the photo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          HEX, RGB, and HSL match the stored swatches. Roles such as wall/base or accent are suggestions.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {item.colors.map((swatch) => (
            <InteriorSwatchCard key={`${item.id}-${swatch.hex}-${swatch.name}`} swatch={swatch} />
          ))}
        </div>
      </section>
      {item.usageNotes ? (
        <section className="mt-10 rounded-3xl border border-border/70 bg-card p-5">
          <h2 className="font-display text-xl font-semibold">Using these colors together</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.usageNotes}</p>
        </section>
      ) : null}
      {related.length > 0 ? (
        <section className="mt-12">
          <h2 className="mb-5 font-display text-xl font-semibold">Related palettes</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((other) => (
              <Link
                key={other.id}
                href={`/interior-colors/${other.slug}`}
                className="overflow-hidden rounded-2xl border border-border/70 bg-card"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={interiorImageUrl(other)}
                  alt={other.altText}
                  className="aspect-[4/3] w-full object-cover"
                />
                <p className="p-3 text-sm font-medium">{other.title}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
