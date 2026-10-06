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
import { TOOL_FAQS } from "@/lib/faqs";
import { getRelatedTools } from "@/lib/tools-registry";
import { ToolGuideSection } from "@/components/content/tool-guide";

export function ToolPageShell({
  tool,
  children,
  hideHeader = false,
}: {
  tool: ToolDefinition;
  children: React.ReactNode;
  hideHeader?: boolean;
}) {
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Our Tools", href: "/tools" },
    { name: CATEGORY_LABELS[tool.category], href: `/tools?category=${tool.category}` },
    { name: tool.title, href: `/${tool.slug}` },
  ];
  const faqs = TOOL_FAQS[tool.slug] ?? [];
  const related = getRelatedTools(tool.slug);

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-4 sm:py-6 lg:px-6">
      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumbs),
          softwareAppJsonLd(tool),
          ...(faqs.length > 0 ? [faqJsonLd(faqs)] : []),
        ]}
      />
      <Breadcrumbs items={breadcrumbs} />
      {hideHeader ? (
        <h1 className="sr-only">{tool.title}</h1>
      ) : (
        <header className="mb-6 overflow-hidden rounded-[1.35rem] border border-border/50 bg-background/80 p-5 shadow-[0_18px_40px_-28px_rgba(225,29,72,0.35)] sm:mb-8 sm:rounded-[1.75rem] sm:p-7">
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
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-3 sm:text-base">{tool.description}</p>
        </header>
      )}
      <div className="min-w-0">{children}</div>
      <ToolGuideSection slug={tool.slug} />
      <RelatedTools tools={related} />
      {faqs.length > 0 && <ToolFaqs faqs={faqs} />}
      <p className="mt-8 text-sm text-muted-foreground">
        Looking for more? Browse{" "}
        <Link href="/tools" className="text-primary underline-offset-4 hover:underline">
          Our Tools
        </Link>
        .
      </p>
    </div>
  );
}
