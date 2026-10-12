import Link from "next/link";
import { BrandLogo } from "@/components/library/brand-logo";
import { BrandHexChip } from "@/components/library/brand-hex-chip";
import { CopyButton } from "@/components/color/copy-button";
import { cn } from "@/lib/utils";

export function BrandCard({
  slug,
  name,
  overview,
  category,
  colors,
  className,
  hexHref,
  logoUrl,
  unverified = [],
  priority = false,
}: {
  slug: string;
  name: string;
  overview: string;
  category: string;
  colors: string[];
  className?: string;
  hexHref?: string;
  logoUrl?: string;
  unverified?: string[];
  priority?: boolean;
}) {
  const href = hexHref ?? `/brands/${slug}`;
  const palette = [...new Map(colors.map((c) => [c.toLowerCase(), c])).values()];
  const primary = palette[0];
  const estimated = new Set(unverified.map((hex) => hex.toLowerCase()));

  return (
    <article
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-white shadow-[0_8px_30px_-18px_rgba(15,10,20,0.35)] [content-visibility:auto] [contain-intrinsic-size:auto_26rem] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(15,10,20,0.45)] dark:bg-card",
        className
      )}
    >
      <Link
        href={href}
        className="flex min-w-0 flex-1 flex-col px-4 pb-3 pt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-5 sm:pt-5"
        aria-label={`${name} brand colors`}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {name}
          </h2>
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {category}
          </span>
        </div>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:line-clamp-2">
          {overview}
        </p>
        <div className="flex flex-1 items-center justify-center py-6 sm:py-8">
          <BrandLogo slug={slug} name={name} colors={palette} size="lg" logoUrl={logoUrl} priority={priority} />
        </div>
      </Link>
      {primary ? (
        <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Primary</p>
            <p className="truncate font-mono text-sm font-semibold">{primary.toUpperCase()}</p>
          </div>
          <CopyButton value={primary.toUpperCase()} label="Copy HEX" size="sm" variant="outline" className="shrink-0" />
        </div>
      ) : null}
      <div className="flex min-h-16 min-w-0 overflow-x-auto">
        {palette.map((hex, i) => (
          <BrandHexChip
            key={`${slug}-${hex}-${i}`}
            hex={hex}
            estimated={estimated.has(hex.toLowerCase())}
            className="min-w-[4.75rem] flex-none"
          />
        ))}
      </div>
    </article>
  );
}
