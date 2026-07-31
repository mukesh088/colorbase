import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { AdvancedSearch } from "@/components/search/advanced-search";
import { searchTools, CATEGORY_LABELS, TOOLS } from "@/lib/tools-registry";
import type { ToolCategory } from "@/types/tools";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { searchBrands } from "@/lib/data/brands";
import { searchNamedColors } from "@/lib/data/color-names";
import { searchGradients } from "@/lib/data/gradient-library";
import { searchPalettes } from "@/lib/data/palette-library";

export const metadata: Metadata = createPageMetadata({
  title: "Search",
  description:
    "Instant global search across color tools, brands, named colors, gradients, and palettes with autocomplete and history.",
  path: "/search",
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const category = params.category as ToolCategory | undefined;
  let tools = q ? searchTools(q) : TOOLS;
  if (category) tools = tools.filter((t) => t.category === category);

  const brands = q ? searchBrands(q).slice(0, 8) : [];
  const colors = q ? searchNamedColors(q).slice(0, 8) : [];
  const gradients = q ? searchGradients(q).slice(0, 8) : [];
  const palettes = q ? searchPalettes(q).slice(0, 8) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Search", href: "/search" },
        ]}
      />
      <h1 className="font-display text-4xl font-semibold">Search</h1>
      <div className="mt-6">
        <AdvancedSearch initialQuery={q} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_LABELS) as ToolCategory[]).map((cat) => (
          <Link
            key={cat}
            href={`/search?category=${cat}`}
            className="rounded-full border border-border/60 px-3 py-1 text-xs hover:border-primary/40"
          >
            {CATEGORY_LABELS[cat]}
          </Link>
        ))}
      </div>

      {q && (
        <div className="mt-10 space-y-8">
          <ResultSection title="Tools" count={tools.length}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {tools.slice(0, 12).map((tool) => (
                <Link key={tool.slug} href={`/${tool.slug}`}>
                  <Card className="h-full hover:border-primary/40">
                    <CardHeader>
                      <CardTitle className="text-base">{tool.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </ResultSection>
          <ResultSection title="Brands" count={brands.length}>
            <ul className="grid gap-2 sm:grid-cols-2">
              {brands.map((b) => (
                <li key={b.slug}>
                  <Link href={`/brands/${b.slug}`} className="text-sm text-primary hover:underline">
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </ResultSection>
          <ResultSection title="Color names" count={colors.length}>
            <ul className="grid gap-2 sm:grid-cols-2">
              {colors.map((c) => (
                <li key={c.slug}>
                  <Link href={`/color-names/${c.slug}`} className="text-sm text-primary hover:underline">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </ResultSection>
          <ResultSection title="Gradients" count={gradients.length}>
            <ul className="grid gap-2 sm:grid-cols-2">
              {gradients.map((g) => (
                <li key={g.slug}>
                  <Link href={`/gradient-library/${g.slug}`} className="text-sm text-primary hover:underline">
                    {g.name}
                  </Link>
                </li>
              ))}
            </ul>
          </ResultSection>
          <ResultSection title="Palettes" count={palettes.length}>
            <ul className="grid gap-2 sm:grid-cols-2">
              {palettes.map((p) => (
                <li key={p.slug}>
                  <Link href={`/palette-library/${p.slug}`} className="text-sm text-primary hover:underline">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </ResultSection>
        </div>
      )}

      {!q && (
        <>
          <p className="mt-6 text-sm text-muted-foreground">{tools.length} tools in directory</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {tools.slice(0, 24).map((tool) => (
              <Link key={tool.slug} href={`/${tool.slug}`}>
                <Card className="h-full hover:border-primary/40">
                  <CardHeader>
                    <CardTitle className="text-base">{tool.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ResultSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (!count) return null;
  return (
    <section>
      <h2 className="mb-3 font-display text-xl font-semibold">
        {title} <span className="text-sm font-normal text-muted-foreground">({count})</span>
      </h2>
      {children}
    </section>
  );
}
