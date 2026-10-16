import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ColorizePhotoTool } from "@/components/tools/colorize-photo-tool";
import { ArrowRight, Palette, Sparkles, HelpCircle, Info } from "lucide-react";

export const metadata: Metadata = createPageMetadata({
  title: "Colorize Photo Online — Grayscale Tinting & Duotone Photo Wash",
  description:
    "Colorize photos online with historic sepia, cyanotype blueprint tones, and neon duotones. Apply aesthetic chromatic washes to black and white or color pictures with 100% private in-browser processing.",
  path: "/colorize-photo",
  keywords: [
    "colorize photo",
    "photo colorizer",
    "tint photo online",
    "sepia photo filter",
    "duotone photo effect",
    "cyanotype photo tool",
    "black and white to color wash",
  ],
});

const faqs = [
  {
    question: "How does this photo colorization tool work?",
    answer: "The tool calculates the luminance (lightness value) of each pixel in your image and maps it along a chromatic gradient between a shadow color and a highlight color (duotone color wash). This allows you to restore antique sepia warmth, create classic cyanotypes, or generate modern cyberpunk neon portraits.",
  },
  {
    question: "What is the difference between chromatic tinting and AI generative colorization?",
    answer: "Chromatic tinting (this tool) applies authentic photographic tone washes (such as sepia, split-toning, or duotones) deterministically across the luminance spectrum. Generative AI colorization attempts to hallucinate realistic multi-colored skin, clothing, and foliage onto vintage black & white archives by guessing original colors with deep neural networks.",
  },
  {
    question: "Are my photos kept safe and private?",
    answer: "Yes. Processing takes place 100% inside your local web browser canvas. Your images are never sent over the internet or saved on our servers.",
  },
];

export default function ColorizePhotoPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Colorize Photo", href: "/colorize-photo" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />

      {/* Header */}
      <header className="mt-4 rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/70 to-card/40 p-6 sm:p-10 shadow-xs">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Palette className="h-3.5 w-3.5" />
          Photographic Tint &amp; Duotone Studio
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Colorize &amp; Tint Photo Tool
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Transform black &amp; white or color photographs with archival sepia, vintage cyanotype blues, and modern neon duotones. Export high-res artwork instantly without watermarks or server uploads.
        </p>
      </header>

      {/* Interactive Tool */}
      <section className="mt-8">
        <ColorizePhotoTool />
      </section>

      {/* Technical distinction note */}
      <section className="mt-12 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold tracking-tight">Understanding Photo Colorization Techniques</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Photographic colorization spans both historical chemical methods and modern digital algorithms:
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/80 bg-background/50 p-5">
            <h3 className="font-display text-base font-bold text-foreground">1. Archival Toning (Duotone Mapping)</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Historically achieved by converting silver bromide prints with gold, platinum, or selenium baths. In digital workflows, duotone tone mapping mathematically shifts shadow tones into one hue and highlights into another, preserving full tonal dynamic range while infusing artistic mood.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-background/50 p-5">
            <h3 className="font-display text-base font-bold text-foreground">2. Multi-Zone AI Color Restoration</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Used when restoring historical family archives where different objects require distinct hues (e.g. skin tones, blue sky, green grass). Because a grayscale photo contains only brightness data and no chromatic record, neural networks estimate the most statistically probable colors.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            Frequently Asked Questions about Photo Colorization
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
        <h3 className="font-display text-base font-bold text-foreground">Explore Related Image Tools</h3>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link
            href="/white-background"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            White Background Tool <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/image-color-picker"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Eyedrop Image Colors <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/color-palette-from-image"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Extract Palette from Image <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
