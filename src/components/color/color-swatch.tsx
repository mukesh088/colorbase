"use client";

import { useRouter } from "next/navigation";
import { getTextColor, hexToRgb } from "@/lib/colors/convert";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/color/copy-button";
import { toast } from "sonner";

interface ColorSwatchProps {
  hex: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  showHex?: boolean;
  className?: string;
  href?: string;
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
  href,
  onClick,
}: ColorSwatchProps) {
  const text = getTextColor(hex);
  const rgb = hexToRgb(hex);
  const router = useRouter();
  const rgbLabel = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const title = [name, hex, rgbLabel].filter(Boolean).join(" · ");
  const colorHref = href ?? `/color/${hex.replace("#", "").toLowerCase()}`;

  const copyHex = async () => {
    await navigator.clipboard.writeText(hex);
    toast.success(`${hex} copied`);
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[var(--radius-md)] border border-border bg-card transition-[transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/35",
        className
      )}
    >
      <button
        type="button"
        title={title}
        onClick={() => {
          if (onClick) onClick();
          else void copyHex();
        }}
        onDoubleClick={() => router.push(colorHref)}
        className={cn(
          "relative flex w-full flex-col items-center justify-end p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          sizes[size]
        )}
        style={{ backgroundColor: hex, color: text }}
        aria-label={`Copy ${name ?? "color"} ${hex}. Double-click to open.`}
      >
        {showHex && (
          <span className="rounded-[var(--radius-sm)] bg-black/30 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {hex}
          </span>
        )}
      </button>
      {name && (
        <div className="flex items-center justify-between gap-2 border-t border-border px-2 py-1.5">
          <span className="truncate text-xs font-medium">{name}</span>
          <CopyButton value={hex} size="icon" variant="ghost" />
        </div>
      )}
    </div>
  );
}
