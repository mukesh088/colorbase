import type { Metadata } from "next";
import { createPageMetadata, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { ColorCodePageShell, RelatedCodeLinks, AdReserve } from "@/components/color-codes/page-shell";
import { ColorReferenceTable } from "@/components/color-codes/reference-table";
import { ColorSpaceNotes } from "@/components/color-codes/color-space-notes";
import { getCommonColorRows } from "@/lib/data/color-codes/common";

export const metadata: Metadata = createPageMetadata({
  title: "Common Color Codes — HEX, RGB, HSL & OKLCH",
  description:
    "A compact reference of everyday CSS named colors with HEX, RGB, HSL, OKLCH, copy buttons, and links to full color pages.",
  path: "/color-codes/common",
  keywords: ["common color codes", "black hex", "white rgb", "css named colors"],
});

export default function CommonColorCodesPage() {
  const rows = getCommonColorRows().map((row) => ({
    id: row.name,
    name: row.name,
    hex: row.hex,
    rgb: row.rgb,
    hsl: row.hsl,
    oklch: row.oklch,
  }));
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Codes", href: "/color-codes" },
    { name: "Common", href: "/color-codes/common" },
  ];
  const faqs = [
    {
      question: "Are these official CSS colors?",
      answer:
        "Yes. Each row is an official CSS named color keyword. HSL and OKLCH on this page are calculated from the same sRGB HEX.",
    },
  ];

  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <ColorCodePageShell
        crumbs={crumbs}
        eyebrow="CSS named colors"
        title="Common Color Codes"
        description="Popular named colors with HEX, RGB, HSL, and OKLCH. Values come from the CSS Color Module keywords; HSL and OKLCH are calculated in ColorBase’s shared engine."
        aside={
          <RelatedCodeLinks
            items={[
              { href: "/colors/css", label: "Full CSS named set" },
              { href: "/color-names", label: "Color names" },
              { href: "/color-atlas", label: "Color atlas" },
              { href: "/learn/color-codes", label: "Learn HEX & RGB" },
            ]}
          />
        }
      >
        <ColorReferenceTable
          rows={rows}
          columns={[
            { id: "name", header: "Name" },
            { id: "hex", header: "HEX", copy: true, mono: true },
            { id: "rgb", header: "RGB", copy: true, mono: true },
            { id: "hsl", header: "HSL", copy: true, mono: true },
            { id: "oklch", header: "OKLCH", copy: true, mono: true },
          ]}
        />
        <AdReserve />
        <ColorSpaceNotes ids={["hex", "rgb", "hsl", "oklch"]} />
      </ColorCodePageShell>
    </>
  );
}
