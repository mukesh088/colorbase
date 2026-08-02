"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RotateCcw, Sparkles, Wand2 } from "lucide-react";
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

type BtnState = {
  label: string;
  bg: string;
  bg2: string;
  useGradient: boolean;
  text: string;
  borderColor: string;
  borderWidth: number;
  borderStyle: string;
  radius: number;
  padX: number;
  padY: number;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  fontFamily: string;
  googleFont: string | null;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowColor: string;
  shadowOpacity: number;
  hoverLift: number;
  hoverBright: number;
  hoverScale: number;
  focusRing: number;
  focusColor: string;
  gap: number;
  icon: string;
  iconSide: "none" | "left" | "right";
  fullWidth: boolean;
  uppercaseTracking: boolean;
};

const DEFAULT: BtnState = {
  label: "Get started",
  bg: "#e11d48",
  bg2: "#be123c",
  useGradient: false,
  text: "#ffffff",
  borderColor: "#be123c",
  borderWidth: 0,
  borderStyle: "solid",
  radius: 12,
  padX: 28,
  padY: 14,
  fontSize: 15,
  fontWeight: 600,
  letterSpacing: 0,
  textTransform: "none",
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  googleFont: null,
  shadowX: 0,
  shadowY: 10,
  shadowBlur: 20,
  shadowSpread: -4,
  shadowColor: "#e11d48",
  shadowOpacity: 35,
  hoverLift: 2,
  hoverBright: 8,
  hoverScale: 0,
  focusRing: 3,
  focusColor: "#fb7185",
  gap: 8,
  icon: "→",
  iconSide: "right",
  fullWidth: false,
  uppercaseTracking: false,
};

type Preset = { id: string; label: string; state: Partial<BtnState> };

