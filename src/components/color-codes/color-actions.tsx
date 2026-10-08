"use client";

import Link from "next/link";
import { CopyButton } from "@/components/color/copy-button";
import { Button } from "@/components/ui/button";
import { useFavoriteColors } from "@/hooks";
import { cn } from "@/lib/utils";

export function ColorActions({
  hex,
  className,
  compact = false,
}: {
  hex: string;
  className?: string;
  compact?: boolean;
}) {
  const slug = hex.replace("#", "").toLowerCase();
  const fav = useFavoriteColors();
  const saved = fav.has(hex);

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      <CopyButton value={hex.toUpperCase()} label="HEX" size="sm" className="h-8 px-2 text-[11px]" />
      <Link
        href={`/color/${slug}`}
        className="inline-flex h-8 items-center rounded-lg border border-border px-2 text-[11px] font-medium hover:bg-muted"
      >
        Open
      </Link>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 px-2 text-[11px]"
        onClick={() => fav.toggle(hex)}
      >
        {saved ? "In palette" : "Add to palette"}
      </Button>
      {!compact && (
        <>
          <Link
            href={`/color-atlas?hex=${slug}`}
            className="inline-flex h-8 items-center rounded-lg border border-border px-2 text-[11px] font-medium hover:bg-muted"
          >
            Compare
          </Link>
          <Link
            href={`/tools/shades-tints-tones?hex=${slug}`}
            className="inline-flex h-8 items-center rounded-lg border border-border px-2 text-[11px] font-medium hover:bg-muted"
          >
            Shades
          </Link>
          <Link
            href={`/tools/harmony-studio?hex=${slug}`}
            className="inline-flex h-8 items-center rounded-lg border border-border px-2 text-[11px] font-medium hover:bg-muted"
          >
            Harmony
          </Link>
        </>
      )}
    </div>
  );
}
