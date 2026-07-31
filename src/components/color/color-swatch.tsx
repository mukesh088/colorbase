"use client";

import { getTextColor } from "@/lib/colors/convert";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/color/copy-button";

interface ColorSwatchProps {
  hex: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  showHex?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizes = {
  sm: "h-10 w-10",
  md: "h-16 w-16",
  lg: "h-24 w-full min-h-24",
};

export function ColorSwatch({
  hex,
  name,
  size = "md",
  showHex = true,
  className,
  onClick,
}: ColorSwatchProps) {
  const text = getTextColor(hex);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_16px_32px_-20px_rgba(14,165,233,0.45)]",
        className
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "relative flex w-full flex-col items-center justify-end p-2 transition-[filter,transform] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          sizes[size],
          onClick && "cursor-pointer"
        )}
        style={{ backgroundColor: hex, color: text }}
        aria-label={`${name ?? "Color"} ${hex}`}
      >
        {showHex && (
          <span className="rounded-md bg-black/25 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
            {hex}
          </span>
        )}
      </button>
      {name && (
        <div className="flex items-center justify-between gap-2 border-t border-border/40 bg-background/50 px-2 py-1.5 backdrop-blur-sm">
          <span className="truncate text-xs font-medium">{name}</span>
          <CopyButton value={hex} size="icon" variant="ghost" />
        </div>
      )}
    </div>
  );
}
