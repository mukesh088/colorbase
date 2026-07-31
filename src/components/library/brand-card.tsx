import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PaletteStrip } from "@/components/library/palette-strip";
import { cn } from "@/lib/utils";

export function BrandCard({
  slug,
  name,
  overview,
  category,
  colors,
  className,
}: {
  slug: string;
  name: string;
  overview: string;
  category: string;
  colors: string[];
  className?: string;
}) {
  return (
    <Link
      href={`/brands/${slug}`}
      className={cn(
        "group card-lift glass relative block overflow-hidden rounded-3xl border border-border/50",
        className
      )}
    >
      <PaletteStrip colors={colors.slice(0, 6)} height="md" />
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-600/90 dark:text-rose-400">
              {category}
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-tight transition-colors duration-300 group-hover:text-rose-700 dark:group-hover:text-rose-300">
              {name}
            </h2>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/60 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-hover:text-foreground">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
          {overview}
        </p>
        <div className="mt-4 flex items-center gap-1.5">
          {colors.slice(0, 5).map((c, i) => (
            <span
              key={`${slug}-dot-${c}-${i}`}
              className="h-2.5 w-2.5 rounded-full ring-2 ring-background transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: c, transitionDelay: `${i * 40}ms` }}
            />
          ))}
          <span className="ml-auto text-[11px] font-medium text-muted-foreground transition-colors group-hover:text-primary">
            View palette
          </span>
        </div>
      </div>
    </Link>
  );
}
