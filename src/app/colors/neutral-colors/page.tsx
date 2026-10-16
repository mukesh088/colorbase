import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { CopyButton } from "@/components/color/copy-button";
import { ArrowRight, Sparkles, HelpCircle, Layers, Home } from "lucide-react";

export const metadata: Metadata = createPageMetadata({
  title: "Neutral Colors — Hex Codes, Warm & Cool Palettes for Interiors & UI",
  description:
    "Explore the complete guide to neutral colors with exact HEX, RGB, and HSL codes. Discover beige, taupe, greige, ivory, slate grey, and warm cream palettes for architecture, interior decor, and minimalist web design.",
  path: "/colors/neutral-colors",
  keywords: [
    "neutral colors",
    "neutral color palette",
    "warm neutrals",
    "cool neutrals",
    "beige color code",
    "taupe hex",
    "greige paint color",
    "off white color hex",
  ],
});

const NEUTRAL_PALETTE = [
  { name: "Warm Beige", hex: "#F5F5DC", undertone: "Warm Yellow", desc: "A timeless sandy foundation conveying natural linen and grounded simplicity." },
  { name: "Classic Taupe", hex: "#483C32", undertone: "Warm Brown-Grey", desc: "Complex earthy neutral offering refined depth without the severity of pure black." },
  { name: "Architectural Off-White", hex: "#FAF9F6", undertone: "Soft Warm", desc: "Museum-grade background white that prevents harsh screen glare and eye fatigue." },
  { name: "Greige", hex: "#B0A89F", undertone: "Balanced Grey-Beige", desc: "The perfect bridge between cool contemporary grey and cozy warm beige." },
  { name: "Ivory Cream", hex: "#FFFFF0", undertone: "Warm Milk", desc: "Soft and luxurious, ideal for wedding stationary, quiet luxury, and traditional trim." },
  { name: "Slate Grey", hex: "#708090", undertone: "Cool Blue-Grey", desc: "Clean industrial neutrality bringing structure, composure, and modern clarity." },
  { name: "Charcoal Black", hex: "#262626", undertone: "Deep Neutral", desc: "High-contrast anchor for typography, hardware, and dark-mode surfaces." },
  { name: "Sandstone", hex: "#D2B48C", undertone: "Warm Earth", desc: "Desert mineral warmth favored for Southwestern facades, rugs, and leather goods." },
  { name: "Alabaster", hex: "#F2F0EB", undertone: "Subtle Warm Grey", desc: "A top-rated interior designer wall color that flatters both natural and warm artificial light." },
  { name: "Oatmeal", hex: "#E3DAC9", undertone: "Warm Grain", desc: "Textural ceramic neutral that pairs effortlessly with raw oak and matte brass." },
  { name: "Pewter", hex: "#8A8D8F", undertone: "Cool Metallic", desc: "Understated mid-tone grey for secondary UI typography and metallic accents." },
  { name: "Espresso Brown", hex: "#362B28", undertone: "Deep Warm", desc: "Rich roasted coffee tone providing grounding luxury in executive branding." },
];

const faqs = [
  {
    question: "What are neutral colors?",
    answer: "Neutral colors are hues that appear to be without color or have very low saturation, including beige, grey, taupe, cream, off-white, black, and brown. Because they don't dominate the visual field, they act as the structural backdrop in both interior architecture and digital design systems.",
  },
  {
    question: "What is the difference between warm neutrals and cool neutrals?",
    answer: "Warm neutrals (such as beige, cream, sand, and taupe) contain subtle yellow, red, or orange undertones, creating a cozy, inviting, and organic atmosphere. Cool neutrals (like slate grey, silver, and charcoal) have blue, green, or violet undertones, communicating crisp modernism, efficiency, and focus.",
  },
  {
    question: "What is 'greige' and why is it so popular?",
    answer: "Greige (#B0A89F) is a hybrid blend of grey and beige. It solved the common complaint of cool grey feeling too clinical and warm beige looking dated, providing a versatile backdrop that complements both warm wooden flooring and modern cool stainless steel appliances.",
  },
];

export default function NeutralColorsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Colors", href: "/colors" },
    { name: "Neutral Colors", href: "/colors/neutral-colors" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />

      {/* Header */}
      <header className="mt-4 rounded-3xl border border-border/80 bg-gradient-to-br from-amber-500/10 via-stone-500/5 to-card p-6 sm:p-10 shadow-xs">
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-500/20 bg-stone-500/10 px-3 py-1 text-xs font-semibold text-stone-600 dark:text-stone-300">
          <Layers className="h-3.5 w-3.5" />
          Essential Design Tokens
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Neutral Colors &amp; Warm Earth Tones
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Master the backbone of interior design and UI design systems. Explore warm beiges, greiges, off-whites, and deep charcoals with verified HEX codes, undertone analysis, and real-world pairing tips.
        </p>
      </header>

      {/* Swatch Grid */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            Curated Neutral Swatches
          </h2>
          <span className="text-xs text-muted-foreground">{NEUTRAL_PALETTE.length} Essential Tones</span>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {NEUTRAL_PALETTE.map((c) => (
            <div
              key={c.name}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 transition-colors"
            >
              <div
                className="h-32 w-full transition-transform duration-300 hover:scale-[1.02]"
                style={{ backgroundColor: c.hex }}
              />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-foreground">{c.name}</h3>
                  <CopyButton value={c.hex} label={c.hex} size="sm" variant="outline" className="h-7 text-xs font-mono" />
                </div>
                <span className="mt-1 inline-block text-[11px] font-semibold text-primary">
                  {c.undertone} Undertone
                </span>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.desc}</p>
                <div className="mt-3 flex items-center justify-between pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                  <span className="font-mono font-bold text-foreground">{c.hex}</span>
                  <Link
                    href={`/color/${c.hex.replace("#", "")}`}
                    className="inline-flex items-center gap-1 font-medium hover:text-primary transition-colors"
                  >
                    Details <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
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
            Frequently Asked Questions about Neutral Colors
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

      {/* Related Explorations */}
      <section className="mt-8 rounded-2xl border border-border/60 bg-muted/20 p-5 sm:p-6">
        <h3 className="font-display text-base font-bold text-foreground">Explore Related Design Tools</h3>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link
            href="/house-color-combinations"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            House Color Combinations <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/colors/pastel-colors"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Pastel Colors Collection <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/colors/shades-of-purple"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Shades of Purple <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
