"use client";

import Link from "next/link";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { getTextColor, hexToRgb } from "@/lib/colors/convert";
import { cn } from "@/lib/utils";

export function LibraryColorCard({
  href,
  hex,
  name,
  meta,
  className,
}: {
  href: string;
  hex: string;
  name: string;
  meta?: string;
  className?: string;
}) {
  const text = getTextColor(hex);
  const rgb = hexToRgb(hex);
  const rgbLabel = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  return (
    <article
      className={cn(
        "group card-lift relative overflow-hidden rounded-[var(--radius-md)] border border-border bg-card",
        className
      )}
    >
      <Link href={href} className="block" aria-label={`${name} ${hex}`}>
        <div
          className="relative flex h-28 flex-col justify-end p-3"
          style={{ backgroundColor: hex, color: text }}
        >
          <p className="relative font-mono text-xs font-semibold uppercase tracking-wider">{hex}</p>
          <p className="relative mt-0.5 font-mono text-[10px] opacity-80">{rgbLabel}</p>
        </div>
        <div className="space-y-1 px-3 py-3">
          <p className="truncate text-sm font-semibold tracking-tight transition-colors duration-200 group-hover:text-primary">
            {name}
          </p>
          {meta && (
            <p className="truncate text-[11px] text-muted-foreground">{meta}</p>
          )}
        </div>
      </Link>

      <div className="absolute right-2 top-2 flex gap-1 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-white/25 bg-black/30 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-black/45"
          aria-label={`Copy ${hex}`}
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await navigator.clipboard.writeText(hex);
            toast.success(`${hex} copied`);
          }}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <Link
          href={href}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-white/25 bg-black/30 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-black/45"
          aria-label={`Open ${name}`}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
