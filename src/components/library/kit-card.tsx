import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTextColor } from "@/lib/colors/convert";

export function KitCard({
  href,
  title,
  blurb,
  accent,
  preview,
  count,
  className,
}: {
  href: string;
  title: string;
  blurb: string;
  accent: string;
  preview: string[];
  count?: number;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group card-lift relative block overflow-hidden rounded-[1.6rem] border border-border/50 bg-background/40",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(120% 80% at 0% 0%, ${accent}33, transparent 55%), linear-gradient(180deg, transparent 35%, var(--background) 100%)`,
        }}
      />

      <div className="relative flex h-28 overflow-hidden">
        {preview.map((color, i) => (
          <div
            key={`${href}-preview-${color}-${i}`}
            className="relative flex-1 transition-[flex-grow,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:brightness-105 group-hover:first:flex-[1.35]"
            style={{ backgroundColor: color }}
          />
        ))}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />
      </div>

      <div className="relative space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span
              className="mb-2 inline-flex h-2 w-8 rounded-full"
              style={{ backgroundColor: accent }}
              aria-hidden
            />
            <h3 className="font-display text-lg font-semibold tracking-tight transition-colors duration-300 group-hover:text-rose-700 dark:group-hover:text-rose-300">
              {title}
            </h3>
          </div>
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/70 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-hover:text-foreground"
            style={{ boxShadow: `0 0 0 1px ${accent}22` }}
          >
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground/80">
          {blurb}
        </p>
        <div className="flex items-center justify-between pt-1">
          <div className="flex -space-x-1.5">
            {preview.slice(0, 5).map((color, i) => (
              <span
                key={`${href}-dot-${color}-${i}`}
                className="h-5 w-5 rounded-full border-2 border-background shadow-sm transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: color, transitionDelay: `${i * 40}ms` }}
              />
            ))}
          </div>
          {typeof count === "number" && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {count} colors
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function FamilyCard({
  href,
  label,
  swatch,
  shades,
  className,
}: {
  href: string;
  label: string;
  swatch: string;
  shades: string[];
  className?: string;
}) {
  const text = getTextColor(swatch);

  return (
    <Link
      href={href}
      className={cn(
        "group card-lift relative block overflow-hidden rounded-[1.35rem] border border-border/50",
        className
      )}
    >
      <div
        className="relative flex h-24 flex-col justify-end p-3 transition-[filter] duration-500 group-hover:brightness-110"
        style={{
          background: `linear-gradient(145deg, ${swatch} 0%, ${shades[2] ?? swatch} 55%, ${shades[4] ?? swatch} 100%)`,
          color: text,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.28),transparent_45%)] opacity-60" />
        <p className="relative font-display text-sm font-semibold tracking-tight drop-shadow-sm sm:text-base">
          {label}
        </p>
      </div>
      <div className="flex h-2.5">
        {shades.map((shade, i) => (
          <span
            key={`${href}-shade-${shade}-${i}`}
            className="flex-1 transition-[flex-grow] duration-500 group-hover:first:flex-[1.4]"
            style={{ backgroundColor: shade }}
          />
        ))}
      </div>
    </Link>
  );
}
