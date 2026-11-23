import { ToolFaqs } from "@/components/layout/tool-faqs";
import { JsonLd } from "@/components/seo/json-ld";
import { LANDING_FAQS } from "@/lib/data/landing-faqs";
import { faqJsonLd } from "@/lib/seo";

/** Server-rendered FAQ section plus FAQPage JSON-LD for a landing page. */
export function LandingFaqs({ slug }: { slug: string }) {
  const faqs = LANDING_FAQS[slug];
  if (!faqs?.length) return null;
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <ToolFaqs faqs={faqs} className="mt-10" />
    </>
  );
}
