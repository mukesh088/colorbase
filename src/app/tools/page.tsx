import type { Metadata } from "next";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ToolsDirectory } from "@/components/tools/tools-directory";
import { CATEGORY_LABELS } from "@/lib/tools-registry";
import type { ToolCategory } from "@/types/tools";

export const metadata: Metadata = createPageMetadata({
  title: "Our Tools — Free CSS, Text, Developer & Color Utilities",
  description:
    "Browse free tools by menu: CSS, text, developer, image, web, social, utility, and color tools. Open a category to see the full name list.",
  path: "/tools",
  keywords: [
    "free tools",
    "css tools",
    "developer tools",
    "text tools",
    "image tools",
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
