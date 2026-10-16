import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ArtPigmentTool, type ArtPigment } from "@/components/tools/art-pigment-tool";
import { ArrowRight, Pencil, Sparkles, HelpCircle, Palette } from "lucide-react";

export const metadata: Metadata = createPageMetadata({
  title: "Colored Pencil Colors & Hex Codes — Artist Palette Reference Guide",
  description:
    "Explore essential artist colored pencil colors with exact HEX values, wax vs oil core details, lightfastness ratings, and blending notes for traditional sketchers and Procreate illustrators.",
  path: "/color-pencil-colors",
  keywords: [
    "color pencil",
    "colored pencil colors",
    "colored pencil hex codes",
    "prismacolor color chart",
    "polychromos color palette",
    "artist colored pencil sets",
    "blending colored pencils",
  ],
});

const PENCIL_PIGMENTS: ArtPigment[] = [
  {
    name: "Indigo Blue",
    hex: "#1F2942",
    pigmentCode: "PB60",
    opacity: "Opaque",
    lightfastness: "ASTM I (Excellent)",
    washNote: "Deep, moody midnight blue. The classic artist alternative to harsh graphite black for rich shadows.",
    category: "Cool Primary",
  },
  {
    name: "True Blue",
    hex: "#0066CC",
    pigmentCode: "PB15",
    opacity: "Semi-Opaque",
    lightfastness: "ASTM I (Excellent)",
    washNote: "Vibrant, clean royal blue that layers effortlessly over lighter sky tones without wax bloom.",
    category: "Cool Primary",
  },
  {
    name: "Crimson Lake",
    hex: "#990033",
    pigmentCode: "PR177",
    opacity: "Semi-Opaque",
    lightfastness: "ASTM I (Excellent)",
    washNote: "Deep, saturated wine crimson. Ideal for realistic botanical petals, berries, and velvet drapery.",
    category: "Cool Primary",
  },
  {
    name: "Poppy Red",
    hex: "#E32636",
    pigmentCode: "PR254",
    opacity: "Opaque",
    lightfastness: "ASTM I (Excellent)",
    washNote: "Warm, luminous scarlet red with creamy blending characteristics across hot press paper.",
    category: "Warm Primary",
  },
  {
    name: "Canary Yellow",
    hex: "#FFEF00",
    pigmentCode: "PY3",
    opacity: "Semi-Opaque",
    lightfastness: "ASTM II (Very Good)",
    washNote: "High-intensity brilliant primary yellow for sunlit highlights and energetic flora.",
    category: "Warm Primary",
  },
  {
    name: "Burnt Ochre",
    hex: "#9E472A",
    pigmentCode: "PR101",
    opacity: "Opaque",
    lightfastness: "ASTM I (Excellent)",
    washNote: "Warm reddish-brown mineral earth tone fundamental for lifelike human skin and animal fur.",
    category: "Earth",
  },
  {
    name: "Dark Umber",
    hex: "#3D2B1F",
    pigmentCode: "PBr7",
    opacity: "Opaque",
    lightfastness: "ASTM I (Excellent)",
    washNote: "Deep neutral chocolate brown for tree trunks, deep hair tones, and soft vignette outlines.",
    category: "Earth",
  },
  {
    name: "Olive Green",
    hex: "#556B2F",
    pigmentCode: "PG8",
    opacity: "Semi-Opaque",
    lightfastness: "ASTM I (Excellent)",
    washNote: "Natural earthy foliage green that avoids the artificial candy-look of cheap synthetic greens.",
    category: "Botanical",
  },
  {
    name: "Apple Green",
    hex: "#8DB600",
    pigmentCode: "PY151+PG7",
    opacity: "Semi-Transparent",
    lightfastness: "ASTM II (Very Good)",
    washNote: "Fresh, vibrant yellow-green for springtime shoots, moss, and tropical bird plumage.",
    category: "Botanical",
  },
  {
    name: "Peach",
    hex: "#FFE5B4",
    pigmentCode: "PO62+PW6",
    opacity: "Opaque",
    lightfastness: "ASTM I (Excellent)",
    washNote: "Soft warm pastel essential for portrait base layers and delicate floral transitions.",
    category: "Earth",
  },
  {
    name: "French Grey 50%",
    hex: "#8C857B",
    pigmentCode: "PBr7+PBk9",
    opacity: "Semi-Opaque",
    lightfastness: "ASTM I (Excellent)",
    washNote: "Neutral warm grey favored for architectural sketching and subtle value transitions.",
    category: "Earth",
  },
  {
    name: "White Core",
    hex: "#FFFFFF",
    pigmentCode: "PW6",
    opacity: "Opaque",
    lightfastness: "ASTM I (Excellent)",
    washNote: "Used for burnishing and blending underlying colored layers into a smooth, painterly sheen.",
    category: "Metallic & White",
  },
];

const faqs = [
  {
    question: "What is the difference between wax-based and oil-based colored pencils?",
    answer: "Wax-based pencils (like Prismacolor Premier) have a soft, creamy core that lays down thick color quickly and blends like butter, but can produce 'wax bloom' (a temporary foggy white film). Oil-based pencils (like Faber-Castell Polychromos) have a firmer vegetable oil core that holds a sharp needle point, excels at fine cross-hatching, and never blooms.",
  },
  {
    question: "What is 'burnishing' in colored pencil drawing?",
    answer: "Burnishing is a blending technique where an artist applies heavy pressure using a light-colored pencil (or colorless blender) over multiple pigment layers. This flattens the tooth of the paper and fuses the wax/oil binder into a glass-smooth, photographically continuous tone.",
  },
  {
    question: "Can I use digital HEX codes from colored pencils in drawing apps like Procreate?",
    answer: "Yes! The calibrated HEX codes on this page represent the core mass tones of standard artist pencil sets. You can copy these hex codes into custom Procreate, Photoshop, or Figma swatch palettes for digital sketching.",
  },
];

export default function ColorPencilColorsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Colored Pencil Colors", href: "/color-pencil-colors" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />

      {/* Header */}
      <header className="mt-4 rounded-3xl border border-border/80 bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-card p-6 sm:p-10 shadow-xs">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Pencil className="h-3.5 w-3.5" />
          Fine Art Drawing Reference
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Colored Pencil Colors &amp; Hex Codes
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Benchmark colored pencil tones for illustrators, sketch artists, and digital creators. Explore wax vs oil core properties, lightfastness ratings, and copyable HEX codes for your Procreate or Photoshop palette.
        </p>
      </header>

      {/* Interactive Tool */}
      <section className="mt-8">
        <ArtPigmentTool medium="Colored Pencil" pigments={PENCIL_PIGMENTS} />
      </section>

      {/* FAQs */}
      <section className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            Frequently Asked Questions about Colored Pencils
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
        <h3 className="font-display text-base font-bold text-foreground">Explore Related Art Mediums</h3>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link
            href="/watercolor-colors"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Watercolor Pigment Index <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/acrylic-colors"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Acrylic Paint Colors <ArrowRight className="h-3 w-3" />
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
