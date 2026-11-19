"use client";

import { CopyButton } from "@/components/color/copy-button";
import type { InteriorSwatch } from "@/lib/interior/catalog";
import { cn } from "@/lib/utils";

export function InteriorSwatchCard({
  swatch,
  className,
}: {
  swatch: InteriorSwatch;
  className?: string;
}) {
  const sharePct = Math.round(swatch.share * 100);
  return (
    <article className={cn("overflow-hidden rounded-2xl border border-border/70 bg-card", className)}>
      <div className="h-20 w-full" style={{ backgroundColor: swatch.hex }} aria-hidden />
      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-sm font-semibold">{swatch.name}</h3>
            <p className="font-mono text-xs text-muted-foreground">{swatch.hex.toUpperCase()}</p>
          </div>
          <CopyButton value={swatch.hex.toUpperCase()} label="HEX" size="sm" />
        </div>
        <p className="text-xs text-muted-foreground">
          RGB {swatch.rgb.r}, {swatch.rgb.g}, {swatch.rgb.b}
        </p>
        <p className="text-xs text-muted-foreground">
          HSL {swatch.hsl.h}°, {swatch.hsl.s}%, {swatch.hsl.l}%
        </p>
        {sharePct > 0 ? (
          <p className="text-xs text-muted-foreground">About {sharePct}% of sampled pixels</p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Suggested role: <span className="font-medium text-foreground">{swatch.suggestedRole}</span>
        </p>
      </div>
    </article>
  );
}
