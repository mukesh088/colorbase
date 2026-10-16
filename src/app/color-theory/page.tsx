import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ArrowRight, Compass, Eye, Layers, Palette, Sparkles, ShieldCheck, HelpCircle } from "lucide-react";

export const metadata: Metadata = createPageMetadata({
  title: "Color Theory Guide — Principles, Harmonies & Practical Application",
  description:
    "Master color theory with our complete visual guide. Learn primary, secondary, and tertiary colors, color harmonies (complementary, analogous, triadic), warm vs cool psychology, and accessible UI design.",
  path: "/color-theory",
  keywords: [
    "color theory",
    "color theory guide",
    "color wheel theory",
    "complementary colors",
    "analogous colors",
    "triadic colors",
    "warm vs cool colors",
    "color harmony",
  ],
});

const faqs = [
  {
    question: "What is color theory?",
    answer: "Color theory is a practical system of rules and guidelines that explains how humans perceive colors, how colors blend, and the visual effects of how colors are paired together on the color wheel.",
  },
  {
    question: "What are the primary, secondary, and tertiary colors?",
    answer: "In traditional subtractive art (RYB), primary colors are Red, Yellow, and Blue. Secondary colors (Green, Orange, Purple) are formed by mixing two primaries. Tertiary colors (like red-orange, yellow-green, blue-purple) are formed by mixing a primary with an adjacent secondary color. In digital screen design (RGB), the additive primaries are Red, Green, and Blue.",
  },
  {
    question: "What is the difference between a tint, shade, and tone?",
    answer: "A tint is created by adding white to a pure hue (increasing lightness). A shade is created by adding black to a pure hue (decreasing lightness). A tone is created by adding grey (both black and white) to a hue, desaturating it.",
  },
  {
    question: "How do color harmonies affect digital interface design?",
    answer: "Harmonies ensure visual balance and hierarchy. Monochromatic and analogous schemes create clean, cohesive backgrounds and secondary surfaces, while complementary accents draw high-contrast attention to calls-to-action (CTAs) and interactive highlights.",
  },
];

