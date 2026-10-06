import type { Metadata } from "next";
import { createPageMetadata, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { GLOBAL_FAQS } from "@/lib/faqs";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ToolFaqs } from "@/components/layout/tool-faqs";
import { JsonLd } from "@/components/seo/json-ld";
import { ContactDetails } from "@/components/layout/contact-details";

export const metadata: Metadata = createPageMetadata({
  title: "FAQ",
  description: "Frequently asked questions about HTML color codes and tools.",
  path: "/faq",
  keywords: ["html color faq", "hex color questions"],
});

export default function FaqPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "FAQ", href: "/faq" },
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(GLOBAL_FAQS)]} />
      <Breadcrumbs items={crumbs} />
      <h1 className="font-display text-4xl font-semibold">FAQ</h1>
      <p className="mt-2 text-muted-foreground">Answers to common color and accessibility questions.</p>
      <ToolFaqs faqs={GLOBAL_FAQS} heading={false} className="mt-8" />
      <ContactDetails className="mt-10 rounded-2xl border border-border/60 bg-background/80 p-4" />
    </div>
  );
}
