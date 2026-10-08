import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { ColorCodePageShell, RelatedCodeLinks, AdReserve } from "@/components/color-codes/page-shell";
import { COLOR_CODE_CATEGORIES } from "@/lib/data/color-codes";

export const metadata: Metadata = createPageMetadata({
  title: "Color Codes — HEX, RGB, HSL & Developer Color References",
  description:
    "Explore color codes, named colors, design-system palettes, game color codes and developer-ready color references.",
  path: "/color-codes",
  keywords: ["color codes", "hex color codes", "rgb hsl oklch", "minecraft color codes", "roblox brickcolor"],
});

export default function ColorCodesHubPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Codes", href: "/color-codes" },
  ];

  return (
    <ColorCodePageShell
      crumbs={crumbs}
      eyebrow="Reference hub"
      title="Color Codes"
      description="Explore color codes, named colors, design-system palettes, game color codes and developer-ready color references."
      aside={
        <RelatedCodeLinks
          items={[
            { href: "/color-atlas", label: "Universal Color Atlas" },
            { href: "/explore-colors", label: "16.7 million explorer" },
            { href: "/learn/color-codes", label: "Learn color codes" },
            { href: "/color-picker", label: "Color picker" },
          ]}
        />
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {COLOR_CODE_CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={cat.href}
            className="rounded-2xl border border-border/70 bg-card p-5 transition-colors hover:border-rose-500/40"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {cat.kind === "existing" ? "Library" : "Reference"}
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold">{cat.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{cat.description}</p>
          </Link>
        ))}
      </div>
      <AdReserve />
      <section className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        <h2 className="font-display text-lg font-semibold text-foreground">What this hub is for</h2>
        <p className="mt-2">
          ColorBase keeps official tokens (CSS names, Tailwind scales, Material shades, game chat codes)
          separate from calculated conversions such as HSL, OKLCH, and nearest-token matches. Open any
          swatch to reach HEX pages, contrast, shades, and harmony tools without duplicating the same
          color as a new database row.
        </p>
      </section>
    </ColorCodePageShell>
  );
}
