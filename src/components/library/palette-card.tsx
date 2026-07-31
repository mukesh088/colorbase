import Link from "next/link";
import { PaletteStrip } from "@/components/library/palette-strip";
import { cn } from "@/lib/utils";

export function PaletteCard({
  href,
  name,
  colors,
  meta,
  className,
}: {
  href: string;
  name: string;
  colors: string[];
  meta?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group card-lift glass block overflow-hidden rounded-3xl border border-border/50",
        className
      )}
    >
      <PaletteStrip colors={colors} height="md" />
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-medium tracking-tight transition-colors duration-300 group-hover:text-rose-700 dark:group-hover:text-rose-300">
            {name}
          </p>
          {meta && (
            <p className="mt-0.5 text-[11px] text-muted-foreground transition-colors group-hover:text-foreground/70">
              {meta}
            </p>
          )}
        </div>
        <div className="flex -space-x-1.5">
          {colors.slice(0, 4).map((c, i) => (
            <span
              key={`${href}-chip-${c}-${i}`}
              className="h-6 w-6 rounded-full border-2 border-background shadow-sm transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: c, transitionDelay: `${i * 35}ms` }}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
