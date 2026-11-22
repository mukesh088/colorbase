import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ToolFaqs } from "@/components/layout/tool-faqs";
import { JsonLd } from "@/components/seo/json-ld";
import { colorMatches, getCombinationBase, getCombinationBases, readableText, readyPalettes } from "@/lib/colors/combinations";
import { getContrastRatio, hexToHsl } from "@/lib/colors/convert";
import { describeHex } from "@/lib/colors/describe";
import { breadcrumbJsonLd, createPageMetadata, faqJsonLd, fitDescription, fitTitle } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCombinationBases().map((b) => ({ color: b.slug }));
}

type Ctx = { params: Promise<{ color: string }> };

function hexPath(hex: string) {
  return `/color/${hex.replace("#", "").toLowerCase()}`;
}

function nameList(names: string[]) {
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0];
}

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { color } = await params;
  const base = getCombinationBase(color);
  if (!base) notFound();
  const matches = colorMatches(base.hex);
  return createPageMetadata({
    title: fitTitle(
      `Colors That Go With ${base.name} – ${matches.length} Matches`,
      `Colors That Go With ${base.name}`,
      `${base.name} Color Combinations`
    ),
    description: fitDescription(
      `${matches.length} colors that go with ${base.name} (${base.hex.toUpperCase()}): ${matches
        .slice(0, 3)
        .map((m) => m.hex.toUpperCase())
        .join(", ")} and more.`,
      "See ready palettes and previews for a website, room, outfit and logo, with HEX codes to copy.",
      "See ready palettes and previews with HEX codes."
    ),
    path: `/colors-that-go-with/${base.slug}`,
  });
}

