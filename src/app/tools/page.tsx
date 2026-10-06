import type { Metadata } from "next";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ToolsDirectory } from "@/components/tools/tools-directory";
import { CATEGORY_LABELS } from "@/lib/tools-registry";
import type { ToolCategory } from "@/types/tools";

export const metadata: Metadata = createPageMetadata({
  title: "Our Tools — Color, CSS & Palette Utilities",
  description:
    "Browse colorBase tools by menu: color pickers, converters, palettes, CSS generators, image color extractors, and accessibility checkers.",
  path: "/tools",
  keywords: [
    "free color tools",
    "css tools",
    "palette tools",
    "color picker",
    "image color tools",
    "color tools directory",
  ],
});

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const category = params.category as ToolCategory | undefined;
  const validCategory =
    category && category in CATEGORY_LABELS ? category : undefined;

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Our Tools", href: "/tools" },
    ...(validCategory
      ? [{ name: CATEGORY_LABELS[validCategory], href: `/tools?category=${validCategory}` }]
      : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <div className="mt-4 sm:mt-6">
        <ToolsDirectory initialCategory={validCategory} />
      </div>
    </div>
  );
}
