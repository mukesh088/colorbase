import Link from "next/link";
import { Contrast, LayoutDashboard, Palette, Pipette } from "lucide-react";
import { colorToolLinks } from "@/lib/colors/tool-links";

export function ToolCtaRow({
  hex,
  colors,
  className,
}: {
  hex?: string;
  colors?: string[];
  className?: string;
}) {
  const clean = hex?.replace("#", "") ?? "";
  const { picker, contrast, palette } = colorToolLinks(hex, colors);

  return (
    <nav
      aria-label="Related color tools"
      className={className ?? "flex flex-wrap gap-2"}
    >
      <Link href={palette.replace("/palette-generator", "/theme-builder")} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-3.5 text-sm font-medium transition-colors hover:border-primary/40">
        <LayoutDashboard className="h-4 w-4" /> Preview as a UI theme
      </Link>
      <Link
        href={picker}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-3.5 text-sm font-medium transition-colors hover:border-rose-500/40"
      >
        <Pipette className="h-4 w-4 text-rose-600" />
        Open picker{clean ? ` · #${clean}` : ""}
      </Link>
      <Link
        href={contrast}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-3.5 text-sm font-medium transition-colors hover:border-rose-500/40"
      >
        <Contrast className="h-4 w-4 text-rose-600" />
        Check contrast
      </Link>
      <Link
        href={palette}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-3.5 text-sm font-medium transition-colors hover:border-rose-500/40"
      >
        <Palette className="h-4 w-4 text-rose-600" />
        Build a palette
      </Link>
    </nav>
  );
}
