"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, RotateCcw, Sparkles, Wand2 } from "lucide-react";
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

type Unit = "px" | "rem" | "em" | "%" | "vw" | "vh" | "vmin" | "vmax";
type PropertyId =
  | "font-size"
  | "width"
  | "height"
  | "padding"
  | "gap"
  | "margin"
  | "border-radius"
  | "custom";
type ModeId = "simple" | "fluid";

type ClampState = {
  min: number;
  preferred: number;
  max: number;
  minUnit: Unit;
  preferredUnit: Unit;
  maxUnit: Unit;
  /** Fluid: size at min viewport */
  sizeMin: number;
  /** Fluid: size at max viewport */
  sizeMax: number;
  sizeUnit: "px" | "rem";
  vpMin: number;
  vpMax: number;
  rootFont: number;
};

const DEFAULT: ClampState = {
  min: 16,
  preferred: 4,
  max: 48,
  minUnit: "px",
  preferredUnit: "vw",
  maxUnit: "px",
  sizeMin: 16,
  sizeMax: 48,
  sizeUnit: "px",
  vpMin: 320,
  vpMax: 1280,
  rootFont: 16,
};

type Preset = {
  id: string;
  label: string;
  property: PropertyId;
  mode: ModeId;
  state: Partial<ClampState>;
  sample?: string;
};

const PRESETS: Preset[] = [
  {
    id: "body",
    label: "Body text",
    property: "font-size",
    mode: "fluid",
    state: { sizeMin: 16, sizeMax: 18, sizeUnit: "px", vpMin: 320, vpMax: 1280 },
    sample: "Readable body copy that grows gently with the viewport.",
  },
  {
    id: "h1",
    label: "Heading H1",
    property: "font-size",
    mode: "fluid",
    state: { sizeMin: 32, sizeMax: 72, sizeUnit: "px", vpMin: 320, vpMax: 1280 },
    sample: "Fluid headline",
  },
  {
    id: "h2",
    label: "Heading H2",
    property: "font-size",
    mode: "fluid",
    state: { sizeMin: 24, sizeMax: 48, sizeUnit: "px", vpMin: 320, vpMax: 1280 },
    sample: "Section title",
  },
  {
    id: "display",
    label: "Display",
    property: "font-size",
    mode: "fluid",
    state: { sizeMin: 40, sizeMax: 96, sizeUnit: "px", vpMin: 360, vpMax: 1440 },
    sample: "Hero type",
  },
  {
    id: "container",
    label: "Container",
    property: "width",
    mode: "fluid",
    state: { sizeMin: 280, sizeMax: 1100, sizeUnit: "px", vpMin: 320, vpMax: 1400 },
  },
  {
    id: "space",
    label: "Spacing",
    property: "padding",
    mode: "fluid",
    state: { sizeMin: 16, sizeMax: 64, sizeUnit: "px", vpMin: 320, vpMax: 1280 },
  },
  {
    id: "gap",
    label: "Gap",
    property: "gap",
    mode: "fluid",
    state: { sizeMin: 12, sizeMax: 32, sizeUnit: "px", vpMin: 320, vpMax: 1024 },
  },
  {
    id: "radius",
    label: "Radius",
    property: "border-radius",
    mode: "fluid",
    state: { sizeMin: 8, sizeMax: 24, sizeUnit: "px", vpMin: 320, vpMax: 1024 },
  },
  {
    id: "simple-vw",
    label: "Simple vw",
    property: "font-size",
    mode: "simple",
    state: { min: 16, preferred: 4, max: 48, minUnit: "px", preferredUnit: "vw", maxUnit: "px" },
    sample: "Simple clamp with vw preferred.",
  },
  {
    id: "rem-scale",
    label: "Rem scale",
    property: "font-size",
    mode: "fluid",
    state: { sizeMin: 1, sizeMax: 3, sizeUnit: "rem", vpMin: 320, vpMax: 1280, rootFont: 16 },
    sample: "Rem-based fluid type",
  },
];

const PROPERTIES: { id: PropertyId; label: string }[] = [
  { id: "font-size", label: "font-size" },
  { id: "width", label: "width" },
  { id: "height", label: "height" },
  { id: "padding", label: "padding" },
  { id: "gap", label: "gap" },
  { id: "margin", label: "margin" },
  { id: "border-radius", label: "border-radius" },
  { id: "custom", label: "custom" },
];

