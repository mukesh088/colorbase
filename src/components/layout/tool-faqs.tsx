import type { FAQItem } from "@/types/tools";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import "./tool-pages.css";

export function ToolFaqs({
  faqs,
  className,
  heading = true,
}: {
  faqs: FAQItem[];
  className?: string;
  heading?: boolean;
}) {
  if (!faqs.length) return null;
  return (
    <section
      className={cn("tool-faqs", className)}
      aria-labelledby={heading ? "faq-heading" : undefined}
      aria-label={heading ? undefined : "Frequently asked questions"}
    >
      {heading && (
        <div className="tool-section-heading">
          <div>
            <p>A LITTLE MORE CLARITY</p>
            <h2 id="faq-heading">Good questions. Useful answers.</h2>
          </div>
        </div>
      )}
      <Accordion type="single" collapsible>
        {faqs.map((faq, i) => (
          <AccordionItem key={faq.question} value={`item-${i}`}>
            <AccordionTrigger>
              <span className="tool-faq-number">{String(i + 1).padStart(2, "0")}</span>
              <span>{faq.question}</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="tool-faq-answer">{faq.answer}</div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
