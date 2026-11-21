import Link from "next/link";
import { getPageAnswer } from "@/lib/data/tool-answers";
import { routeLastModified } from "@/lib/content-dates";
import { IdeCodeBlock } from "@/components/content/ide-code-block";
import { SITE_NAME } from "@/lib/site-config";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/**
 * Answer-first block under a tool: a question-style H2 with a 40–60 word
 * answer, key facts, an optional table or code sample, and a dated byline.
 */
export function ToolAnswerSection({ slug }: { slug: string }) {
  const answer = getPageAnswer(slug);
  if (!answer) return null;
  const updated = routeLastModified(`/${slug}`, "tools");
  const headingId = `answer-${slug.replace(/\//g, "-")}`;
  return (
    <section className="tool-guide tool-answer" aria-labelledby={headingId}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">Quick answer</p>
      <h2 id={headingId} className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">
        {answer.question}
      </h2>
      <p className="tool-answer-lead mt-3 text-sm leading-relaxed text-foreground sm:text-base">{answer.answer}</p>
      <h3 className="mt-5 font-display text-base font-semibold tracking-tight">Key facts</h3>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {answer.keyFacts.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>
      {answer.explainer && (
        <article className="mt-6 border-t border-border/50 pt-5">
          <h3 className="font-display text-lg font-semibold tracking-tight sm:text-xl">{answer.explainer.heading}</h3>
          {answer.explainer.table && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                {answer.explainer.caption && (
                  <caption className="caption-bottom pt-2 text-left text-xs text-muted-foreground">
                    {answer.explainer.caption}
                  </caption>
                )}
                <thead>
                  <tr className="border-b border-border">
                    {answer.explainer.table.columns.map((col) => (
                      <th key={col} scope="col" className="py-2 pr-4 font-semibold text-foreground">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {answer.explainer.table.rows.map((row) => (
                    <tr key={row.join("|")} className="border-b border-border/50">
                      {row.map((cell, i) => (
                        <td key={`${i}-${cell}`} className="py-2 pr-4 font-mono text-xs text-muted-foreground sm:text-sm">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {answer.explainer.code && (
            <div className="mt-3">
              <IdeCodeBlock code={answer.explainer.code.content} language={answer.explainer.code.language} />
            </div>
          )}
        </article>
      )}
      <p className="mt-6 border-t border-border/50 pt-4 text-xs text-muted-foreground">
        Last updated <time dateTime={updated.toISOString().slice(0, 10)}>{dateFormat.format(updated)}</time> ·
        Maintained by the{" "}
        <Link href="/about" className="text-primary underline-offset-4 hover:underline">
          {SITE_NAME} team
        </Link>
        . Free to use, no sign-up needed.
      </p>
    </section>
  );
}