const UNITS: Unit[] = ["px", "rem", "em", "%", "vw", "vh", "vmin", "vmax"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs sm:text-sm">{label}</Label>
      {children}
    </div>
  );
}

function UnitSelect({ value, onChange }: { value: Unit; onChange: (u: Unit) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Unit)}
      className="h-9 rounded-lg border border-border/60 bg-background px-2 text-xs font-mono"
    >
      {UNITS.map((u) => (
        <option key={u} value={u}>
          {u}
        </option>
      ))}
    </select>
  );
}

/** Build preferred as `AVw + Bunit` from linear interpolation between viewport sizes. */
function fluidPreferred(state: ClampState) {
  const { sizeMin, sizeMax, sizeUnit, vpMin, vpMax } = state;
  const span = Math.max(1, vpMax - vpMin);
  const slope = (sizeMax - sizeMin) / span;
  const intercept = sizeMin - slope * vpMin;
  const vwCoef = slope * 100;
  const round = (n: number) => Math.round(n * 10000) / 10000;
  return `${round(vwCoef)}vw + ${round(intercept)}${sizeUnit}`;
}

function clampExpr(mode: ModeId, state: ClampState) {
  if (mode === "fluid") {
    return `clamp(${state.sizeMin}${state.sizeUnit}, ${fluidPreferred(state)}, ${state.sizeMax}${state.sizeUnit})`;
  }
  return `clamp(${state.min}${state.minUnit}, ${state.preferred}${state.preferredUnit}, ${state.max}${state.maxUnit})`;
}

/** Approximate computed px at a viewport width (fluid mode only; simple uses vw estimate). */
function estimatePx(mode: ModeId, state: ClampState, viewport: number): number {
  if (mode === "fluid") {
    const toPx = (v: number) => (state.sizeUnit === "rem" ? v * state.rootFont : v);
    const minPx = toPx(state.sizeMin);
    const maxPx = toPx(state.sizeMax);
    const span = Math.max(1, state.vpMax - state.vpMin);
    const t = (viewport - state.vpMin) / span;
    const raw = minPx + (maxPx - minPx) * t;
    return Math.min(maxPx, Math.max(minPx, raw));
  }
  // simple: evaluate clamp(min, preferred, max) with rough unit conversion
  const toApproxPx = (value: number, unit: Unit) => {
    switch (unit) {
      case "px":
        return value;
      case "rem":
      case "em":
        return value * state.rootFont;
      case "vw":
        return (value / 100) * viewport;
      case "vh":
        return (value / 100) * 800;
      case "%":
        return value; // relative — show as-is-ish
      case "vmin":
        return (value / 100) * Math.min(viewport, 800);
      case "vmax":
        return (value / 100) * Math.max(viewport, 800);
      default:
        return value;
    }
  };
  const a = toApproxPx(state.min, state.minUnit);
  const b = toApproxPx(state.preferred, state.preferredUnit);
  const c = toApproxPx(state.max, state.maxUnit);
  return Math.min(c, Math.max(a, b));
}

