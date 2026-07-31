import Link from "next/link";
import type { ToolDefinition } from "@/types/tools";
import { CATEGORY_LABELS } from "@/lib/tools-registry";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { RelatedTools } from "@/components/layout/related-tools";
import { ToolFaqs } from "@/components/layout/tool-faqs";
import { JsonLd } from "@/components/seo/json-ld";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  softwareAppJsonLd,
} from "@/lib/seo";
import { GLOBAL_FAQS, TOOL_FAQS } from "@/lib/faqs";
import { getRelatedTools } from "@/lib/tools-registry";

export function ToolPageShell({
  tool,
  children,
}: {
  tool: ToolDefinition;
  children: React.ReactNode;
}) {
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Our Tools", href: "/tools" },
    { name: CATEGORY_LABELS[tool.category], href: `/tools?category=${tool.category}` },
    { name: tool.title, href: `/${tool.slug}` },
  ];
  const faqs = [...(TOOL_FAQS[tool.slug] ?? []), ...GLOBAL_FAQS.slice(0, 2)];
  const related = getRelatedTools(tool.slug);

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-4 sm:py-6 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(breadcrumbs), softwareAppJsonLd(tool), faqJsonLd(faqs)]} />
      <Breadcrumbs items={breadcrumbs} />
      <header className="mb-6 max-w-3xl sm:mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Link
            href={`/tools?category=${tool.category}`}
            className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-700 transition-colors hover:border-rose-500/40 dark:text-rose-300"
          >
            {CATEGORY_LABELS[tool.category]}
          </Link>
          <Link
            href="/tools"
            className="text-[11px] font-medium text-muted-foreground hover:text-rose-600"
          >
            All menus →
          </Link>
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
          {tool.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">{tool.description}</p>
      </header>
      <div className="min-w-0">{children}</div>
      <RelatedTools tools={related} />
      <ToolFaqs faqs={faqs} />
      <p className="mt-8 text-sm text-muted-foreground">
        Looking for more? Browse{" "}
        <Link href="/tools" className="text-primary underline-offset-4 hover:underline">
          Our Tools
        </Link>{" "}
        or open the Quick menu in the header.
      </p>
    </div>
  );
}
