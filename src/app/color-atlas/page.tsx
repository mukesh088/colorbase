import type { Metadata } from "next";
import { Suspense } from "react";
import { createPageMetadata } from "@/lib/seo";
import { ColorCodePageShell, RelatedCodeLinks, AdReserve } from "@/components/color-codes/page-shell";
import { ColorAtlasClient } from "@/components/color-codes/color-atlas-client";

export const metadata: Metadata = createPageMetadata({
  title: "Universal Color Atlas — Design System Color Comparison",
  description:
    "Compare official CSS, Tailwind, Material, Bootstrap, Fluent, Apple, Android, Radix, Chakra, Ant Design, PrimeReact, and Flat UI color tokens. Approximations are labeled as nearest matches.",
  path: "/color-atlas",
  keywords: ["color atlas", "tailwind vs material colors", "design system color comparison"],
});

export default function ColorAtlasPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Atlas", href: "/color-atlas" },
  ];

  return (
    <ColorCodePageShell
      crumbs={crumbs}
      eyebrow="Flagship reference"
      title="Universal Color Atlas"
      description="Browse official design-system tokens and compare a color across CSS, Tailwind, Material, Bootstrap, and more. Exact HEX matches are official. Everything else is a nearest CIEDE2000 match."
      aside={
        <RelatedCodeLinks
          items={[
            { href: "/color-codes", label: "Color codes" },
            { href: "/colors/tailwind", label: "Tailwind" },
            { href: "/colors/material", label: "Material" },
            { href: "/colors/flat-ui", label: "Flat UI" },
            { href: "/explore-colors", label: "Explore 16.7M colors" },
          ]}
        />
      }
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading atlas…</p>}>
        <ColorAtlasClient />
      </Suspense>
      <AdReserve />
    </ColorCodePageShell>
  );
}
