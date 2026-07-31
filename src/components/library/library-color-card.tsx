"use client";

import Link from "next/link";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { getTextColor } from "@/lib/colors/convert";
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

  return (
    <div
      className={cn(
        "group card-lift relative overflow-hidden rounded-[1.35rem] border border-border/50 bg-background/30",
        className
      )}
    >
      <Link href={href} className="block" aria-label={`${name} ${hex}`}>
        <div
          className="relative flex h-28 flex-col justify-end p-3 transition-[filter] duration-500 group-hover:brightness-105"
          style={{
            background: `linear-gradient(160deg, ${hex} 0%, ${hex}cc 70%, ${hex}99 100%)`,
            color: text,
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.35),transparent_40%)] opacity-50 transition-opacity duration-500 group-hover:opacity-80" />
          <p className="relative font-mono text-xs font-semibold uppercase tracking-wider drop-shadow-sm">
            {hex}
          </p>
        </div>
        <div className="space-y-1 px-3 py-3">
          <p className="truncate text-sm font-semibold tracking-tight transition-colors duration-300 group-hover:text-rose-700 dark:group-hover:text-rose-300">
            {name}
          </p>
          {meta && (
            <p className="truncate text-[11px] text-muted-foreground transition-colors group-hover:text-foreground/70">
              {meta}
            </p>
          )}
        </div>
      </Link>

      <button
        type="button"
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 hover:bg-black/35"
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
    </div>
  );
}
