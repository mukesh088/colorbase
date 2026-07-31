import Link from "next/link";
import { analyzeColor } from "@/lib/colors/spaces";
import { psychologyForFamily, FAMILY_LABELS, type ColorFamily } from "@/lib/data/families";
import { CopyButton } from "@/components/color/copy-button";
import { ColorSwatch } from "@/components/color/color-swatch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShareButtons } from "@/components/library/share-buttons";
import { CodeExportPanel } from "@/components/library/code-export-panel";

export function ColorDetailView({
  name,
  hex,
  family,
  sources,
}: {
  name: string;
  hex: string;
  family?: string;
  sources?: string[];
}) {
  const a = analyzeColor(hex);
  const fam = (family ?? "blue") as ColorFamily;
  const rows = [
    ["HEX", a.hex],
    ["RGB", `rgb(${a.rgb.r}, ${a.rgb.g}, ${a.rgb.b})`],
    ["RGBA", a.rgba],
    ["HSL", a.hsl],
    ["HSV", a.hsv],
    ["LAB", a.lab],
    ["LCH", a.lch],
    ["OKLAB", a.oklab],
    ["OKLCH", a.oklch],
    ["XYZ", a.xyz],
    ["CMYK", a.cmyk],
    ["CSS", a.css],
    ["CSS variable", a.cssVar],
    ["SCSS", a.scss],
    ["Tailwind", a.tailwind],
  ] as const;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div
          className="flex min-h-64 flex-col justify-end rounded-3xl border border-border/50 p-6 shadow-inner"
          style={{ backgroundColor: a.hex, color: a.textOnColor }}
        >
          <p className="text-sm opacity-80">Preview</p>
          <h2 className="font-display text-3xl font-semibold">{name}</h2>
          <p className="mt-1 font-mono text-lg">{a.hex}</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {family && (
              <p>
                Family:{" "}
                <Link className="text-primary underline-offset-4 hover:underline" href={`/colors/family/${family}`}>
                  {FAMILY_LABELS[fam] ?? family}
                </Link>
              </p>
            )}
            {sources && sources.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sources.map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
            )}
            <p>
              Accessibility on this swatch: <Badge>{a.accessibility.level}</Badge> ({a.accessibility.ratio}:1)
            </p>
            <p>Contrast vs white: {a.contrastOnWhite}:1 · vs black: {a.contrastOnBlack}:1</p>
            <ShareButtons title={name} path={`/color/${encodeURIComponent(a.hex.slice(1))}`} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formats</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/40 p-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="truncate font-mono text-sm">{value}</p>
              </div>
              <CopyButton value={value} size="icon" variant="ghost" label={label} />
            </div>
          ))}
        </CardContent>
      </Card>

      <CodeExportPanel colors={[a.hex]} name={name.toLowerCase().replace(/\s+/g, "-")} />

      <section>
        <h3 className="mb-3 font-display text-xl font-semibold">Color psychology</h3>
        <p className="max-w-3xl text-muted-foreground">{psychologyForFamily(fam)}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Usage examples: primary buttons, chart series, status badges, marketing gradients, and brand accents in the{" "}
          {FAMILY_LABELS[fam] ?? family} family.
        </p>
      </section>

      {(
        [
          ["Tints", a.tints],
          ["Shades", a.shades],
          ["Tones", a.tones],
          ["Complementary", a.complementary],
          ["Analogous", a.analogous],
          ["Triadic", a.triadic],
          ["Split complementary", a.splitComplementary],
          ["Monochromatic", a.monochromatic],
        ] as const
      ).map(([title, colors]) => (
        <section key={title}>
          <h3 className="mb-3 font-display text-xl font-semibold">{title}</h3>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
            {colors.map((c) => (
              <Link key={`${title}-${c}`} href={`/color/${c.slice(1)}`}>
                <ColorSwatch hex={c} size="sm" />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
