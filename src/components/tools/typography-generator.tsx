"use client";

import { useEffect, useMemo, useState } from "react";
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

type TypeState = {
  fontFamily: string;
  googleFont: string | null;
  fontSize: number;
  sizeUnit: "px" | "rem";
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  textAlign: "left" | "center" | "right" | "justify";
  fontStyle: "normal" | "italic";
  textDecoration: "none" | "underline" | "line-through";
  color: string;
  paragraphWidth: number;
};

const DEFAULT: TypeState = {
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  googleFont: null,
  fontSize: 18,
  sizeUnit: "px",
  fontWeight: 400,
  lineHeight: 1.6,
  letterSpacing: 0,
  wordSpacing: 0,
  textTransform: "none",
  textAlign: "left",
  fontStyle: "normal",
  textDecoration: "none",
  color: "#0f172a",
  paragraphWidth: 42,
};

type Preset = { id: string; label: string; state: Partial<TypeState>; sample?: string };

const PRESETS: Preset[] = [
  {
    id: "display",
    label: "Display",
    state: {
      fontSize: 56,
      fontWeight: 700,
      lineHeight: 1.05,
      letterSpacing: -1.2,
      googleFont: "Fraunces",
      fontFamily: "Fraunces, Georgia, serif",
      color: "#0f172a",
    },
    sample: "Make it unforgettable",
  },
  {
    id: "h1",
    label: "Heading 1",
    state: {
      fontSize: 40,
      fontWeight: 700,
      lineHeight: 1.15,
      letterSpacing: -0.6,
      googleFont: "DM Sans",
      fontFamily: '"DM Sans", system-ui, sans-serif',
    },
    sample: "Design systems that scale",
  },
  {
    id: "h2",
    label: "Heading 2",
    state: {
      fontSize: 28,
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: -0.3,
      googleFont: "DM Sans",
      fontFamily: '"DM Sans", system-ui, sans-serif',
    },
    sample: "Clear hierarchy guides readers",
  },
  {
    id: "h3",
    label: "Heading 3",
    state: {
      fontSize: 22,
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: -0.1,
      googleFont: "Inter",
      fontFamily: "Inter, system-ui, sans-serif",
    },
    sample: "Section label with presence",
  },
  {
    id: "body",
    label: "Body",
    state: {
      fontSize: 17,
      fontWeight: 400,
      lineHeight: 1.65,
      letterSpacing: 0,
      googleFont: "Inter",
      fontFamily: "Inter, system-ui, sans-serif",
      paragraphWidth: 65,
    },
    sample:
      "Typography sets the voice of a product. Size, weight, leading, and tracking work together so every line feels intentional — from headlines to long-form reading.",
  },
  {
    id: "lead",
    label: "Lead",
    state: {
      fontSize: 20,
      fontWeight: 400,
      lineHeight: 1.55,
      letterSpacing: -0.1,
      googleFont: "Inter",
      fontFamily: "Inter, system-ui, sans-serif",
      color: "#334155",
      paragraphWidth: 55,
    },
    sample: "A short lead paragraph introduces the story with a slightly larger size and softer color.",
  },
  {
    id: "caption",
    label: "Caption",
    state: {
      fontSize: 13,
      fontWeight: 500,
      lineHeight: 1.45,
      letterSpacing: 0.2,
      color: "#64748b",
      googleFont: "Inter",
      fontFamily: "Inter, system-ui, sans-serif",
    },
    sample: "Photo caption · supporting detail under imagery",
  },
  {
    id: "label",
    label: "UI label",
    state: {
      fontSize: 12,
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      googleFont: "Space Grotesk",
      fontFamily: '"Space Grotesk", system-ui, sans-serif',
      color: "#e11d48",
    },
    sample: "Workspace",
  },
  {
    id: "quote",
    label: "Quote",
    state: {
      fontSize: 24,
      fontWeight: 500,
      lineHeight: 1.45,
      letterSpacing: -0.2,
      fontStyle: "italic",
      googleFont: "Playfair Display",
      fontFamily: '"Playfair Display", Georgia, serif',
      paragraphWidth: 48,
    },
    sample: "“Good typography is invisible until it isn’t — then it becomes the entire experience.”",
  },
  {
    id: "code",
    label: "Code",
    state: {
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.55,
      letterSpacing: 0,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      googleFont: null,
      color: "#0f172a",
    },
    sample: "const size = clamp(1rem, 2.5vw, 2rem);",
  },
  {
    id: "serif-body",
    label: "Serif body",
    state: {
      fontSize: 18,
      fontWeight: 400,
      lineHeight: 1.7,
      letterSpacing: 0.1,
      googleFont: "Libre Baskerville",
      fontFamily: '"Libre Baskerville", Georgia, serif',
      paragraphWidth: 60,
    },
    sample:
      "Serif text invites slower reading. Pair generous line-height with a measured measure for long articles and essays.",
  },
  {
    id: "friendly",
    label: "Friendly",
    state: {
      fontSize: 18,
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: 0,
      googleFont: "Nunito",
      fontFamily: "Nunito, system-ui, sans-serif",
      color: "#0f172a",
    },
    sample: "Warm, rounded type for approachable product UI.",
  },
];

