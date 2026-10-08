"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import { ColorActions } from "@/components/color-codes/color-actions";
import { ColorSpaceNotes } from "@/components/color-codes/color-space-notes";
import { CodeExportPanel } from "@/components/library/code-export-panel";
import { parseFlexibleColor } from "@/lib/colors/parse";
import { analyzeColor } from "@/lib/colors/spaces";
import { perceptualShades, perceptualTints, perceptualTones } from "@/lib/colors/oklch";
import { getTextColor, randomHex } from "@/lib/colors/convert";
import { exportPalette } from "@/lib/colors/export";
import { ToolWorkspace } from "@/components/layout/tool-workspace";

function SwatchRow({ title, colors }: { title: string; colors: string[] }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-card">
      <div className="border-b border-border/60 px-4 py-3">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </div>
      <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
        {colors.map((hex) => {
          const a = analyzeColor(hex);
          return (
            <article key={`${title}-${hex}`} className="overflow-hidden rounded-xl border border-border/60">
              <Link href={`/color/${hex.slice(1)}`} className="block h-16" style={{ backgroundColor: hex, color: getTextColor(hex) }} />
              <div className="space-y-1 p-3 font-mono text-[11px]">
                <p>{a.hex.toUpperCase()}</p>
                <p>{`rgb(${a.rgb.r}, ${a.rgb.g}, ${a.rgb.b})`}</p>
                <p>{a.hsl}</p>
                <p className="truncate">{a.oklch}</p>
                <ColorActions hex={hex} compact />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function ShadesTintsTonesTool() {
  const params = useSearchParams();
  const start = parseFlexibleColor(params.get("hex") ?? "") ?? "#3b82f6";
  const [input, setInput] = useState(start);
  const [count, setCount] = useState(8);
  const hex = parseFlexibleColor(input) ?? start;
  const a = analyzeColor(hex);
  const tints = useMemo(() => perceptualTints(hex, count), [hex, count]);
  const shades = useMemo(() => perceptualShades(hex, count), [hex, count]);
  const tones = useMemo(() => perceptualTones(hex, count), [hex, count]);
  const all = [hex, ...tints, ...shades, ...tones];

  return (
    <div className="space-y-6">
      <ToolWorkspace
        toolbar={<span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Workspace</span>}
        controls={
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Base color</label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="#3B82F6 or rgb() or oklch()" />
              <input
                type="color"
                value={hex}
                onChange={(e) => setInput(e.target.value)}
                className="h-11 w-16 cursor-pointer rounded-[var(--radius-md)] border border-border"
                aria-label="Pick color"
              />
              <Button type="button" variant="outline" onClick={() => setInput(randomHex())}>
                Random
              </Button>
            </div>
            <p className="mt-3 font-mono text-sm">
              {a.hex.toUpperCase()} · {a.hsl} · {a.oklch}
            </p>
            <label className="mt-4 block text-xs font-medium">Stops: {count}</label>
            <Slider min={3} max={12} step={1} value={[count]} onValueChange={(v) => setCount(v[0] ?? 8)} className="mt-2" />
          </div>
        }
        preview={
          <div
            className="flex min-h-[10rem] items-end rounded-[var(--radius-md)] p-4"
            style={{
              backgroundColor: hex,
              color: getTextColor(hex),
              boxShadow: `0 0 48px -18px ${hex}`,
            }}
          >
            <div>
              <p className="font-display text-2xl font-semibold">{a.hex.toUpperCase()}</p>
              <p className="mt-1 font-mono text-xs opacity-80">{`rgb(${a.rgb.r}, ${a.rgb.g}, ${a.rgb.b})`}</p>
            </div>
          </div>
        }
      />
      <SwatchRow title="Tints (toward white, OKLCH)" colors={tints} />
      <SwatchRow title="Tones (toward gray, OKLCH)" colors={tones} />
      <SwatchRow title="Shades (toward black, OKLCH)" colors={shades} />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => exportPalette(all.map((h, i) => ({ hex: h, name: `stop-${i + 1}` })), "css", "shades")}>
          Export CSS
        </Button>
        <Button type="button" variant="outline" onClick={() => exportPalette(all.map((h, i) => ({ hex: h, name: `stop-${i + 1}` })), "json", "shades")}>
          Export JSON
        </Button>
        <Button type="button" variant="outline" onClick={() => exportPalette(all.map((h, i) => ({ hex: h, name: `stop-${i + 1}` })), "scss", "shades")}>
          Export SCSS
        </Button>
        <Button type="button" variant="outline" onClick={() => exportPalette(all.map((h, i) => ({ hex: h, name: `stop-${i + 1}` })), "tailwind", "shades")}>
          Export Tailwind
        </Button>
        <CopyButton value={all.join(", ")} label="Copy all HEX" />
      </div>
      <CodeExportPanel colors={all} name="shades" />
      <ColorSpaceNotes ids={["hex", "oklch", "hsl"]} />
    </div>
  );
}