export default async function ColorsThatGoWithPage({ params }: Ctx) {
  const { color } = await params;
  const base = getCombinationBase(color);
  if (!base) notFound();
  const hex = base.hex.toUpperCase();
  const d = describeHex(base.hex);
  const matches = colorMatches(base.hex);
  const palettes = readyPalettes(base.hex, base.name);
  const byRole = (role: string) => matches.filter((m) => m.role === role);
  const light = byRole("light-neutral")[0].hex;
  const dark = byRole("dark-neutral")[0].hex;
  const accent = (byRole("complementary")[0] ?? byRole("accent")[0]).hex;
  const harmony = matches.filter((m) => !["light-neutral", "dark-neutral"].includes(m.role));
  const baseText = readableText(base.hex);
  const accentText = readableText(accent);
  const darkOnLight = Math.round(getContrastRatio(dark, light) * 100) / 100;
  const path = `/colors-that-go-with/${base.slug}`;
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Colors That Go With", href: "/colors-that-go-with" },
    { name: base.name, href: path },
  ];

  const answer = d.isNeutral
    ? `${base.name} (${hex}) is a neutral, so almost any hue works with it. Classic partners are ${nameList(
        harmony.slice(0, 4).map((m) => m.nearestName)
      )}, with a soft ${byRole("light-neutral")[0].nearestName} or a deep ${byRole("dark-neutral")[0].nearestName} for balance.`
    : `${base.name} (${hex}) goes best with ${byRole("complementary")[0]?.nearestName ?? "its complement"} (${(
        byRole("complementary")[0]?.hex ?? ""
      ).toUpperCase()}) as a contrasting accent, ${nameList(byRole("analogous").map((m) => m.nearestName))} for a calm analogous scheme, and neutrals like ${byRole("light-neutral")[0].hex.toUpperCase()} and ${byRole("dark-neutral")[0].hex.toUpperCase()} mixed from ${base.name.toLowerCase()} itself.`;

  const faqs = [
    {
      question: `What color goes best with ${base.name.toLowerCase()}?`,
      answer: d.isNeutral
        ? `As a neutral, ${base.name.toLowerCase()} pairs with strong accents such as ${nameList(
            harmony.slice(0, 3).map((m) => `${m.nearestName} (${m.hex.toUpperCase()})`)
          )}.`
        : `Its complementary color, about ${byRole("complementary")[0]?.hex.toUpperCase()} (${byRole("complementary")[0]?.nearestName}), gives the strongest contrast. For a softer look use the analogous neighbors ${nameList(
            byRole("analogous").map((m) => m.hex.toUpperCase())
          )}.`,
    },
    {
      question: `What neutral colors go with ${base.name.toLowerCase()}?`,
      answer: `Neutrals tinted with ${base.name.toLowerCase()} look intentional: a light ${light.toUpperCase()} for backgrounds and walls, and a dark ${dark.toUpperCase()} for text, trim or trousers. Dark text on the light neutral reaches ${darkOnLight}:1 contrast.`,
    },
    {
      question: `Can I use ${base.name.toLowerCase()} for text?`,
      answer:
        getContrastRatio(base.hex, "#ffffff") >= 4.5
          ? `Yes on white: ${hex} reaches ${Math.round(getContrastRatio(base.hex, "#ffffff") * 100) / 100}:1, which passes WCAG AA for body text.`
          : `Not as body text on white (${Math.round(getContrastRatio(base.hex, "#ffffff") * 100) / 100}:1). Use it as a background with ${
              baseText.color === "#ffffff" ? "white" : "black"
            } text (${baseText.ratio}:1) or for large headings and accents.`,
    },
  ];

  const related = getCombinationBases()
    .filter((b) => b.slug !== base.slug)
    .map((b) => {
      const h = hexToHsl(b.hex);
      const delta = Math.min(Math.abs(h.h - d.hsl.h), 360 - Math.abs(h.h - d.hsl.h)) + Math.abs(h.l - d.hsl.l) / 2;
      return { b, delta };
    })
    .sort((x, y) => x.delta - y.delta)
    .slice(0, 10)
    .map((x) => x.b);

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-center">
        <span aria-hidden className="border-border h-24 w-24 shrink-0 rounded-2xl border" style={{ background: base.hex }} />
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-rose-600 uppercase dark:text-rose-400">
            Color combinations
          </p>
          <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            Colors That Go With {base.name}
          </h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            <Link href={hexPath(base.hex)} className="underline-offset-4 hover:underline">
              {hex}
            </Link>{" "}
            · RGB {d.rgb.r}, {d.rgb.g}, {d.rgb.b} · {d.phrase}
          </p>
        </div>
      </header>
      <p className="mt-6 max-w-3xl text-base leading-relaxed">{answer}</p>

      <section className="mt-10" aria-labelledby="matches">
        <h2 id="matches" className="font-display text-xl font-semibold tracking-tight">
          {matches.length} colors that match {base.name.toLowerCase()}
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {matches.map((m) => (
            <li key={m.hex} className="border-border/60 overflow-hidden rounded-2xl border">
              <div className="flex h-20">
                <span aria-hidden className="w-1/3" style={{ background: base.hex }} />
                <span aria-hidden className="w-2/3" style={{ background: m.hex }} />
              </div>
              <div className="p-3 text-sm">
                <p className="font-medium">{m.label}</p>
                <Link href={hexPath(m.hex)} className="text-primary font-mono underline-offset-4 hover:underline">
                  {m.hex.toUpperCase()}
                </Link>
                <span className="text-muted-foreground"> · near {m.nearestName}</span>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mt-3 text-sm">
          Harmony partners are rotated around the{" "}
          <Link href="/color-wheel" className="text-primary underline-offset-4 hover:underline">
            color wheel
          </Link>{" "}
          from {hex}; neutrals are {base.name.toLowerCase()} mixed with white or near-black, so they share its undertone.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="palettes">
        <h2 id="palettes" className="font-display text-xl font-semibold tracking-tight">
          Ready {base.name.toLowerCase()} palettes
        </h2>
        <div className="mt-4 grid gap-5 md:grid-cols-3">
          {palettes.map((p) => (
            <article key={p.name} className="border-border/60 overflow-hidden rounded-2xl border">
              <div className="flex h-16">
                {p.colors.map((c, i) => (
                  <span key={`${c}-${i}`} aria-hidden className="flex-1" style={{ background: c }} />
                ))}
              </div>
              <div className="p-4">
                <h3 className="font-display text-base font-semibold">{p.name} palette</h3>
                <p className="text-muted-foreground mt-1 text-sm">{p.description}</p>
                <p className="mt-2 font-mono text-xs">{p.colors.map((c) => c.toUpperCase()).join("  ")}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="text-muted-foreground mt-3 text-sm">
          Refine any of these in the{" "}
          <Link href="/palette-generator" className="text-primary underline-offset-4 hover:underline">
            palette generator
          </Link>{" "}
          or preview them on an interface in the{" "}
          <Link href="/theme-builder" className="text-primary underline-offset-4 hover:underline">
            UI theme builder
          </Link>
          .
        </p>
      </section>

      <section className="mt-10" aria-labelledby="previews">
        <h2 id="previews" className="font-display text-xl font-semibold tracking-tight">
          {base.name} in use
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <figure className="border-border/60 overflow-hidden rounded-2xl border">
            <div className="h-40 p-3 text-xs" style={{ background: light, color: dark }}>
              <div className="rounded px-2 py-1.5 font-semibold" style={{ background: base.hex, color: baseText.color }}>
                Brand header
              </div>
              <p className="mt-3 font-semibold">Headline in dark neutral</p>
              <p className="mt-1 opacity-80">Body text on the light neutral background.</p>
              <span className="mt-3 inline-block rounded px-2 py-1 font-semibold" style={{ background: accent, color: accentText.color }}>
                Button
              </span>
            </div>
            <figcaption className="p-3 text-sm">
              <strong>Website:</strong> {base.name.toLowerCase()} header, {light.toUpperCase()} page, {accent.toUpperCase()} button.
            </figcaption>
          </figure>
          <figure className="border-border/60 overflow-hidden rounded-2xl border">
            <div className="relative h-40" style={{ background: light }}>
              <span aria-hidden className="absolute inset-y-0 left-0 w-1/3" style={{ background: base.hex }} />
              <span aria-hidden className="absolute bottom-0 left-0 right-0 h-3" style={{ background: "#ffffff" }} />
              <span aria-hidden className="absolute bottom-3 right-4 h-12 w-20 rounded-t-lg" style={{ background: dark }} />
              <span aria-hidden className="absolute bottom-8 right-10 h-4 w-6 rounded" style={{ background: accent }} />
            </div>
            <figcaption className="p-3 text-sm">
              <strong>Room:</strong> {base.name.toLowerCase()} accent wall, light walls, white trim, dark sofa.
            </figcaption>
          </figure>
          <figure className="border-border/60 overflow-hidden rounded-2xl border">
            <div className="flex h-40 flex-col items-center justify-center gap-1" style={{ background: "#f4f4f5" }}>
              <span aria-hidden className="h-14 w-16 rounded-t-2xl" style={{ background: base.hex }} />
              <span aria-hidden className="h-3 w-16" style={{ background: accent }} />
              <span aria-hidden className="flex h-14 w-16 gap-1">
                <span className="flex-1 rounded-b" style={{ background: dark }} />
                <span className="flex-1 rounded-b" style={{ background: dark }} />
              </span>
            </div>
            <figcaption className="p-3 text-sm">
              <strong>Outfit:</strong> {base.name.toLowerCase()} top, accent belt, dark neutral trousers.
            </figcaption>
          </figure>
          <figure className="border-border/60 overflow-hidden rounded-2xl border">
            <div className="flex h-40 items-center justify-center gap-2" style={{ background: light }}>
              <span aria-hidden className="h-12 w-12 rounded-xl" style={{ background: base.hex, boxShadow: `inset 0 -10px 0 ${accent}` }} />
              <span className="font-display text-xl font-semibold" style={{ color: dark }}>
                Brand
              </span>
            </div>
            <figcaption className="p-3 text-sm">
              <strong>Logo:</strong> {base.name.toLowerCase()} mark with an accent stripe, wordmark in {dark.toUpperCase()}.
            </figcaption>
          </figure>
        </div>
      </section>

      <ToolFaqs faqs={faqs} className="mt-10" />

      <section className="mt-10" aria-labelledby="related-bases">
        <h2 id="related-bases" className="font-display text-xl font-semibold tracking-tight">
          Colors that go with similar shades
        </h2>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {related.map((b) => (
            <li key={b.slug}>
              <Link href={`/colors-that-go-with/${b.slug}`} className="text-primary underline-offset-4 hover:underline">
                Colors that go with {b.name.toLowerCase()}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mt-6 text-xs">
          Base color {hex} ({base.sourceName ?? base.name}) from{" "}
          <a href={base.source} className="underline underline-offset-4" rel="noreferrer">
            {base.cssKeyword ? "the CSS Color Module Level 4 named colors" : "the color-names dataset by David Aerne (MIT)"}
          </a>
          . Matches are calculated, not sourced. See all{" "}
          <Link href="/colors-that-go-with" className="underline underline-offset-4">
            color combinations
          </Link>{" "}
          or check pairs in the{" "}
          <Link href="/contrast-checker" className="underline underline-offset-4">
            contrast checker
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
