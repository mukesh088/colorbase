"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import { ColorSpaceNotes } from "@/components/color-codes/color-space-notes";
import { parseFlexibleColor } from "@/lib/colors/parse";
import {
  hexToRgb,
  hslToRgb,
  hsvToRgb,
  randomHex,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
} from "@/lib/colors/convert";
import { hexToOklch, oklchToHex } from "@/lib/colors/oklch";
import { analyzeColor } from "@/lib/colors/spaces";
import { nearestBrand, nearestBootstrap, nearestCssName, nearestMaterial, nearestTailwind } from "@/lib/colors/engine";
import { clamp } from "@/lib/utils";

function nearbyColors(hex: string) {
  const { h, s, l } = rgbToHsl(hexToRgb(hex));
  const out: string[] = [];
  for (const dh of [-18, -8, 8, 18]) out.push(rgbToHex(hslToRgb({ h: (h + dh + 360) % 360, s, l })));
  for (const ds of [-18, 18]) out.push(rgbToHex(hslToRgb({ h, s: clamp(s + ds, 0, 100), l })));
  for (const dl of [-10, 10]) out.push(rgbToHex(hslToRgb({ h, s, l: clamp(l + dl, 5, 95) })));
  return [...new Set(out)];
}

function similarColors(hex: string) {
  const { h, s, l } = rgbToHsl(hexToRgb(hex));
  return [-4, -2, 2, 4].flatMap((d) => [
    rgbToHex(hslToRgb({ h: (h + d + 360) % 360, s, l })),
    rgbToHex(hslToRgb({ h, s: clamp(s + d, 0, 100), l })),
  ]);
}

