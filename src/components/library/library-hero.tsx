import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function LibraryHero({
  eyebrow,
  title,
  description,
  stats,
  swatches,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  stats?: { label: string; value: string }[];
  swatches?: string[];
  actions?: { href: string; label: string; primary?: boolean }[];
}) {
  const mesh = swatches?.filter(Boolean).slice(0, 6) ?? [];

  return (
    <header className="relative overflow-hidden rounded-[1.5rem] border border-border/50 bg-card/90 shadow-[0_24px_56px_-36px_rgba(24,24,27,0.45)] sm:rounded-[1.85rem]">
      {mesh.length > 0 && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div
            className="absolute -left-16 -top-20 h-56 w-56 rounded-full blur-3xl opacity-50"
            style={{ background: mesh[0] }}
          />
          <div
            className="absolute -right-10 top-0 h-40 w-40 rounded-full blur-3xl opacity-40"
            style={{ background: mesh[1] ?? mesh[0] }}
          />
          <div
            className="absolute bottom-0 left-1/3 h-32 w-64 rounded-full blur-3xl opacity-30"
            style={{ background: mesh[2] ?? mesh[0] }}
          />
        </div>
      )}
      <div className="relative grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:p-10">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-2.5 font-display text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-[3.15rem] lg:leading-[1.08]">
            {title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
          {actions && actions.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors",
                    action.primary
                      ? "bg-rose-600 text-white hover:bg-rose-700"
                      : "border border-border/60 bg-background/80 text-foreground hover:border-rose-500/40"
                  )}
                >
                  {action.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          )}
          {stats && stats.length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/50 bg-background/70 px-3 py-3"
                >
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-display text-lg font-semibold tabular-nums tracking-[-0.04em] sm:text-xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        {mesh.length > 0 && (
          <div className="hidden overflow-hidden rounded-2xl border border-white/20 shadow-lg lg:block">
            <div className="flex h-44">
              {mesh.map((hex, i) => (
                <span
                  key={`${hex}-${i}`}
                  className="min-w-0 flex-1"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
            <div className="flex h-16">
              {[...mesh].reverse().map((hex, i) => (
                <span
                  key={`r-${hex}-${i}`}
                  className="min-w-0 flex-1 opacity-90"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
