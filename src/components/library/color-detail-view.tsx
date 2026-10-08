"use client";

import Link from "next/link";
import { Copy, Contrast, Pipette, Palette, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  analyzeColor,
  describeDeltaE,
  nearestBootstrap,
  nearestCssName,
  nearestMaterial,
  nearestTailwind,
} from "@/lib/colors/spaces";
import { oklchShadeScale, SHADE_STEPS } from "@/lib/colors/oklch";
import { colorUsageNotes } from "@/lib/colors/usage-notes";
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
    <section className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/40 panel-accent px-4 py-3 sm:px-5">
        <div>
          <p className="kicker">
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
              className="group relative min-w-0 flex-1 transition-all duration-300 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hover:flex-[1.45]"
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
    <section className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card">
      <div className="border-b border-border/40 px-4 py-3 sm:px-5">
        <p className="kicker">
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
              className="group relative flex min-h-[7.5rem] flex-col justify-end p-3 transition-[filter] duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-[9rem]"
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
  const usage = colorUsageNotes(a, name, family);
  const tw = nearestTailwind(a.hex);
  const material = nearestMaterial(a.hex);
  const bootstrap = nearestBootstrap(a.hex);
  const cssName = nearestCssName(a.hex);
  const oklchScale = oklchShadeScale(a.hex);

  // Full scale: lightest tint → base → darkest shade
  const fullScale = [...[...a.tints].reverse(), a.hex, ...a.shades];
  const slug = a.hex.slice(1);
  const jsSnippet = `const color = "${a.hex}";`;
  const tsSnippet = `const color: string = "${a.hex}";`;
  const reactSnippet = `style={{ backgroundColor: "${a.hex}" }}`;
  const jsonSnippet = JSON.stringify({ hex: a.hex, rgb: a.rgb, oklch: a.oklch }, null, 2);

  const rows = [
    ["HEX", a.hex],
    ["RGB", `rgb(${a.rgb.r}, ${a.rgb.g}, ${a.rgb.b})`],
    ["RGBA", a.rgba],
    ["HSL", a.hsl],
    ["HSLA", a.hsla],
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
    ["JavaScript", jsSnippet],
    ["TypeScript", tsSnippet],
    ["React", reactSnippet],
    ["JSON", jsonSnippet],
  ] as const;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero */}
      <div
        className="overflow-hidden rounded-[var(--radius-lg)] border border-border"
        style={{ boxShadow: `0 24px 64px -36px ${a.hex}` }}
      >
        <div
          className="relative flex min-h-[240px] flex-col justify-end p-5 sm:min-h-[320px] sm:p-8 lg:min-h-[380px]"
          style={{
            backgroundColor: a.hex,
            color: a.textOnColor,
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 88% 12%, color-mix(in srgb, ${a.hex} 35%, white), transparent 42%)`,
            }}
          />
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
                variant="secondary"
                className="min-h-11 rounded-full bg-white/90 text-slate-900 hover:bg-white"
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
                className="min-h-11 rounded-full border-white/30 bg-black/20 text-inherit hover:bg-black/30"
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
        <nav aria-label="Try this color in tools" className="flex flex-wrap gap-2">
          <Link
            href="/color-picker"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-background px-3.5 text-sm font-medium transition-colors hover:border-primary/40"
          >
            <Pipette className="h-4 w-4 text-primary" />
            Open in picker
          </Link>
          <Link
            href={`/tools/shades-tints-tones?hex=${slug}`}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-background px-3.5 text-sm font-medium transition-colors hover:border-primary/40"
          >
            Shades & tints
          </Link>
          <Link
            href={`/tools/harmony-studio?hex=${slug}`}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-background px-3.5 text-sm font-medium transition-colors hover:border-primary/40"
          >
            Harmony
          </Link>
          <Link
            href={`/color-atlas?hex=${slug}`}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-background px-3.5 text-sm font-medium transition-colors hover:border-primary/40"
          >
            Compare tokens
          </Link>
          <Link
            href="/contrast-checker"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-background px-3.5 text-sm font-medium transition-colors hover:border-primary/40"
          >
            <Contrast className="h-4 w-4 text-primary" />
            Check contrast
          </Link>
          <Link
            href="/palette-generator"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-background px-3.5 text-sm font-medium transition-colors hover:border-primary/40"
          >
            <Palette className="h-4 w-4 text-primary" />
            Build palette
          </Link>
          <Link
            href="/ai-color-copilot"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-background px-3.5 text-sm font-medium transition-colors hover:border-primary/40"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            Copilot
          </Link>
        </nav>
      </div>

      {/* Formats */}
      <section className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card">
        <div className="border-b border-border/40 panel-accent px-4 py-3 sm:px-5">
          <p className="kicker">
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

      <section className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card">
        <div className="border-b border-border/40 px-4 py-3 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Design systems</p>
          <h2 className="font-display text-lg font-semibold tracking-tight">Nearest official tokens</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            An arbitrary HEX is not an official Tailwind, Material, or Bootstrap color. Distance is CIEDE2000.
          </p>
        </div>
        <div className="grid gap-2 p-3 sm:grid-cols-2 sm:p-5">
          {[tw, cssName, material, bootstrap].map((match) => (
            <div key={match.label} className="rounded-xl border border-border/50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{match.label}</p>
              <p className="mt-1 font-mono text-sm font-medium">{match.token}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {match.exact ? "Exact match" : `${describeDeltaE(match.deltaE)} · ΔE ${match.deltaE}`}
                {" · "}
                {match.hex.toUpperCase()}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <CopyButton value={match.token} label="Copy token" />
                {match.label.includes("Tailwind") && (
                  <>
                    <CopyButton value={`bg-${match.token}`} label="Copy as Tailwind" />
                    <CopyButton value={`text-${match.token}`} label="text-" />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card">
        <div className="border-b border-border/40 px-4 py-3 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">OKLCH</p>
          <h2 className="font-display text-lg font-semibold tracking-tight">Perceptual 50–950 scale</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Generated in OKLCH from this hex. Not an official Tailwind scale unless the hex itself is a Tailwind token.
          </p>
        </div>
        <div className="flex overflow-hidden">
          {SHADE_STEPS.map((step) => {
            const value = oklchScale[step];
            const text = getTextColor(value);
            return (
              <Link
                key={step}
                href={`/color/${value.slice(1)}`}
                className="min-w-0 flex-1 px-0.5 py-8 text-center"
                style={{ backgroundColor: value, color: text }}
              >
                <span className="block text-[10px] font-semibold">{step}</span>
                <span className="hidden font-mono text-[9px] sm:block">{value.replace("#", "")}</span>
              </Link>
            );
          })}
        </div>
      </section>


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

      {/* Usage — unique to this hex */}
      <section className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card p-5 sm:p-6">
        <p className="kicker">
          Using this color
        </p>
        <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">Where {a.hex} works</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {usage.summary}
        </p>
        <p className="mt-4 text-sm font-medium text-foreground">Sensible jobs for this swatch</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground sm:text-base">
          {usage.uses.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {usage.watchouts.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Family context: {psychologyForFamily(fam)} Common uses still include buttons, charts, and
          accents in the {FAMILY_LABELS[fam] ?? family} range — always verify the pair for this exact
          hex in the{" "}
          <Link href="/contrast-checker" className="text-primary underline-offset-4 hover:underline">
            contrast checker
          </Link>
          .
        </p>
      </section>

      {/* Similar */}
      {similar.length > 0 && (
        <section className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card">
          <div className="border-b border-border/40 px-4 py-3 sm:px-5">
            <p className="kicker">
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
