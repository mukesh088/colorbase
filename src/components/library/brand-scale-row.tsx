"use client";

import { toast } from "sonner";
import { getTextColor } from "@/lib/colors/convert";
import { useCopyToClipboard } from "@/hooks";
import { cn } from "@/lib/utils";

export function BrandScaleRow({
  label,
  colors,
}: {
  label: string;
  colors: string[];
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="flex overflow-hidden rounded-xl border border-border/50">
        {colors.map((hex, index) => (
          <ScaleSwatch key={`${label}-${hex}-${index}`} hex={hex} />
        ))}
      </div>
    </div>
  );
}

function ScaleSwatch({ hex }: { hex: string }) {
  const { copy } = useCopyToClipboard();
  const text = getTextColor(hex);

  return (
    <button
      type="button"
      title={`Copy ${hex}`}
      aria-label={`Copy ${hex}`}
      className={cn(
        "h-12 min-w-0 flex-1 px-0.5 text-[9px] font-mono font-semibold transition-transform hover:z-10 hover:scale-y-110 sm:h-14 sm:text-[10px]"
      )}
      style={{ backgroundColor: hex, color: text }}
      onClick={async () => {
        const ok = await copy(hex);
        if (ok) toast.success(`${hex} copied`);
      }}
    >
      <span className="hidden sm:inline">{hex.replace("#", "").toUpperCase()}</span>
    </button>
  );
}
