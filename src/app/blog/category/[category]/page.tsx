import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { BLOG_CATEGORIES, getPostsByCategory, type BlogCategory } from "@/lib/data/blog";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const decoded = decodeURIComponent(category);
  return createPageMetadata({
    title: `${decoded} Articles`,
    description: `Read ${decoded.toLowerCase()} articles from the colorBase blog.`,
    path: `/blog/category/${category}`,
    keywords: [decoded.toLowerCase(), "color blog"],
  });
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const decoded = decodeURIComponent(category);
  if (!BLOG_CATEGORIES.includes(decoded as BlogCategory)) notFound();
  const posts = getPostsByCategory(decoded);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: decoded, href: `/blog/category/${category}` },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="font-display text-4xl font-semibold">{decoded}</h1>
      <div className="mt-8 space-y-4">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="glass block rounded-2xl border border-border/50 p-5">
            <h2 className="font-display text-xl font-semibold">{post.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{post.description}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {formatDate(post.publishedAt)} · {post.readingTime}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