const PRESETS: Preset[] = [
  { id: "solid", label: "Solid", state: { ...DEFAULT, iconSide: "none" } },
  {
    id: "outline",
    label: "Outline",
    state: {
      bg: "#ffffff",
      text: "#e11d48",
      borderWidth: 2,
      borderColor: "#e11d48",
      shadowOpacity: 0,
      hoverBright: 0,
      useGradient: false,
      iconSide: "none",
    },
  },
  {
    id: "soft",
    label: "Soft",
    state: {
      bg: "#ffe4e6",
      text: "#be123c",
      borderWidth: 0,
      shadowOpacity: 0,
      hoverBright: 0,
      iconSide: "none",
    },
  },
  {
    id: "ghost",
    label: "Ghost",
    state: {
      bg: "transparent",
      text: "#e11d48",
      borderWidth: 0,
      shadowOpacity: 0,
      hoverBright: 0,
      iconSide: "none",
      label: "Learn more",
    },
  },
  {
    id: "gradient",
    label: "Gradient",
    state: {
      useGradient: true,
      bg: "#e11d48",
      bg2: "#a21caf",
      text: "#ffffff",
      shadowColor: "#c026d3",
      shadowOpacity: 40,
      iconSide: "none",
    },
  },
  {
    id: "pill",
    label: "Pill",
    state: {
      radius: 999,
      padX: 32,
      padY: 12,
      label: "Subscribe",
      iconSide: "none",
    },
  },
  {
    id: "neon",
    label: "Neon",
    state: {
      bg: "#0f172a",
      text: "#fb7185",
      borderWidth: 2,
      borderColor: "#fb7185",
      shadowColor: "#e11d48",
      shadowY: 0,
      shadowBlur: 22,
      shadowSpread: 0,
      shadowOpacity: 55,
      hoverLift: 0,
      hoverScale: 2,
      googleFont: "Space Grotesk",
      fontFamily: '"Space Grotesk", system-ui, sans-serif',
      letterSpacing: 1,
      textTransform: "uppercase",
      fontSize: 13,
      fontWeight: 700,
      iconSide: "none",
      label: "Neon CTA",
    },
  },
  {
    id: "3d",
    label: "3D",
    state: {
      bg: "#e11d48",
      text: "#ffffff",
      borderWidth: 0,
      shadowX: 0,
      shadowY: 6,
      shadowBlur: 0,
      shadowSpread: 0,
      shadowColor: "#9f1239",
      shadowOpacity: 100,
      hoverLift: 0,
      radius: 10,
      iconSide: "none",
      label: "Press me",
    },
  },
  {
    id: "glass",
    label: "Glass",
    state: {
      bg: "rgba(255,255,255,0.2)",
      text: "#0f172a",
      borderWidth: 1,
      borderColor: "#ffffff",
      shadowOpacity: 18,
      shadowColor: "#000000",
      radius: 16,
      iconSide: "none",
      label: "Frosted",
    },
  },
  {
    id: "danger",
    label: "Danger",
    state: {
      bg: "#dc2626",
      bg2: "#b91c1c",
      text: "#ffffff",
      shadowColor: "#dc2626",
      label: "Delete",
      icon: "✕",
      iconSide: "left",
    },
  },
  {
    id: "success",
    label: "Success",
    state: {
      bg: "#059669",
      bg2: "#047857",
      text: "#ffffff",
      shadowColor: "#059669",
      label: "Confirm",
      icon: "✓",
      iconSide: "left",
    },
  },
  {
    id: "link",
    label: "Link",
    state: {
      bg: "transparent",
      text: "#e11d48",
      borderWidth: 0,
      shadowOpacity: 0,
      padX: 4,
      padY: 4,
      hoverLift: 0,
      hoverBright: 0,
      icon: "→",
      iconSide: "right",
      label: "Continue",
      fontWeight: 500,
    },
  },
  {
    id: "icon",
    label: "With icon",
    state: {
      label: "Continue",
      icon: "→",
      iconSide: "right",
      gap: 10,
    },
  },
  {
    id: "serif",
    label: "Serif",
    state: {
      googleFont: "Playfair Display",
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 600,
      fontSize: 16,
      label: "Explore",
      radius: 4,
      iconSide: "none",
      bg: "#0f172a",
      text: "#f8fafc",
      shadowOpacity: 20,
      shadowColor: "#000000",
    },
  },
  {
    id: "mono",
    label: "Mono",
    state: {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      googleFont: null,
      fontSize: 13,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      label: "Run build",
      bg: "#18181b",
      text: "#fafafa",
      radius: 8,
      iconSide: "none",
      shadowOpacity: 0,
    },
  },
  {
    id: "rounded",
    label: "Friendly",
    state: {
      googleFont: "Nunito",
      fontFamily: '"Nunito", system-ui, sans-serif',
      fontWeight: 700,
      radius: 999,
      bg: "#f59e0b",
      text: "#422006",
      shadowColor: "#d97706",
      label: "Say hello",
      icon: "✦",
      iconSide: "left",
    },
  },
];

