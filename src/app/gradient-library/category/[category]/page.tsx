import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd, fitDescription } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import {
  GRADIENT_CATEGORIES,
  getGradientsByCategory,
  type GradientCategory,
} from "@/lib/data/gradient-library";
import { GradientGallery } from "@/components/library/gradient-gallery";

export function generateStaticParams() {
  return GRADIENT_CATEGORIES.map((category) => ({ category }));
}

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  if (!GRADIENT_CATEGORIES.includes(category as GradientCategory)) notFound();
  return createPageMetadata({
    title: `${category[0].toUpperCase()}${category.slice(1)} Gradients`,
    description: fitDescription(
      `Browse ${getGradientsByCategory(category).length} ${category} CSS gradients with live previews.`,
      "Copy the CSS, Tailwind or SCSS code for each one, or download it as a JPG.",
      "Open any gradient for its color stops and angle."
    ),
    path: `/gradient-library/category/${category}`,
    keywords: [`${category} gradients`, "css gradient"],
  });
}

export default async function GradientCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!GRADIENT_CATEGORIES.includes(category as GradientCategory)) notFound();
  const items = getGradientsByCategory(category);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Gradient Library", href: "/gradient-library" },
    { name: category, href: `/gradient-library/category/${category}` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="font-display text-4xl font-semibold capitalize">{category} Gradients</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {items.length} named {category} gradients. Click a strip for CSS and JPG download.
      </p>
      <div className="mt-8">
        <GradientGallery
          popular={[]}
          library={items}
          categories={GRADIENT_CATEGORIES}
          showPopularSection={false}
          showFilters={false}
          initialCategory={category}
          pageSize={200}
        />
      </div>
      <section className="mt-12" aria-labelledby="all-gradients">
        <h2 id="all-gradients" className="font-display text-xl font-semibold tracking-tight">
          All {items.length} {category} gradients
        </h2>
        <ul className="mt-4 columns-2 gap-6 text-sm sm:columns-3 lg:columns-4">
          {items.map((g) => (
            <li key={g.slug} className="mb-1.5 break-inside-avoid">
              <Link href={`/gradient-library/${g.slug}`} className="text-primary underline-offset-4 hover:underline">
                {g.name} gradient
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted-foreground">
          Other categories:{" "}
          {GRADIENT_CATEGORIES.filter((c) => c !== category).map((c, i) => (
            <span key={c}>
              {i > 0 ? " · " : ""}
              <Link href={`/gradient-library/category/${c}`} className="text-primary underline-offset-4 hover:underline">
                {c} gradients
              </Link>
            </span>
          ))}
        </p>
      </section>
    </div>
  );
}
