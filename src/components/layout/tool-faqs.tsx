import { CircleHelp } from "lucide-react";
import type { FAQItem } from "@/types/tools";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

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
      className={cn("mt-12 sm:mt-16", className)}
      aria-labelledby={heading ? "faq-heading" : undefined}
      aria-label={heading ? undefined : "Frequently asked questions"}
    >
      {heading && (
        <div className="mb-6 max-w-3xl animate-rise">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-700 dark:text-rose-300">
            <CircleHelp className="h-3.5 w-3.5" />
            Answers
          </div>
          <h2 id="faq-heading" className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Click a question to open it. Click again to close.
          </p>
        </div>
      )}

      <Accordion type="single" collapsible className="mx-auto grid max-w-3xl gap-3">
        {faqs.map((faq, i) => (
          <AccordionItem
            key={faq.question}
            value={`item-${i}`}
            style={{ animationDelay: `${Math.min(i, 10) * 55}ms` }}
            className="card-lift group overflow-hidden rounded-[1.35rem] border border-border/50 bg-background/75 shadow-sm data-[state=open]:border-rose-500/40 data-[state=open]:shadow-[0_20px_44px_-24px_rgba(244,63,94,0.5)] animate-rise"
          >
            <AccordionTrigger className="px-4 py-4 hover:no-underline active:scale-[0.995] sm:px-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/15 to-fuchsia-500/15 font-display text-xs font-semibold text-rose-700 transition-transform duration-300 group-hover:scale-110 group-data-[state=open]:rotate-3 group-data-[state=open]:from-rose-500 group-data-[state=open]:to-fuchsia-500 group-data-[state=open]:text-white dark:text-rose-300">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-left font-display text-[15px] font-semibold leading-snug tracking-tight">
                {faq.question}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 sm:px-5">
              <div className="faq-answer rounded-xl border border-rose-500/10 bg-gradient-to-br from-rose-500/10 via-background/40 to-fuchsia-500/10 px-4 py-3 text-[15px] leading-relaxed text-foreground/85">
                {faq.answer}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
