import { cn } from "@/lib/utils";

/** Color strip with unique keys (handles duplicate HEX values). */
export function PaletteStrip({
  colors,
  className,
  height = "md",
  interactive = true,
}: {
  colors: string[];
  className?: string;
  height?: "sm" | "md" | "lg";
  interactive?: boolean;
}) {
  const heights = { sm: "h-14", md: "h-20", lg: "h-28" };

  return (
    <div
      className={cn(
        "group/strip flex overflow-hidden",
        heights[height],
        className
      )}
    >
      {colors.map((color, index) => (
        <div
          key={`${color}-${index}`}
          title={color}
          className={cn(
            "relative flex-1 transition-[flex-grow,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            interactive && "hover:flex-[1.65] group-hover/strip:brightness-[0.97]"
          )}
          style={{ backgroundColor: color }}
        >
          <span
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 translate-y-1 bg-gradient-to-t from-black/45 to-transparent px-1 pb-1.5 pt-4 text-center font-mono text-[9px] font-medium uppercase tracking-wide text-white opacity-0 transition-all duration-300",
              interactive && "group-hover/strip:translate-y-0 group-hover/strip:opacity-100"
            )}
          >
            {color}
          </span>
        </div>
      ))}
    </div>
  );
}
