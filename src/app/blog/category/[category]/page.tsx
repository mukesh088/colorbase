import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd, fitDescription } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import {
  BLOG_CATEGORIES,
  BLOG_CATEGORY_INTROS,
  MIN_POSTS_FOR_INDEXED_CATEGORY,
  blogCategoryPath,
  blogCategorySlug,
  getBlogCategoryBySlug,
  getPostsByCategory,
} from "@/lib/data/blog";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((category) => ({ category: blogCategorySlug(category) }));
}

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getBlogCategoryBySlug(slug);
  if (!category) notFound();
  const posts = getPostsByCategory(category);
  return createPageMetadata({
    title: `${category} Articles`,
    description: fitDescription(
      `${posts.length === 1 ? "A ColorBase article" : `${posts.length} ColorBase articles`} on ${category}, written for designers and developers.`,
      ...posts.slice(0, 3).map((post) => `Read “${post.title}”.`),
      "Each guide links to a free tool you can try."
    ),
    path: blogCategoryPath(category),
    noIndex: posts.length < MIN_POSTS_FOR_INDEXED_CATEGORY,
  });
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = getBlogCategoryBySlug(slug);
  if (!category) notFound();
  const posts = getPostsByCategory(category);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: category, href: blogCategoryPath(category) },
  ];
  const others = BLOG_CATEGORIES.filter((c) => c !== category && getPostsByCategory(c).length > 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="font-display text-4xl font-semibold">{category}</h1>
      <p className="text-muted-foreground mt-4 max-w-3xl leading-relaxed">{BLOG_CATEGORY_INTROS[category]}</p>
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
      {others.length > 0 && (
        <nav aria-label="Other blog categories" className="text-muted-foreground mt-10 text-sm">
          More topics:{" "}
          {others.map((c, i) => (
            <span key={c}>
              {i > 0 ? " · " : ""}
              <Link href={blogCategoryPath(c)} className="text-primary underline-offset-4 hover:underline">
                {c} articles
              </Link>
            </span>
          ))}
        </nav>
      )}
    </div>
  );
}
