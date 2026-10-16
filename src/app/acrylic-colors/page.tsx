import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ArtPigmentTool, type ArtPigment } from "@/components/tools/art-pigment-tool";
import { ArrowRight, Paintbrush, Sparkles, HelpCircle, Palette } from "lucide-react";

export const metadata: Metadata = createPageMetadata({
  title: "Acrylic Paint Colors & Heavy Body Pigment Index — ColorBase",
  description:
    "Explore the essential acrylic paint colors reference guide. Discover pigment codes (PW6, PB15:3, PR254), opacity, lightfastness ratings, and accurate digital HEX swatches for acrylic painters and illustrators.",
  path: "/acrylic-colors",
  keywords: [
    "acrylic colour",
    "acrylic paint colors",
    "acrylic color reference",
    "heavy body acrylic palette",
    "phthalo blue pb15",
    "pyrrole red pr254",
    "titanium white acrylic",
    "acrylic mixing palette",
  ],
});

const ACRYLIC_PIGMENTS: ArtPigment[] = [
  {
    name: "Titanium White",
    hex: "#FFFFFF",
    pigmentCode: "PW6",
    opacity: "Opaque",
    lightfastness: "ASTM I (Excellent)",
    washNote: "The undisputed workhorse white with maximum opacity, brilliant whiteness, and intense tinting power.",
    category: "Metallic & White",
  },
  {
    name: "Phthalo Blue (Green Shade)",
    hex: "#000F89",
    pigmentCode: "PB15:3",
    opacity: "Transparent",
    lightfastness: "ASTM I (Excellent)",
    washNote: "Extremely powerful synthetic cyan blue. A tiny speck tints entire jars of white.",
    category: "Cool Primary",
  },
  {
    name: "Ultramarine Blue",
    hex: "#1B3F8B",
    pigmentCode: "PB29",
    opacity: "Semi-Transparent",
    lightfastness: "ASTM I (Excellent)",
    washNote: "Deep, rich reddish-blue essential for shadows and atmospheric depth in heavy body acrylic.",
    category: "Cool Primary",
  },
  {
    name: "Pyrrole Red",
    hex: "#E0115F",
    pigmentCode: "PR254",
    opacity: "Opaque",
    lightfastness: "ASTM I (Excellent)",
    washNote: "Modern Ferrari-red synthetic pigment. Unrivaled lightfastness replacing fugitive cadmium reds.",
    category: "Warm Primary",
  },
  {
    name: "Quin Rose / Magenta",
    hex: "#C71585",
    pigmentCode: "PV19",
    opacity: "Transparent",
    lightfastness: "ASTM I (Excellent)",
    washNote: "Vibrant cool primary magenta. Essential for mixing clean, luminous purples and violets.",
    category: "Cool Primary",
  },
  {
    name: "Hansa Yellow Medium",
    hex: "#FFD300",
    pigmentCode: "PY73",
    opacity: "Semi-Transparent",
    lightfastness: "ASTM II (Very Good)",
    washNote: "Bright, clean, non-toxic organic yellow ideal for brilliant landscape greens.",
    category: "Warm Primary",
  },
  {
    name: "Yellow Oxide / Ochre",
    hex: "#CC7722",
    pigmentCode: "PY42",
    opacity: "Opaque",
    lightfastness: "ASTM I (Excellent)",
    washNote: "Synthetic yellow iron oxide with creamy opacity and warm, durable earth undertones.",
    category: "Earth",
  },
  {
    name: "Burnt Sienna",
    hex: "#E97451",
    pigmentCode: "PBr7",
    opacity: "Semi-Opaque",
    lightfastness: "ASTM I (Excellent)",
    washNote: "Warm, fiery mahogany earth tone for skin underpaintings, wood, and rich shadows.",
    category: "Earth",
  },
  {
    name: "Phthalo Green (Blue Shade)",
    hex: "#123524",
    pigmentCode: "PG7",
    opacity: "Transparent",
    lightfastness: "ASTM I (Excellent)",
    washNote: "Staining, cold synthetic emerald green with massive tinting strength in acrylic glazes.",
    category: "Botanical",
  },
  {
    name: "Carbon Black",
    hex: "#131313",
    pigmentCode: "PBk7",
    opacity: "Opaque",
    lightfastness: "ASTM I (Excellent)",
    washNote: "Neutral, dense black produced from pure carbon soot. High tinting strength.",
    category: "Metallic & White",
  },
  {
    name: "Iridescent Rich Gold",
    hex: "#D4AF37",
    pigmentCode: "Mica+Iron",
    opacity: "Semi-Opaque",
    lightfastness: "ASTM I (Excellent)",
    washNote: "Mica flakes coated with metal oxides to produce shimmering reflective metallic highlights.",
    category: "Metallic & White",
  },
  {
    name: "Dioxazine Purple",
    hex: "#4D0F3F",
    pigmentCode: "PV23",
    opacity: "Semi-Opaque",
    lightfastness: "ASTM II (Very Good)",
    washNote: "Near-black deep violet in mass tone, dispersing into electric floral purple glazes.",
    category: "Cool Primary",
  },
];

const faqs = [
  {
    question: "Do acrylic paint colors dry darker than when wet?",
    answer: "Yes. Acrylic emulsion binder appears milky white when wet and dries completely clear. As the water evaporates and the binder clarifies, acrylic colors generally shift 10% to 20% darker (known as color shift) depending on the brand and pigment concentration.",
  },
  {
    question: "What is the difference between Heavy Body and Fluid acrylic colors?",
    answer: "Heavy body acrylics have a thick, buttery consistency that holds brush strokes and palette knife peaks (impasto). Fluid acrylics have the exact same high pigment load but a pourable, water-like viscosity ideal for smooth glazing, leveling, and detail work.",
  },
  {
    question: "What is the best primary trio for acrylic color mixing?",
    answer: "For the cleanest, least-muddy secondary mixtures, use a CMYK-based modern trio: Quinacridone Magenta (PV19), Phthalo Blue (PB15:3), and Hansa Yellow (PY73), supplemented by Titanium White (PW6).",
  },
];

export default function AcrylicColorsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Acrylic Colors", href: "/acrylic-colors" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />

      {/* Header */}
      <header className="mt-4 rounded-3xl border border-border/80 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-card p-6 sm:p-10 shadow-xs">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Paintbrush className="h-3.5 w-3.5" />
          Heavy Body &amp; Fluid Paint Palette
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Acrylic Paint Colors &amp; Pigment Index
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Master acrylic color palettes with calibrated digital HEX codes, pigment classifications, opacity metrics, and lightfastness ratings for canvas painters and digital concept artists.
        </p>
      </header>

      {/* Interactive Tool */}
      <section className="mt-8">
        <ArtPigmentTool medium="Acrylic" pigments={ACRYLIC_PIGMENTS} />
      </section>

      {/* FAQs */}
      <section className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            Frequently Asked Questions about Acrylic Paint
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
        <h3 className="font-display text-base font-bold text-foreground">Explore Related Color Tools</h3>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link
            href="/watercolor-colors"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Watercolor Pigment Codes <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/color-pencil-colors"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Colored Pencil Palette Reference <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/color-palette-generator"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Palette Generator <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
