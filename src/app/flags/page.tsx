import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getAllFlags, getIndexableFlags } from "@/lib/data/flags";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Flag Colors – HEX, RGB & CMYK Codes by Country",
  description: "Flag color codes by country.",
  path: "/flags",
  // Indexed once at least one flag has been verified.
  noIndex: getIndexableFlags().length === 0,
});

export default function FlagsHub() {
  const flags = getAllFlags();
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Flag Colors", href: "/flags" },
  ];
  return (
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <Breadcrumbs items={crumbs} withJsonLd />
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Flag Colors by Country</h1>
      <p className="mt-4 max-w-3xl leading-relaxed">
        National flags rarely publish HEX codes; most specify colors with Pantone, dyes or CIE coordinates. Each page
        lists the screen values from a cited source, converts them to RGB and CMYK, and gives CSS variables you can copy.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {flags.map((f) => (
          <li key={f.slug}>
            <Link href={`/flags/${f.slug}`} className="border-border/60 hover:border-primary/50 flex items-center gap-3 rounded-xl border p-3">
              <span aria-hidden className="flex h-8 w-12 shrink-0 overflow-hidden rounded border border-border">
                {f.colors.map((c) => (
                  <span key={c.hex + c.name} className="flex-1" style={{ background: c.hex }} />
                ))}
              </span>
              <span className="text-sm font-medium">{f.country} flag colors</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
