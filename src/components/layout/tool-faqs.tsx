import type { FAQItem } from "@/types/tools";
import { ChevronDown } from "lucide-react";
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
      <div>
        {faqs.map((faq, i) => (
          <details key={faq.question} className="group">
            <summary className="flex cursor-pointer list-none items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="tool-faq-number">{String(i + 1).padStart(2, "0")}</span>
              <span>{faq.question}</span>
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <div className="tool-faq-answer pb-4">{faq.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
