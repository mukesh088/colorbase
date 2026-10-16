import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { CopyButton } from "@/components/color/copy-button";
import { ArrowRight, Sparkles, HelpCircle, Palette, ShieldAlert } from "lucide-react";

export const metadata: Metadata = createPageMetadata({
  title: "Pastel Colors — Aesthetic Hex Codes, Palettes & Soft Color Guide",
  description:
    "Explore the ultimate collection of aesthetic pastel colors with exact HEX, RGB, and HSL codes. Discover pastel pink, baby blue, mint green, lavender, and gentle pastel color palettes for web UI and branding.",
  path: "/colors/pastel-colors",
  keywords: [
    "pastel colors",
    "pastel color palette",
    "soft colors",
    "pastel pink hex",
    "pastel blue hex",
    "pastel green",
    "aesthetic pastel colors",
    "light pastel color codes",
  ],
});

const PASTEL_PALETTE = [
  { name: "Pastel Pink", hex: "#FFD1DC", desc: "Gentle cherry blossom blush, perfect for soft cosmetic branding and calming backgrounds." },
  { name: "Pastel Blue", hex: "#AEC6CF", desc: "Serene powder sky blue that instills trust, cleanliness, and effortless spaciousness." },
  { name: "Pastel Green", hex: "#77DD77", desc: "Soothing spring botanical tint reminiscent of fresh mint and gentle pistachio." },
  { name: "Pastel Yellow", hex: "#FDFD96", desc: "Soft morning sunlight, warm creaminess without the aggressive glare of pure yellow." },
  { name: "Pastel Lavender", hex: "#CFCFC4", desc: "Silvery floral mauve offering understated vintage charm and soothing clarity." },
  { name: "Pastel Peach", hex: "#FFDAB9", desc: "Warm apricot sorbet that radiates friendly hospitality and welcoming optimism." },
  { name: "Pastel Mint", hex: "#BDFCC9", desc: "Crisp and refreshing botanical frost suited for modern health and eco apps." },
  { name: "Pastel Lilac", hex: "#D8BFD8", desc: "Delicate thistled violet with subtle romantic elegance and playful creativity." },
  { name: "Duck Egg Blue", hex: "#C3D9D9", desc: "Muted heritage coastal blue with soft grey undertones for timeless calm." },
  { name: "Dusty Rose", hex: "#DCAE96", desc: "Earthy vintage blush combining terracotta warmth with feminine romance." },
  { name: "Soft Sage", hex: "#B2AC88", desc: "Silvery dried herb green, an interior design favorite for relaxing spaces." },
  { name: "Pale Coral", hex: "#F88379", desc: "Warm marine melon with cheerful vibrancy, softened for prolonged screen viewing." },
];

const faqs = [
  {
    question: "What makes a color 'pastel'?",
    answer: "Pastel colors are high-lightness, low-to-medium saturation colors created by blending a substantial amount of white into a pure hue. In the HSL color model, pastels typically feature lightness values between 75% and 92% and saturation between 40% and 80%.",
  },
  {
    question: "Are pastel colors accessible for website body text?",
    answer: "No. Because pastel colors are very light, they lack sufficient contrast against white (#FFFFFF) backgrounds (frequently failing WCAG 2.1 AA with ratios below 2:1). Pastels should be used for card backgrounds, badges, or illustrations with dark (#18181B) text placed on top.",
  },
  {
    question: "Which colors pair best with pastel palettes?",
    answer: "Pastels pair beautifully with deep anchor neutrals such as Charcoal (#27272A), Slate Navy (#1E293B), or Rich Espresso (#292524) to establish visual structure, grounding, and readable typography.",
  },
];

export default function PastelColorsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Colors", href: "/colors" },
    { name: "Pastel Colors", href: "/colors/pastel-colors" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />

      {/* Header */}
      <header className="mt-4 rounded-3xl border border-border/80 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-card p-6 sm:p-10 shadow-xs">
        <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-600 dark:text-pink-400">
          <Sparkles className="h-3.5 w-3.5" />
          Curated Color Collection
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Aesthetic Pastel Colors &amp; Hex Codes
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Explore soft, soothing pastel colors with exact HEX, RGB, and HSL values. From dreamy pastel pinks and baby blues to calming mint and lavender, copy codes instantly or export to your design workflow.
        </p>
      </header>

      {/* Accessibility warning banner */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div>
          <strong className="text-foreground">Designer Accessibility Tip:</strong> Because pastels are naturally light and airy, never use them as small body copy against white backgrounds. Use them as background tints, chip surfaces, or borders, and pair them with deep charcoal text (#18181B) to pass WCAG AA contrast.
        </div>
      </div>

      {/* Grid of Pastel Colors */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            Popular Pastel Color Swatches
          </h2>
          <span className="text-xs text-muted-foreground">{PASTEL_PALETTE.length} Curated Hues</span>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PASTEL_PALETTE.map((c) => (
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
            Frequently Asked Questions about Pastel Colors
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
        <h3 className="font-display text-base font-bold text-foreground">Explore More Color Collections</h3>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link
            href="/colors/neutral-colors"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Neutral Colors Collection <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/colors/shades-of-purple"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Shades of Purple <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/color-palette-generator"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Color Palette Generator <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
