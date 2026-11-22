import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ToolFaqs } from "@/components/layout/tool-faqs";
import { JsonLd } from "@/components/seo/json-ld";
import { CopyButton } from "@/components/color/copy-button";
import { ColorCodeCards, PaletteTrio, cssVariables } from "@/components/library/color-code-cards";
import { flagImage, getAllFlags, getFlag, similarFlags } from "@/lib/data/flags";
import { breadcrumbJsonLd, createPageMetadata, faqJsonLd, fitDescription, fitTitle } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllFlags().map((f) => ({ country: f.slug }));
}

type Ctx = { params: Promise<{ country: string }> };

function list(items: string[]) {
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}` : items[0];
}

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { country } = await params;
  const flag = getFlag(country);
  if (!flag) notFound();
  return createPageMetadata({
    title: fitTitle(`${flag.country} Flag Colors – HEX, RGB & CMYK Codes`, `${flag.country} Flag Colors – HEX Codes`, `${flag.country} Flag Colors`),
    description: fitDescription(
      `${flag.country} flag colors: ${flag.colors.map((c) => `${c.name} ${c.hex}`).join(", ")}.`,
      "Copy HEX, RGB and CMYK values, CSS variables and a ready palette, with the source of each value.",
      "Copy HEX, RGB and CMYK values with their source."
    ),
    path: `/flags/${flag.slug}`,
    ogImage: flagImage(flag.code, 1280),
    noIndex: !flag.verified,
  });
}

export default async function FlagPage({ params }: Ctx) {
  const { country } = await params;
  const flag = getFlag(country);
  if (!flag) notFound();
  const path = `/flags/${flag.slug}`;
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Flag Colors", href: "/flags" },
    { name: flag.country, href: path },
  ];
  const hexes = flag.colors.map((c) => c.hex.toUpperCase());
  const cards = flag.colors.map((c) => ({ ...c, hex: c.hex.toUpperCase() }));
  const css = cssVariables(flag.slug.replace(/-/g, ""), cards);
  const measured = flag.colors.some((c) => typeof c.share === "number");
  const faqs = [
    {
      question: `What are the colors of the ${flag.country} flag?`,
      answer: `The ${flag.country} flag uses ${list(cards.map((c) => `${c.name.toLowerCase()} (${c.hex})`))}.`,
    },
    {
      question: `What is the HEX code of the ${flag.country} flag?`,
      answer: `The main colors are ${list(hexes)}. ${measured ? `${cards[0].name} covers the largest area (about ${cards[0].share}% of the flag).` : ""}`.trim(),
    },
    {
      question: `Are these the official ${flag.country} flag colors?`,
      answer: `${flag.sourceNote} Screen colors are approximations of the printed or dyed flag.`,
    },
  ];
  const similar = similarFlags(flag);

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />

      <header className="border-border/60 bg-card mt-2 grid gap-6 overflow-hidden rounded-3xl border p-5 sm:p-8 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div className="bg-muted/40 flex items-center justify-center rounded-2xl p-4 sm:p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={flagImage(flag.code, 640)}
            srcSet={`${flagImage(flag.code, 640)} 1x, ${flagImage(flag.code, 1280)} 2x`}
            alt={`Flag of ${flag.country}`}
            width={640}
            height={427}
            className="h-auto max-h-72 w-auto rounded-md shadow-lg"
          />
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-rose-600 uppercase dark:text-rose-400">Flag colors</p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{flag.country} Flag Colors</h1>
          <p className="mt-4 text-base leading-relaxed">
            The {flag.country} flag uses {cards.length} color{cards.length === 1 ? "" : "s"}:{" "}
            {list(cards.map((c) => `${c.name.toLowerCase()} ${c.hex}`))}.
          </p>
          <div className="mt-5 flex h-4 overflow-hidden rounded-full" aria-hidden>
            {cards.map((c) => (
              <span key={c.hex + c.name} style={{ background: c.hex, flex: c.share ?? 1 }} />
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <CopyButton value={hexes.join(", ")} label="Copy all HEX" />
            <CopyButton value={css} label="Copy CSS variables" />
          </div>
          {!flag.verified && (
            <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
              Measured from the flag artwork and not yet checked by ColorBase against the official specification.
            </p>
          )}
        </div>
      </header>

      <section className="mt-10" aria-labelledby="flag-codes">
        <h2 id="flag-codes" className="font-display text-2xl font-semibold tracking-tight">
          {flag.country} flag color codes
        </h2>
        <ColorCodeCards colors={cards} />
        {flag.alternatives && flag.alternatives.length > 0 && (
          <div className="border-border/60 mt-6 rounded-2xl border p-4">
            <h3 className="font-display text-base font-semibold">Other published values</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {flag.alternatives.map((a) => (
                <li key={a.label} className="flex flex-wrap items-center gap-3">
                  <span className="flex h-5 w-20 overflow-hidden rounded" aria-hidden>
                    {a.colors.map((h, i) => (
                      <span key={`${h}-${i}`} className="flex-1" style={{ background: h }} />
                    ))}
                  </span>
                  <span>{a.label}:</span> <span className="font-mono">{a.colors.join(", ")}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-12" aria-labelledby="flag-palettes">
        <h2 id="flag-palettes" className="font-display text-2xl font-semibold tracking-tight">
          {flag.country} flag color palettes
        </h2>
        <PaletteTrio label={`${flag.country} flag`} hexes={hexes} />
      </section>

      <section className="mt-12" aria-labelledby="flag-css">
        <h2 id="flag-css" className="font-display text-2xl font-semibold tracking-tight">
          CSS variables
        </h2>
        <pre className="bg-muted/50 mt-3 overflow-x-auto rounded-xl p-4 text-xs">
          <code>{css}</code>
        </pre>
      </section>

      <ToolFaqs faqs={faqs} className="mt-12" />

      <section className="mt-12" aria-labelledby="similar-flags">
        <h2 id="similar-flags" className="font-display text-2xl font-semibold tracking-tight">
          Flags with similar colors
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {similar.map((f) => (
            <li key={f.slug}>
              <Link href={`/flags/${f.slug}`} className="group border-border/60 bg-card block overflow-hidden rounded-xl border">
                <span className="bg-muted/40 flex aspect-[3/2] items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={flagImage(f.code, 160)} alt={`Flag of ${f.country}`} width={160} height={107} loading="lazy" className="max-h-full w-auto rounded-sm" />
                </span>
                <span className="block truncate p-2 text-sm font-medium group-hover:underline">{f.country} flag colors</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-muted-foreground mt-10 text-xs">
        Source:{" "}
        <a href={flag.source} className="underline underline-offset-4" rel="noreferrer">
          {flag.source}
        </a>
        . {flag.sourceNote} Flag image from{" "}
        <a href="https://flagcdn.com" className="underline underline-offset-4" rel="noreferrer">
          flagcdn.com
        </a>
        . See all{" "}
        <Link href="/flags" className="underline underline-offset-4">
          flag colors
        </Link>
        .
      </p>
    </div>
  );
}
