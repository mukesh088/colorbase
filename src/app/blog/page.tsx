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
    "Original colorBase guides on contrast, palettes, CSS tokens, Tailwind, and color psychology — written for designers and developers who ship UI.",
  path: "/blog",
  keywords: ["color blog", "wcag contrast", "css color tokens", "palette guide"],
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
      <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-rose-50 via-background to-violet-50 p-6 sm:p-8 dark:from-rose-950/40 dark:via-background dark:to-violet-950/30">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-fuchsia-400/20 blur-3xl"
        />
        <h1 className="font-display relative text-4xl font-semibold tracking-[-0.04em]">Blog</h1>
        <p className="text-muted-foreground relative mt-3 max-w-2xl">
          Practical writing from the colorBase studio in Ranchi — how to pick, contrast-check, and
          ship color, not a dump of keyword pages.
        </p>
      </header>
      <div className="mt-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap">
        {BLOG_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/blog/category/${encodeURIComponent(cat)}`}
            className="shrink-0 whitespace-nowrap rounded-full border border-border/60 bg-card/70 px-3 py-2 text-xs transition-colors hover:border-primary/40 hover:bg-primary/5"
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
            className="card-lift group relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 p-5"
          >
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-rose-500 to-violet-500 opacity-70 transition-opacity group-hover:opacity-100"
            />
            <p className="pl-2 text-xs font-semibold uppercase tracking-wider text-rose-600">
              {post.category}
            </p>
            <h2 className="font-display mt-2 pl-2 text-xl font-semibold tracking-[-0.03em] transition-colors group-hover:text-primary">
              {post.title}
            </h2>
            <p className="text-muted-foreground mt-2 pl-2 text-sm">{post.description}</p>
            <p className="text-muted-foreground mt-3 pl-2 text-xs">
              {formatDate(post.publishedAt)} · {post.readingTime}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
