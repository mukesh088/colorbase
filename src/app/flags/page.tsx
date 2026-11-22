import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { FlagBrowser } from "@/components/library/flag-browser";
import { getAllFlags, getIndexableFlags } from "@/lib/data/flags";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Flag Colors – HEX, RGB & CMYK Codes by Country",
  description: "Flag color codes by country.",
  path: "/flags",
  noIndex: getIndexableFlags().length === 0,
});

export default function FlagsHub() {
  const flags = getAllFlags();
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Flag Colors", href: "/flags" },
  ];
  const cards = flags.map((f) => ({
    slug: f.slug,
    code: f.code,
    country: f.country,
    colors: f.colors.map((c) => c.hex),
    letter: f.country.normalize("NFD").replace(/[̀-ͯ]/g, "").charAt(0).toLowerCase(),
  }));
  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <Breadcrumbs items={crumbs} withJsonLd />
      <header className="border-border/60 bg-card mt-2 overflow-hidden rounded-3xl border p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.16em] text-rose-600 uppercase dark:text-rose-400">Flag colors</p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">Flag Colors by Country</h1>
        <p className="text-muted-foreground mt-4 max-w-3xl leading-relaxed">
          HEX, RGB and CMYK codes for {flags.length} national and regional flags, each with a ready color palette. Search by
          country or paste a HEX code to find flags that use it. National specifications usually define flag colors with
          Pantone, dyes or CIE values, so every page names the source of its screen values.
        </p>
        <div className="mt-5 flex h-3 max-w-xl overflow-hidden rounded-full" aria-hidden>
          {["#FF671F", "#C8102E", "#012169", "#009440", "#FFCB00", "#000000", "#FFFFFF"].map((c) => (
            <span key={c} className="flex-1" style={{ background: c }} />
          ))}
        </div>
      </header>
      <div className="mt-8">
        <FlagBrowser flags={cards} />
      </div>
    </div>
  );
}
