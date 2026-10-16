import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { HouseColorTool } from "@/components/tools/house-color-tool";
import { ArrowRight, Home, Sparkles, HelpCircle, AlertCircle, Sun, Paintbrush } from "lucide-react";

export const metadata: Metadata = createPageMetadata({
  title: "House Color Combinations — Interior & Exterior Paint Schemes",
  description:
    "Explore designer-curated house color combinations for living rooms, bedrooms, kitchens, and home exteriors. Test wall, trim, ceiling, and accent palettes with copyable HEX codes and lighting advice.",
  path: "/house-color-combinations",
  keywords: [
    "house colour combination",
    "home colour",
    "exterior house colors",
    "interior color combinations",
    "living room paint colors",
    "bedroom color schemes",
    "wall and trim colors",
    "house paint palettes",
  ],
});

const faqs = [
  {
    question: "How do I choose a house color combination for my interior walls?",
    answer: "Follow the classic 60-30-10 interior design rule: 60% dominant wall color (usually a neutral or muted tone like greige, cream, or sage green), 30% secondary color (trim, ceiling, cabinetry, or drapery), and 10% accent color (throw pillows, art, or a feature door).",
  },
  {
    question: "Do digital HEX codes match physical paint cans from Benjamin Moore, Sherwin-Williams, or Asian Paints?",
    answer: "No digital HEX code is an exact 1:1 match for physical paint. Screen displays emit light (sRGB / additive RGB), whereas real paint reflects light (subtractive pigment absorption). Lighting conditions (such as 2700K warm bulbs vs 5000K natural daylight) and surface sheen (flat, eggshell, satin, semi-gloss) also dramatically alter perceived color. Always purchase sample pots and test 2x2 ft swatches in your room.",
  },
  {
    question: "What is Light Reflectance Value (LRV) in home paint?",
    answer: "LRV measures the percentage of light a paint color reflects on a scale of 0 (pure black absorbing all light) to 100 (pure white reflecting all light). In rooms with small windows or north-facing exposure, choosing a wall color with an LRV of 60 or higher helps brighten the space naturally.",
  },
  {
    question: "Which paint finishes (sheens) should I use on walls, trim, and ceilings?",
    answer: "Use Flat/Matte on ceilings (it hides drywall imperfections and reflects zero glare). Use Eggshell or Matte on living and bedroom walls (soft, velvety look). Use Satin or Semi-Gloss on high-traffic trim, baseboards, doors, and bathroom walls (water-resistant and easy to clean).",
  },
];

const CURATED_PAINT_LINKS = [
  { name: "Sage Green", hex: "#9CAF88", slug: "sage-green", tip: "Perennial favorite for bedroom walls & kitchens" },
  { name: "Beige", hex: "#F5F5DC", slug: "beige", tip: "Warm, unpretentious organic linen foundation" },
  { name: "Terracotta", hex: "#E2725B", slug: "terracotta", tip: "Earthy warmth for accent doors & backsplashes" },
  { name: "Olive Green", hex: "#556B2F", slug: "olive-green", tip: "Heritage cabinetry and cozy moody studies" },
  { name: "Taupe", hex: "#483C32", slug: "taupe", tip: "Complex brown-grey for elegant living spaces" },
  { name: "Off White", hex: "#FAF9F6", slug: "off-white", tip: "The benchmark trim and open-plan ceiling tone" },
];

export default function HouseColorCombinationsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "House Color Combinations", href: "/house-color-combinations" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />

      {/* Header */}
      <header className="mt-4 rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/70 to-card/40 p-6 sm:p-10 shadow-xs">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Home className="h-3.5 w-3.5" />
          Interior &amp; Exterior Palette Architect
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          House Color Combinations &amp; Home Paint Palettes
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Plan cohesive color schemes for every room in your home. Harmonize walls, trim, ceilings, and architectural accents with designer-tested palettes and practical paint sheen advice.
        </p>
      </header>

      {/* Interactive Tool */}
      <section className="mt-8">
        <HouseColorTool />
      </section>

      {/* Lighting & Paint Sheen Guide */}
      <section className="mt-12 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-amber-500" />
          <h2 className="font-display text-2xl font-bold tracking-tight">The Effect of Lighting on House Colors</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          A paint swatch will look completely different depending on your window orientation and bulb color temperature.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border/80 bg-background/50 p-5">
            <h3 className="font-display text-base font-bold text-foreground">Natural Window Exposure</h3>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li>
                <strong className="text-foreground">North-Facing Light:</strong> Cool, blue-ish, and indirect. Cool greys can feel icy. Choose warm undertones (creams, warm greiges, soft terracottas) to counter the chill.
              </li>
              <li>
                <strong className="text-foreground">South-Facing Light:</strong> Bright, warm, and intense all day. Enhances both warm and cool colors. Deep olive greens, navy, and charcoal look breathtaking here.
              </li>
              <li>
                <strong className="text-foreground">East-Facing Light:</strong> Warm golden sunlight in the morning, cooler light in the afternoon. Perfect for breakfast nooks and kitchens.
              </li>
              <li>
                <strong className="text-foreground">West-Facing Light:</strong> Dazzling, intense orange/red sunset glow. Cool blues and sage greens help balance the late-afternoon heat.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border/80 bg-background/50 p-5">
            <h3 className="font-display text-base font-bold text-foreground">Artificial Lighting Kelvin Scale</h3>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li>
                <strong className="text-foreground">2700K (Warm Incandescent):</strong> Cozy, yellowish-amber light. Accentuates reds, oranges, and warm woods. May turn pale blues slightly greenish.
              </li>
              <li>
                <strong className="text-foreground">3000K (Soft White):</strong> The designer sweet-spot for living rooms and bedrooms. Warm enough to feel inviting without distorting neutral undertones.
              </li>
              <li>
                <strong className="text-foreground">4000K (Neutral White):</strong> Clean, crisp lighting ideal for kitchens, bathrooms, and home offices where accurate color rendering is needed.
              </li>
              <li>
                <strong className="text-foreground">5000K+ (Daylight):</strong> Very cool, clinical light. Best reserved for workshops and garages; makes cozy home living spaces feel sterile.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-muted-foreground">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <span>
            <strong>Crucial Real-World Advice:</strong> Never purchase full gallons based solely on a computer monitor or tiny 2-inch paint chips. Buy sample pots, paint two coats on large poster boards, and tape them to different walls in your room to observe them at morning, noon, and night.
          </span>
        </div>
      </section>

      {/* Popular Home Paint Colors to Explore */}
      <section className="mt-12">
        <div className="flex items-center gap-2">
          <Paintbrush className="h-5 w-5 text-primary" />
          <h2 className="font-display text-2xl font-bold tracking-tight">Explore Benchmark Home Paint Colors</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Dive into individual color profiles featuring exact codes, harmonies, and design applications.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CURATED_PAINT_LINKS.map((c) => (
            <Link
              key={c.slug}
              href={`/colors/${c.slug}`}
              className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-xs hover:border-primary/50 transition-colors group"
            >
              <div
                className="h-12 w-12 shrink-0 rounded-xl border border-black/10 shadow-xs"
                style={{ backgroundColor: c.hex }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {c.name}
                  </h3>
                  <span className="font-mono text-xs text-muted-foreground">{c.hex}</span>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">{c.tip}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            Frequently Asked Questions about House Paint Colors
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