const FONT_OPTIONS: { id: string; label: string; family: string; google: string | null }[] = [
  { id: "system", label: "System", family: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", google: null },
  { id: "dm", label: "DM Sans", family: '"DM Sans", system-ui, sans-serif', google: "DM Sans" },
  { id: "inter", label: "Inter", family: 'Inter, system-ui, sans-serif', google: "Inter" },
  { id: "poppins", label: "Poppins", family: 'Poppins, system-ui, sans-serif', google: "Poppins" },
  { id: "space", label: "Space Grotesk", family: '"Space Grotesk", system-ui, sans-serif', google: "Space Grotesk" },
  { id: "nunito", label: "Nunito", family: 'Nunito, system-ui, sans-serif', google: "Nunito" },
  { id: "playfair", label: "Playfair", family: '"Playfair Display", Georgia, serif', google: "Playfair Display" },
  { id: "fraunces", label: "Fraunces", family: 'Fraunces, Georgia, serif', google: "Fraunces" },
  { id: "georgia", label: "Georgia", family: "Georgia, 'Times New Roman', serif", google: null },
  { id: "mono", label: "Mono", family: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", google: null },
];

function hexToRgb(hex: string) {
  if (hex.startsWith("rgba") || hex === "transparent") return { r: 0, g: 0, b: 0 };
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full || "000000", 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function hexToRgba(hex: string, alpha: number) {
  if (hex.startsWith("rgba") || hex === "transparent") return hex;
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 1000) / 1000})`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs sm:text-sm">{label}</Label>
      {children}
    </div>
  );
}

export function CssButtonGeneratorTool() {
  const [state, setState] = useState<BtnState>({ ...DEFAULT });
  const [activePreset, setActivePreset] = useState("solid");
  const [className, setClassName] = useState("btn");
  const [extraCss, setExtraCss] = useState("");
  const [includeDisabled, setIncludeDisabled] = useState(true);
  const [includeFocus, setIncludeFocus] = useState(true);
  const [previewBg, setPreviewBg] = useState<"light" | "dark" | "mesh">("light");
  const [demoDisabled, setDemoDisabled] = useState(false);

  const patch = <K extends keyof BtnState>(key: K, value: BtnState[K]) => {
    setActivePreset("custom");
    setState((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!state.googleFont) return;
    const id = `cb-btn-font-${state.googleFont.replace(/\s+/g, "-")}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(state.googleFont).replace(/%20/g, "+")}:wght@400;500;600;700;800&display=swap`;
    document.head.appendChild(link);
  }, [state.googleFont]);

  const background = state.useGradient
    ? `linear-gradient(135deg, ${state.bg}, ${state.bg2})`
    : state.bg;

  const boxShadow =
    state.shadowOpacity > 0
      ? `${state.shadowX}px ${state.shadowY}px ${state.shadowBlur}px ${state.shadowSpread}px ${hexToRgba(state.shadowColor, state.shadowOpacity / 100)}`
      : "none";

  const letterSpacing =
    state.uppercaseTracking && state.textTransform === "uppercase"
      ? Math.max(state.letterSpacing, 1)
      : state.letterSpacing;

  const css = useMemo(() => {
    const cls = className.trim() || "btn";
    const lines: string[] = [];

    if (state.googleFont) {
      lines.push(
        `@import url("https://fonts.googleapis.com/css2?family=${encodeURIComponent(state.googleFont).replace(/%20/g, "+")}:wght@400;500;600;700;800&display=swap");`
      );
      lines.push(``);
    }

    lines.push(`.${cls} {`);
    lines.push(`  display: inline-flex;`);
    lines.push(`  align-items: center;`);
    lines.push(`  justify-content: center;`);
    lines.push(`  gap: ${state.gap}px;`);
    if (state.fullWidth) lines.push(`  width: 100%;`);
    lines.push(`  background: ${background};`);
    lines.push(`  color: ${state.text};`);
    lines.push(`  border: ${state.borderWidth}px ${state.borderStyle} ${state.borderColor};`);
    lines.push(`  border-radius: ${state.radius >= 999 ? "9999px" : `${state.radius}px`};`);
    lines.push(`  padding: ${state.padY}px ${state.padX}px;`);
    lines.push(`  font-family: ${state.fontFamily};`);
    lines.push(`  font-size: ${state.fontSize}px;`);
    lines.push(`  font-weight: ${state.fontWeight};`);
    lines.push(`  letter-spacing: ${letterSpacing}px;`);
    lines.push(`  text-transform: ${state.textTransform};`);
    lines.push(`  line-height: 1.2;`);
    lines.push(`  text-decoration: none;`);
    lines.push(`  cursor: pointer;`);
    lines.push(`  box-shadow: ${boxShadow};`);
    lines.push(
      `  transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;`
    );
    if (extraCss.trim()) {
      for (const raw of extraCss.split("\n")) {
        const line = raw.trim();
        if (!line) continue;
        lines.push(`  ${line.endsWith(";") ? line : `${line};`}`);
      }
    }
    lines.push(`}`);
    lines.push(``);
    lines.push(`.${cls}:hover {`);
    const hoverParts: string[] = [];
    if (state.hoverLift) hoverParts.push(`translateY(-${state.hoverLift}px)`);
    if (state.hoverScale) hoverParts.push(`scale(${1 + state.hoverScale / 100})`);
    if (hoverParts.length) lines.push(`  transform: ${hoverParts.join(" ")};`);
    if (state.hoverBright) lines.push(`  filter: brightness(${(100 + state.hoverBright) / 100});`);
    if (state.bg === "transparent" || state.bg.startsWith("rgba")) {
      lines.push(`  background: ${hexToRgba("#e11d48", 0.08)};`);
    }
    lines.push(`}`);
    lines.push(``);
    lines.push(`.${cls}:active {`);
    lines.push(`  transform: translateY(0) scale(0.98);`);
    lines.push(`  filter: brightness(0.96);`);
    lines.push(`}`);

    if (includeFocus) {
      lines.push(``);
      lines.push(`.${cls}:focus-visible {`);
      lines.push(`  outline: ${state.focusRing}px solid ${state.focusColor};`);
      lines.push(`  outline-offset: 2px;`);
      lines.push(`}`);
    }

    if (includeDisabled) {
      lines.push(``);
      lines.push(`.${cls}:disabled,`);
      lines.push(`.${cls}[aria-disabled="true"] {`);
      lines.push(`  opacity: 0.5;`);
      lines.push(`  cursor: not-allowed;`);
      lines.push(`  transform: none;`);
      lines.push(`  filter: none;`);
      lines.push(`  box-shadow: none;`);
      lines.push(`}`);
    }

    return lines.join("\n");
  }, [
    background,
    boxShadow,
    className,
    extraCss,
    includeDisabled,
    includeFocus,
    letterSpacing,
    state,
  ]);

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    setState({ ...DEFAULT, ...preset.state });
    toast.success(`Applied “${preset.label}”`);
  };

  const reset = () => {
    setActivePreset("solid");
    setState({ ...DEFAULT });
  };

  const setFont = (opt: (typeof FONT_OPTIONS)[number]) => {
    setActivePreset("custom");
    setState((prev) => ({
      ...prev,
      fontFamily: opt.family,
      googleFont: opt.google,
    }));
  };

  const previewStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: state.gap,
    width: state.fullWidth ? "100%" : undefined,
    maxWidth: "100%",
    background,
    color: state.text,
    border: `${state.borderWidth}px ${state.borderStyle} ${state.borderColor}`,
    borderRadius: state.radius >= 999 ? 9999 : state.radius,
    padding: `${state.padY}px ${state.padX}px`,
    fontFamily: state.fontFamily,
    fontSize: state.fontSize,
    fontWeight: state.fontWeight,
    letterSpacing,
    textTransform: state.textTransform,
    lineHeight: 1.2,
    boxShadow: demoDisabled ? "none" : boxShadow,
    cursor: demoDisabled ? "not-allowed" : "pointer",
    opacity: demoDisabled ? 0.5 : 1,
    transition: "transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
  };

  const stageClass =
    previewBg === "dark"
      ? "bg-slate-900"
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
                  CSS Button
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Presets, typography, hover, focus, and export-ready CSS.
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
                href="/css-animation-generator"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Animation
              </Link>
              <Button type="button" size="sm" variant="ghost" className="h-8 rounded-full" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>

            <section className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Button types
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
                Content
              </p>
              <Field label="Label">
                <Input value={state.label} onChange={(e) => patch("label", e.target.value)} className="rounded-xl" />
              </Field>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["none", "No icon"],
                    ["left", "Icon left"],
                    ["right", "Icon right"],
                  ] as const
                ).map(([id, name]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => patch("iconSide", id)}
                    className={cn(
                      "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                      state.iconSide === id
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30"
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
              {state.iconSide !== "none" && (
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Icon">
                    <Input value={state.icon} onChange={(e) => patch("icon", e.target.value)} className="rounded-xl" />
                  </Field>
                  <Field label={`Gap · ${state.gap}px`}>
                    <Slider min={0} max={24} value={[state.gap]} onValueChange={([n]) => patch("gap", n)} />
                  </Field>
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={state.fullWidth}
                  onChange={(e) => patch("fullWidth", e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-rose-500"
                />
                Full width
              </label>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Font & type
              </p>
              <div className="flex flex-wrap gap-1.5">
                {FONT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFont(opt)}
                    className={cn(
                      "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                      state.fontFamily === opt.family
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30 hover:bg-muted/60"
                    )}
                    style={{ fontFamily: opt.family }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <Field label={`Size · ${state.fontSize}px`}>
                <Slider min={11} max={28} value={[state.fontSize]} onValueChange={([n]) => patch("fontSize", n)} />
              </Field>
              <Field label={`Weight · ${state.fontWeight}`}>
                <Slider
                  min={400}
                  max={800}
                  step={100}
                  value={[state.fontWeight]}
                  onValueChange={([n]) => patch("fontWeight", n)}
                />
              </Field>
              <Field label={`Letter spacing · ${letterSpacing}px`}>
                <Slider
                  min={-1}
                  max={6}
                  step={0.5}
                  value={[state.letterSpacing]}
                  onValueChange={([n]) => patch("letterSpacing", n)}
                />
              </Field>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["none", "Aa"],
                    ["uppercase", "AA"],
                    ["lowercase", "aa"],
                    ["capitalize", "Aa Bb"],
                  ] as const
                ).map(([id, name]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => patch("textTransform", id)}
                    className={cn(
                      "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                      state.textTransform === id
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30"
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Style
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Background">
                  <Input
                    type="color"
                    value={state.bg.startsWith("#") ? state.bg : "#e11d48"}
                    onChange={(e) => patch("bg", e.target.value)}
                    className="h-10 w-full p-1"
                  />
                </Field>
                <Field label="Text">
                  <Input type="color" value={state.text} onChange={(e) => patch("text", e.target.value)} className="h-10 w-full p-1" />
                </Field>
                <Field label="Border">
                  <Input
                    type="color"
                    value={state.borderColor.startsWith("#") ? state.borderColor : "#e11d48"}
                    onChange={(e) => patch("borderColor", e.target.value)}
                    className="h-10 w-full p-1"
                  />
                </Field>
                <Field label="Shadow">
                  <Input
                    type="color"
                    value={state.shadowColor.startsWith("#") ? state.shadowColor : "#000000"}
                    onChange={(e) => patch("shadowColor", e.target.value)}
                    className="h-10 w-full p-1"
                  />
                </Field>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={state.useGradient}
                  onChange={(e) => patch("useGradient", e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-rose-500"
                />
                Gradient background
              </label>
              {state.useGradient && (
                <Field label="Gradient end">
                  <Input type="color" value={state.bg2} onChange={(e) => patch("bg2", e.target.value)} className="h-10 w-full max-w-[8rem] p-1" />
                </Field>
              )}
              {(
                [
                  ["padX", "Padding X", 4, 72, "px", state.padX],
                  ["padY", "Padding Y", 4, 40, "px", state.padY],
                  ["radius", "Radius", 0, 48, "px", state.radius],
                  ["borderWidth", "Border width", 0, 6, "px", state.borderWidth],
                  ["shadowY", "Shadow Y", 0, 32, "px", state.shadowY],
                  ["shadowBlur", "Shadow blur", 0, 48, "px", state.shadowBlur],
                  ["shadowOpacity", "Shadow opacity", 0, 100, "%", state.shadowOpacity],
                ] as const
              ).map(([key, label, min, max, unit, value]) => (
                <Field key={key} label={`${label} · ${value}${unit}`}>
                  <Slider min={min} max={max} value={[value]} onValueChange={([n]) => patch(key, n)} />
                </Field>
              ))}
              <div className="flex flex-wrap gap-1.5">
                {["solid", "dashed", "dotted", "double"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => patch("borderStyle", s)}
                    className={cn(
                      "rounded-full border px-2.5 py-1.5 text-[11px] font-medium capitalize",
                      state.borderStyle === s
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30"
                    )}
                  >
                    {s}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => patch("radius", 999)}
                  className={cn(
                    "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                    state.radius >= 999
                      ? "border-rose-500/50 bg-rose-500 text-white"
                      : "border-border/60 bg-muted/30"
                  )}
                >
                  Pill radius
                </button>
              </div>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Interaction
              </p>
              <Field label={`Hover lift · ${state.hoverLift}px`}>
                <Slider min={0} max={8} value={[state.hoverLift]} onValueChange={([n]) => patch("hoverLift", n)} />
              </Field>
              <Field label={`Hover brightness · +${state.hoverBright}%`}>
                <Slider min={0} max={20} value={[state.hoverBright]} onValueChange={([n]) => patch("hoverBright", n)} />
              </Field>
              <Field label={`Hover scale · +${state.hoverScale}%`}>
                <Slider min={0} max={8} value={[state.hoverScale]} onValueChange={([n]) => patch("hoverScale", n)} />
              </Field>
              <Field label={`Focus ring · ${state.focusRing}px`}>
                <Slider min={0} max={6} value={[state.focusRing]} onValueChange={([n]) => patch("focusRing", n)} />
              </Field>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeFocus}
                  onChange={(e) => setIncludeFocus(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-rose-500"
                />
                Include :focus-visible
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeDisabled}
                  onChange={(e) => setIncludeDisabled(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-rose-500"
                />
                Include :disabled
              </label>
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
                  placeholder="min-width: 140px;"
                  rows={2}
                  className="rounded-xl font-mono text-xs"
                  spellCheck={false}
                />
              </Field>
            </section>

            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="button" onClick={() => applyPreset(PRESETS[0])}>
                <Sparkles className="h-4 w-4" />
                Solid preset
              </PrimaryButton>
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
                  <p className="text-sm font-semibold">Hover · focus · press</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      ["light", "Light"],
                      ["dark", "Dark"],
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
                  <button
                    type="button"
                    onClick={() => setDemoDisabled((d) => !d)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                      demoDisabled
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30"
                    )}
                  >
                    Disabled
                  </button>
                </div>
              </div>
            </div>
            <div className="p-3 sm:p-5">
              <div className={cn("flex min-h-[280px] items-center justify-center rounded-2xl p-8 sm:min-h-[340px]", stageClass)}>
                <button
                  type="button"
                  disabled={demoDisabled}
                  className="outline-none"
                  style={previewStyle}
                  onMouseEnter={(e) => {
                    if (demoDisabled) return;
                    const el = e.currentTarget;
                    const parts: string[] = [];
                    if (state.hoverLift) parts.push(`translateY(-${state.hoverLift}px)`);
                    if (state.hoverScale) parts.push(`scale(${1 + state.hoverScale / 100})`);
                    el.style.transform = parts.join(" ") || "";
                    if (state.hoverBright) el.style.filter = `brightness(${(100 + state.hoverBright) / 100})`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.filter = "";
                  }}
                  onMouseDown={(e) => {
                    if (demoDisabled) return;
                    e.currentTarget.style.transform = "translateY(0) scale(0.98)";
                  }}
                  onMouseUp={(e) => {
                    if (demoDisabled) return;
                    const parts: string[] = [];
                    if (state.hoverLift) parts.push(`translateY(-${state.hoverLift}px)`);
                    if (state.hoverScale) parts.push(`scale(${1 + state.hoverScale / 100})`);
                    e.currentTarget.style.transform = parts.join(" ") || "";
                  }}
                  onFocus={(e) => {
                    if (!includeFocus || !state.focusRing) return;
                    e.currentTarget.style.outline = `${state.focusRing}px solid ${state.focusColor}`;
                    e.currentTarget.style.outlineOffset = "2px";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = "none";
                  }}
                >
                  {state.iconSide === "left" && <span aria-hidden>{state.icon}</span>}
                  <span>{state.label}</span>
                  {state.iconSide === "right" && <span aria-hidden>{state.icon}</span>}
                </button>
              </div>
            </div>
          </div>

          <CodeOutput
            value={css}
            filename="button.css"
            language="css"
            title="CSS output"
            eyebrow="Copy · Download"
            rows={20}
          />
        </div>
      </div>
    </div>
  );
}
