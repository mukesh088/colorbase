"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { hexToRgb, rgbToHsl, getTextColor } from "@/lib/colors/convert";
import { CSS_NAMED_COLORS } from "@/lib/colors/palettes";
import { cn } from "@/lib/utils";

const MIN_TOLERANCE = 5;
const SKIP = new Set(["aqua", "fuchsia"]);
const ALIAS: Record<string, string> = {
  magenta: "fuchsia",
  cyan: "aqua",
  gray: "grey",
  darkgray: "darkgrey",
  darkslategray: "darkslategrey",
  dimgray: "dimgrey",
  lightgray: "lightgrey",
  lightslategray: "lightslategrey",
  slategray: "slategrey",
};

type SortedColor = {
  name: string;
  hex: string;
  h: number;
  s: number;
  l: number;
  rgb: string;
  hsl: string;
  alternative?: string;
};

function hueDistance(a: number, b: number) {
  const delta = Math.abs(a - b) % 360;
  return Math.min(delta, 360 - delta);
}

function prepareColors(): SortedColor[] {
  const namesByHex = new Map<string, string[]>();
  for (const color of CSS_NAMED_COLORS) {
    const hex = color.hex.toLowerCase();
    const names = namesByHex.get(hex) ?? [];
    names.push(color.name);
    namesByHex.set(hex, names);
  }

  return CSS_NAMED_COLORS.flatMap((color) => {
    const key = color.name.toLowerCase();
    if (SKIP.has(key)) return [];
    const rgb = hexToRgb(color.hex);
    const hsl = rgbToHsl(rgb);
    const sibling = (namesByHex.get(color.hex.toLowerCase()) ?? []).find(
      (name) => name.toLowerCase() !== key
    );
    return [
      {
        name: color.name,
        hex: color.hex.toUpperCase(),
        h: hsl.h,
        s: hsl.s,
        l: hsl.l,
        rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        alternative: sibling?.toLowerCase() ?? ALIAS[key],
      },
    ];
  });
}

const SORTED_COLORS = prepareColors();

function filterByHue(list: SortedColor[], hue: number, tolerance: number): { list: SortedColor[]; tolerance: number } {
  const matches = list.filter((color) => hueDistance(hue, color.h) < tolerance);
  if (matches.length > 0 || tolerance >= 180) return { list: matches, tolerance };
  return filterByHue(list, hue, tolerance + 1);
}

function groupByLightness(list: SortedColor[], tolerance: number) {
  const buckets = Math.floor(100 / tolerance) + 1;
  const groups: SortedColor[][] = [];
  for (let band = 0; band < buckets; band += 1) {
    const limit = tolerance / 2;
    const group = list.filter((color) => {
      const difference = 100 - color.l - band * tolerance;
      if (Math.abs(difference) === limit) return difference > 0;
      return Math.abs(difference) < limit;
    });
    if (group.length > 0) groups.push(group);
  }
  return groups;
}

export function SortedCssColors({
  query,
  onPick,
}: {
  query: string;
  onPick: (hex: string, name: string) => void;
}) {
  const [hue, setHue] = useState(210);
  const [mono, setMono] = useState(false);
  const [prevHue, setPrevHue] = useState(210);
  const [active, setActive] = useState<SortedColor | null>(null);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return SORTED_COLORS.filter(
      (color) =>
        !text ||
        color.name.toLowerCase().includes(text) ||
        color.hex.toLowerCase().includes(text) ||
        color.alternative?.includes(text)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const base = filtered
      .filter((color) => (mono ? color.s === 0 : color.s > 0))
      .sort((a, b) => a.s - b.s);
    if (mono) return { rows: groupByLightness(base, MIN_TOLERANCE), tolerance: 0 };
    const byHue = filterByHue(base, hue, MIN_TOLERANCE);
    return { rows: groupByLightness(byHue.list, MIN_TOLERANCE), tolerance: byHue.tolerance };
  }, [filtered, hue, mono]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    window.addEventListener("keyup", onKey);
    return () => window.removeEventListener("keyup", onKey);
  }, []);

  const thumb = mono ? "#737373" : `hsl(${hue} 100% 50%)`;

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-sm)]">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Sorted CSS colors</p>
          <p className="text-sm text-muted-foreground">Lightness down the chart, saturation across each row.</p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={mono}
            aria-label="Toggle monochrome colors"
            className="h-4 w-4 accent-primary"
            onChange={(event) => {
              const next = event.target.checked;
              setActive(null);
              if (next) {
                setPrevHue(hue);
                setHue(0);
              } else {
                setHue(prevHue || 210);
              }
              setMono(next);
            }}
          />
          Monochrome
        </label>
      </div>

      <div className="space-y-3 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="sorted-hue" className="min-w-24 text-sm font-medium">
            Hue: <span className="font-mono">{mono ? 0 : hue}</span>
          </label>
          <input
            id="sorted-hue"
            type="range"
            min={0}
            max={360}
            value={mono ? 0 : hue}
            disabled={mono}
            aria-label="Hue"
            className="sorted-hue-slider min-w-40 flex-1 disabled:opacity-70"
            style={{
              ["--thumb" as string]: thumb,
              background: mono
                ? "linear-gradient(to right, #111, #fff)"
                : "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
            }}
            onChange={(event) => {
              setActive(null);
              setHue(Number(event.target.value));
            }}
          />
        </div>
        <p className={cn("text-xs text-muted-foreground", mono && "invisible")}>
          Hue tolerance: <span className="font-mono text-foreground">{grouped.tolerance || MIN_TOLERANCE}</span>
        </p>

        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
          <p className="flex items-center text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground [writing-mode:vertical-rl] rotate-180">
            Lightness
          </p>
          <div>
            <div className="relative aspect-square overflow-hidden rounded-xl border border-border/70 bg-muted/30">
              {grouped.rows.length === 0 ? (
                <p className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                  No named colors in this hue. Widen the search or move the slider.
                </p>
              ) : (
                <div className="flex h-full flex-col">
                  {grouped.rows.map((row) => (
                    <div key={row.map((color) => color.name).join("-")} className="flex min-h-0 flex-1">
                      {row.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          className="min-w-0 flex-1 truncate px-1 text-[10px] font-semibold uppercase tracking-wide transition-transform hover:z-10 hover:scale-105"
                          style={{ backgroundColor: color.hex, color: getTextColor(color.hex) }}
                          onClick={() => {
                            setActive(color);
                            onPick(color.hex, color.name);
                          }}
                        >
                          {color.name}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {active && (
                <div
                  className="absolute inset-0 flex flex-col justify-between p-5 sm:p-8"
                  style={{ backgroundColor: active.hex, color: getTextColor(active.hex) }}
                >
                  <div>
                    <p className="font-display text-3xl font-semibold capitalize tracking-tight sm:text-5xl">
                      {active.name}
                    </p>
                    {active.alternative && (
                      <p className="mt-2 text-sm opacity-80">
                        or <span className="font-semibold">{active.alternative}</span>
                      </p>
                    )}
                    <div className="mt-6 space-y-1 font-mono text-sm sm:text-base">
                      <p>{active.hex}</p>
                      <p>{active.rgb}</p>
                      <p>{active.hsl}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex w-fit items-center gap-2 rounded-full bg-black/15 px-3 py-1.5 text-sm font-semibold backdrop-blur-sm"
                    onClick={() => setActive(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                </div>
              )}
            </div>
            <p className={cn("mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground", mono && "invisible")}>
              Saturation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
