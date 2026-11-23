import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { colorNameLetters, getNamedColorsByLetter, MIN_NAMES_FOR_INDEXED_LETTER } from "@/lib/data/color-names";
import { createPageMetadata, fitDescription } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return colorNameLetters().map(({ letter }) => ({ letter }));
}

type Ctx = { params: Promise<{ letter: string }> };

function label(letter: string) {
  return letter === "0-9" ? "a number" : letter.toUpperCase();
}

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { letter } = await params;
  const colors = getNamedColorsByLetter(letter);
  if (!colors.length) notFound();
  return createPageMetadata({
    title: `Color Names Starting With ${label(letter)} – HEX Codes`,
    description: fitDescription(
      `${colors.length} color names starting with ${label(letter)}, from ${colors[0].displayName} (${colors[0].hex.toUpperCase()}) to ${colors[colors.length - 1].displayName} (${colors[colors.length - 1].hex.toUpperCase()}).`,
      "Open any name for its HEX, RGB, shades and contrast.",
      "Open any name for its codes."
    ),
    path: `/color-names/letter/${letter}`,
    noIndex: colors.length < MIN_NAMES_FOR_INDEXED_LETTER,
  });
}

export default async function ColorNamesLetterPage({ params }: Ctx) {
  const { letter } = await params;
  const colors = getNamedColorsByLetter(letter);
  if (!colors.length) notFound();
  const letters = colorNameLetters();
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Names", href: "/color-names" },
    { name: `Starting with ${label(letter)}`, href: `/color-names/letter/${letter}` },
  ];
  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <Breadcrumbs items={crumbs} withJsonLd />
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        Color Names Starting With {label(letter)}
      </h1>
      <p className="text-muted-foreground mt-3 max-w-3xl leading-relaxed">
        {colors.length} color names start with {label(letter)}. Each one links to its own page with the HEX and RGB code,
        tints and shades, harmonies and a WCAG contrast check.
      </p>
      <ul className="mt-6 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {colors.map((c) => (
          <li key={c.slug} className="flex items-center gap-2">
            <span aria-hidden className="border-border h-4 w-4 shrink-0 rounded border" style={{ background: c.hex }} />
            <Link href={`/color-names/${c.slug}`} className="underline-offset-4 hover:underline">
              {c.displayName} <span className="text-muted-foreground font-mono text-xs">{c.hex.toUpperCase()}</span>
            </Link>
          </li>
        ))}
      </ul>
      <nav aria-label="Other letters" className="mt-10 flex flex-wrap gap-2 text-sm">
        {letters.map(({ letter: l }) => (
          <Link
            key={l}
            href={`/color-names/letter/${l}`}
            aria-current={l === letter ? "page" : undefined}
            className="inline-flex min-w-10 items-center justify-center rounded-lg border border-border px-2.5 py-1.5 font-medium uppercase hover:border-primary/50"
            aria-label={`Color names starting with ${label(l)}`}
          >
            {l}
          </Link>
        ))}
      </nav>
    </div>
  );
}
