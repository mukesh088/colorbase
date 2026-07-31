import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { GRADIENT_CATEGORIES, getAllGradients, getGradientsByCategory } from "@/lib/data/gradient-library";

export const metadata: Metadata = createPageMetadata({
  title: "Premade Gradient Library",
  description:
    "Thousands of ready-made CSS gradients across modern, ocean, sunset, neon, aurora, luxury, gaming, and more categories.",
  path: "/gradient-library",
  keywords: ["css gradients", "gradient library", "ready made gradients"],
});

export default function GradientLibraryPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Gradient Library", href: "/gradient-library" },
  ];
  const total = getAllGradients().length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="font-display text-4xl font-semibold">Premade Gradient Library</h1>
      <p className="mt-3 text-muted-foreground">
        {total.toLocaleString()} curated gradients with live preview, CSS, Tailwind, SCSS, copy, and share.
      </p>
      <div className="mt-8 space-y-10">
        {GRADIENT_CATEGORIES.map((category) => {
          const items = getGradientsByCategory(category).slice(0, 8);
          return (
            <section key={category}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold capitalize">{category}</h2>
                <Link href={`/gradient-library/category/${category}`} className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((g, index) => (
                  <Link
                    key={g.slug}
                    href={`/gradient-library/${g.slug}`}
                    className="card-lift glass group animate-rise overflow-hidden rounded-3xl border border-border/50"
                    style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                  >
                    <div
                      className="h-28 transition-[filter,transform] duration-500 group-hover:scale-[1.03] group-hover:brightness-105"
                      style={{ background: g.css }}
                    />
                    <p className="bg-background/70 px-4 py-3 text-sm font-medium backdrop-blur-sm transition-colors group-hover:text-rose-700 dark:group-hover:text-rose-300">
                      {g.name}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
