import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ComplementaryTool } from "@/components/tools/complementary-tool";
import { ArrowRight, Compass, Sparkles, HelpCircle, Layers, Palette } from "lucide-react";

export const metadata: Metadata = createPageMetadata({
  title: "Complementary Colors Finder & Generator — Opposite Color Harmonies",
  description:
    "Find the exact opposite complementary color for any HEX or RGB code. Calculate 180° complements, split-complementary palettes, and check WCAG accessibility contrast.",
  path: "/complementary-colors",
  keywords: [
    "complementary colors",
    "opposite colors",
    "complementary color palette",
    "split complementary",
    "color wheel opposites",
    "contrasting colors",
  ],
});

const faqs = [
  {
    question: "What are complementary colors?",
    answer: "Complementary colors are pairs of colors that sit directly opposite each other (180 degrees apart) on the color wheel, such as Blue and Orange, Red and Green, or Purple and Yellow. When placed side by side, they produce the maximum possible visual contrast.",
  },
  {
    question: "How do you calculate a complementary color?",
    answer: "To calculate a complementary color programmatically: convert the color to the HSL color model, add 180 degrees to the Hue (modulo 360), and convert the resulting HSL value back to HEX or RGB. Saturation and Lightness can be preserved or slightly adjusted for text contrast.",
  },
  {
    question: "What is split-complementary?",
    answer: "A split-complementary color scheme uses a base color plus the two colors on either side of its direct complement (150 degrees and 210 degrees on the wheel). It provides vibrant contrast similar to a complementary scheme but with less visual tension.",
  },
  {
    question: "Why do complementary colors sometimes vibrate?",
    answer: "When two fully saturated complementary colors (like pure red and pure green) touch directly with equal lightness, the human visual cortex struggles to resolve their edges simultaneously, creating chromatic vibration. To fix this, adjust the lightness of one color or separate them with a neutral border.",
  },
];

export default function ComplementaryColorsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Complementary Colors", href: "/complementary-colors" },
  ];

  const famousPairs = [
    {
      name: "Sage Green & Dusty Mauve",
      color1: "#9CAF88",
      color2: "#AF889C",
      mood: "Organic tranquility and soft contemporary elegance.",
    },
    {
      name: "Classic Blue & Warm Amber",
      color1: "#1E40AF",
      color2: "#D97706",
      mood: "Authoritative security with energetic high-conversion accents.",
    },
    {
      name: "Terracotta & Duck Egg Blue",
      color1: "#E2725B",
      color2: "#5BE2D8",
      mood: "Mediterranean warmth balanced with breezy coastal serenity.",
    },
    {
      name: "Emerald Green & Deep Crimson",
      color1: "#10B981",
      color2: "#E11D48",
      mood: "Vibrant botanical energy with striking focal clarity.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />

      {/* Header */}
      <header className="mt-4 rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/70 to-card/40 p-6 sm:p-10 shadow-xs">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Color Harmony Calculator
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Complementary Color Finder
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Discover the mathematical 180° opposite of any color. Build high-contrast, accessible palettes for websites, branding, interior rooms, and digital art.
        </p>
      </header>

      {/* Interactive Tool */}
      <section className="mt-8">
        <ComplementaryTool />
      </section>

      {/* Famous Harmonious Pairs */}
      <section className="mt-12">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="font-display text-2xl font-bold tracking-tight">Curated Designer Complementary Pairings</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Real-world complementary pairs that avoid harsh eye-strain by balancing tone, saturation, and lightness.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {famousPairs.map((pair) => (
            <div key={pair.name} className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
              <div className="flex h-28">
                <div
                  className="flex flex-1 items-end p-3 font-mono text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: pair.color1 }}
                >
                  {pair.color1}
                </div>
                <div
                  className="flex flex-1 items-end p-3 font-mono text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: pair.color2 }}
                >
                  {pair.color2}
                </div>
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="font-display text-base font-bold text-foreground">{pair.name}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{pair.mood}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            Frequently Asked Questions about Complementary Colors
          </h2>
        </div>
        <div className="mt-6 divide-y divide-border/60">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-4 first:pt-0 last:pb-0">
              <h3 className="text-base font-semibold text-foreground">{faq.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Navigation */}
      <section className="mt-8 rounded-2xl border border-border/60 bg-muted/20 p-5 sm:p-6">
        <h3 className="font-display text-base font-bold text-foreground">Explore Related Color Theory Tools</h3>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link
            href="/color-wheel"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Interactive Color Wheel <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/color-theory"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Color Theory Principles <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/color-palette-generator"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Color Palette Generator <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/house-color-combinations"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            House Color Combinations <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
