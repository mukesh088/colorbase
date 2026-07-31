import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { BLOG_CATEGORIES, getAllPosts } from "@/lib/data/blog";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = createPageMetadata({
  title: "Blog",
  description:
    "SEO-friendly articles on color psychology, UI trends, accessibility, branding, CSS, Tailwind, and developer tips.",
  path: "/blog",
  keywords: ["color blog", "design blog", "css tutorials"],
});

export default function BlogPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
  ];
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="font-display text-4xl font-semibold">Blog</h1>
      <p className="mt-3 text-muted-foreground">Guides for designers and developers working with color on the web.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {BLOG_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/blog/category/${encodeURIComponent(cat)}`}
            className="rounded-full border border-border/60 px-3 py-1 text-xs hover:border-primary/40"
          >
            {cat}
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="glass rounded-2xl border border-border/50 p-5 transition-colors hover:border-primary/40"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">{post.category}</p>
            <h2 className="mt-2 font-display text-xl font-semibold">{post.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{post.description}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {formatDate(post.publishedAt)} · {post.readingTime}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
