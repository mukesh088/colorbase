import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import {
  GRADIENT_CATEGORIES,
  getGradientsByCategory,
  type GradientCategory,
} from "@/lib/data/gradient-library";

export function generateStaticParams() {
  return GRADIENT_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  return createPageMetadata({
    title: `${category[0].toUpperCase()}${category.slice(1)} Gradients`,
    description: `Browse ${category} CSS gradients with live preview and copy-ready code.`,
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
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((g) => (
          <Link key={g.slug} href={`/gradient-library/${g.slug}`} className="overflow-hidden rounded-2xl border border-border/50">
            <div className="h-32" style={{ background: g.css }} />
            <p className="px-3 py-2 text-sm font-medium">{g.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
