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
import {
  generateHarmony,
  generateHarmonyByOffsets,
  getTextColor,
  hexToRgb,
  hslToRgb,
  rgbToHex,
  rgbToHsl,
} from "@/lib/colors/convert";
import { hexToOklch, withOklch } from "@/lib/colors/oklch";
import { HARMONY_PRESETS } from "@/lib/colors/engine";
import { exportPalette } from "@/lib/colors/export";
import { downloadText } from "@/lib/utils";
import { cn } from "@/lib/utils";

function downloadPng(colors: string[]) {
  const canvas = document.createElement("canvas");
  canvas.width = colors.length * 80;
  canvas.height = 120;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  colors.forEach((hex, i) => {
    ctx.fillStyle = hex;
    ctx.fillRect(i * 80, 0, 80, 120);
  });
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "harmony.png";
  a.click();
}

function downloadSvg(colors: string[]) {
  const w = colors.length * 80;
  const rects = colors.map((hex, i) => `<rect x="${i * 80}" y="0" width="80" height="120" fill="${hex}" />`).join("");
  downloadText(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="120">${rects}</svg>`, "harmony.svg", "image/svg+xml");
}

export function HarmonyStudioTool() {
  const params = useSearchParams();
  const start = parseFlexibleColor(params.get("hex") ?? "") ?? "#e11d48";
  const [hex, setHex] = useState(start);
  const [preset, setPreset] = useState<(typeof HARMONY_PRESETS)[number]["id"] | "custom">("complementary");
  const [custom, setCustom] = useState("0, 180");
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  const oklch = hexToOklch(hex);

  const colors = useMemo(() => {
    if (preset === "custom") {
      const offsets = custom
        .split(/[,\s]+/)
        .map(Number)
        .filter((n) => Number.isFinite(n));
      return generateHarmonyByOffsets(hex, offsets.length ? offsets : [0]);
    }
    if (preset === "monochromatic") return generateHarmony(hex, "monochromatic");
    return generateHarmony(hex, preset);
  }, [custom, hex, preset]);

  const share = typeof window !== "undefined" ? `${window.location.origin}/tools/harmony-studio?hex=${hex.slice(1)}` : "";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="space-y-4 rounded-2xl border border-border/70 p-4">
          <svg viewBox="0 0 200 200" className="w-full" role="img" aria-label="Color wheel">
            <defs>
              <linearGradient id="cb-hue" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(0 100% 50%)" />
                <stop offset="16%" stopColor="hsl(60 100% 50%)" />
                <stop offset="33%" stopColor="hsl(120 100% 50%)" />
                <stop offset="50%" stopColor="hsl(180 100% 50%)" />
                <stop offset="66%" stopColor="hsl(240 100% 50%)" />
                <stop offset="83%" stopColor="hsl(300 100% 50%)" />
                <stop offset="100%" stopColor="hsl(360 100% 50%)" />
              </linearGradient>
            </defs>
            {Array.from({ length: 36 }, (_, i) => {
              const startA = (i / 36) * Math.PI * 2 - Math.PI / 2;
              const endA = ((i + 1) / 36) * Math.PI * 2 - Math.PI / 2;
              const r0 = 58;
              const r1 = 92;
              const x1 = 100 + r0 * Math.cos(startA);
              const y1 = 100 + r0 * Math.sin(startA);
              const x2 = 100 + r1 * Math.cos(startA);
              const y2 = 100 + r1 * Math.sin(startA);
              const x3 = 100 + r1 * Math.cos(endA);
              const y3 = 100 + r1 * Math.sin(endA);
              const x4 = 100 + r0 * Math.cos(endA);
              const y4 = 100 + r0 * Math.sin(endA);
              return (
                <path
                  key={i}
                  d={`M${x1} ${y1} L${x2} ${y2} A${r1} ${r1} 0 0 1 ${x3} ${y3} L${x4} ${y4} A${r0} ${r0} 0 0 0 ${x1} ${y1}`}
                  fill={`hsl(${(i / 36) * 360} 100% 50%)`}
                  className="cursor-pointer"
                  onClick={() => setHex(rgbToHex(hslToRgb({ h: Math.round((i / 36) * 360), s: hsl.s, l: hsl.l })))}
                />
              );
            })}
            <circle cx="100" cy="100" r="46" fill={hex} stroke="white" strokeWidth="3" />
          </svg>
          <label className="text-xs">Hue {hsl.h}°</label>
          <Slider min={0} max={359} value={[hsl.h]} onValueChange={(v) => setHex(rgbToHex(hslToRgb({ h: v[0] ?? 0, s: hsl.s, l: hsl.l })))} />
          <label className="text-xs">Saturation {hsl.s}%</label>
          <Slider min={0} max={100} value={[hsl.s]} onValueChange={(v) => setHex(rgbToHex(hslToRgb({ h: hsl.h, s: v[0] ?? 0, l: hsl.l })))} />
          <label className="text-xs">Lightness {hsl.l}%</label>
          <Slider min={5} max={95} value={[hsl.l]} onValueChange={(v) => setHex(rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: v[0] ?? 50 })))} />
          <label className="text-xs">OKLCH chroma {oklch.c.toFixed(3)}</label>
          <Slider
            min={0}
            max={0.4}
            step={0.005}
            value={[oklch.c]}
            onValueChange={(v) => setHex(withOklch(hex, { c: v[0] ?? 0 }))}
          />
        </div>
        <div className="space-y-4">
          <Input value={hex} onChange={(e) => setHex(parseFlexibleColor(e.target.value) ?? hex)} aria-label="Harmony base HEX" />
          <div className="flex flex-wrap gap-1.5">
            {HARMONY_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium",
                  preset === p.id ? "border-rose-500 bg-rose-500/10" : "border-border text-muted-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPreset("custom")}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium",
                preset === "custom" ? "border-rose-500 bg-rose-500/10" : "border-border text-muted-foreground"
              )}
            >
              Custom hue angles
            </button>
          </div>
          {preset === "custom" && (
            <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="0, 150, 210" aria-label="Custom hue offsets" />
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {colors.map((c) => (
              <div key={c} className="overflow-hidden rounded-xl border border-border/70">
                <Link href={`/color/${c.slice(1)}`} className="block h-20" style={{ backgroundColor: c, color: getTextColor(c) }} />
                <div className="p-2">
                  <p className="font-mono text-[11px]">{c.toUpperCase()}</p>
                  <ColorActions hex={c} compact />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <CopyButton value={colors.join(", ")} label="Copy HEX" />
        <Button type="button" variant="outline" onClick={() => exportPalette(colors.map((h, i) => ({ hex: h, name: `h${i + 1}` })), "css", "harmony")}>
          CSS
        </Button>
        <Button type="button" variant="outline" onClick={() => exportPalette(colors.map((h, i) => ({ hex: h, name: `h${i + 1}` })), "json", "harmony")}>
          JSON
        </Button>
        <Button type="button" variant="outline" onClick={() => exportPalette(colors.map((h, i) => ({ hex: h, name: `h${i + 1}` })), "tailwind", "harmony")}>
          Tailwind
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            downloadText(
              JSON.stringify(
                {
                  color: Object.fromEntries(colors.map((h, i) => [`harmony-${i + 1}`, { $type: "color", $value: h }])),
                },
                null,
                2
              ),
              "harmony.tokens.json",
              "application/json"
            )
          }
        >
          Design tokens
        </Button>
        <Button type="button" variant="outline" onClick={() => downloadSvg(colors)}>
          SVG
        </Button>
        <Button type="button" variant="outline" onClick={() => downloadPng(colors)}>
          PNG
        </Button>
        <CopyButton value={share} label="Share URL" />
      </div>
      <CodeExportPanel colors={colors} name="harmony" />
      <ColorSpaceNotes ids={["hsl", "oklch", "hex"]} />
    </div>
  );
}