const FONT_OPTIONS: { id: string; label: string; family: string; google: string | null }[] = [
  { id: "system", label: "System", family: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", google: null },
  { id: "dm", label: "DM Sans", family: '"DM Sans", system-ui, sans-serif', google: "DM Sans" },
  { id: "inter", label: "Inter", family: "Inter, system-ui, sans-serif", google: "Inter" },
  { id: "poppins", label: "Poppins", family: "Poppins, system-ui, sans-serif", google: "Poppins" },
  { id: "space", label: "Space Grotesk", family: '"Space Grotesk", system-ui, sans-serif', google: "Space Grotesk" },
  { id: "nunito", label: "Nunito", family: "Nunito, system-ui, sans-serif", google: "Nunito" },
  { id: "fraunces", label: "Fraunces", family: "Fraunces, Georgia, serif", google: "Fraunces" },
  { id: "playfair", label: "Playfair", family: '"Playfair Display", Georgia, serif', google: "Playfair Display" },
  { id: "libre", label: "Libre Baskerville", family: '"Libre Baskerville", Georgia, serif', google: "Libre Baskerville" },
  { id: "georgia", label: "Georgia", family: "Georgia, 'Times New Roman', serif", google: null },
  { id: "mono", label: "Mono", family: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", google: null },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs sm:text-sm">{label}</Label>
      {children}
    </div>
  );
}

export function TypographyGeneratorTool() {
  const [state, setState] = useState<TypeState>({
    ...DEFAULT,
    ...PRESETS[1].state,
  });
  const [activePreset, setActivePreset] = useState("h1");
  const [sample, setSample] = useState(PRESETS[1].sample ?? "");
  const [className, setClassName] = useState("type");
  const [extraCss, setExtraCss] = useState("");
  const [asVariable, setAsVariable] = useState(false);
  const [previewBg, setPreviewBg] = useState<"light" | "dark" | "paper">("light");
  const [specimen, setSpecimen] = useState<"sample" | "alphabet" | "paragraph">("sample");

  const patch = <K extends keyof TypeState>(key: K, value: TypeState[K]) => {
    setActivePreset("custom");
    setState((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!state.googleFont) return;
    const id = `cb-type-font-${state.googleFont.replace(/\s+/g, "-")}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(state.googleFont).replace(/%20/g, "+")}:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700&display=swap`;
    document.head.appendChild(link);
  }, [state.googleFont]);

  const sizeValue = `${state.fontSize}${state.sizeUnit}`;
  const tracking = `${state.letterSpacing}px`;
  const wordSpace = `${state.wordSpacing}px`;

  const css = useMemo(() => {
    const cls = className.trim() || "type";
    const lines: string[] = [];
    if (state.googleFont) {
      lines.push(
        `@import url("https://fonts.googleapis.com/css2?family=${encodeURIComponent(state.googleFont).replace(/%20/g, "+")}:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700&display=swap");`
      );
      lines.push(``);
    }
    if (asVariable) {
      lines.push(`:root {`);
      lines.push(`  --type-font: ${state.fontFamily};`);
      lines.push(`  --type-size: ${sizeValue};`);
      lines.push(`  --type-weight: ${state.fontWeight};`);
      lines.push(`  --type-leading: ${state.lineHeight};`);
      lines.push(`  --type-tracking: ${tracking};`);
      lines.push(`  --type-color: ${state.color};`);
      lines.push(`}`);
      lines.push(``);
    }
    lines.push(`.${cls} {`);
    lines.push(`  font-family: ${asVariable ? "var(--type-font)" : state.fontFamily};`);
    lines.push(`  font-size: ${asVariable ? "var(--type-size)" : sizeValue};`);
    lines.push(`  font-weight: ${asVariable ? "var(--type-weight)" : state.fontWeight};`);
    lines.push(`  line-height: ${asVariable ? "var(--type-leading)" : state.lineHeight};`);
    lines.push(`  letter-spacing: ${asVariable ? "var(--type-tracking)" : tracking};`);
    if (state.wordSpacing !== 0) lines.push(`  word-spacing: ${wordSpace};`);
    lines.push(`  text-transform: ${state.textTransform};`);
    lines.push(`  text-align: ${state.textAlign};`);
    lines.push(`  font-style: ${state.fontStyle};`);
    lines.push(`  text-decoration: ${state.textDecoration};`);
    lines.push(`  color: ${asVariable ? "var(--type-color)" : state.color};`);
    if (extraCss.trim()) {
      for (const raw of extraCss.split("\n")) {
        const line = raw.trim();
        if (!line) continue;
        lines.push(`  ${line.endsWith(";") ? line : `${line};`}`);
      }
    }
    lines.push(`}`);
    return lines.join("\n");
  }, [asVariable, className, extraCss, sizeValue, state, tracking, wordSpace]);

  const previewStyle: React.CSSProperties = {
    fontFamily: state.fontFamily,
    fontSize: sizeValue,
    fontWeight: state.fontWeight,
    lineHeight: state.lineHeight,
    letterSpacing: tracking,
    wordSpacing: wordSpace,
    textTransform: state.textTransform,
    textAlign: state.textAlign,
    fontStyle: state.fontStyle,
    textDecoration: state.textDecoration,
    color: previewBg === "dark" ? (state.color === "#0f172a" || state.color === "#334155" ? "#f8fafc" : state.color) : state.color,
    maxWidth: `${state.paragraphWidth}ch`,
    width: "100%",
  };

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    setState({ ...DEFAULT, ...preset.state });
    if (preset.sample) setSample(preset.sample);
    toast.success(`Applied “${preset.label}”`);
  };

  const reset = () => {
    setActivePreset("h1");
    setState({ ...DEFAULT, ...PRESETS[1].state });
    setSample(PRESETS[1].sample ?? "");
  };

  const setFont = (opt: (typeof FONT_OPTIONS)[number]) => {
    setActivePreset("custom");
    setState((prev) => ({ ...prev, fontFamily: opt.family, googleFont: opt.google }));
  };

  const copyStack = async () => {
    try {
      await navigator.clipboard.writeText(state.fontFamily);
      toast.success("font-family copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const stageClass =
    previewBg === "dark"
      ? "bg-slate-900 text-slate-50"
      : previewBg === "paper"
        ? "bg-[#f7f3eb] text-slate-900"
        : "bg-muted/30";

  const displayText =
    specimen === "alphabet"
      ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz\n0123456789"
      : specimen === "paragraph"
        ? "Typography is the craft of arranging type so language is clear, inviting, and alive. Adjust size, weight, leading, and tracking until the rhythm of each line feels inevitable."
        : sample;

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
                  Typography
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Fonts, scale, leading, tracking, and export-ready CSS.
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
                href="/css-clamp-generator"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Fluid clamp
              </Link>
              <Link
                href="/text-shadow-generator"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Text shadow
              </Link>
              <Button type="button" size="sm" variant="ghost" className="h-8 rounded-full" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>

            <section className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Type presets
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
                Font
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
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Scale & rhythm
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
              <Field label={`Size · ${state.fontSize}${state.sizeUnit}`}>
                <Slider
                  min={state.sizeUnit === "rem" ? 0.6 : 10}
                  max={state.sizeUnit === "rem" ? 6 : 96}
                  step={state.sizeUnit === "rem" ? 0.05 : 1}
                  value={[state.fontSize]}
                  onValueChange={([n]) => patch("fontSize", Number(n.toFixed(2)))}
                />
              </Field>
              <Field label={`Weight · ${state.fontWeight}`}>
                <Slider
                  min={100}
                  max={900}
                  step={100}
                  value={[state.fontWeight]}
                  onValueChange={([n]) => patch("fontWeight", n)}
                />
              </Field>
              <Field label={`Line height · ${state.lineHeight}`}>
                <Slider
                  min={0.9}
                  max={2.4}
                  step={0.05}
                  value={[state.lineHeight]}
                  onValueChange={([n]) => patch("lineHeight", Number(n.toFixed(2)))}
                />
              </Field>
              <Field label={`Letter spacing · ${state.letterSpacing}px`}>
                <Slider
                  min={-3}
                  max={8}
                  step={0.1}
                  value={[state.letterSpacing]}
                  onValueChange={([n]) => patch("letterSpacing", Number(n.toFixed(1)))}
                />
              </Field>
              <Field label={`Word spacing · ${state.wordSpacing}px`}>
                <Slider
                  min={-2}
                  max={16}
                  step={0.5}
                  value={[state.wordSpacing]}
                  onValueChange={([n]) => patch("wordSpacing", Number(n.toFixed(1)))}
                />
              </Field>
              <Field label={`Measure · ${state.paragraphWidth}ch`}>
                <Slider
                  min={28}
                  max={80}
                  value={[state.paragraphWidth]}
                  onValueChange={([n]) => patch("paragraphWidth", n)}
                />
              </Field>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Style
              </p>
              <Field label="Color">
                <Input type="color" value={state.color.startsWith("#") ? state.color : "#0f172a"} onChange={(e) => patch("color", e.target.value)} className="h-10 w-full max-w-[8rem] p-1" />
              </Field>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["none", "Aa"],
                    ["uppercase", "AA"],
                    ["lowercase", "aa"],
                    ["capitalize", "Title"],
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
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["left", "Left"],
                    ["center", "Center"],
                    ["right", "Right"],
                    ["justify", "Justify"],
                  ] as const
                ).map(([id, name]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => patch("textAlign", id)}
                    className={cn(
                      "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                      state.textAlign === id
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30"
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => patch("fontStyle", state.fontStyle === "italic" ? "normal" : "italic")}
                  className={cn(
                    "rounded-full border px-2.5 py-1.5 text-[11px] font-medium italic",
                    state.fontStyle === "italic"
                      ? "border-rose-500/50 bg-rose-500 text-white"
                      : "border-border/60 bg-muted/30"
                  )}
                >
                  Italic
                </button>
                {(
                  [
                    ["none", "None"],
                    ["underline", "Underline"],
                    ["line-through", "Strike"],
                  ] as const
                ).map(([id, name]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => patch("textDecoration", id)}
                    className={cn(
                      "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                      state.textDecoration === id
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
                Content & output
              </p>
              <Field label="Sample text">
                <Textarea
                  value={sample}
                  onChange={(e) => setSample(e.target.value)}
                  rows={3}
                  className="rounded-xl text-sm"
                />
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
                  checked={asVariable}
                  onChange={(e) => setAsVariable(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-rose-500"
                />
                Export CSS variables
              </label>
              <Field label="Extra CSS">
                <Textarea
                  value={extraCss}
                  onChange={(e) => setExtraCss(e.target.value)}
                  placeholder="max-width: 65ch;"
                  rows={2}
                  className="rounded-xl font-mono text-xs"
                  spellCheck={false}
                />
              </Field>
            </section>

            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="button" onClick={() => void copyStack()}>
                <Copy className="h-4 w-4" />
                Copy font stack
              </PrimaryButton>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => applyPreset(PRESETS[0])}>
                <Sparkles className="h-3.5 w-3.5" />
                Display
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
                  <p className="text-sm font-semibold">Type specimen</p>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {sizeValue} · {state.fontWeight} · lh {state.lineHeight} · {state.paragraphWidth}ch
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      ["sample", "Sample"],
                      ["alphabet", "Alphabet"],
                      ["paragraph", "Paragraph"],
                    ] as const
                  ).map(([id, name]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSpecimen(id)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                        specimen === id
                          ? "border-rose-500/50 bg-rose-500 text-white"
                          : "border-border/60 bg-muted/30"
                      )}
                    >
                      {name}
                    </button>
                  ))}
                  {(
                    [
                      ["light", "Light"],
                      ["paper", "Paper"],
                      ["dark", "Dark"],
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
              <div className={cn("flex min-h-[280px] items-center justify-center rounded-2xl p-6 sm:min-h-[360px] sm:p-10", stageClass)}>
                <p style={previewStyle} className="whitespace-pre-wrap break-words">
                  {displayText}
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ["Size", sizeValue],
                  ["Weight", String(state.fontWeight)],
                  ["Leading", String(state.lineHeight)],
                  ["Tracking", tracking],
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
            filename="typography.css"
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
