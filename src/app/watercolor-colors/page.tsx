import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ArtPigmentTool, type ArtPigment } from "@/components/tools/art-pigment-tool";
import { ArrowRight, Paintbrush, Sparkles, HelpCircle, Palette, Droplet } from "lucide-react";

export const metadata: Metadata = createPageMetadata({
  title: "Watercolor Colors & Pigment Codes — Artist Paint Palette & Hex Guide",
  description:
    "Explore essential artist watercolor paint colors with exact pigment codes (PB29, PR108, PY43), digital HEX values, lightfastness ratings, granulation, and transparency details for fine art and digital illustration.",
  path: "/watercolor-colors",
  keywords: [
    "watercolor paint",
    "watercolor colors",
    "watercolor pigment codes",
    "artist watercolor palette",
    "transparent watercolor hex",
    "ultramarine blue pb29",
    "burnt sienna pbr7",
    "cadmium red watercolor",
  ],
});

const WATERCOLOR_PIGMENTS: ArtPigment[] = [
  {
    name: "French Ultramarine",
    hex: "#1B3F8B",
    pigmentCode: "PB29",
    opacity: "Transparent",
    lightfastness: "ASTM I (Excellent)",
    granulation: "High",
    washNote: "Warm reddish-blue with rich dramatic granulation in wet-on-wet washes.",
    category: "Cool Primary",
  },
  {
    name: "Cobalt Blue",
    hex: "#0047AB",
    pigmentCode: "PB28",
    opacity: "Semi-Transparent",
    lightfastness: "ASTM I (Excellent)",
    granulation: "Medium",
    washNote: "Clean, neutral primary sky blue that mixes cleanly without turning muddy.",
    category: "Cool Primary",
  },
  {
    name: "Cerulean Blue Genuine",
    hex: "#2A52BE",
    pigmentCode: "PB35",
    opacity: "Semi-Opaque",
    lightfastness: "ASTM I (Excellent)",
    granulation: "High",
    washNote: "Cool, chalky sky blue with distinct mottled mineral granulation.",
    category: "Cool Primary",
  },
  {
    name: "Cadmium Red Medium",
    hex: "#E30022",
    pigmentCode: "PR108",
    opacity: "Opaque",
    lightfastness: "ASTM I (Excellent)",
    granulation: "Non-granulating",
    washNote: "Intense, glowing warm scarlet red with high tinting strength.",
    category: "Warm Primary",
  },
  {
    name: "Permanent Alizarin Crimson",
    hex: "#E32636",
    pigmentCode: "PR177",
    opacity: "Transparent",
    lightfastness: "ASTM I (Excellent)",
    granulation: "Non-granulating",
    washNote: "Deep cool ruby crimson with smooth staining glaze properties.",
    category: "Cool Primary",
  },
  {
    name: "Cadmium Yellow Pale",
    hex: "#FFF600",
    pigmentCode: "PY35",
    opacity: "Semi-Opaque",
    lightfastness: "ASTM I (Excellent)",
    granulation: "Non-granulating",
    washNote: "Bright, punchy lemon primary yellow with high opacity.",
    category: "Warm Primary",
  },
  {
    name: "Yellow Ochre",
    hex: "#CC7722",
    pigmentCode: "PY43",
    opacity: "Semi-Transparent",
    lightfastness: "ASTM I (Excellent)",
    granulation: "Medium",
    washNote: "Warm earthy natural clay yellow, an indispensable landscape staple.",
    category: "Earth",
  },
  {
    name: "Burnt Sienna",
    hex: "#E97451",
    pigmentCode: "PBr7",
    opacity: "Transparent",
    lightfastness: "ASTM I (Excellent)",
    granulation: "High",
    washNote: "Rich red-brown calcined earth. Mixes with Ultramarine to create legendary neutral greys.",
    category: "Earth",
  },
  {
    name: "Raw Umber",
    hex: "#826644",
    pigmentCode: "PBr7",
    opacity: "Semi-Transparent",
    lightfastness: "ASTM I (Excellent)",
    granulation: "Medium",
    washNote: "Cool, greenish-brown earth pigment for shadows, bark, and muted portraiture.",
    category: "Earth",
  },
  {
    name: "Viridian",
    hex: "#40826D",
    pigmentCode: "PG18",
    opacity: "Transparent",
    lightfastness: "ASTM I (Excellent)",
    granulation: "Medium",
    washNote: "Cool, transparent blue-green with soft mineral granulation for botanical shadows.",
    category: "Botanical",
  },
  {
    name: "Sap Green",
    hex: "#507D2A",
    pigmentCode: "PG36+PY110",
    opacity: "Transparent",
    lightfastness: "ASTM II (Very Good)",
    granulation: "Non-granulating",
    washNote: "Lush, natural warm foliage green preferred for lively botanical paintings.",
    category: "Botanical",
  },
  {
    name: "Chinese White (Zinc)",
    hex: "#F7F8F8",
    pigmentCode: "PW4",
    opacity: "Semi-Opaque",
    lightfastness: "ASTM I (Excellent)",
    granulation: "Non-granulating",
    washNote: "Gentle tinting white used for soft atmospheric mist, gouache accents, and sea foam.",
    category: "Metallic & White",
  },
];

const faqs = [
  {
    question: "What do international pigment codes (e.g. PB29, PR108) mean?",
    answer: "Pigment codes are standard designations from the Colour Index International (CII). The first letter 'P' stands for Pigment, the second letter indicates the color family (B = Blue, R = Red, Y = Yellow, Br = Brown, G = Green, W = White), and the number identifies the exact chemical compound.",
  },
  {
    question: "What is granulation in watercolor paints?",
    answer: "Granulation occurs when heavier pigment particles (such as Ultramarine PB29 or Burnt Sienna PBr7) settle into the valleys of textured watercolor paper (cold press or rough) as the wash dries, creating an organic, speckled textural effect.",
  },
  {
    question: "Why do artists use split-primary watercolor palettes?",
    answer: "A split-primary palette contains a warm and cool version of each primary color (e.g., warm Cadmium Red + cool Alizarin Crimson; warm Cadmium Yellow + cool Lemon Yellow; warm Ultramarine + cool Phthalo Blue). This prevents muddy mixes when creating secondary oranges, greens, and purples.",
  },
];

export default function WatercolorColorsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Watercolor Colors", href: "/watercolor-colors" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />

      {/* Header */}
      <header className="mt-4 rounded-3xl border border-border/80 bg-gradient-to-br from-blue-500/10 via-amber-500/5 to-card p-6 sm:p-10 shadow-xs">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Droplet className="h-3.5 w-3.5" />
          Fine Art Pigment Reference
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Watercolor Paint Colors &amp; Pigment Index
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          The essential pigment guide for traditional watercolorists and digital illustrators. Explore pigment codes, transparency, lightfastness ratings, granulation behavior, and calibrated HEX swatches.
        </p>
      </header>

      {/* Interactive Tool */}
      <section className="mt-8">
        <ArtPigmentTool medium="Watercolor" pigments={WATERCOLOR_PIGMENTS} />
      </section>

      {/* FAQs */}
      <section className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            Frequently Asked Questions about Watercolor Pigments
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
        <h3 className="font-display text-base font-bold text-foreground">Explore Other Art Medium References</h3>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link
            href="/acrylic-colors"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Acrylic Color Palette Reference <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/color-pencil-colors"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Color Pencil Pigments <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/color-wheel"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Interactive Color Wheel <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
