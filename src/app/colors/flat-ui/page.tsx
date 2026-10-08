import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { ColorCodePageShell, RelatedCodeLinks, AdReserve } from "@/components/color-codes/page-shell";
import { ColorSpaceNotes } from "@/components/color-codes/color-space-notes";
import { FlatUiLibrary } from "@/components/color-codes/flat-ui-library";
import { FLAT_UI_COLORS } from "@/lib/data/color-codes/flat-ui";

export const metadata: Metadata = createPageMetadata({
  title: "Flat UI Colors — HEX, RGB & HSL",
  description:
    "Flat UI Original and American palettes with HEX, RGB, HSL, OKLCH, copy actions, shades, and design-system comparison.",
  path: "/colors/flat-ui",
  keywords: ["flat ui colors", "flat ui palette", "turquoise hex", "peter river"],
});

export default function FlatUiColorsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Library", href: "/colors" },
    { name: "Flat UI", href: "/colors/flat-ui" },
  ];

  return (
    <ColorCodePageShell
      crumbs={crumbs}
      eyebrow="Design palette"
      title="Flat UI Colors"
      description="A professional Flat UI reference: Original 20 plus the American palette. HEX values are the published swatches; RGB, HSL, and OKLCH are calculated. Open a color for contrast, nearest Tailwind, and exports."
      aside={
        <RelatedCodeLinks
          items={[
            { href: "/color-codes", label: "Color codes hub" },
            { href: "/color-atlas", label: "Compare systems" },
            { href: "/colors/tailwind", label: "Tailwind colors" },
            { href: "/tools/shades-tints-tones", label: "Shades & tints" },
          ]}
        />
      }
    >
      <FlatUiLibrary colors={FLAT_UI_COLORS} />
      <AdReserve />
      <ColorSpaceNotes ids={["hex", "rgb", "hsl", "oklch"]} />
    </ColorCodePageShell>
  );
}
