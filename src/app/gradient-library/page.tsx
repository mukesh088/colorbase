import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import {
  GRADIENT_CATEGORIES,
  getAllGradients,
  getPopularGradients,
  getStudioGradients,
} from "@/lib/data/gradient-library";
import { GradientGallery } from "@/components/library/gradient-gallery";
import { LibraryInsight } from "@/components/library/library-insight";

export const metadata: Metadata = createPageMetadata({
  title: "Premade Gradient Library",
  description:
    "Explore named CSS gradients, including 100 new original recipes. Preview color stops, copy CSS, Tailwind or SCSS, and download a JPG for your next design.",
  path: "/gradient-library",
  keywords: ["css gradients", "gradient library", "ui gradients", "named gradients"],
});

export default function GradientLibraryPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Gradient Library", href: "/gradient-library" },
  ];
  const popular = getPopularGradients();
  const library = getAllGradients();
  const studio = getStudioGradients();

  return (
    <div>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <GradientGallery
        popular={popular}
        library={popular}
        totalCount={library.length}
        loadFullLibrary
        categories={GRADIENT_CATEGORIES}
        showHero
      />
      <div className="mx-auto max-w-7xl px-3 pb-12 sm:px-4 lg:px-6">
        <section
          id="new-gradients"
          className="border-border bg-muted/20 mb-14 scroll-mt-24 rounded-3xl border p-5 sm:p-8"
        >
          <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
            Fresh inspiration
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight">
            100 new named gradients
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed">
            From Amethyst Morning to Watercolor Arcade, discover original combinations for landing
            pages, brand concepts, and everyday interfaces. Every recipe includes its exact colors,
            direction, and copy-ready code.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[studio[0], studio[20], studio[30], studio[40], studio[60], studio[80]].map(
              (gradient) => (
                <Link
                  prefetch={false}
                  key={gradient.slug}
                  href={`/gradient-library/${gradient.slug}`}
                  className="group border-border bg-card overflow-hidden rounded-2xl border transition-shadow hover:shadow-md"
                >
                  <span className="block h-28" style={{ background: gradient.css }} />
                  <span className="flex items-center justify-between gap-3 p-4">
                    <span>
                      <strong className="block text-sm font-semibold">{gradient.name}</strong>
                      <span className="text-muted-foreground mt-1 block text-xs capitalize">
                        {gradient.category} · {gradient.colors.length} colors
                      </span>
                    </span>
                    <ArrowUpRight className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              )
            )}
          </div>
          <details className="border-border bg-card mt-6 rounded-2xl border">
            <summary className="focus-visible:outline-ring cursor-pointer rounded-2xl p-4 text-sm font-semibold focus-visible:outline focus-visible:outline-2">
              Browse all 100 names
            </summary>
            <div className="border-border grid gap-1 border-t p-3 sm:grid-cols-2 lg:grid-cols-3">
              {studio.map((gradient) => (
                <Link
                  prefetch={false}
                  key={gradient.slug}
                  href={`/gradient-library/${gradient.slug}`}
                  className="hover:bg-muted focus-visible:outline-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm focus-visible:outline focus-visible:outline-2"
                >
                  <span
                    className="h-6 w-6 shrink-0 rounded-full border border-black/10"
                    style={{ background: gradient.css }}
                    aria-hidden="true"
                  />
                  {gradient.name}
                </Link>
              ))}
            </div>
          </details>
        </section>
        <LibraryInsight id="gradients" />
      </div>
    </div>
  );
}
