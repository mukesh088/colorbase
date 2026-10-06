import Link from "next/link";
import { getToolGuide } from "@/lib/data/tool-guides";

export function ToolGuideSection({ slug }: { slug: string }) {
  const guide = getToolGuide(slug);
  if (!guide) return null;
  return (
    <section className="mt-8 max-w-3xl rounded-2xl border border-border/60 bg-background/80 p-4 sm:mt-10 sm:p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
        How to use this tool
      </p>
      <h2 className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">A practical walkthrough</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{guide.intro}</p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {guide.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{guide.why}</p>
      {guide.sections?.map((section) => (
        <article key={section.heading} className="mt-6 border-t border-border/50 pt-5">
          <h3 className="font-display text-lg font-semibold tracking-tight sm:text-xl">
            {section.heading}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {section.body}
          </p>
        </article>
      ))}
      {guide.relatedReading && guide.relatedReading.length > 0 && (
        <p className="mt-4 text-sm">
          <span className="font-medium text-foreground">Read next: </span>
          {guide.relatedReading.map((item, i) => (
            <span key={item.href}>
              {i > 0 ? " · " : ""}
              <Link href={item.href} className="text-primary underline-offset-4 hover:underline">
                {item.title}
              </Link>
            </span>
          ))}
        </p>
      )}
    </section>
  );
}
