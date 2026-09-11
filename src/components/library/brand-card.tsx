import Link from "next/link";
import { BrandLogo } from "@/components/library/brand-logo";
import { BrandHexChip } from "@/components/library/brand-hex-chip";
import { cn } from "@/lib/utils";

export function BrandCard({
  slug,
  name,
  overview,
  category,
  colors,
  className,
  hexHref,
}: {
  slug: string;
  name: string;
  overview: string;
  category: string;
  colors: string[];
  className?: string;
  hexHref?: string;
}) {
  const href = hexHref ?? `/brands/${slug}`;
  const palette = [...new Map(colors.map((c) => [c.toLowerCase(), c])).values()];

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-white shadow-[0_8px_30px_-18px_rgba(15,10,20,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(15,10,20,0.45)] dark:bg-card",
        className
      )}
    >
      <Link
        href={href}
        className="flex flex-1 flex-col px-5 pb-4 pt-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${name} brand colors`}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {name}
          </h2>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {category}
          </span>
        </div>
        <p className="sr-only">{overview}</p>
        <div className="flex flex-1 items-center justify-center py-8 sm:py-10">
          <BrandLogo slug={slug} name={name} colors={palette} size="lg" />
        </div>
      </Link>
      <div className="flex min-h-[4.25rem] overflow-hidden">
        {palette.map((hex, i) => (
          <BrandHexChip key={`${slug}-${hex}-${i}`} hex={hex} />
        ))}
      </div>
    </article>
  );
}
