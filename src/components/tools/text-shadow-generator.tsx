"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Plus, RotateCcw, Sparkles, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { CodeOutput } from "@/components/tools/suite/code-output";
import { PrimaryButton } from "@/components/tools/suite/workbench";
import { cn } from "@/lib/utils";

type ShadowLayer = {
  id: string;
  x: number;
  y: number;
  blur: number;
  color: string;
  opacity: number;
};

type PreviewBg = "light" | "dark" | "gradient" | "mesh";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function layer(partial?: Partial<ShadowLayer>): ShadowLayer {
  return {
    id: uid(),
    x: 2,
    y: 4,
    blur: 8,
    color: "#000000",
    opacity: 45,
    ...partial,
  };
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full || "000000", 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 1000) / 1000})`;
}

function shadowCss(layers: ShadowLayer[]) {
  if (!layers.length) return "none";
  return layers
    .map((s) => `${s.x}px ${s.y}px ${s.blur}px ${hexToRgba(s.color, s.opacity / 100)}`)
    .join(", ");
}

type Preset = {
  id: string;
  label: string;
  layers: Partial<ShadowLayer>[];
  textColor?: string;
  bg?: PreviewBg;
};

const PRESETS: Preset[] = [
  {
    id: "soft",
    label: "Soft",
    layers: [{ x: 0, y: 4, blur: 12, color: "#000000", opacity: 35 }],
  },
  {
    id: "hard",
    label: "Hard",
    layers: [{ x: 3, y: 3, blur: 0, color: "#000000", opacity: 55 }],
  },
  {
    id: "glow",
    label: "Glow",
    textColor: "#ffffff",
    bg: "dark",
    layers: [
      { x: 0, y: 0, blur: 8, color: "#fb7185", opacity: 80 },
      { x: 0, y: 0, blur: 20, color: "#e11d48", opacity: 55 },
      { x: 0, y: 0, blur: 40, color: "#e11d48", opacity: 35 },
    ],
  },
  {
    id: "neon",
    label: "Neon",
    textColor: "#ffe4e6",
    bg: "dark",
    layers: [
      { x: 0, y: 0, blur: 4, color: "#fb7185", opacity: 100 },
      { x: 0, y: 0, blur: 12, color: "#e11d48", opacity: 80 },
      { x: 0, y: 0, blur: 28, color: "#be123c", opacity: 50 },
    ],
  },
  {
    id: "long",
    label: "Long",
    layers: Array.from({ length: 12 }, (_, i) => ({
      x: i + 1,
      y: i + 1,
      blur: 0,
      color: "#e11d48",
      opacity: Math.max(8, 55 - i * 4),
    })),
  },
  {
    id: "retro",
    label: "Retro",
    textColor: "#fff7ed",
    bg: "gradient",
    layers: [
      { x: 4, y: 4, blur: 0, color: "#ea580c", opacity: 100 },
      { x: 8, y: 8, blur: 0, color: "#c2410c", opacity: 90 },
    ],
  },
  {
    id: "emboss",
    label: "Emboss",
    textColor: "#e2e8f0",
    bg: "dark",
    layers: [
      { x: 1, y: 1, blur: 0, color: "#ffffff", opacity: 45 },
      { x: -1, y: -1, blur: 0, color: "#000000", opacity: 55 },
    ],
  },
  {
    id: "outline",
    label: "Outline",
    textColor: "#ffffff",
    bg: "mesh",
    layers: [
      { x: -2, y: -2, blur: 0, color: "#e11d48", opacity: 100 },
      { x: 2, y: -2, blur: 0, color: "#e11d48", opacity: 100 },
      { x: -2, y: 2, blur: 0, color: "#e11d48", opacity: 100 },
      { x: 2, y: 2, blur: 0, color: "#e11d48", opacity: 100 },
      { x: 0, y: -2, blur: 0, color: "#e11d48", opacity: 100 },
      { x: 0, y: 2, blur: 0, color: "#e11d48", opacity: 100 },
      { x: -2, y: 0, blur: 0, color: "#e11d48", opacity: 100 },
      { x: 2, y: 0, blur: 0, color: "#e11d48", opacity: 100 },
    ],
  },
  {
    id: "depth",
    label: "Depth",
    layers: [
      { x: 1, y: 1, blur: 0, color: "#000000", opacity: 20 },
      { x: 2, y: 3, blur: 2, color: "#000000", opacity: 18 },
      { x: 4, y: 8, blur: 12, color: "#000000", opacity: 22 },
    ],
  },
  {
    id: "subtle",
    label: "Subtle",
    layers: [{ x: 0, y: 1, blur: 2, color: "#0f172a", opacity: 18 }],
  },
  {
    id: "pop",
    label: "Pop",
    textColor: "#ffffff",
    bg: "gradient",
    layers: [
      { x: 0, y: 6, blur: 0, color: "#9f1239", opacity: 100 },
      { x: 0, y: 12, blur: 18, color: "#e11d48", opacity: 40 },
    ],
  },
  {
    id: "rainbow",
    label: "Rainbow",
    textColor: "#0f172a",
    bg: "light",
    layers: [
      { x: 0, y: 0, blur: 6, color: "#e11d48", opacity: 70 },
      { x: 0, y: 0, blur: 14, color: "#f59e0b", opacity: 55 },
      { x: 0, y: 0, blur: 24, color: "#22c55e", opacity: 40 },
      { x: 0, y: 0, blur: 36, color: "#3b82f6", opacity: 35 },
    ],
  },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs sm:text-sm">{label}</Label>
      {children}
    </div>
  );
}

export function TextShadowGeneratorTool() {
  const [layers, setLayers] = useState<ShadowLayer[]>([layer()]);
  const [activePreset, setActivePreset] = useState("soft");
  const [textColor, setTextColor] = useState("#0f172a");
  const [sample, setSample] = useState("Aa Preview");
  const [fontSize, setFontSize] = useState(64);
  const [fontWeight, setFontWeight] = useState(700);
  const [previewBg, setPreviewBg] = useState<PreviewBg>("light");
  const [className, setClassName] = useState("headline");
  const [extraCss, setExtraCss] = useState("");

  const value = useMemo(() => shadowCss(layers), [layers]);

  const css = useMemo(() => {
    const cls = className.trim() || "headline";
    const lines = [
      `.${cls} {`,
      `  color: ${textColor};`,
      `  text-shadow: ${value};`,
    ];
    if (extraCss.trim()) {
      for (const raw of extraCss.split("\n")) {
        const line = raw.trim();
        if (!line) continue;
        lines.push(`  ${line.endsWith(";") ? line : `${line};`}`);
      }
    }
    lines.push(`}`);
    return lines.join("\n");
  }, [className, extraCss, textColor, value]);

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    setLayers(preset.layers.map((p) => layer(p)));
    if (preset.textColor) setTextColor(preset.textColor);
    if (preset.bg) setPreviewBg(preset.bg);
    toast.success(`Applied “${preset.label}”`);
  };

  const reset = () => {
    setActivePreset("soft");
    setLayers([layer()]);
    setTextColor("#0f172a");
    setPreviewBg("light");
    setSample("Aa Preview");
    setFontSize(64);
  };

  const updateLayer = (id: string, patch: Partial<ShadowLayer>) => {
    setActivePreset("custom");
    setLayers((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addLayer = () => {
    setActivePreset("custom");
    setLayers((prev) => [...prev, layer({ x: 0, y: 6, blur: 16, opacity: 30 })]);
  };

  const removeLayer = (id: string) => {
    setActivePreset("custom");
    setLayers((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.id !== id)));
  };

  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("text-shadow value copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const stageClass =
    previewBg === "dark"
      ? "bg-slate-950"
      : previewBg === "gradient"
        ? "bg-gradient-to-br from-rose-500 via-fuchsia-500 to-amber-400"
        : previewBg === "mesh"
          ? "bg-[radial-gradient(at_20%_20%,#fb7185_0,transparent_45%),radial-gradient(at_80%_10%,#60a5fa_0,transparent_40%),radial-gradient(at_50%_80%,#34d399_0,transparent_45%)] bg-slate-900"
          : "bg-muted/40";

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] xl:items-start">
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
          <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Workspace
                </p>
                <h2 className="font-display text-base font-semibold tracking-tight sm:text-lg">
                  Text Shadow
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Multi-layer shadows, glow presets, and live type preview.
                </p>
              </div>
              <Badge variant="secondary" className="rounded-full">
                <Wand2 className="mr-1 h-3.5 w-3.5" />
                Live
              </Badge>
            </div>
          </div>

          <div className="max-h-[min(70vh,52rem)] space-y-5 overflow-y-auto p-3 sm:p-5">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/box-shadow-generator"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Box shadow
              </Link>
              <Link
                href="/typography-generator"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Typography
              </Link>
              <Button type="button" size="sm" variant="ghost" className="h-8 rounded-full" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>

            <section className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Presets
                </p>
                {activePreset === "custom" && (
                  <Badge variant="outline" className="rounded-full text-[10px]">
                    Custom
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={cn(
                      "rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                      activePreset === preset.id
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30 hover:bg-muted/60"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Type
              </p>
              <Field label="Sample text">
                <Input value={sample} onChange={(e) => setSample(e.target.value)} className="rounded-xl" />
              </Field>
              <Field label="Text color">
                <Input
                  type="color"
                  value={textColor.startsWith("#") ? textColor : "#0f172a"}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-10 w-full max-w-[8rem] p-1"
                />
              </Field>
              <Field label={`Size · ${fontSize}px`}>
                <Slider min={24} max={120} value={[fontSize]} onValueChange={([n]) => setFontSize(n)} />
              </Field>
              <Field label={`Weight · ${fontWeight}`}>
                <Slider
                  min={400}
                  max={900}
                  step={100}
                  value={[fontWeight]}
                  onValueChange={([n]) => setFontWeight(n)}
                />
              </Field>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Shadow layers
                </p>
                <Button type="button" variant="outline" size="sm" className="h-8 rounded-full text-xs" onClick={addLayer}>
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
              {layers.map((s, index) => (
                <div key={s.id} className="space-y-2 rounded-2xl border border-border/50 bg-muted/20 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Layer {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeLayer(s.id)}
                      disabled={layers.length <= 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label={`X · ${s.x}px`}>
                      <Slider min={-40} max={40} value={[s.x]} onValueChange={([n]) => updateLayer(s.id, { x: n })} />
                    </Field>
                    <Field label={`Y · ${s.y}px`}>
                      <Slider min={-40} max={40} value={[s.y]} onValueChange={([n]) => updateLayer(s.id, { y: n })} />
                    </Field>
                  </div>
                  <Field label={`Blur · ${s.blur}px`}>
                    <Slider min={0} max={60} value={[s.blur]} onValueChange={([n]) => updateLayer(s.id, { blur: n })} />
                  </Field>
                  <Field label={`Opacity · ${s.opacity}%`}>
                    <Slider min={0} max={100} value={[s.opacity]} onValueChange={([n]) => updateLayer(s.id, { opacity: n })} />
                  </Field>
                  <Field label="Color">
                    <Input
                      type="color"
                      value={s.color.startsWith("#") ? s.color : "#000000"}
                      onChange={(e) => updateLayer(s.id, { color: e.target.value })}
                      className="h-10 w-full max-w-[8rem] p-1"
                    />
                  </Field>
                </div>
              ))}
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Output
              </p>
              <Field label="Class name">
                <Input
                  value={className}
                  onChange={(e) => setClassName(e.target.value.replace(/[^\w-]/g, ""))}
                  className="font-mono text-sm"
                  spellCheck={false}
                />
              </Field>
              <Field label="Extra CSS">
                <Textarea
                  value={extraCss}
                  onChange={(e) => setExtraCss(e.target.value)}
                  placeholder="font-weight: 700;"
                  rows={2}
                  className="rounded-xl font-mono text-xs"
                  spellCheck={false}
                />
              </Field>
            </section>

            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="button" onClick={() => void copyValue()}>
                <Copy className="h-4 w-4" />
                Copy text-shadow
              </PrimaryButton>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => applyPreset(PRESETS[2])}>
                <Sparkles className="h-3.5 w-3.5" />
                Glow
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
            <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                    Preview
                  </p>
                  <p className="text-sm font-semibold">Live type</p>
                  <p className="mt-0.5 max-w-xl truncate font-mono text-[11px] text-muted-foreground">{value}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      ["light", "Light"],
                      ["dark", "Dark"],
                      ["gradient", "Gradient"],
                      ["mesh", "Mesh"],
                    ] as const
                  ).map(([id, name]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPreviewBg(id)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                        previewBg === id
                          ? "border-rose-500/50 bg-rose-500 text-white"
                          : "border-border/60 bg-muted/30"
                      )}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-3 sm:p-5">
              <div className={cn("flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl p-8 sm:min-h-[360px]", stageClass)}>
                <p
                  className="max-w-full break-words text-center font-display tracking-tight"
                  style={{
                    color: textColor,
                    textShadow: value,
                    fontSize,
                    fontWeight,
                  }}
                >
                  {sample || "Aa"}
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ["Layers", String(layers.length)],
                  ["Blur", `${layers[0]?.blur ?? 0}px`],
                  ["Offset", `${layers[0]?.x ?? 0}, ${layers[0]?.y ?? 0}`],
                  ["Size", `${fontSize}px`],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</p>
                    <p className="font-mono text-sm font-semibold">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <CodeOutput
            value={css}
            filename="text-shadow.css"
            language="css"
            title="CSS output"
            eyebrow="Copy · Download"
            rows={12}
          />
        </div>
      </div>
    </div>
  );
}