export default function ColorTheoryPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Theory", href: "/color-theory" },
  ];

  const primaryColors = [
    { name: "Cadmium Red", hex: "#E53E3E", desc: "Stimulating, energetic, high urgency" },
    { name: "Vibrant Yellow", hex: "#ECC94B", desc: "Optimistic, radiant, high visibility" },
    { name: "Cobalt Blue", hex: "#3182CE", desc: "Calming, trustworthy, stable depth" },
  ];

  const harmonies = [
    {
      title: "Complementary",
      angle: "180° Opposite",
      desc: "Colors situated directly across from one another on the color wheel. Delivers the strongest visual contrast and highest energy.",
      examples: ["#3182CE", "#DD6B20"],
      usage: "Hero buttons, high-priority badge highlights, and dramatic artistic contrast.",
    },
    {
      title: "Analogous",
      angle: "30° - 60° Adjacent",
      desc: "Colors that sit side-by-side on the wheel. They share common undertones and occur naturally in nature, creating peaceful, comfortable rhythms.",
      examples: ["#2B6CB0", "#319795", "#38A169"],
      usage: "Editorial layouts, website backgrounds, gradients, and calming brand suites.",
    },
    {
      title: "Triadic",
      angle: "120° Equidistant Triangle",
      desc: "Three colors spaced equally around the wheel. Provides rich chromatic diversity while maintaining balanced harmony.",
      examples: ["#E53E3E", "#D69E2E", "#3182CE"],
      usage: "Playful brand identities, infographics, data visualizations, and creative illustrations.",
    },
    {
      title: "Split-Complementary",
      angle: "Base + 150° / 210°",
      desc: "A variation of the complementary scheme using the base color plus the two colors adjacent to its complement. Delivers contrast with less tension.",
      examples: ["#805AD5", "#D69E2E", "#38A169"],
      usage: "Balanced user interfaces where you need contrast without overwhelming the eye.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />

      {/* Header */}
      <header className="mt-4 rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/70 to-card/40 p-6 sm:p-10 shadow-xs">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Compass className="h-3.5 w-3.5" />
          Foundation &amp; Reference Guide
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Color Theory for Modern Creators
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Color theory combines science, psychology, and design to explain how colors interact, evoke emotion, and guide user attention. Explore fundamental harmonies, the color wheel, and practical rules for building accessible palettes.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/color-wheel"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            Interactive Color Wheel <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/complementary-colors"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
          >
            Complementary Colors Tool
          </Link>
          <Link
            href="/color-palette-generator"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
          >
            Palette Generator
          </Link>
        </div>
      </header>

      {/* Primary, Secondary, Tertiary */}
      <section className="mt-10">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="font-display text-2xl font-bold tracking-tight">The Color Wheel Anatomy</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          First developed by Sir Isaac Newton in 1666, the color wheel maps the spectrum of visible light into a continuous 360° circle.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">1. Primary Colors</span>
            <h3 className="mt-2 font-display text-lg font-bold">Pure, Unmixable Foundations</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              In traditional art (RYB), Red, Yellow, and Blue cannot be created by mixing other colors. In digital screens (RGB additive), Red, Green, and Blue combine to create pure white light.
            </p>
            <div className="mt-4 flex gap-2">
              {primaryColors.map((c) => (
                <div
                  key={c.name}
                  className="h-10 flex-1 rounded-lg border border-black/10 shadow-xs"
                  style={{ backgroundColor: c.hex }}
                  title={`${c.name} (${c.hex})`}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">2. Secondary Colors</span>
            <h3 className="mt-2 font-display text-lg font-bold">Two Primaries Combined</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Created by mixing two primary colors in equal proportions: Orange (Red + Yellow), Green (Yellow + Blue), and Purple / Violet (Blue + Red).
            </p>
            <div className="mt-4 flex gap-2">
              <div className="h-10 flex-1 rounded-lg border border-black/10" style={{ backgroundColor: "#ED8936" }} title="Orange" />
              <div className="h-10 flex-1 rounded-lg border border-black/10" style={{ backgroundColor: "#38A169" }} title="Green" />
              <div className="h-10 flex-1 rounded-lg border border-black/10" style={{ backgroundColor: "#805AD5" }} title="Purple" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">3. Tertiary Colors</span>
            <h3 className="mt-2 font-display text-lg font-bold">Nuanced In-Between Tones</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Formed by mixing a primary with its adjacent secondary color: Red-Orange, Yellow-Orange, Yellow-Green, Blue-Green (Teal), Blue-Violet, and Red-Violet (Magenta).
            </p>
            <div className="mt-4 flex gap-2">
              <div className="h-10 flex-1 rounded-lg border border-black/10" style={{ backgroundColor: "#DD6B20" }} title="Red-Orange" />
              <div className="h-10 flex-1 rounded-lg border border-black/10" style={{ backgroundColor: "#319795" }} title="Blue-Green" />
              <div className="h-10 flex-1 rounded-lg border border-black/10" style={{ backgroundColor: "#B83280" }} title="Red-Violet" />
            </div>
          </div>
        </div>
      </section>

      {/* Harmonies */}
      <section className="mt-12">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="font-display text-2xl font-bold tracking-tight">The 4 Major Color Harmonies</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Harmonies are geometric formulas that define which colors look naturally pleasing when viewed together.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {harmonies.map((h) => (
            <div key={h.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">{h.title}</h3>
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  {h.angle}
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{h.desc}</p>
              
              <div className="mt-4 flex h-14 overflow-hidden rounded-xl border border-border">
                {h.examples.map((hex, idx) => (
                  <div
                    key={idx}
                    className="flex flex-1 items-end justify-center pb-2 text-[10px] font-mono font-bold text-white shadow-xs"
                    style={{ backgroundColor: hex }}
                  >
                    {hex}
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                <strong className="text-foreground">Best For:</strong> {h.usage}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Warm vs Cool Psychology */}
      <section className="mt-12 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <h2 className="font-display text-2xl font-bold tracking-tight">Warm vs Cool Color Psychology</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          The color temperature of an interface or room dramatically influences psychological perception and emotional response.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Warm Colors (Reds, Oranges, Yellows)
            </span>
            <h3 className="mt-2 font-display text-lg font-bold">Energy, Appetite &amp; Urgency</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Warm colors visually advance toward the viewer, appearing larger and closer. They stimulate heart rate, evoke feelings of comfort, hospitality, and dynamism. Used extensively in food, fitness, and e-commerce checkout buttons.
            </p>
            <div className="mt-4 flex gap-2">
              <div className="h-8 flex-1 rounded bg-[#E53E3E]" />
              <div className="h-8 flex-1 rounded bg-[#DD6B20]" />
              <div className="h-8 flex-1 rounded bg-[#ECC94B]" />
            </div>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Cool Colors (Blues, Greens, Purples)
            </span>
            <h3 className="mt-2 font-display text-lg font-bold">Trust, Serenity &amp; Focus</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Cool colors visually recede, creating a sensation of space, calm, and clarity. They promote mental focus, convey institutional security, and reduce visual fatigue. Dominant across fintech, healthcare, and productivity apps.
            </p>
            <div className="mt-4 flex gap-2">
              <div className="h-8 flex-1 rounded bg-[#3182CE]" />
              <div className="h-8 flex-1 rounded bg-[#319795]" />
              <div className="h-8 flex-1 rounded bg-[#805AD5]" />
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility & WCAG */}
      <section className="mt-12 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="font-display text-2xl font-bold tracking-tight">The Golden Rule: Contrast &amp; Accessibility</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Never rely on color alone to convey meaning (such as error states or critical warnings). To meet WCAG 2.1 AA standards, standard body text must have a minimum contrast ratio of <strong>4.5:1</strong> against its background, and large text (18pt+ or bold 14pt+) must achieve at least <strong>3:1</strong>.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/contrast-checker"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            Open Contrast Checker <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/accessibility-checker"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
          >
            Color Blindness Simulator
          </Link>
        </div>
      </section>

      {/* FAQs */}
      <section className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            Frequently Asked Questions about Color Theory
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
    </div>
  );
}
