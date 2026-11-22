import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { colorMatches, getCombinationBases } from "@/lib/colors/combinations";
import { SwatchCardBrowser } from "@/components/library/swatch-card-browser";
import { letterOf } from "@/lib/utils";
import { describeHex } from "@/lib/colors/describe";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Colors That Go Together – Combinations by Color",
  description: "Find colors that go with any color.",
  path: "/colors-that-go-with",
});

const GROUPS: [string, (name: string, neutral: boolean) => boolean][] = [
  ["Neutrals", (_, neutral) => neutral],
  ["Reds and pinks", (n) => ["red", "pink", "magenta"].includes(n)],
  ["Oranges and browns", (n) => ["reddish-orange", "orange", "brown"].includes(n)],
  ["Yellows and golds", (n) => ["amber", "yellow", "yellow-green"].includes(n)],
  ["Greens", (n) => ["green", "teal"].includes(n)],
  ["Blues", (n) => ["cyan", "azure blue", "blue", "indigo"].includes(n)],
  ["Purples", (n) => ["violet"].includes(n)],
];

export default function ColorsThatGoWithHub() {
  const bases = getCombinationBases().map((b) => ({ ...b, d: describeHex(b.hex) }));
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Colors That Go With", href: "/colors-that-go-with" },
  ];
  const placed = new Set<string>();
  const groups = GROUPS.map(([label, test]) => {
    const items = bases.filter((b) => !placed.has(b.slug) && test(b.d.hueName, b.d.isNeutral || b.d.hsl.s < 12));
    items.forEach((b) => placed.add(b.slug));
    return { label, items: items.sort((a, b) => a.name.localeCompare(b.name)) };
  });
  const rest = bases.filter((b) => !placed.has(b.slug));
  if (rest.length) groups.push({ label: "More colors", items: rest });

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <Breadcrumbs items={crumbs} withJsonLd />
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Colors That Go Together</h1>
      <p className="mt-4 max-w-3xl text-base leading-relaxed">
        Pick a base color to see the colors that go with it. Each page calculates matches from the color wheel
        (complementary, analogous and split-complementary partners), adds light and dark neutrals mixed from the base
        so they share its undertone, and shows ready palettes plus previews for a website, a room, an outfit and a logo.
      </p>
      <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed">
        {bases.length} base colors are covered. Their HEX values come from the CSS named colors or the open color-names
        dataset, and every match comes with a HEX code you can copy and a contrast check you can trust.
      </p>
      <div className="mt-8">
        <SwatchCardBrowser
          placeholder="Search a color or HEX (e.g. navy, #000080)"
          groups={groups.filter((g) => g.items.length > 0).map((g) => ({ id: g.label, label: g.label }))}
          items={groups.flatMap((g) =>
            g.items.map((b) => ({
              href: `/colors-that-go-with/${b.slug}`,
              title: `Colors that go with ${b.name.toLowerCase()}`,
              meta: b.hex.toUpperCase(),
              colors: [b.hex, ...colorMatches(b.hex).slice(0, 4).map((m) => m.hex)],
              group: g.label,
              letter: letterOf(b.name),
            }))
          ).sort((a, b) => a.title.localeCompare(b.title))}
        />
      </div>
    </div>
  );
}
