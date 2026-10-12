import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getAllPosts, getPost, getPostsByCategory } from "@/lib/data/blog";
import { SITE_URL } from "@/lib/site-config";
import { formatDate } from "@/lib/utils";
import { MarkdownBody, markdownHeadingId } from "@/components/content/markdown-body";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export const dynamic = "force-static";

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
  const toc = post.body
    .split("\n")
    .filter((line) => line.startsWith("## ") && !line.startsWith("### "))
    .map((line) => {
      const text = line.slice(3).replace(/[*`]/g, "");
      return { text, id: markdownHeadingId(text) };
    });
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: post.title, href: `/blog/${post.slug}` },
  ];
  const faqs = post.faqs ?? [];

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 pb-28 sm:pb-10 lg:px-6">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          ...(faqs.length ? [faqJsonLd(faqs)] : []),
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            datePublished: post.publishedAt,
            author: { "@type": "Organization", name: "colorBase" },
            publisher: { "@type": "Organization", name: "colorBase" },
            mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
          },
        ]}
      />
      <Breadcrumbs items={crumbs} />
      <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">{post.category}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">{post.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {formatDate(post.publishedAt)} · {post.readingTime}
      </p>
      {toc.length > 2 ? (
        <nav aria-label="On this page" className="mt-8 rounded-2xl border border-border/60 bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">On this page</p>
          <ol className="mt-3 space-y-2 text-sm">
            {toc.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="text-foreground underline-offset-4 hover:underline">
                  {item.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      <div className="mt-8">
        <MarkdownBody markdown={post.body} />
      </div>
      {faqs.length > 0 ? (
        <section className="mt-12">
          <h2 id="frequently-asked-questions" className="scroll-mt-24 font-display text-2xl font-semibold">
            Frequently asked questions
          </h2>
          <div className="mt-4 space-y-6">
            {faqs.map((faq) => (
              <section key={faq.question}>
                <h3 className="font-display text-lg font-semibold text-foreground">{faq.question}</h3>
                <p className="mt-2 text-muted-foreground">{faq.answer}</p>
              </section>
            ))}
          </div>
        </section>
      ) : null}
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
