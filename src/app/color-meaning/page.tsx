import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata: Metadata = createPageMetadata({
  title: "Color meaning in product UI",
  description:
    "What blue, green, red, and other hues signal in interfaces — including when culture and contrast override the poster version of color psychology.",
  path: "/color-meaning",
  keywords: ["color meaning", "color psychology", "brand colors meaning", "ui color meaning"],
});

const COLORS = [
  {
    color: "Blue",
    hex: "#2563EB",
    meaning:
      "Competence, calm, “this system will still be here tomorrow.” Default for SaaS, banks, and docs. Overused — if every competitor is #2563EB, a quieter ink-blue plus a warm CTA can differentiate.",
    do: "Use for chrome, links, and info alerts when you want low drama.",
    dont: "Don’t assume blue is universally trusted in every market, and don’t use a mid blue for small text on white without checking contrast.",
  },
  {
    color: "Green",
    hex: "#16A34A",
    meaning:
      "Growth, health, success, “you can proceed.” Strong for eco brands and for semantic success — as long as success is not only a green dot.",
    do: "Pair with a check icon. Keep a separate brand green if your primary is already green so alerts stay readable.",
    dont: "Don’t rely on green vs red alone. Deuteranopia collapses that pair — simulate it before shipping charts.",
  },
  {
    color: "Red / rose",
    hex: "#E11D48",
    meaning:
      "Energy, urgency, passion — and in UI, often danger. colorBase uses rose #E11D48 as a brand accent, not as the only error color. In much of South and East Asia red also reads as festive or lucky, so context matters.",
    do: "Budget it as the one loud action, or as a distinct danger token — not both with the same HEX.",
    dont: "Don’t put 14px rose copy on white and call it a brand moment. Check the ratio.",
  },
  {
    color: "Orange",
    hex: "#EA580C",
    meaning:
      "Warmth, enthusiasm, “human.” Friendly CTAs and warnings that are not quite errors. Easy to make cheap if saturation is maxed on a pale background.",
    do: "Use for highlights, sale tags, or a secondary action that should feel energetic.",
    dont: "Don’t mix orange sale stickers with a red primary button. Pick one loud warm hue.",
  },
  {
    color: "Purple",
    hex: "#7C3AED",
    meaning:
      "Imagination, premium, “a bit more ritual than blue.” Common in creative tools and AI products (including our Copilot cues).",
    do: "Works as a secondary to a warmer primary, or as the primary for a creator brand.",
    dont: "Don’t stack purple gradients behind body copy. Contrast dies and the page looks like a template.",
  },
  {
    color: "Yellow / amber",
    hex: "#CA8A04",
    meaning:
      "Attention, optimism, caution. Excellent for warnings and empty-state illustrations. Poor as small text on white — yellow almost always needs a dark pairing.",
    do: "Use as a fill with near-black labels, or as a 3:1+ large heading on dark UI.",
    dont: "Don’t use yellow for long reading on a light canvas.",
  },
  {
    color: "Teal / cyan",
    hex: "#0D9488",
    meaning:
      "Clarity, health-tech, a less generic cousin of blue. Complements rose and coral well (that is why it often sits opposite our accent on the wheel).",
    do: "Strong secondary or data-viz hue in a rose/ink system.",
    dont: "Don’t neon-ify it on white; drop saturation for large surfaces.",
  },
  {
    color: "Neutrals",
    hex: "#57534E",
    meaning:
      "The unglamorous majority of any serious UI: text, borders, surfaces. Warm greys (stone) sit nicer next to rose; cool greys sit nicer next to blue.",
    do: "Design the neutral ramp first. Brand color is a guest.",
    dont: "Don’t use pure #000 on pure #FFF for huge text blocks on cheap screens — slight warmth or lift helps.",
  },
];

export default function ColorMeaningPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Color Meaning", href: "/color-meaning" },
        ]}
      />
      <h1 className="font-display text-4xl font-semibold">Color meaning in product UI</h1>
      <p className="mt-3 text-muted-foreground">
        Poster psychology (“blue means trust”) is a starting hypothesis. Contrast, labeling, and
        culture decide whether that hypothesis survives a real interface — including products used
        from India and abroad.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        We operate colorBase from Ranchi, Jharkhand. That does not change sRGB math, but it does
        change how we write about red and gold: festive in one context, alert in another. Always
        pair hue with copy. Test pairs in the{" "}
        <Link href="/contrast-checker" className="text-primary underline-offset-4 hover:underline">
          contrast checker
        </Link>{" "}
        and{" "}
        <Link href="/color-blind-simulator" className="text-primary underline-offset-4 hover:underline">
          color-blind simulator
        </Link>
        .
      </p>
      <div className="mt-8 space-y-4">
        {COLORS.map((item) => (
          <article key={item.color} className="glass rounded-2xl border border-border/60 p-5">
            <div className="flex gap-4">
              <Link
                href={`/color/${item.hex.slice(1).toLowerCase()}`}
                className="h-16 w-16 shrink-0 rounded-xl border border-black/5 shadow-sm"
                style={{ backgroundColor: item.hex }}
                aria-label={`${item.color} swatch ${item.hex}`}
              />
              <div className="min-w-0">
                <h2 className="font-display text-xl font-semibold">{item.color}</h2>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">{item.hex}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.meaning}</p>
              </div>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-foreground">Do</dt>
                <dd className="mt-1 text-muted-foreground">{item.do}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Don’t</dt>
                <dd className="mt-1 text-muted-foreground">{item.dont}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Longer read:{" "}
        <Link
          href="/blog/how-color-psychology-shapes-conversion-rates"
          className="text-primary underline-offset-4 hover:underline"
        >
          How color psychology shapes conversion rates
        </Link>
        . To build a set around one of these hues, use the{" "}
        <Link href="/palette-generator" className="text-primary underline-offset-4 hover:underline">
          palette generator
        </Link>
        .
      </p>
    </div>
  );
}
