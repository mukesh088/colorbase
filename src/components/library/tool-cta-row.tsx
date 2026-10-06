import Link from "next/link";
import { Contrast, Palette, Pipette } from "lucide-react";

export function ToolCtaRow({
  hex,
  className,
}: {
  hex?: string;
  className?: string;
}) {
  const clean = hex?.replace("#", "") ?? "";
  const picker = clean ? `/color-picker` : "/color-picker";
  const contrast = "/contrast-checker";
  const palette = "/palette-generator";

  return (
    <nav
      aria-label="Related color tools"
      className={className ?? "flex flex-wrap gap-2"}
    >
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
