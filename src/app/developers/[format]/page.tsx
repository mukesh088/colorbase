import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { CODE_FORMATS } from "@/lib/codegen";
import { DeveloperPlayground } from "@/components/library/developer-playground";

export function generateStaticParams() {
  return CODE_FORMATS.map((f) => ({ format: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ format: string }>;
}): Promise<Metadata> {
  const { format } = await params;
  const meta = CODE_FORMATS.find((f) => f.slug === format);
  if (!meta) return {};
  return createPageMetadata({
    title: `${meta.title} Color Code Generator`,
    description: meta.description,
    path: `/developers/${meta.slug}`,
    keywords: [`${meta.title} colors`, "design tokens", "color export"],
  });
}

export default async function DeveloperFormatPage({
  params,
}: {
  params: Promise<{ format: string }>;
}) {
  const { format } = await params;
  const meta = CODE_FORMATS.find((f) => f.slug === format);
  if (!meta) notFound();
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Developers", href: "/developers" },
    { name: meta.title, href: `/developers/${meta.slug}` },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
          {meta.slug}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
          {meta.title} Generator
        </h1>
        <p className="mt-3 text-muted-foreground">{meta.description}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Randomize a palette, pick each swatch, or build a harmony from a base color — then export{" "}
          {meta.title} tokens.
        </p>
      </header>
      <div className="mt-8">
        <DeveloperPlayground initialFormat={meta.slug} />
      </div>
    </div>
  );
}
