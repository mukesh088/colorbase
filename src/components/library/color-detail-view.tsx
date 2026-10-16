"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
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
import { CopyButton } from "@/components/color/copy-button";
import { ShareButtons } from "@/components/library/share-buttons";
import { CodeExportPanel } from "@/components/library/code-export-panel";
import { cn } from "@/lib/utils";
import { colorToolLinks } from "@/lib/colors/tool-links";
import { readableInk } from "@/lib/theme-builder";
import { ColorPageOverview, ColorPagePreview } from "./color-page-workspace";
import "./color-detail.css";

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
  // Keep long scales within Palette Studio's 10-color limit, including endpoints.
  const editableColors =
    colors.length > 10
      ? Array.from({ length: 9 }, (_, i) => colors[Math.round((i * (colors.length - 1)) / 8)])
      : colors;
  return (
    <section className="border-border bg-card overflow-hidden rounded-[var(--radius-lg)] border">
      <div className="border-border/40 panel-accent flex flex-wrap items-end justify-between gap-3 border-b px-4 py-3 sm:px-5">
        <div>
          <p className="kicker">Palette</p>
          <h3 className="font-display text-lg font-semibold tracking-tight sm:text-xl">{title}</h3>
          {subtitle && <p className="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>}
        </div>
        <div className="cd-palette-actions">
          <CopyButton value={colors.join("\n")} label={`${title} colors`} />
          <Link href={colorToolLinks(editableColors[0], editableColors).palette}>
            Edit {editableColors.length}-color palette <ArrowRight size={13} />
          </Link>
        </div>
      </div>
      <div className={cn("cd-scale-swatches", tall ? "h-36 sm:h-44" : "h-28 sm:h-32")}>
        {colors.map((hex, i) => {
          const text = readableInk(hex);
          return (
            <Link
              key={`${title}-${hex}-${i}`}
              href={`/color/${hex.slice(1)}`}
              className="group focus-visible:ring-ring relative min-w-0 flex-1 transition-all duration-300 focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none sm:hover:flex-[1.45]"
              style={{ backgroundColor: hex, color: text }}
              title={hex}
            >
              <span className="absolute inset-x-0 bottom-0 px-1 pt-8 pb-3 text-center">
                <span className="block font-mono text-[10px] font-medium tracking-wide uppercase">
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
    <section className="border-border bg-card overflow-hidden rounded-[var(--radius-lg)] border">
      <div className="border-border/40 border-b px-4 py-3 sm:px-5">
        <p className="kicker">Harmony</p>
        <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
        <p className="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>
      </div>
      <div className="cd-palette-actions border-border border-b p-3">
        <CopyButton value={colors.join("\n")} label={`${title} colors`} />
        <Link href={colorToolLinks(colors[0], colors).palette}>
          Edit palette <ArrowRight size={13} />
        </Link>
      </div>
      <div
        className="grid gap-0"
        style={{ gridTemplateColumns: `repeat(${Math.min(colors.length, 3)},minmax(0,1fr))` }}
      >
        {colors.map((hex, i) => {
          const text = readableInk(hex);
          return (
            <Link
              key={`${title}-${hex}-${i}`}
              href={`/color/${hex.slice(1)}`}
              className="group focus-visible:ring-ring relative flex min-h-[7.5rem] flex-col justify-end p-3 transition-[filter] duration-200 hover:brightness-105 focus-visible:ring-2 focus-visible:outline-none sm:min-h-[9rem]"
              style={{ backgroundColor: hex, color: text }}
            >
              <span className="font-mono text-xs font-semibold drop-shadow-sm">
                {hex.toUpperCase()}
              </span>
              <span className="mt-1 text-[10px] font-medium tracking-wider uppercase opacity-80">
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
  headingLevel = 1,
}: {
  name: string;
  hex: string;
  family?: string;
  sources?: string[];
  similar?: SimilarColor[];
  sharePath?: string;
  headingLevel?: 1 | 2;
}) {
  const a = useMemo(() => analyzeColor(hex), [hex]);
  const [allFormats, setAllFormats] = useState(false);
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
    <div className="color-detail">
      <ColorPageOverview
        key={a.hex}
        name={name}
        hex={a.hex}
        hsl={a.hsl}
        family={family}
        sources={sources}
        headingLevel={headingLevel}
      />
      <ColorPagePreview key={`preview-${a.hex}`} hex={a.hex} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          A color worth keeping? Save it above or share it.
        </p>
        <ShareButtons title={name} path={path} />
      </div>

      {/* Formats */}
      <section
        id="color-codes"
        className="border-border bg-card overflow-hidden rounded-[var(--radius-lg)] border"
      >
        <div className="cd-formats-heading border-border/40 border-b px-4 py-3 sm:px-5">
          <div>
            <p className="kicker">COPY. PASTE. CREATE.</p>
            <h2 className="font-display text-lg font-semibold tracking-tight">Color codes</h2>
          </div>
          <CopyButton
            value={rows.map(([label, value]) => `${label}: ${value}`).join("\n")}
            label="all color codes"
          />
        </div>
        <div className="grid gap-2 p-3 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
          {(allFormats
            ? rows
            : rows.filter(([label]) =>
                ["HEX", "RGB", "HSL", "OKLCH", "CMYK", "CSS variable"].includes(label)
              )
          ).map(([label, value]) => (
            <div
              key={label}
              className="border-border/50 bg-muted/15 flex items-center gap-2 rounded-xl border px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                  {label}
                </p>
                <p className="cd-format-value">{value}</p>
              </div>
              <CopyButton value={value} size="icon" variant="ghost" label={label} />
            </div>
          ))}
        </div>
        <p className="cd-format-note">
          CMYK is an approximate reference; print output depends on the color profile. HSV and CMYK
          are not CSS color functions.
        </p>
        <button
          type="button"
          className="cd-format-toggle"
          aria-expanded={allFormats}
          onClick={() => setAllFormats(!allFormats)}
        >
          {allFormats ? "Show essential codes" : `Show all ${rows.length} formats & snippets`}
        </button>
      </section>

      <section
        id="color-scales"
        className="border-border bg-card overflow-hidden rounded-[var(--radius-lg)] border"
      >
        <div className="border-border/40 border-b px-4 py-3 sm:px-5">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
            OKLCH
          </p>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Perceptual 50–950 scale
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Generated in OKLCH from this hex. Not an official Tailwind scale unless the hex itself
            is a Tailwind token.
          </p>
        </div>
        <div className="cd-scale-swatches">
          {SHADE_STEPS.map((step) => {
            const value = oklchScale[step];
            const text = readableInk(value);
            return (
              <Link
                key={step}
                href={`/color/${value.slice(1)}`}
                className="min-w-0 flex-1 px-0.5 py-8 text-center"
                style={{ backgroundColor: value, color: text }}
              >
                <span className="block text-[10px] font-semibold">{step}</span>
                <span className="hidden font-mono text-[9px] sm:block">
                  {value.replace("#", "")}
                </span>
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

      <div id="color-harmonies" className="grid gap-6 lg:grid-cols-2">
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

      <div id="color-export">
        <CodeExportPanel colors={[a.hex]} name={`color${a.hex.slice(1)}`} />
      </div>

      <section
        id="color-tokens"
        className="border-border bg-card overflow-hidden rounded-[var(--radius-lg)] border"
      >
        <div className="border-border/40 border-b px-4 py-3 sm:px-5">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
            Design systems
          </p>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Nearest official tokens
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">
            An arbitrary HEX is not an official Tailwind, Material, or Bootstrap color. Distance is
            CIEDE2000.
          </p>
        </div>
        <div className="grid gap-2 p-3 sm:grid-cols-2 sm:p-5">
          {[tw, cssName, material, bootstrap].map((match) => (
            <div key={match.label} className="border-border/50 rounded-xl border p-3">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                {match.label}
              </p>
              <p className="mt-1 font-mono text-sm font-medium">{match.token}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {match.exact
                  ? "Exact match"
                  : `${describeDeltaE(match.deltaE)} · ΔE ${match.deltaE}`}
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

      {/* Usage — unique to this hex */}
      <section
        id="color-usage"
        className="border-border bg-card overflow-hidden rounded-[var(--radius-lg)] border p-5 sm:p-6"
      >
        <p className="kicker">Using this color</p>
        <h2 className="font-display mt-1 text-xl font-semibold tracking-tight">
          Where {a.hex} works
        </h2>
        <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-relaxed sm:text-base">
          {usage.summary}
        </p>
        <p className="text-foreground mt-4 text-sm font-medium">Sensible jobs for this swatch</p>
        <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm sm:text-base">
          {usage.uses.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="text-muted-foreground mt-4 space-y-2 text-sm leading-relaxed sm:text-base">
          {usage.watchouts.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
        <p className="text-muted-foreground mt-4 text-sm">
          Family context: {psychologyForFamily(fam)} Common uses still include buttons, charts, and
          accents in the {FAMILY_LABELS[fam] ?? family} range — always verify the pair for this
          exact hex in the{" "}
          <Link
            href={colorToolLinks(a.hex).contrast}
            className="text-primary underline-offset-4 hover:underline"
          >
            contrast checker
          </Link>
          .
        </p>
      </section>

      {/* Similar */}
      {similar.length > 0 && (
        <section className="border-border bg-card overflow-hidden rounded-[var(--radius-lg)] border">
          <div className="border-border/40 border-b px-4 py-3 sm:px-5">
            <p className="kicker">Related</p>
            <h2 className="font-display text-lg font-semibold tracking-tight sm:text-xl">
              Similar & related colors
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Nearby colors from the library by perceptual distance
            </p>
          </div>
          <div className="grid grid-cols-2 gap-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {similar.map((c) => {
              const text = readableInk(c.hex);
              return (
                <Link
                  key={c.slug}
                  href={`/colors/${c.slug}`}
                  className="group focus-visible:ring-ring relative flex min-h-[8.5rem] flex-col justify-end p-3 transition-transform hover:z-10 hover:scale-[1.02] focus-visible:ring-2 focus-visible:outline-none sm:min-h-[10rem]"
                  style={{ backgroundColor: c.hex, color: text }}
                >
                  <span className="truncate text-sm font-semibold drop-shadow-sm">{c.name}</span>
                  <span className="mt-0.5 font-mono text-[11px] opacity-90">
                    {c.hex.toUpperCase()}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
