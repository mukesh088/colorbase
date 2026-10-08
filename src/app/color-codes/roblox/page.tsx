import type { Metadata } from "next";
import { createPageMetadata, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { ColorCodePageShell, RelatedCodeLinks, AdReserve } from "@/components/color-codes/page-shell";
import { ColorReferenceTable } from "@/components/color-codes/reference-table";
import { robloxRows } from "@/lib/data/color-codes/roblox";

export const metadata: Metadata = createPageMetadata({
  title: "Roblox Color Codes — BrickColor IDs & RGB",
  description:
    "Searchable Roblox BrickColor IDs with official RGB values and calculated HEX, HSL, and OKLCH conversions.",
  path: "/color-codes/roblox",
  keywords: ["roblox color codes", "brickcolor", "roblox rgb", "brickcolor id"],
});

export default function RobloxColorCodesPage() {
  const rows = robloxRows();
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Codes", href: "/color-codes" },
    { name: "Roblox", href: "/color-codes/roblox" },
  ];
  const faqs = [
    {
      question: "Are HEX values official BrickColors?",
      answer:
        "RGB triples are the public BrickColor table. HEX, HSL, and OKLCH are calculated in ColorBase from those RGB values and are labeled as conversions.",
    },
  ];

  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <ColorCodePageShell
        crumbs={crumbs}
        eyebrow="BrickColor database"
        title="Roblox BrickColor Codes"
        description="Classic BrickColor IDs with RGB from the public BrickColor table. HEX, HSL, and OKLCH are calculated conversions — not separate Roblox APIs. Open an ID for a dedicated page."
        aside={
          <RelatedCodeLinks
            items={[
              { href: "/color-codes/minecraft", label: "Minecraft colors" },
              { href: "/color-atlas", label: "Design-system atlas" },
              { href: "/explore-colors", label: "Color explorer" },
            ]}
          />
        }
      >
        <ColorReferenceTable
          rows={rows}
          columns={[
            { id: "brickId", header: "BrickColor ID", copy: true, mono: true },
            { id: "name", header: "Name" },
            { id: "rgb", header: "RGB", copy: true, mono: true },
            { id: "hex", header: "HEX", copy: true, mono: true },
            { id: "hsl", header: "HSL", copy: true, mono: true },
            { id: "oklch", header: "OKLCH", copy: true, mono: true },
            { id: "hue", header: "Hue", mono: true },
          ]}
          openPath={(row) => `/color-codes/roblox/${row.id}`}
          searchPlaceholder="Search BrickColor ID, name, or HEX…"
        />
        <AdReserve />
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Sort by ID, name, or hue from the column headers. Duplicate display names can share similar RGB
          with different IDs; each ID has its own page so Studio lookups stay unambiguous.
        </p>
      </ColorCodePageShell>
    </>
  );
}
