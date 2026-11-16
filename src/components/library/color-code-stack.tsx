import { CopyButton } from "@/components/color/copy-button";
import { formatHsl, formatRgb, hexToRgb, rgbToHsl } from "@/lib/colors/convert";

export function ColorCodeStack({
  hex,
  cssKeyword,
}: {
  hex: string;
  cssKeyword?: string;
}) {
  const rgb = hexToRgb(hex);
  const rgbCss = formatRgb(rgb);
  const rgbaCss = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
  const hslCss = formatHsl(rgbToHsl(rgb));
  const css = cssKeyword ? `color: ${cssKeyword};` : `color: ${hex};`;
  const rows = [
    { label: "HEX", value: hex.toUpperCase() },
    { label: "RGB", value: rgbCss },
    { label: "RGBA", value: rgbaCss },
    { label: "HSL", value: hslCss },
    { label: "CSS", value: css },
  ];

  return (
    <ul className="border-border/60 bg-background/80 mt-4 divide-y divide-border/50 overflow-hidden rounded-2xl border">
      {rows.map((row) => (
        <li key={row.label} className="flex items-center gap-3 px-3 py-2 sm:px-4">
          <span className="text-muted-foreground w-12 shrink-0 text-[10px] font-semibold tracking-[0.14em] uppercase">
            {row.label}
          </span>
          <code className="min-w-0 flex-1 truncate font-mono text-xs sm:text-sm">{row.value}</code>
          <CopyButton value={row.value} label={row.label} size="sm" variant="ghost" />
        </li>
      ))}
    </ul>
  );
}
