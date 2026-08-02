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

type TransLayer = {
  id: string;
  property: string;
  duration: number;
  delay: number;
  easing: string;
};

type PreviewKind = "button" | "card" | "box" | "text";

const PROP_OPTIONS = [
  "all",
  "transform",
  "opacity",
  "background-color",
  "color",
  "box-shadow",
  "border-color",
  "border-radius",
  "width",
  "height",
  "padding",
  "filter",
  "letter-spacing",
] as const;

const EASINGS: { value: string; label: string; bezier?: [number, number, number, number] }[] = [
  { value: "ease", label: "ease", bezier: [0.25, 0.1, 0.25, 1] },
  { value: "ease-in", label: "ease-in", bezier: [0.42, 0, 1, 1] },
  { value: "ease-out", label: "ease-out", bezier: [0, 0, 0.58, 1] },
  { value: "ease-in-out", label: "ease-in-out", bezier: [0.42, 0, 0.58, 1] },
  { value: "linear", label: "linear", bezier: [0, 0, 1, 1] },
  { value: "cubic-bezier(0.4, 0, 0.2, 1)", label: "material", bezier: [0.4, 0, 0.2, 1] },
  { value: "cubic-bezier(0.34, 1.56, 0.64, 1)", label: "springy", bezier: [0.34, 1.56, 0.64, 1] },
  { value: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", label: "back", bezier: [0.68, -0.55, 0.265, 1.55] },
  { value: "cubic-bezier(0.16, 1, 0.3, 1)", label: "smooth", bezier: [0.16, 1, 0.3, 1] },
  { value: "cubic-bezier(0.87, 0, 0.13, 1)", label: "emphasized", bezier: [0.87, 0, 0.13, 1] },
  { value: "steps(5, end)", label: "steps" },
  { value: "custom", label: "custom…" },
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function layer(partial?: Partial<TransLayer>): TransLayer {
  return {
    id: uid(),
    property: "all",
    duration: 300,
    delay: 0,
    easing: "ease",
    ...partial,
  };
}

type Preset = {
  id: string;
  label: string;
  layers: Partial<TransLayer>[];
  preview: PreviewKind;
  hoverHint: string;
};

const PRESETS: Preset[] = [
  {
    id: "button",
    label: "Button hover",
    preview: "button",
    hoverHint: "Lift + shadow + brightness",
    layers: [
      { property: "transform", duration: 200, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
      { property: "box-shadow", duration: 200, easing: "ease-out" },
      { property: "filter", duration: 200, easing: "ease" },
    ],
  },
  {
    id: "fade",
    label: "Fade",
    preview: "box",
    hoverHint: "Opacity softens on hover",
    layers: [{ property: "opacity", duration: 350, easing: "ease-in-out" }],
  },
  {
    id: "lift",
    label: "Lift",
    preview: "card",
    hoverHint: "Card rises with shadow",
    layers: [
      { property: "transform", duration: 280, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      { property: "box-shadow", duration: 280, easing: "ease-out" },
    ],
  },
  {
    id: "scale",
    label: "Scale",
    preview: "box",
    hoverHint: "Subtle grow",
    layers: [{ property: "transform", duration: 250, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }],
  },
  {
    id: "color",
    label: "Color morph",
    preview: "button",
    hoverHint: "Background & text shift",
    layers: [
      { property: "background-color", duration: 300, easing: "ease" },
      { property: "color", duration: 300, easing: "ease" },
      { property: "border-color", duration: 300, easing: "ease" },
    ],
  },
  {
    id: "shadow",
    label: "Shadow grow",
    preview: "card",
    hoverHint: "Depth on hover",
    layers: [{ property: "box-shadow", duration: 320, easing: "ease-out" }],
  },
  {
    id: "width",
    label: "Expand",
    preview: "box",
    hoverHint: "Width expands",
    layers: [{ property: "width", duration: 400, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }],
  },
  {
    id: "material",
    label: "Material",
    preview: "button",
    hoverHint: "Standard Material motion",
    layers: [{ property: "all", duration: 250, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }],
  },
  {
    id: "spring",
    label: "Spring",
    preview: "box",
    hoverHint: "Overshoot bounce",
    layers: [{ property: "transform", duration: 500, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }],
  },
  {
    id: "slow",
    label: "Elegant",
    preview: "text",
    hoverHint: "Slow letter-spacing",
    layers: [
      { property: "letter-spacing", duration: 600, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      { property: "color", duration: 600, easing: "ease" },
    ],
  },
  {
    id: "snappy",
    label: "Snappy",
    preview: "button",
    hoverHint: "Quick 120ms feedback",
    layers: [{ property: "all", duration: 120, easing: "ease-out" }],
  },
  {
    id: "filter",
    label: "Filter",
    preview: "box",
    hoverHint: "Brightness / blur",
    layers: [{ property: "filter", duration: 350, easing: "ease-in-out" }],
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

function parseBezier(easing: string): [number, number, number, number] | null {
  const named = EASINGS.find((e) => e.value === easing);
  if (named?.bezier) return named.bezier;
  const m = easing.match(
    /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/
  );
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
}

/** Approximate cubic-bezier curve for SVG path (control points in unit square). */
function bezierPath(bezier: [number, number, number, number], w = 120, h = 80) {
  const [x1, y1, x2, y2] = bezier;
  const pad = 8;
  const sx = (t: number) => pad + t * (w - pad * 2);
  const sy = (t: number) => h - pad - t * (h - pad * 2);
  return `M ${sx(0)} ${sy(0)} C ${sx(x1)} ${sy(y1)}, ${sx(x2)} ${sy(y2)}, ${sx(1)} ${sy(1)}`;
}

function formatMs(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 2)}s` : `${n}ms`;
}

export function CssTransitionGeneratorTool() {
  const [layers, setLayers] = useState<TransLayer[]>([
    layer({ property: "transform", duration: 200, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }),
    layer({ property: "box-shadow", duration: 200, easing: "ease-out" }),
    layer({ property: "filter", duration: 200, easing: "ease" }),
  ]);
  const [activePreset, setActivePreset] = useState("button");
  const [preview, setPreview] = useState<PreviewKind>("button");
  const [className, setClassName] = useState("interactive");
  const [includeHover, setIncludeHover] = useState(true);
  const [longhand, setLonghand] = useState(false);
  const [extraCss, setExtraCss] = useState("");
  const [customBezier, setCustomBezier] = useState("0.42, 0, 0.58, 1");
  const [sharedEasing, setSharedEasing] = useState("cubic-bezier(0.4, 0, 0.2, 1)");
  const [triggered, setTriggered] = useState(false);
  const [unit, setUnit] = useState<"ms" | "s">("ms");

  const resolveEasing = (e: string) =>
    e === "custom" ? `cubic-bezier(${customBezier})` : e;

  const shorthand = useMemo(() => {
    return layers
      .map((l) => {
        const dur = unit === "s" ? `${(l.duration / 1000).toFixed(2)}s` : `${l.duration}ms`;
        const del = unit === "s" ? `${(l.delay / 1000).toFixed(2)}s` : `${l.delay}ms`;
        return `${l.property} ${dur} ${resolveEasing(l.easing)} ${del}`;
      })
      .join(", ");
  }, [customBezier, layers, unit]);

  const css = useMemo(() => {
    const cls = className.trim() || "interactive";
    const lines: string[] = [`.${cls} {`];

    if (longhand) {
      lines.push(`  transition-property: ${layers.map((l) => l.property).join(", ")};`);
      lines.push(
        `  transition-duration: ${layers
          .map((l) => (unit === "s" ? `${(l.duration / 1000).toFixed(2)}s` : `${l.duration}ms`))
          .join(", ")};`
      );
      lines.push(`  transition-timing-function: ${layers.map((l) => resolveEasing(l.easing)).join(", ")};`);
      lines.push(
        `  transition-delay: ${layers
          .map((l) => (unit === "s" ? `${(l.delay / 1000).toFixed(2)}s` : `${l.delay}ms`))
          .join(", ")};`
      );
    } else {
      lines.push(`  transition: ${shorthand};`);
    }

    if (extraCss.trim()) {
      for (const raw of extraCss.split("\n")) {
        const line = raw.trim();
        if (!line) continue;
        lines.push(`  ${line.endsWith(";") ? line : `${line};`}`);
      }
    }
    lines.push(`}`);

    if (includeHover) {
      lines.push(``);
      lines.push(`.${cls}:hover {`);
      if (preview === "button" || preview === "card") {
        lines.push(`  transform: translateY(-2px);`);
        lines.push(`  box-shadow: 0 12px 28px rgba(225, 29, 72, 0.28);`);
        lines.push(`  filter: brightness(1.05);`);
      } else if (preview === "box") {
        lines.push(`  transform: scale(1.06);`);
        lines.push(`  opacity: 0.92;`);
        lines.push(`  filter: brightness(1.08);`);
        lines.push(`  width: 180px;`);
      } else {
        lines.push(`  letter-spacing: 0.12em;`);
        lines.push(`  color: #e11d48;`);
      }
      lines.push(`}`);
    }

    return lines.join("\n");
  }, [
    className,
    customBezier,
    extraCss,
    includeHover,
    layers,
    longhand,
    preview,
    shorthand,
    unit,
  ]);

  const primaryEasing = resolveEasing(layers[0]?.easing ?? "ease");
  const curve = parseBezier(primaryEasing);

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    setPreview(preset.preview);
    setLayers(preset.layers.map((p) => layer(p)));
    setSharedEasing(preset.layers[0]?.easing ?? "ease");
    toast.success(`Applied “${preset.label}”`);
  };

  const reset = () => applyPreset(PRESETS[0]);

  const updateLayer = (id: string, patch: Partial<TransLayer>) => {
    setActivePreset("custom");
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const addLayer = () => {
    setActivePreset("custom");
    setLayers((prev) => [...prev, layer({ property: "opacity", duration: 300 })]);
  };

  const removeLayer = (id: string) => {
    setActivePreset("custom");
    setLayers((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.id !== id)));
  };

  const applySharedEasing = (value: string) => {
    setSharedEasing(value);
    setActivePreset("custom");
    setLayers((prev) => prev.map((l) => ({ ...l, easing: value })));
  };

  const copyShorthand = async () => {
    try {
      await navigator.clipboard.writeText(`transition: ${shorthand};`);
      toast.success("transition copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const transitionStyle = { transition: shorthand };

  const hoverActive = triggered;

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
                  CSS Transition
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Presets, multi-property timing, easing curves, and live hover.
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
                href="/css-animation-generator"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Animations
              </Link>
              <Link
                href="/css-button-generator"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Buttons
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
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Properties
                </p>
                <Button type="button" variant="outline" size="sm" className="h-8 rounded-full text-xs" onClick={addLayer}>
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(["ms", "s"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={cn(
                      "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                      unit === u
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30"
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>
              {layers.map((l, index) => (
                <div key={l.id} className="space-y-2 rounded-2xl border border-border/50 bg-muted/20 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold">Layer {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeLayer(l.id)}
                      disabled={layers.length <= 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Field label="Property">
                    <select
                      value={l.property}
                      onChange={(e) => updateLayer(l.id, { property: e.target.value })}
                      className="h-10 w-full rounded-xl border border-border/60 bg-background px-3 font-mono text-sm"
                    >
                      {PROP_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={`Duration · ${formatMs(l.duration)}`}>
                    <Slider
                      min={50}
                      max={2000}
                      step={10}
                      value={[l.duration]}
                      onValueChange={([n]) => updateLayer(l.id, { duration: n })}
                    />
                  </Field>
                  <Field label={`Delay · ${formatMs(l.delay)}`}>
                    <Slider
                      min={0}
                      max={1000}
                      step={10}
                      value={[l.delay]}
                      onValueChange={([n]) => updateLayer(l.id, { delay: n })}
                    />
                  </Field>
                  <Field label="Easing">
                    <select
                      value={EASINGS.some((e) => e.value === l.easing) ? l.easing : "custom"}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "custom") updateLayer(l.id, { easing: "custom" });
                        else updateLayer(l.id, { easing: v });
                      }}
                      className="h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm"
                    >
                      {EASINGS.map((e) => (
                        <option key={e.value} value={e.value}>
                          {e.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              ))}
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Shared easing
              </p>
              <div className="flex flex-wrap gap-1.5">
                {EASINGS.filter((e) => e.value !== "custom").map((e) => (
                  <button
                    key={e.value}
                    type="button"
                    onClick={() => applySharedEasing(e.value)}
                    className={cn(
                      "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                      sharedEasing === e.value
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30 hover:bg-muted/60"
                    )}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
              {(sharedEasing === "custom" || layers.some((l) => l.easing === "custom")) && (
                <Field label="cubic-bezier values">
                  <Input
                    value={customBezier}
                    onChange={(e) => {
                      setCustomBezier(e.target.value);
                      setActivePreset("custom");
                    }}
                    className="font-mono text-xs"
                    placeholder="0.42, 0, 0.58, 1"
                    spellCheck={false}
                  />
                </Field>
              )}
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Preview & output
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["button", "Button"],
                    ["card", "Card"],
                    ["box", "Box"],
                    ["text", "Text"],
                  ] as const
                ).map(([id, name]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPreview(id)}
                    className={cn(
                      "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                      preview === id
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30"
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <Field label="Class name">
                <Input
                  value={className}
                  onChange={(e) => setClassName(e.target.value.replace(/[^\w-]/g, ""))}
                  className="font-mono text-sm"
                  spellCheck={false}
                />
              </Field>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeHover}
                  onChange={(e) => setIncludeHover(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-rose-500"
                />
                Include :hover styles in CSS
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={longhand}
                  onChange={(e) => setLonghand(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-rose-500"
                />
                Export longhand properties
              </label>
              <Field label="Extra CSS">
                <Textarea
                  value={extraCss}
                  onChange={(e) => setExtraCss(e.target.value)}
                  placeholder="will-change: transform;"
                  rows={2}
                  className="rounded-xl font-mono text-xs"
                  spellCheck={false}
                />
              </Field>
            </section>

            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="button" onClick={() => void copyShorthand()}>
                <Copy className="h-4 w-4" />
                Copy transition
              </PrimaryButton>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => applyPreset(PRESETS[0])}>
                <Sparkles className="h-3.5 w-3.5" />
                Button hover
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
                  <p className="text-sm font-semibold">Hover or toggle</p>
                  <p className="mt-0.5 max-w-xl truncate font-mono text-[11px] text-muted-foreground">
                    {shorthand}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-full text-xs"
                  onClick={() => setTriggered((t) => !t)}
                >
                  {triggered ? "Reset state" : "Trigger"}
                </Button>
              </div>
            </div>
            <div className="space-y-4 p-3 sm:p-5">
              <div className="flex min-h-[240px] items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.08),_transparent_55%)] p-8">
                {preview === "button" && (
                  <button
                    type="button"
                    className="rounded-2xl bg-rose-500 px-7 py-3.5 text-sm font-semibold text-white shadow-md outline-none"
                    style={{
                      ...transitionStyle,
                      ...(hoverActive
                        ? {
                            transform: "translateY(-2px)",
                            boxShadow: "0 12px 28px rgba(225, 29, 72, 0.28)",
                            filter: "brightness(1.05)",
                          }
                        : {}),
                    }}
                    onMouseEnter={(e) => {
                      if (triggered) return;
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 12px 28px rgba(225, 29, 72, 0.28)";
                      e.currentTarget.style.filter = "brightness(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (triggered) return;
                      e.currentTarget.style.transform = "";
                      e.currentTarget.style.boxShadow = "";
                      e.currentTarget.style.filter = "";
                    }}
                  >
                    Hover me
                  </button>
                )}
                {preview === "card" && (
                  <div
                    className="w-full max-w-xs cursor-pointer rounded-3xl border border-border/50 bg-background p-5 shadow-sm"
                    style={{
                      ...transitionStyle,
                      ...(hoverActive
                        ? {
                            transform: "translateY(-4px)",
                            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.15)",
                          }
                        : {}),
                    }}
                    onMouseEnter={(e) => {
                      if (triggered) return;
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 18px 40px rgba(15, 23, 42, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      if (triggered) return;
                      e.currentTarget.style.transform = "";
                      e.currentTarget.style.boxShadow = "";
                    }}
                  >
                    <p className="font-display text-lg font-semibold">Card lift</p>
                    <p className="mt-1 text-sm text-muted-foreground">Hover to feel the transition.</p>
                  </div>
                )}
                {preview === "box" && (
                  <div
                    className="h-24 cursor-pointer rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-500 shadow-lg"
                    style={{
                      width: hoverActive ? 180 : 120,
                      ...transitionStyle,
                      ...(hoverActive
                        ? { transform: "scale(1.06)", filter: "brightness(1.08)", opacity: 0.92 }
                        : {}),
                    }}
                    onMouseEnter={(e) => {
                      if (triggered) return;
                      e.currentTarget.style.width = "180px";
                      e.currentTarget.style.transform = "scale(1.06)";
                      e.currentTarget.style.filter = "brightness(1.08)";
                      e.currentTarget.style.opacity = "0.92";
                    }}
                    onMouseLeave={(e) => {
                      if (triggered) return;
                      e.currentTarget.style.width = "120px";
                      e.currentTarget.style.transform = "";
                      e.currentTarget.style.filter = "";
                      e.currentTarget.style.opacity = "";
                    }}
                  />
                )}
                {preview === "text" && (
                  <p
                    className="cursor-pointer font-display text-3xl font-semibold tracking-tight"
                    style={{
                      ...transitionStyle,
                      ...(hoverActive
                        ? { letterSpacing: "0.12em", color: "#e11d48" }
                        : { color: "inherit" }),
                    }}
                    onMouseEnter={(e) => {
                      if (triggered) return;
                      e.currentTarget.style.letterSpacing = "0.12em";
                      e.currentTarget.style.color = "#e11d48";
                    }}
                    onMouseLeave={(e) => {
                      if (triggered) return;
                      e.currentTarget.style.letterSpacing = "";
                      e.currentTarget.style.color = "";
                    }}
                  >
                    colorBase
                  </p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Easing curve
                  </p>
                  {curve ? (
                    <svg viewBox="0 0 120 80" className="h-auto w-full max-w-[10rem]" aria-label="Easing curve">
                      <rect x="8" y="8" width="104" height="64" fill="none" stroke="currentColor" className="text-border" strokeDasharray="2 3" />
                      <path d={bezierPath(curve)} fill="none" stroke="currentColor" strokeWidth="2.5" className="text-rose-500" />
                      <circle cx="8" cy="72" r="3" className="fill-rose-500" />
                      <circle cx="112" cy="8" r="3" className="fill-rose-500" />
                    </svg>
                  ) : (
                    <p className="font-mono text-xs text-muted-foreground">{primaryEasing}</p>
                  )}
                  <p className="mt-2 truncate font-mono text-[11px] text-muted-foreground">{primaryEasing}</p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Layers
                  </p>
                  <ul className="space-y-1.5">
                    {layers.map((l) => (
                      <li key={l.id} className="flex justify-between gap-2 font-mono text-[11px]">
                        <span className="truncate text-foreground">{l.property}</span>
                        <span className="shrink-0 text-muted-foreground">{formatMs(l.duration)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <CodeOutput
            value={css}
            filename="transition.css"
            language="css"
            title="CSS output"
            eyebrow="Copy · Download"
            rows={14}
          />
        </div>
      </div>
    </div>
  );
}
