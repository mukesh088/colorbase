import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd, fitDescription } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import Link from "next/link";
import { CODE_FORMATS, generateCode } from "@/lib/codegen";
import { DeveloperPlayground } from "@/components/library/developer-playground";
import { IdeCodeBlock } from "@/components/content/ide-code-block";

/** Fixed demo palette so every format page shows real, comparable output. */
const SAMPLE_PALETTE = ["#e11d48", "#0ea5e9", "#0f172a"];
const EXAMPLE_LANGUAGE: Partial<Record<string, string>> = {
  css: "css",
  scss: "scss",
  less: "css",
  stylus: "css",
  tailwind: "js",
  bootstrap: "scss",
  mui: "js",
  chakra: "js",
  react: "js",
  "react-native": "js",
  json: "json",
  yaml: "yaml",
  android: "xml",
};

export function generateStaticParams() {
  return CODE_FORMATS.map((f) => ({ format: f.slug }));
}

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ format: string }>;
}): Promise<Metadata> {
  const { format } = await params;
  const meta = CODE_FORMATS.find((f) => f.slug === format);
  if (!meta) notFound();
  return createPageMetadata({
    title: `${meta.title} Color Code Generator`,
    description: fitDescription(
      `${meta.title} color code generator for your palette. Output: ${meta.description}`,
      "Randomize a palette, pick each swatch or build a harmony from one base color, then copy the code.",
      "Randomize or build a palette from one base color, then copy the code."
    ),
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
      <section className="border-border bg-card mt-10 rounded-2xl border p-5 sm:p-7" aria-labelledby="format-example">
        <h2 id="format-example" className="font-display text-xl font-semibold tracking-tight">
          What {meta.title} color code looks like
        </h2>
        <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-relaxed">
          This is the exact output for a sample palette of {SAMPLE_PALETTE.join(", ")}: {meta.description.charAt(0).toLowerCase()}
          {meta.description.slice(1)} Paste it into your project, then swap in your own colors with the generator above.
        </p>
        <div className="mt-4">
          <IdeCodeBlock code={generateCode(SAMPLE_PALETTE, meta.slug, "brand")} language={EXAMPLE_LANGUAGE[meta.slug] ?? "text"} />
        </div>
        <h3 className="font-display mt-6 text-base font-semibold">Other export formats</h3>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
          {CODE_FORMATS.filter((f) => f.slug !== meta.slug).map((f) => (
            <li key={f.slug}>
              <Link href={`/developers/${f.slug}`} className="text-primary underline-offset-4 hover:underline">
                {f.title} color code
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
