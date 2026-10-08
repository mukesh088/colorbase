import type { Metadata } from "next";
import { Suspense } from "react";
import { createPageMetadata } from "@/lib/seo";
import { ColorCodePageShell, RelatedCodeLinks, AdReserve } from "@/components/color-codes/page-shell";
import { ColorExplorerClient } from "@/components/color-codes/color-explorer-client";

export const metadata: Metadata = createPageMetadata({
  title: "Explore 16.7 Million Colors — Interactive Color-Space Explorer",
  description:
    "Explore the 16,777,216 colors of 24-bit RGB dynamically with HEX, RGB, HSL, OKLCH, nearby colors, and nearest CSS, Tailwind, and Material tokens.",
  path: "/explore-colors",
  keywords: ["16.7 million colors", "color explorer", "24-bit rgb", "oklch explorer"],
});

export default function ExploreColorsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Explore Colors", href: "/explore-colors" },
  ];
  return (
    <ColorCodePageShell
      crumbs={crumbs}
      eyebrow="Color space"
      title="16.7 Million Color Explorer"
      description="24-bit RGB can encode 16,777,216 colors. This page generates any of them on demand — it does not index a page per HEX."
      aside={
        <RelatedCodeLinks
          items={[
            { href: "/color-atlas", label: "Color atlas" },
            { href: "/color-picker", label: "Color picker" },
            { href: "/learn/color-codes", label: "How HEX works" },
            { href: "/tools/harmony-studio", label: "Harmony studio" },
          ]}
        />
      }
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading explorer…</p>}>
        <ColorExplorerClient />
      </Suspense>
      <AdReserve />
    </ColorCodePageShell>
  );
}
