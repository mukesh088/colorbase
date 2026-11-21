import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Home } from "lucide-react";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { InteriorFilters } from "@/components/interior/interior-filters";
import { listPublishedInteriorPalettes } from "@/lib/db/interior";
import { ROOM_LABELS, STYLE_LABELS } from "@/lib/interior/catalog";
import { interiorImageUrl } from "@/lib/interior/paths";
import { SITE_URL } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Interior Color Inspiration",
  description:
    "Room palettes sampled from real interior photos. Each HEX value comes from image analysis, with names, roles, and practical pairing notes.",
  path: "/interior-colors",
  keywords: ["interior color palette", "room paint colors", "home color inspiration"],
});

export default async function InteriorColorsPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string; style?: string; family?: string }>;
}) {
  const filters = await searchParams;
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Interior colors", href: "/interior-colors" },
  ];
  const items = await listPublishedInteriorPalettes({
    room: filters.room,
    style: filters.style,
    family: filters.family,
  }).catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Interior Color Inspiration",
            url: `${SITE_URL}/interior-colors`,
            description:
              "Published interior palettes extracted from room photographs with exact HEX values.",
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Published interior palettes",
            numberOfItems: items.length,
            itemListElement: items.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.title,
              url: `${SITE_URL}/interior-colors/${item.slug}`,
            })),
          },
        ]}
      />
      <Breadcrumbs items={crumbs} />
      <header className="mt-4 rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/70 to-card/40 p-6 sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Home className="h-3.5 w-3.5" />
          Interior Color Inspiration
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
          Palettes from real rooms
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Each published page starts with a photograph. Colors are quantized from pixels — HEX codes are not
          invented by a language model. Filter by room, style, or color family.
        </p>
        <p className="mt-3 text-sm">
          Planning paint first? Try{" "}
          <Link href="/house-color-combinations" className="font-medium text-primary underline-offset-4 hover:underline">
            house color combinations
          </Link>
          .
        </p>
      </header>
      <Suspense fallback={null}>
        <InteriorFilters />
      </Suspense>
      {items.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          No published interior palettes match these filters yet. Check back after an admin publishes a room photo.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/interior-colors/${item.slug}`}
              className="card-lift overflow-hidden rounded-3xl border border-border/70 bg-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={interiorImageUrl(item)}
                alt={item.altText}
                width={item.imageWidth}
                height={item.imageHeight}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="space-y-3 p-4">
                <h2 className="font-display text-lg font-semibold tracking-tight">{item.title}</h2>
                <p className="text-xs text-muted-foreground">
                  {ROOM_LABELS[item.roomType]} · {STYLE_LABELS[item.style]}
                </p>
                <div className="flex overflow-hidden rounded-full">
                  {item.colors.map((swatch) => (
                    <span
                      key={`${item.id}-${swatch.hex}`}
                      className="h-8 flex-1"
                      style={{ backgroundColor: swatch.hex }}
                      title={swatch.hex}
                    />
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