export function ColorExplorerClient() {
  const params = useSearchParams();
  const start = parseFlexibleColor(params.get("hex") ?? "") ?? "#3b82f6";
  const [hex, setHex] = useState(start);
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  const hsv = rgbToHsv(rgb);
  const oklch = hexToOklch(hex);
  const a = analyzeColor(hex);

  const nearest = useMemo(
    () => ({
      css: nearestCssName(hex),
      tw: nearestTailwind(hex),
      mat: nearestMaterial(hex),
      bs: nearestBootstrap(hex),
      brand: nearestBrand(hex),
    }),
    [hex]
  );

  const setFromRgb = (r: number, g: number, b: number) => setHex(rgbToHex({ r, g, b }));

  return (
    <div className="space-y-8">
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        24-bit RGB provides <strong className="text-foreground">16,777,216</strong> possible colors (256³).
        This explorer generates them dynamically. ColorBase does not create a database row or an indexable
        page for every HEX.
      </p>
      <div
        className="flex min-h-40 items-end rounded-2xl border border-border/70 p-5"
        style={{ backgroundColor: hex, color: a.textOnColor }}
      >
        <p className="font-display text-3xl font-semibold">{a.hex.toUpperCase()}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          HEX
          <Input className="mt-1" value={hex} onChange={(e) => setHex(parseFlexibleColor(e.target.value) ?? hex)} />
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["r", "g", "b"] as const).map((ch) => (
            <label key={ch} className="text-sm">
              RGB {ch.toUpperCase()}
              <Input
                className="mt-1"
                type="number"
                min={0}
                max={255}
                value={rgb[ch]}
                onChange={(e) =>
                  setFromRgb(
                    ch === "r" ? Number(e.target.value) : rgb.r,
                    ch === "g" ? Number(e.target.value) : rgb.g,
                    ch === "b" ? Number(e.target.value) : rgb.b
                  )
                }
              />
            </label>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["h", "s", "l"] as const).map((ch) => (
            <label key={ch} className="text-sm">
              HSL {ch.toUpperCase()}
              <Input
                className="mt-1"
                type="number"
                min={0}
                max={ch === "h" ? 359 : 100}
                value={hsl[ch]}
                onChange={(e) =>
                  setHex(
                    rgbToHex(
                      hslToRgb({
                        h: ch === "h" ? Number(e.target.value) : hsl.h,
                        s: ch === "s" ? Number(e.target.value) : hsl.s,
                        l: ch === "l" ? Number(e.target.value) : hsl.l,
                      })
                    )
                  )
                }
              />
            </label>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["h", "s", "v"] as const).map((ch) => (
            <label key={ch} className="text-sm">
              HSV {ch.toUpperCase()}
              <Input
                className="mt-1"
                type="number"
                min={0}
                max={ch === "h" ? 359 : 100}
                value={hsv[ch]}
                onChange={(e) =>
                  setHex(
                    rgbToHex(
                      hsvToRgb({
                        h: ch === "h" ? Number(e.target.value) : hsv.h,
                        s: ch === "s" ? Number(e.target.value) : hsv.s,
                        v: ch === "v" ? Number(e.target.value) : hsv.v,
                      })
                    )
                  )
                }
              />
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-3 rounded-2xl border border-border/70 p-4">
        <label className="text-xs">Hue {hsl.h}°</label>
        <Slider min={0} max={359} value={[hsl.h]} onValueChange={(v) => setHex(rgbToHex(hslToRgb({ h: v[0] ?? 0, s: hsl.s, l: hsl.l })))} />
        <label className="text-xs">Saturation {hsl.s}%</label>
        <Slider min={0} max={100} value={[hsl.s]} onValueChange={(v) => setHex(rgbToHex(hslToRgb({ h: hsl.h, s: v[0] ?? 0, l: hsl.l })))} />
        <label className="text-xs">Lightness {hsl.l}%</label>
        <Slider min={0} max={100} value={[hsl.l]} onValueChange={(v) => setHex(rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: v[0] ?? 50 })))} />
        <label className="text-xs">OKLCH chroma {oklch.c.toFixed(3)}</label>
        <Slider min={0} max={0.4} step={0.005} value={[oklch.c]} onValueChange={(v) => setHex(oklchToHex({ ...oklch, c: v[0] ?? 0 }))} />
        <Button type="button" variant="outline" onClick={() => setHex(randomHex())}>
          Random color
        </Button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["HEX", a.hex],
          ["RGB", `rgb(${a.rgb.r}, ${a.rgb.g}, ${a.rgb.b})`],
          ["HSL", a.hsl],
          ["HSV", `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`],
          ["LAB", a.lab],
          ["LCH", a.lch],
          ["OKLAB", a.oklab],
          ["OKLCH", a.oklch],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-2 rounded-xl border border-border/70 px-3 py-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="truncate font-mono text-xs">{value}</p>
            </div>
            <CopyButton value={String(value)} size="icon" label={label} />
          </div>
        ))}
      </div>
      <section>
        <h2 className="font-display text-lg font-semibold">Nearest official tokens</h2>
        <p className="text-sm text-muted-foreground">Exact HEX matches are official. Otherwise these are nearest CIEDE2000 matches.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[nearest.css, nearest.tw, nearest.mat, nearest.bs, nearest.brand].filter(Boolean).map((m) =>
            m ? (
              <div key={m.label} className="rounded-xl border border-border/70 p-3 text-sm">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="font-mono">{m.token}</p>
                <p className="text-xs">
                  {m.exact ? "Official / exact" : `Nearest · ΔE ${m.deltaE}`}
                </p>
              </div>
            ) : null
          )}
        </div>
      </section>
      <section>
        <h2 className="font-display text-lg font-semibold">Nearby hues</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {nearbyColors(hex).map((c) => (
            <Link key={c} href={`/explore-colors?hex=${c.slice(1)}`} onClick={() => setHex(c)} className="h-10 w-10 rounded-lg border" style={{ backgroundColor: c }} aria-label={c} />
          ))}
        </div>
      </section>
      <section>
        <h2 className="font-display text-lg font-semibold">Similar colors</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {similarColors(hex).map((c) => (
            <button key={c} type="button" onClick={() => setHex(c)} className="h-10 w-10 rounded-lg border" style={{ backgroundColor: c }} aria-label={c} />
          ))}
        </div>
      </section>
      <ColorSpaceNotes ids={["hex", "rgb", "hsl", "hsv", "oklch", "lab"]} />
    </div>
  );
}
