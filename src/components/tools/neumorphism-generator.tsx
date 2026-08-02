"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
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

type NeoMode = "raised" | "pressed" | "flat" | "convex" | "concave";
type NeoShape = "square" | "circle" | "soft" | "button" | "pill";

type NeoState = {
  bg: string;
  distance: number;
  blur: number;
  intensity: number;
  angle: number;
  radius: number;
  width: number;
  height: number;
  mode: NeoMode;
};

const DEFAULT: NeoState = {
  bg: "#e0e5ec",
  distance: 10,
  blur: 20,
  intensity: 18,
  angle: 145,
  radius: 24,
  width: 160,
  height: 160,
  mode: "raised",
};

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full || "000000", 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mixHex(hex: string, toward: "white" | "black", amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const t = toward === "white" ? 255 : 0;
  const m = (c: number) => Math.round(c + (t - c) * amount);
  return `#${[m(r), m(g), m(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function offsetFromAngle(distance: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.round(Math.cos(rad) * distance),
    y: Math.round(Math.sin(rad) * distance),
  };
}

function buildShadows(state: NeoState) {
  const dark = mixHex(state.bg, "black", state.intensity / 100);
  const light = mixHex(state.bg, "white", Math.min(0.95, state.intensity / 70));
  const { x, y } = offsetFromAngle(state.distance, state.angle);
  const b = state.blur;

  switch (state.mode) {
    case "flat":
      return "none";
    case "pressed":
      return `inset ${x}px ${y}px ${b}px ${dark}, inset ${-x}px ${-y}px ${b}px ${light}`;
    case "convex":
      return `${x}px ${y}px ${b}px ${dark}, ${-x}px ${-y}px ${b}px ${light}, inset ${-Math.round(x / 2)}px ${-Math.round(y / 2)}px ${Math.round(b / 2)}px ${light}, inset ${Math.round(x / 2)}px ${Math.round(y / 2)}px ${Math.round(b / 2)}px ${dark}`;
    case "concave":
      return `${x}px ${y}px ${b}px ${dark}, ${-x}px ${-y}px ${b}px ${light}, inset ${Math.round(x / 2)}px ${Math.round(y / 2)}px ${Math.round(b / 2)}px ${dark}, inset ${-Math.round(x / 2)}px ${-Math.round(y / 2)}px ${Math.round(b / 2)}px ${light}`;
    case "raised":
    default:
      return `${x}px ${y}px ${b}px ${dark}, ${-x}px ${-y}px ${b}px ${light}`;
  }
}

type Preset = { id: string; label: string; state: Partial<NeoState>; shape?: NeoShape };

const PRESETS: Preset[] = [
  { id: "raised", label: "Raised", state: { ...DEFAULT } },
  { id: "pressed", label: "Pressed", state: { mode: "pressed", distance: 8, blur: 16 } },
  { id: "convex", label: "Convex", state: { mode: "convex", distance: 8, blur: 18 } },
  { id: "concave", label: "Concave", state: { mode: "concave", distance: 8, blur: 18 } },
  {
    id: "soft",
    label: "Soft",
    state: { mode: "raised", distance: 6, blur: 14, intensity: 12, radius: 32 },
  },
  {
    id: "deep",
    label: "Deep",
    state: { mode: "raised", distance: 16, blur: 28, intensity: 24 },
  },
  {
    id: "dark",
    label: "Dark neo",
    state: { bg: "#2d3436", mode: "raised", intensity: 22, blur: 22, distance: 12 },
  },
  {
    id: "circle",
    label: "Circle",
    state: { mode: "raised", width: 140, height: 140, radius: 999 },
    shape: "circle",
  },
  {
    id: "pill",
    label: "Pill",
    state: { mode: "raised", width: 220, height: 56, radius: 999, distance: 8, blur: 16 },
    shape: "pill",
  },
  {
    id: "flat",
    label: "Flat",
    state: { mode: "flat" },
  },
];

const SURFACE_SWATCHES = ["#e0e5ec", "#f0f0f3", "#dfe6e9", "#cad3c8", "#2d3436", "#1e272e", "#353b48", "#eee5e9"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs sm:text-sm">{label}</Label>
      {children}
    </div>
  );
}

export function NeumorphismGeneratorTool() {
  const [state, setState] = useState<NeoState>({ ...DEFAULT });
  const [shape, setShape] = useState<NeoShape>("soft");
  const [label, setLabel] = useState("Soft UI");
  const [className, setClassName] = useState("neo");
  const [includeHover, setIncludeHover] = useState(true);
  const [includeActive, setIncludeActive] = useState(true);
  const [extraCss, setExtraCss] = useState("");
  const [activePreset, setActivePreset] = useState("raised");
  const [flashKey, setFlashKey] = useState(0);
  const [demoPressed, setDemoPressed] = useState(false);

  const patch = <K extends keyof NeoState>(key: K, value: NeoState[K]) => {
    setActivePreset("custom");
    setState((prev) => ({ ...prev, [key]: value }));
    setFlashKey((k) => k + 1);
  };

  const shadows = useMemo(() => buildShadows(state), [state]);
  const pressedShadows = useMemo(
    () => buildShadows({ ...state, mode: "pressed" }),
    [state]
  );
  const raisedShadows = useMemo(
    () => buildShadows({ ...state, mode: "raised" }),
    [state]
  );

  const dims = useMemo(() => {
    if (shape === "circle") {
      const s = Math.min(state.width, state.height);
      return { width: s, height: s, radius: 9999 };
    }
    if (shape === "pill") {
      return { width: Math.max(state.width, 180), height: Math.min(state.height, 64), radius: 9999 };
    }
    if (shape === "button") {
      return { width: Math.max(state.width, 140), height: Math.min(Math.max(state.height, 44), 72), radius: state.radius };
    }
    if (shape === "square") {
      const s = Math.min(state.width, state.height);
      return { width: s, height: s, radius: state.radius };
    }
    return { width: state.width, height: state.height, radius: state.radius };
  }, [shape, state.width, state.height, state.radius]);

  const textColor = mixHex(state.bg, luminance(state.bg) > 0.55 ? "black" : "white", 0.45);

  const css = useMemo(() => {
    const cls = className.trim() || "neo";
    const lines = [
      `.${cls} {`,
      `  width: ${dims.width}px;`,
      `  height: ${dims.height}px;`,
      `  background: ${state.bg};`,
      `  border-radius: ${dims.radius >= 999 ? "9999px" : `${dims.radius}px`};`,
      `  box-shadow: ${shadows};`,
      `  border: none;`,
      `  color: ${textColor};`,
      `  display: inline-flex;`,
      `  align-items: center;`,
      `  justify-content: center;`,
      `  cursor: pointer;`,
      `  transition: box-shadow 180ms ease, transform 180ms ease;`,
    ];
    if (extraCss.trim()) {
      for (const raw of extraCss.split("\n")) {
        const line = raw.trim();
        if (!line) continue;
        lines.push(`  ${line.endsWith(";") ? line : `${line};`}`);
      }
    }
    lines.push(`}`);
    if (includeHover && state.mode !== "flat") {
      lines.push(``);
      lines.push(`.${cls}:hover {`);
      lines.push(`  box-shadow: ${raisedShadows};`);
      lines.push(`  transform: translateY(-1px);`);
      lines.push(`}`);
    }
    if (includeActive && state.mode !== "flat") {
      lines.push(``);
      lines.push(`.${cls}:active {`);
      lines.push(`  box-shadow: ${pressedShadows};`);
      lines.push(`  transform: translateY(0);`);
      lines.push(`}`);
    }
    return lines.join("\n");
  }, [
    className,
    dims,
    extraCss,
    includeActive,
    includeHover,
    pressedShadows,
    raisedShadows,
    shadows,
    state.bg,
    state.mode,
    textColor,
  ]);

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    setState((prev) => ({ ...prev, ...DEFAULT, ...preset.state }));
    if (preset.shape) setShape(preset.shape);
    setFlashKey((k) => k + 1);
    toast.success(`Applied “${preset.label}”`);
  };

  const reset = () => {
    setActivePreset("raised");
    setState({ ...DEFAULT });
    setShape("soft");
    setFlashKey((k) => k + 1);
  };

  const copyShadows = async () => {
    try {
      await navigator.clipboard.writeText(shadows);
      toast.success("box-shadow value copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const previewShadows = demoPressed && state.mode !== "flat" ? pressedShadows : shadows;
  const lightPos = offsetFromAngle(1, state.angle);

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
                  Neumorphism
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Soft UI with light angle, intensity, and raised/pressed modes.
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
                href="/glassmorphism-generator"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Glassmorphism
              </Link>
              <Link
                href="/box-shadow-generator"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Box shadow
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
                {(
                  [
                    ["raised", "Raised"],
                    ["pressed", "Pressed"],
                    ["convex", "Convex"],
                    ["concave", "Concave"],
                    ["flat", "Flat"],
                  ] as const
                ).map(([id, name]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => patch("mode", id)}
                    className={cn(
                      "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                      state.mode === id
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30 hover:bg-muted/60"
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Surface
              </p>
              <Field label="Background">
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="color"
                    value={state.bg}
                    onChange={(e) => patch("bg", e.target.value)}
                    className="h-10 w-16 p-1"
                  />
                  <Input
                    value={state.bg}
                    onChange={(e) => patch("bg", e.target.value)}
                    className="h-10 max-w-[8rem] font-mono text-xs"
                    spellCheck={false}
                  />
                </div>
              </Field>
              <div className="flex flex-wrap gap-1.5">
                {SURFACE_SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    onClick={() => patch("bg", c)}
                    className={cn(
                      "h-7 w-7 rounded-full border-2 transition-transform hover:scale-105",
                      state.bg.toLowerCase() === c.toLowerCase()
                        ? "border-rose-500 ring-2 ring-rose-500/30"
                        : "border-border/50"
                    )}
                    style={{ background: c }}
                  />
                ))}
              </div>
              {(
                [
                  ["distance", "Distance", 0, 32, "px", state.distance],
                  ["blur", "Blur", 0, 60, "px", state.blur],
                  ["intensity", "Intensity", 4, 40, "%", state.intensity],
                  ["angle", "Light angle", 0, 360, "°", state.angle],
                ] as const
              ).map(([key, name, min, max, unit, value]) => (
                <Field key={key} label={`${name} · ${value}${unit}`}>
                  <Slider min={min} max={max} value={[value]} onValueChange={([n]) => patch(key, n)} />
                </Field>
              ))}
              <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/20 p-3">
                <div
                  className="relative h-14 w-14 rounded-full border border-border/60"
                  style={{ background: state.bg }}
                >
                  <span
                    className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400 shadow"
                    style={{
                      left: `${50 + lightPos.x * 38}%`,
                      top: `${50 + lightPos.y * 38}%`,
                    }}
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold">Light source</p>
                  <p className="text-[11px] text-muted-foreground">
                    Angle {state.angle}° · shadows follow this direction
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Shape & size
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["soft", "Soft"],
                    ["square", "Square"],
                    ["circle", "Circle"],
                    ["button", "Button"],
                    ["pill", "Pill"],
                  ] as const
                ).map(([id, name]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setShape(id)}
                    className={cn(
                      "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                      shape === id
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30 hover:bg-muted/60"
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
              {(
                [
                  ["width", "Width", 60, 320, "px", state.width],
                  ["height", "Height", 40, 320, "px", state.height],
                  ["radius", "Radius", 0, 100, "px", state.radius],
                ] as const
              ).map(([key, name, min, max, unit, value]) => (
                <Field key={key} label={`${name} · ${value}${unit}`}>
                  <Slider min={min} max={max} value={[value]} onValueChange={([n]) => patch(key, n)} />
                </Field>
              ))}
              <Field label="Label">
                <Input value={label} onChange={(e) => setLabel(e.target.value)} className="rounded-xl" />
              </Field>
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
                Include :hover raised state
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeActive}
                  onChange={(e) => setIncludeActive(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-rose-500"
                />
                Include :active pressed state
              </label>
              <Field label="Extra CSS">
                <Textarea
                  value={extraCss}
                  onChange={(e) => setExtraCss(e.target.value)}
                  placeholder="font-weight: 600;"
                  rows={2}
                  className="rounded-xl font-mono text-xs"
                  spellCheck={false}
                />
              </Field>
            </section>

            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="button" onClick={() => void copyShadows()}>
                <Copy className="h-4 w-4" />
                Copy box-shadow
              </PrimaryButton>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => applyPreset(PRESETS[0])}>
                <Sparkles className="h-3.5 w-3.5" />
                Raised
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
                  <p className="text-sm font-semibold">Live soft UI</p>
                  <p className="mt-0.5 max-w-xl truncate font-mono text-[11px] text-muted-foreground">
                    {shadows}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-full text-xs"
                  onMouseDown={() => setDemoPressed(true)}
                  onMouseUp={() => setDemoPressed(false)}
                  onMouseLeave={() => setDemoPressed(false)}
                  onTouchStart={() => setDemoPressed(true)}
                  onTouchEnd={() => setDemoPressed(false)}
                >
                  Hold to press
                </Button>
              </div>
            </div>
            <div className="p-3 sm:p-5">
              <div
                className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl sm:min-h-[400px]"
                style={{ background: state.bg }}
              >
                <AnimatePresence mode="wait">
                  <motion.button
                    key={`${shape}-${flashKey}`}
                    type="button"
                    initial={{ opacity: 0.9, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-[1] select-none text-sm font-semibold outline-none"
                    style={{
                      width: dims.width,
                      height: dims.height,
                      background: state.bg,
                      borderRadius: dims.radius >= 999 ? 9999 : dims.radius,
                      boxShadow: previewShadows,
                      color: textColor,
                      border: "none",
                    }}
                    onMouseDown={() => setDemoPressed(true)}
                    onMouseUp={() => setDemoPressed(false)}
                    onMouseLeave={() => setDemoPressed(false)}
                  >
                    {label}
                  </motion.button>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <CodeOutput
            value={css}
            filename="neumorphism.css"
            language="css"
            title="CSS output"
            eyebrow="Copy · Download"
            rows={16}
          />
        </div>
      </div>
    </div>
  );
}
