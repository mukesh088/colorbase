import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ToolFaqs } from "@/components/layout/tool-faqs";
import { TableGeneratorApp } from "@/components/tools/table-generator";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  faqJsonLd,
  softwareAppJsonLd,
} from "@/lib/seo";
import { TABLE_GENERATOR_FAQS, tableGeneratorHowToJsonLd } from "@/lib/table-generator/seo";
import { getToolBySlug } from "@/lib/tools-registry";

const slug = "table-generator";

export function generateMetadata(): Metadata {
  return createPageMetadata({
    title: "Universal Table Generator",
    description:
      "Create HTML, Markdown, LaTeX, CSV, TSV, MediaWiki, BBCode, SQL, React and Tailwind tables visually. Import spreadsheets, style cells, and export instantly.",
    path: `/${slug}`,
    keywords: [
      "table generator",
      "html table generator",
      "markdown table generator",
      "csv to table",
      "latex table",
      "online table editor",
    ],
  });
}

export default function TableGeneratorPage() {
  const tool = getToolBySlug(slug);
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Our Tools", href: "/tools" },
    { name: "Developer Tools", href: "/tools?category=developer-tools" },
    { name: "Table Generator", href: `/${slug}` },
  ];
  const faqs = TABLE_GENERATOR_FAQS;

  return (
    <div className="mx-auto w-full max-w-[1400px] px-3 py-5 pb-12 sm:px-4 sm:py-6 sm:pb-16 lg:px-6">
      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumbs),
          ...(tool ? [softwareAppJsonLd(tool)] : []),
          faqJsonLd(faqs),
          tableGeneratorHowToJsonLd(),
        ]}
      />
      <Breadcrumbs items={breadcrumbs} />
      <div className="mb-6 max-w-3xl sm:mb-8">
        <Link
          href="/tools?category=developer-tools"
          className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-700 dark:text-rose-300"
        >
          Developer Tools
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
          Universal Table Generator
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Design beautiful tables visually and export to HTML, Markdown, LaTeX, CSV, SQL, React, and more.
        </p>
      </div>
      <TableGeneratorApp />
      <ToolFaqs faqs={faqs} />
    </div>
  );
}
