import { getLibraryGuide, type LibraryGuideId } from "@/lib/data/library-guides";

export function LibraryInsight({ id }: { id: LibraryGuideId }) {
  const guide = getLibraryGuide(id);
  return (
    <section className="rounded-[1.35rem] border border-border/50 bg-background/80 p-5 shadow-sm sm:rounded-[1.75rem] sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
        How this library works
      </p>
      <h2 className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">
        A practical walkthrough
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {guide.intro}
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {guide.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{guide.why}</p>
    </section>
  );
}
