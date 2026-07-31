import type { FAQItem } from "@/types/tools";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function ToolFaqs({ faqs }: { faqs: FAQItem[] }) {
  if (!faqs.length) return null;
  return (
    <section className="mt-12 max-w-3xl" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="mb-4 font-display text-xl font-semibold">
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible className="glass rounded-2xl border border-border/60 px-4">
        {faqs.map((faq, i) => (
          <AccordionItem key={faq.question} value={`item-${i}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
