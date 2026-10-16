import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getGradient } from "@/lib/data/gradient-library";
import { CopyButton } from "@/components/color/copy-button";
import { ShareButtons } from "@/components/library/share-buttons";
import { GradientJpgButton } from "@/components/library/gradient-jpg-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = getGradient(slug);
  if (!g) notFound();
  return createPageMetadata({
    title: `${g.name} Gradient`,
    description: `${g.name} CSS gradient with Tailwind and SCSS exports. Category: ${g.category}.`,
    path: `/gradient-library/${g.slug}`,
    keywords: [g.name, `${g.category} gradient`, "css linear-gradient"],
  });
}

export default async function GradientDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const g = getGradient(slug);
  if (!g) notFound();
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Gradient Library", href: "/gradient-library" },
    { name: g.name, href: `/gradient-library/${g.slug}` },
  ];
  const cssBlock = `background: ${g.css};`;
  const file = `/* ${g.name} */\n.gradient {\n  ${cssBlock}\n}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-rose-600 uppercase">
            {g.category}
          </p>
          <h1 className="font-display text-4xl font-semibold">{g.name}</h1>
        </div>
        <ShareButtons title={g.name} path={`/gradient-library/${g.slug}`} />
      </div>
      <div
        className="border-border/50 h-40 w-full rounded-none border sm:h-48 sm:rounded-3xl"
        style={{ background: g.css }}
        role="img"
        aria-label={`${g.name} preview`}
      />
      <div className="mt-6 flex flex-wrap gap-2">
        <GradientJpgButton gradient={g} />
        <a
          className="border-input hover:bg-accent inline-flex h-10 items-center rounded-lg border px-4 text-sm"
          href={`data:text/css;charset=utf-8,${encodeURIComponent(file)}`}
          download={`${g.slug}.css`}
        >
          Download CSS
        </a>
      </div>
      <div className="mt-6 grid gap-4">
        {[
          ["CSS", cssBlock],
          ["Tailwind", g.tailwind],
          ["SCSS", g.scss],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">{label}</CardTitle>
              <CopyButton value={value} label={label} />
            </CardHeader>
            <CardContent>
              <pre className="bg-muted/50 overflow-x-auto rounded-xl p-3 text-xs">{value}</pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
