import type { ReactNode } from "react";

/** Header card for color collections (flags, teams): eyebrow, H1, intro, color stripe. */
export function CollectionHero({
  eyebrow,
  title,
  stripe,
  children,
}: {
  eyebrow: string;
  title: string;
  stripe: string[];
  children: ReactNode;
}) {
  return (
    <header className="border-border/60 bg-card mt-2 overflow-hidden rounded-3xl border p-6 sm:p-8">
      <p className="text-xs font-semibold tracking-[0.16em] text-rose-600 uppercase dark:text-rose-400">{eyebrow}</p>
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
      <p className="text-muted-foreground mt-4 max-w-3xl leading-relaxed">{children}</p>
      <div className="mt-5 flex h-3 max-w-xl overflow-hidden rounded-full" aria-hidden>
        {stripe.map((c, i) => (
          <span key={`${c}-${i}`} className="flex-1" style={{ background: c }} />
        ))}
      </div>
    </header>
  );
}
