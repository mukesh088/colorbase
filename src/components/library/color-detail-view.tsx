"use client";

import Link from "next/link";
import { Copy, Contrast, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { analyzeColor } from "@/lib/colors/spaces";
import { psychologyForFamily, FAMILY_LABELS, type ColorFamily } from "@/lib/data/families";
import { getTextColor } from "@/lib/colors/convert";
import { CopyButton } from "@/components/color/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/library/share-buttons";
import { CodeExportPanel } from "@/components/library/code-export-panel";
import { cn } from "@/lib/utils";

type SimilarColor = { slug: string; name: string; hex: string };

function ColorStrip({
  colors,
  title,
  subtitle,
  tall = false,
}: {
  colors: string[];
  title: string;
  subtitle?: string;
  tall?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-transparent to-transparent px-4 py-3 sm:px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
            Palette
          </p>
          <h3 className="font-display text-lg font-semibold tracking-tight sm:text-xl">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 rounded-full text-xs"
          onClick={async () => {
            await navigator.clipboard.writeText(colors.join("\n"));
            toast.success(`${title} copied`);
          }}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy all
        </Button>
      </div>
      <div className={cn("flex w-full overflow-hidden", tall ? "h-36 sm:h-44" : "h-28 sm:h-32")}>
        {colors.map((hex, i) => {
          const text = getTextColor(hex);
          return (
            <Link
              key={`${title}-${hex}-${i}`}
              href={`/color/${hex.slice(1)}`}
              className="group relative min-w-0 flex-1 transition-all duration-300 hover:flex-[1.45] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ backgroundColor: hex, color: text }}
              title={hex}
            >
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-0.5 pb-2 pt-8 text-center opacity-90 sm:opacity-100">
                <span className="block font-mono text-[9px] font-semibold uppercase tracking-wide text-white drop-shadow sm:text-[10px]">
                  {hex.replace("#", "")}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function HarmonyGrid({
  title,
  subtitle,
  colors,
}: {
  title: string;
  subtitle: string;
  colors: string[];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
      <div className="border-b border-border/40 px-4 py-3 sm:px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
          Harmony
        </p>
        <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid grid-cols-2 gap-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {colors.map((hex, i) => {
          const text = getTextColor(hex);
          return (
            <Link
              key={`${title}-${hex}-${i}`}
              href={`/color/${hex.slice(1)}`}
              className="group relative flex min-h-[7.5rem] flex-col justify-end p-3 transition-transform hover:z-10 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-[9rem]"
              style={{ backgroundColor: hex, color: text }}
            >
              <span className="font-mono text-xs font-semibold drop-shadow-sm">{hex.toUpperCase()}</span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-wider opacity-80">
                Stop {i + 1}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function ColorDetailView({
  name,
  hex,
  family,
  sources,
  similar = [],
  sharePath,
}: {
  name: string;
  hex: string;
  family?: string;
  sources?: string[];
  similar?: SimilarColor[];
  sharePath?: string;
}) {
  const a = analyzeColor(hex);
  const fam = (family ?? "blue") as ColorFamily;
  const path = sharePath ?? `/color/${a.hex.slice(1)}`;

  // Full scale: lightest tint → base → darkest shade
  const fullScale = [...[...a.tints].reverse(), a.hex, ...a.shades];

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
    <div className="space-y-6 sm:space-y-8">
      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border border-border/50 shadow-sm sm:rounded-[1.75rem]">
        <div
          className="relative flex min-h-[240px] flex-col justify-end p-5 sm:min-h-[320px] sm:p-8 lg:min-h-[380px]"
          style={{
            background: `linear-gradient(155deg, ${a.hex} 0%, color-mix(in srgb, ${a.hex} 82%, black) 100%)`,
            color: a.textOnColor,
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(255,255,255,0.28),transparent_42%)]" />
          <div className="relative z-[1] flex flex-wrap items-end justify-between gap-4">
            <div>
              {family && (
                <Link
                  href={`/colors/family/${family}`}
                  className="mb-2 inline-flex rounded-full border border-white/25 bg-black/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] backdrop-blur-sm hover:bg-black/25"
                >
                  {FAMILY_LABELS[fam] ?? family}
                </Link>
              )}
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                {name}
              </h1>
              <p className="mt-2 font-mono text-lg opacity-90 sm:text-xl">{a.hex.toUpperCase()}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="rounded-full bg-white/90 text-slate-900 hover:bg-white"
                onClick={async () => {
                  await navigator.clipboard.writeText(a.hex);
                  toast.success("HEX copied");
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy HEX
              </Button>
              <CopyButton
                value={a.cssVar}
                label="CSS var"
                className="rounded-full border-white/30 bg-black/20 text-inherit hover:bg-black/30"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-border/40 sm:grid-cols-3">
          <div className="bg-background/90 px-4 py-3 sm:px-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Accessibility</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge>{a.accessibility.level}</Badge>
              <span className="font-mono text-sm font-semibold">{a.accessibility.ratio}:1</span>
            </div>
          </div>
          <div className="bg-background/90 px-4 py-3 sm:px-5">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Contrast className="h-3 w-3" />
              Vs white / black
            </p>
            <p className="mt-1 font-mono text-sm font-semibold">
              {a.contrastOnWhite}:1 · {a.contrastOnBlack}:1
            </p>
          </div>
          <div className="bg-background/90 px-4 py-3 sm:px-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sources</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {sources && sources.length > 0 ? (
                sources.map((s) => (
                  <Badge key={s} variant="secondary" className="text-[10px]">
                    {s}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Library color</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ShareButtons title={name} path={path} />
        <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border/50 px-2.5 py-1">
            <Sparkles className="h-3 w-3 text-rose-500" />
            Click any stop to open
          </span>
        </div>
      </div>

      {/* Formats */}
      <section className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
        <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-transparent to-transparent px-4 py-3 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
            Codes
          </p>
          <h2 className="font-display text-lg font-semibold tracking-tight">Formats</h2>
        </div>
        <div className="grid gap-2 p-3 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/15 px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="truncate font-mono text-sm">{value}</p>
              </div>
              <CopyButton value={value} size="icon" variant="ghost" label={label} />
            </div>
          ))}
        </div>
      </section>

      <CodeExportPanel colors={[a.hex]} name={name.toLowerCase().replace(/\s+/g, "-")} />

      {/* Full tint–shade scale */}
      <ColorStrip
        title="Tints & shades"
        subtitle="Full scale from light tints through the base color into deep shades"
        colors={fullScale}
        tall
      />

      <ColorStrip
        title="Tints"
        subtitle="Mixed toward white — soft backgrounds and highlights"
        colors={[...a.tints].reverse()}
      />

      <ColorStrip
        title="Shades"
        subtitle="Mixed toward black — depth, text, and emphasis"
        colors={a.shades}
      />

      <ColorStrip
        title="Tones"
        subtitle="Mixed toward neutral grey — muted UI surfaces"
        colors={a.tones}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <HarmonyGrid
          title="Complementary"
          subtitle="Opposite on the color wheel for contrast"
          colors={a.complementary}
        />
        <HarmonyGrid
          title="Analogous"
          subtitle="Neighbors that sit comfortably together"
          colors={a.analogous}
        />
        <HarmonyGrid
          title="Triadic"
          subtitle="Evenly spaced triad for vibrant sets"
          colors={a.triadic}
        />
        <HarmonyGrid
          title="Split complementary"
          subtitle="Base plus two accents beside the complement"
          colors={a.splitComplementary}
        />
      </div>

      <HarmonyGrid
        title="Monochromatic"
        subtitle="Same hue, varied lightness and saturation"
        colors={a.monochromatic}
      />

      {/* Psychology */}
      <section className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 p-5 shadow-sm sm:rounded-3xl sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
          Meaning
        </p>
        <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">Color psychology</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {psychologyForFamily(fam)}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Common uses: primary buttons, chart series, status badges, marketing gradients, and brand accents in the{" "}
          {FAMILY_LABELS[fam] ?? family} family.
        </p>
      </section>

      {/* Similar */}
      {similar.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
          <div className="border-b border-border/40 px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
              Related
            </p>
            <h2 className="font-display text-lg font-semibold tracking-tight sm:text-xl">
              Similar & related colors
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Nearby colors from the library by perceptual distance
            </p>
          </div>
          <div className="grid grid-cols-2 gap-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {similar.map((c) => {
              const text = getTextColor(c.hex);
              return (
                <Link
                  key={c.slug}
                  href={`/colors/${c.slug}`}
                  className="group relative flex min-h-[8.5rem] flex-col justify-end p-3 transition-transform hover:z-10 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-[10rem]"
                  style={{ backgroundColor: c.hex, color: text }}
                >
                  <span className="truncate text-sm font-semibold drop-shadow-sm">{c.name}</span>
                  <span className="mt-0.5 font-mono text-[11px] opacity-90">{c.hex.toUpperCase()}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
