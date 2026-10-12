"use client";

import { toast } from "sonner";
import { getTextColor } from "@/lib/colors/convert";
import { useCopyToClipboard } from "@/hooks";
import { cn } from "@/lib/utils";

export function BrandHexChip({
  hex,
  className,
  estimated = false,
}: {
  hex: string;
  className?: string;
  estimated?: boolean;
}) {
  const { copy } = useCopyToClipboard();
  const label = hex.replace("#", "").toUpperCase();
  const text = getTextColor(hex);

  return (
    <button
      type="button"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-end gap-1 px-1 py-2 text-center transition-opacity hover:opacity-90",
        className
      )}
      style={{ backgroundColor: hex, color: text }}
      aria-label={estimated ? `Copy estimated color ${hex}` : `Copy ${hex}`}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const ok = await copy(hex);
        if (ok) toast.success(`${hex} copied`);
        else toast.error("Failed to copy");
      }}
    >
      <span className="w-full truncate font-mono text-[10px] font-semibold tracking-wide sm:text-[11px]">
        {label}
      </span>
      {estimated ? <span className="text-[9px] font-semibold uppercase tracking-wide">Est.</span> : null}
    </button>
  );
}
