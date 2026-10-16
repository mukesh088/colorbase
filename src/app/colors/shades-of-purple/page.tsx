import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { CopyButton } from "@/components/color/copy-button";
import { ArrowRight, Sparkles, HelpCircle, Palette } from "lucide-react";

export const metadata: Metadata = createPageMetadata({
  title: "Shades of Purple — 20+ Hex Codes, Names, Palettes & Color Meanings",
  description:
    "Explore the complete spectrum of shades of purple with exact HEX, RGB, and HSL codes. Discover lavender, lilac, violet, mauve, plum, amethyst, and royal purple for web design, branding, and fashion.",
  path: "/colors/shades-of-purple",
  keywords: [
    "shades of purple",
    "purple color codes",
    "lavender color",
    "lilac color hex",
    "violet color",
    "mauve color",
    "plum hex code",
    "purple palette",
  ],
});

const PURPLE_SHADES = [
  { name: "Royal Purple", hex: "#7851A9", desc: "The definitive regal tone historically worn by emperors, symbolizing sovereignty and grandeur." },
  { name: "Lavender", hex: "#E6E6FA", desc: "Soft, misty botanical pastel with gentle silvery undertones promoting serenity and sleep." },
  { name: "Lilac", hex: "#C8A2C8", desc: "Pale pinkish-purple evoking spring blossoms, gentle nostalgia, and youth." },
  { name: "Mauve", hex: "#E0B0FF", desc: "The first synthetic aniline dye discovered in 1856, pairing warm violet with soft vintage pink." },
  { name: "Violet", hex: "#8F00FF", desc: "The shortest wavelength of visible light, vibrant and electric with high spiritual resonance." },
  { name: "Plum", hex: "#8E4585", desc: "Rich fruit tone blending deep reddish purple with warm autumn depth." },
  { name: "Amethyst", hex: "#9966CC", desc: "Crystalline quartz purple associated with clarity, calm focus, and creative intuition." },
  { name: "Deep Eggplant", hex: "#311432", desc: "Near-black moody purple favored in luxury packaging and dramatic living spaces." },
  { name: "Indigo", hex: "#4B0082", desc: "Deep mystical hue between blue and violet, conveying nocturnal contemplation and depth." },
  { name: "Cyber Violet", hex: "#7000FF", desc: "High-voltage neon purple trending in Web3, cyberpunk games, and tech interfaces." },
  { name: "Mulberry", hex: "#C54B8C", desc: "Juicy berry tone balancing pink vibrancy with rich wine undertones." },
  { name: "Periwinkle", hex: "#CCCCFF", desc: "Playful floral pastel straddling the border between soft blue and pale violet." },
];

const faqs = [
  {
    question: "What is the difference between purple and violet?",
    answer: "Scientifically, violet is a true spectral color with its own single wavelength of light (around 380–450 nm) at the end of the visible spectrum. Purple is a composite (non-spectral) color created in human vision by stimulating both red and blue light receptors simultaneously.",
  },
  {
    question: "What colors pair best with shades of purple?",
    answer: "Purple pairs dramatically with its complementary color, Yellow/Gold (#ECC94B or #D97706), for royal contrast. For soft, calming palettes, pair purple with Sage Green (#9CAF88), Cream (#FAF9F6), or Soft Blush Pink (#FFD1DC).",
  },
  {
    question: "What does purple symbolize in branding and psychology?",
    answer: "Purple balances the physical energy of red with the calm stability of blue. It universally evokes luxury, wisdom, mystery, spiritual intuition, and creative innovation. Prominently used by brands targeting imagination, premium confectionery, and wellness.",
  },
];

export default function ShadesOfPurplePage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Colors", href: "/colors" },
    { name: "Shades of Purple", href: "/colors/shades-of-purple" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />

      {/* Header */}
      <header className="mt-4 rounded-3xl border border-border/80 bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-card p-6 sm:p-10 shadow-xs">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-300">
          <Sparkles className="h-3.5 w-3.5" />
          Color Spectrum Showcase
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Shades of Purple &amp; Violet Color Codes
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          From ethereal pastels like lavender and lilac to regal amethyst and deep eggplant. Discover hex codes, RGB coordinates, and harmonious palette pairings for every shade of purple.
        </p>
      </header>

      {/* Grid */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            Popular Purple Swatches
          </h2>
          <span className="text-xs text-muted-foreground">{PURPLE_SHADES.length} Curated Tones</span>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PURPLE_SHADES.map((c) => (
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
            Frequently Asked Questions about Purple
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
        <h3 className="font-display text-base font-bold text-foreground">Explore Related Colors</h3>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link
            href="/colors/lavender"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Lavender Color Details <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/colors/violet"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Violet Color Details <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/colors/lilac"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Lilac Color Details <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/complementary-colors"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Find Purple&apos;s Complement <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
