import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { WhiteBackgroundTool } from "@/components/tools/white-background-tool";
import { ArrowRight, CheckCircle2, Sparkles, HelpCircle, ShieldCheck, ShoppingBag } from "lucide-react";

export const metadata: Metadata = createPageMetadata({
  title: "White Background Photo Editor & Background Remover — White, Colors & Gradients",
  description:
    "Remove backgrounds and replace with pure white (#FFFFFF), transparent PNG, studio gradients, or solid colors. Free, private in-browser tool for Amazon & Shopify product photos, portraits, and graphics.",
  path: "/white-background",
  keywords: [
    "white background photo",
    "white bg",
    "remove bg",
    "background remover",
    "change background color",
    "white background product photo",
    "pure white background #ffffff",
    "transparent png cutout",
    "gradient photo background",
  ],
});

const faqs = [
  {
    question: "How does the background remover work?",
    answer: "The tool analyzes edge contrasts and corner pixel data to isolate your foreground subject from the background. You can adjust the sensitivity slider, feather edges for a natural look, or click anywhere with the Eyedropper tool to instantly key out specific background colors.",
  },
  {
    question: "Can I replace the background with gradients or other colors?",
    answer: "Yes! Once the background is removed, you can switch between Pure White (#FFFFFF), Transparent PNG cutout, custom solid colors (e.g. studio grey, soft pink, royal blue), modern studio gradients, or even upload your own custom backdrop photo.",
  },
  {
    question: "Why do Amazon, Shopify, and Google Shopping require pure white backgrounds?",
    answer: "Marketplaces like Amazon strictly enforce pure RGB 255, 255, 255 (#FFFFFF) backgrounds on primary hero images to create a uniform, distraction-free browsing experience across mobile and desktop catalogs.",
  },
  {
    question: "Does this tool upload my photos to an external server?",
    answer: "No. All image operations occur directly within your device's browser using HTML5 Canvas APIs. Your photos never leave your computer or phone, ensuring complete confidentiality for unreleased products and private media.",
  },
];

export default function WhiteBackgroundPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "White Background Photo", href: "/white-background" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />

      {/* Header */}
      <header className="mt-4 rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/70 to-card/40 p-6 sm:p-10 shadow-xs">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <ShoppingBag className="h-3.5 w-3.5" />
          Background Remover &amp; Studio Backdrop Studio
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          White Background Photo Tool &amp; Background Remover
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Isolate your subject and replace cluttered backdrops with pure white (#FFFFFF), transparent PNG cutouts, stylish studio gradients, or solid brand colors with 100% private in-browser processing.
        </p>
      </header>

      {/* Interactive Tool */}
      <section className="mt-8">
        <WhiteBackgroundTool />
      </section>

      {/* Marketplace Standards Guide */}
      <section className="mt-12 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold tracking-tight">E-Commerce White Background Specifications</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Meet the strict visual requirements of top online marketplaces with these benchmark guidelines.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/80 bg-background/50 p-5">
            <h3 className="font-display text-base font-bold text-foreground">Amazon Standards</h3>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                Pure RGB (255, 255, 255) on main image
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                Product fills at least 85% of image frame
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                Minimum 1600px on longest side for zoom
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border/80 bg-background/50 p-5">
            <h3 className="font-display text-base font-bold text-foreground">Shopify Catalogs</h3>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                Square 1:1 ratio (2048 x 2048 px recommended)
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                Eliminates distracting border seams on white themes
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                Optimized JPG size under 2MB for fast mobile loading
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border/80 bg-background/50 p-5">
            <h3 className="font-display text-base font-bold text-foreground">Google Shopping Ads</h3>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                Solid white or transparent background accepted
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                No promotional text, watermarks, or borders
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                Clear lighting with natural product drop shadows
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            Frequently Asked Questions about White Backgrounds
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
            href="/image-color-picker"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Image Color Picker (Eyedropper) <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/colorize-photo"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Colorize &amp; Tint Photo Tool <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/image-tools"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Image Color Extraction Suite <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
