import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getAllPosts, getPost, getPostsByCategory } from "@/lib/data/blog";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return createPageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.keywords,
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const related = getPostsByCategory(post.category).filter((p) => p.slug !== post.slug).slice(0, 3);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: post.title, href: `/blog/${post.slug}` },
  ];
  const faqs = [
    {
      question: `What is this article about?`,
      answer: post.description,
    },
  ];

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          faqJsonLd(faqs),
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            datePublished: post.publishedAt,
            author: { "@type": "Organization", name: "colorBase" },
          },
        ]}
      />
      <Breadcrumbs items={crumbs} />
      <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">{post.category}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">{post.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {formatDate(post.publishedAt)} · {post.readingTime}
      </p>
      <div className="mt-8 space-y-4 text-base leading-relaxed text-muted-foreground">
        {post.content.map((para) => (
          <p key={para}>{para}</p>
        ))}
      </div>
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">Related articles</h2>
          <ul className="mt-4 space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/blog/${r.slug}`} className="text-primary hover:underline">
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