export function CssClampGeneratorTool() {
  const [mode, setMode] = useState<ModeId>("fluid");
  const [property, setProperty] = useState<PropertyId>("font-size");
  const [customProp, setCustomProp] = useState("font-size");
  const [state, setState] = useState<ClampState>({ ...DEFAULT, sizeMin: 32, sizeMax: 72 });
  const [activePreset, setActivePreset] = useState("h1");
  const [simViewport, setSimViewport] = useState(768);
  const [className, setClassName] = useState("fluid");
  const [asVariable, setAsVariable] = useState(false);
  const [varName, setVarName] = useState("--fluid-size");
  const [sample, setSample] = useState("Fluid headline");
  const [extraCss, setExtraCss] = useState("");

  const patch = <K extends keyof ClampState>(key: K, value: ClampState[K]) => {
    setActivePreset("custom");
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const expr = useMemo(() => clampExpr(mode, state), [mode, state]);
  const propName = property === "custom" ? customProp.trim() || "font-size" : property;
  const computed = useMemo(() => estimatePx(mode, state, simViewport), [mode, state, simViewport]);

  const css = useMemo(() => {
    const cls = className.trim() || "fluid";
    const lines: string[] = [];
    if (asVariable) {
      const vn = varName.trim() || "--fluid-size";
      lines.push(`:root {`);
      lines.push(`  ${vn}: ${expr};`);
      lines.push(`}`);
      lines.push(``);
      lines.push(`.${cls} {`);
      lines.push(`  ${propName}: var(${vn});`);
    } else {
      lines.push(`.${cls} {`);
      lines.push(`  ${propName}: ${expr};`);
    }
    if (extraCss.trim()) {
      for (const raw of extraCss.split("\n")) {
        const line = raw.trim();
        if (!line) continue;
        lines.push(`  ${line.endsWith(";") ? line : `${line};`}`);
      }
    }
    lines.push(`}`);
    return lines.join("\n");
  }, [asVariable, className, expr, extraCss, propName, varName]);

  const chartPoints = useMemo(() => {
    const w = 320;
    const h = 120;
    const pad = 8;
    const vps = Array.from({ length: 33 }, (_, i) => 280 + i * ((1600 - 280) / 32));
    const values = vps.map((vp) => estimatePx(mode, state, vp));
    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    const range = Math.max(1, maxV - minV);
    return vps.map((vp, i) => {
      const x = pad + ((vp - 280) / (1600 - 280)) * (w - pad * 2);
      const y = h - pad - ((values[i] - minV) / range) * (h - pad * 2);
      return { x, y, vp, value: values[i] };
    });
  }, [mode, state]);

  const polyline = chartPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const simPoint = useMemo(() => {
    const w = 320;
    const h = 120;
    const pad = 8;
    const values = chartPoints.map((p) => p.value);
    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    const range = Math.max(1, maxV - minV);
    const x = pad + ((simViewport - 280) / (1600 - 280)) * (w - pad * 2);
    const y = h - pad - ((computed - minV) / range) * (h - pad * 2);
    return { x, y };
  }, [chartPoints, computed, simViewport]);

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    setMode(preset.mode);
    setProperty(preset.property);
    setState((prev) => ({ ...prev, ...DEFAULT, ...preset.state }));
    if (preset.sample) setSample(preset.sample);
    toast.success(`Applied “${preset.label}”`);
  };

  const reset = () => {
    setActivePreset("h1");
    setMode("fluid");
    setProperty("font-size");
    setState({ ...DEFAULT, sizeMin: 32, sizeMax: 72 });
    setSample("Fluid headline");
  };

  const copyExpr = async () => {
    try {
      await navigator.clipboard.writeText(expr);
      toast.success("clamp() copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const previewUsesSize = propName === "font-size";
  const previewBoxStyle: React.CSSProperties =
    propName === "width"
      ? { width: expr, maxWidth: "100%", height: 48, background: "linear-gradient(135deg,#e11d48,#fb7185)", borderRadius: 12 }
      : propName === "height"
        ? { width: 120, height: expr, background: "linear-gradient(135deg,#e11d48,#fb7185)", borderRadius: 12 }
        : propName === "padding"
          ? { padding: expr, background: "rgba(225,29,72,0.12)", borderRadius: 16, border: "1px solid rgba(225,29,72,0.25)" }
          : propName === "gap"
            ? { display: "flex", gap: expr }
            : propName === "border-radius"
              ? { width: 160, height: 96, borderRadius: expr, background: "linear-gradient(135deg,#e11d48,#a21caf)" }
              : propName === "margin"
                ? { margin: expr, background: "rgba(225,29,72,0.15)", padding: 16, borderRadius: 12 }
                : {};

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
                  CSS Clamp
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Fluid min / preferred / max with live viewport simulation.
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
                href="/typography-generator"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Typography
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
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Mode
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setMode("fluid");
                    setActivePreset("custom");
                  }}
                  className={cn(
                    "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                    mode === "fluid"
                      ? "border-rose-500/50 bg-rose-500 text-white"
                      : "border-border/60 bg-muted/30"
                  )}
                >
                  Fluid (viewport)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("simple");
                    setActivePreset("custom");
                  }}
                  className={cn(
                    "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                    mode === "simple"
                      ? "border-rose-500/50 bg-rose-500 text-white"
                      : "border-border/60 bg-muted/30"
                  )}
                >
                  Simple clamp
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {mode === "fluid"
                  ? "Interpolates size between two viewport widths — preferred is computed as vw + offset."
                  : "Manually set min, preferred, and max with any units."}
              </p>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Property
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PROPERTIES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setProperty(p.id);
                      setActivePreset("custom");
                    }}
                    className={cn(
                      "rounded-full border px-2.5 py-1.5 font-mono text-[11px] font-medium",
                      property === p.id
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30 hover:bg-muted/60"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {property === "custom" && (
                <Field label="Custom property">
                  <Input
                    value={customProp}
                    onChange={(e) => setCustomProp(e.target.value)}
                    className="font-mono text-sm"
                    spellCheck={false}
                  />
                </Field>
              )}
            </section>

            {mode === "fluid" ? (
              <section className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Fluid range
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(["px", "rem"] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => patch("sizeUnit", u)}
                      className={cn(
                        "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                        state.sizeUnit === u
                          ? "border-rose-500/50 bg-rose-500 text-white"
                          : "border-border/60 bg-muted/30"
                      )}
                    >
                      {u}
                    </button>
                  ))}
                </div>
                <Field label={`Min size · ${state.sizeMin}${state.sizeUnit}`}>
                  <Slider
                    min={state.sizeUnit === "rem" ? 0.5 : 8}
                    max={state.sizeUnit === "rem" ? 8 : 120}
                    step={state.sizeUnit === "rem" ? 0.05 : 1}
                    value={[state.sizeMin]}
                    onValueChange={([n]) => patch("sizeMin", Number(n.toFixed(2)))}
                  />
                </Field>
                <Field label={`Max size · ${state.sizeMax}${state.sizeUnit}`}>
                  <Slider
                    min={state.sizeUnit === "rem" ? 0.5 : 12}
                    max={state.sizeUnit === "rem" ? 10 : 200}
                    step={state.sizeUnit === "rem" ? 0.05 : 1}
                    value={[state.sizeMax]}
                    onValueChange={([n]) => patch("sizeMax", Number(n.toFixed(2)))}
                  />
                </Field>
                <Field label={`Viewport min · ${state.vpMin}px`}>
                  <Slider min={280} max={900} value={[state.vpMin]} onValueChange={([n]) => patch("vpMin", n)} />
                </Field>
                <Field label={`Viewport max · ${state.vpMax}px`}>
                  <Slider min={900} max={1920} value={[state.vpMax]} onValueChange={([n]) => patch("vpMax", n)} />
                </Field>
                {state.sizeUnit === "rem" && (
                  <Field label={`Root font · ${state.rootFont}px`}>
                    <Slider min={12} max={20} value={[state.rootFont]} onValueChange={([n]) => patch("rootFont", n)} />
                  </Field>
                )}
              </section>
            ) : (
              <section className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Clamp values
                </p>
                {(
                  [
                    ["min", "Min", state.min, state.minUnit, "minUnit"] as const,
                    ["preferred", "Preferred", state.preferred, state.preferredUnit, "preferredUnit"] as const,
                    ["max", "Max", state.max, state.maxUnit, "maxUnit"] as const,
                  ]
                ).map(([key, label, value, unit, unitKey]) => (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-xs sm:text-sm">
                        {label} · {value}
                        {unit}
                      </Label>
                      <UnitSelect value={unit} onChange={(u) => patch(unitKey, u)} />
                    </div>
                    <Slider
                      min={0}
                      max={unit === "vw" || unit === "vh" || unit === "%" ? 100 : 200}
                      step={unit.includes("w") || unit.includes("h") || unit === "%" ? 0.1 : 1}
                      value={[value]}
                      onValueChange={([n]) =>
                        patch(key, unit.includes("w") || unit.includes("h") || unit === "%" ? Number(n.toFixed(1)) : n)
                      }
                    />
                  </div>
                ))}
              </section>
            )}

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
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={asVariable}
                  onChange={(e) => setAsVariable(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-rose-500"
                />
                Export as CSS variable
              </label>
              {asVariable && (
                <Field label="Variable name">
                  <Input
                    value={varName}
                    onChange={(e) => setVarName(e.target.value.replace(/[^\w-]/g, "") || "--fluid-size")}
                    className="font-mono text-sm"
                    spellCheck={false}
                  />
                </Field>
              )}
              {previewUsesSize && (
                <Field label="Sample text">
                  <Input value={sample} onChange={(e) => setSample(e.target.value)} className="rounded-xl" />
                </Field>
              )}
              <Field label="Extra CSS">
                <Textarea
                  value={extraCss}
                  onChange={(e) => setExtraCss(e.target.value)}
                  placeholder="line-height: 1.15;"
                  rows={2}
                  className="rounded-xl font-mono text-xs"
                  spellCheck={false}
                />
              </Field>
            </section>

            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="button" onClick={() => void copyExpr()}>
                <Copy className="h-4 w-4" />
                Copy clamp()
              </PrimaryButton>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => applyPreset(PRESETS[1])}>
                <Sparkles className="h-3.5 w-3.5" />
                H1 preset
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
            <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Preview
              </p>
              <p className="text-sm font-semibold">Viewport simulator</p>
              <p className="mt-0.5 max-w-xl truncate font-mono text-[11px] text-muted-foreground">{expr}</p>
            </div>
            <div className="space-y-4 p-3 sm:p-5">
              <div className="space-y-2 rounded-2xl border border-border/50 bg-muted/20 p-4">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Simulated viewport
                    </p>
                    <p className="font-display text-2xl font-semibold tracking-tight">{simViewport}px</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Computed ≈
                    </p>
                    <p className="font-mono text-lg font-semibold text-rose-600 dark:text-rose-400">
                      {computed.toFixed(1)}px
                    </p>
                  </div>
                </div>
                <Slider
                  min={280}
                  max={1600}
                  value={[simViewport]}
                  onValueChange={([n]) => setSimViewport(n)}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>280</span>
                  <span>768</span>
                  <span>1280</span>
                  <span>1600</span>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-muted/10 p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Size across viewports
                </p>
                <svg viewBox="0 0 320 120" className="h-auto w-full max-w-md" role="img" aria-label="Clamp size chart">
                  <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-rose-500"
                    points={polyline}
                  />
                  <circle cx={simPoint.x} cy={simPoint.y} r="5" className="fill-rose-500" />
                </svg>
              </div>

              <div className="flex min-h-[200px] items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.08),_transparent_55%)] p-6">
                {previewUsesSize || property === "custom" ? (
                  <p
                    className="font-display font-semibold tracking-tight text-foreground"
                    style={{ fontSize: expr, maxWidth: "100%" }}
                  >
                    {sample || "Aa"}
                  </p>
                ) : propName === "gap" ? (
                  <div style={previewBoxStyle}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 w-14 rounded-xl bg-rose-500/80" />
                    ))}
                  </div>
                ) : propName === "padding" ? (
                  <div style={previewBoxStyle}>
                    <div className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white">Inner</div>
                  </div>
                ) : (
                  <div style={previewBoxStyle} />
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="rounded-xl border border-border/50 bg-muted/20 px-2 py-2">
                  <p className="text-muted-foreground">Min</p>
                  <p className="font-mono font-semibold">
                    {mode === "fluid" ? `${state.sizeMin}${state.sizeUnit}` : `${state.min}${state.minUnit}`}
                  </p>
                </div>
                <div className="rounded-xl border border-border/50 bg-muted/20 px-2 py-2">
                  <p className="text-muted-foreground">Preferred</p>
                  <p className="truncate font-mono font-semibold">
                    {mode === "fluid" ? fluidPreferred(state) : `${state.preferred}${state.preferredUnit}`}
                  </p>
                </div>
                <div className="rounded-xl border border-border/50 bg-muted/20 px-2 py-2">
                  <p className="text-muted-foreground">Max</p>
                  <p className="font-mono font-semibold">
                    {mode === "fluid" ? `${state.sizeMax}${state.sizeUnit}` : `${state.max}${state.maxUnit}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <CodeOutput
            value={css}
            filename="clamp.css"
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
