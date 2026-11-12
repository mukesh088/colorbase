"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Copy, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { CodeOutput } from "@/components/tools/suite/code-output";
import { PrimaryButton } from "@/components/tools/suite/workbench";
import { cn } from "@/lib/utils";
import "./typography-generator.css";

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
  fontFamily: '"DM Sans", system-ui, sans-serif',
  googleFont: "DM Sans",
  fontSize: 40,
  sizeUnit: "px",
  fontWeight: 700,
  lineHeight: 1.15,
  letterSpacing: -0.6,
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
      paragraphWidth: 28,
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
      googleFont: "Outfit",
      fontFamily: "Outfit, system-ui, sans-serif",
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
      fontSize: 26,
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: -0.2,
      fontStyle: "italic",
      googleFont: "Playfair Display",
      fontFamily: '"Playfair Display", Georgia, serif',
      paragraphWidth: 42,
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
      paragraphWidth: 70,
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
    id: "editorial",
    label: "Editorial",
    state: {
      fontSize: 48,
      fontWeight: 600,
      lineHeight: 1.08,
      letterSpacing: -1.4,
      googleFont: "Instrument Serif",
      fontFamily: '"Instrument Serif", Georgia, serif',
      color: "#111827",
      paragraphWidth: 24,
    },
    sample: "Quiet confidence on every line",
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

const FONT_OPTIONS: { id: string; label: string; family: string; google: string | null; sample: string }[] = [
  { id: "system", label: "System", family: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", google: null, sample: "Aa" },
  { id: "dm", label: "DM Sans", family: '"DM Sans", system-ui, sans-serif', google: "DM Sans", sample: "Aa" },
  { id: "inter", label: "Inter", family: "Inter, system-ui, sans-serif", google: "Inter", sample: "Aa" },
  { id: "outfit", label: "Outfit", family: "Outfit, system-ui, sans-serif", google: "Outfit", sample: "Aa" },
  { id: "poppins", label: "Poppins", family: "Poppins, system-ui, sans-serif", google: "Poppins", sample: "Aa" },
  { id: "space", label: "Space Grotesk", family: '"Space Grotesk", system-ui, sans-serif', google: "Space Grotesk", sample: "Aa" },
  { id: "nunito", label: "Nunito", family: "Nunito, system-ui, sans-serif", google: "Nunito", sample: "Aa" },
  { id: "syne", label: "Syne", family: "Syne, system-ui, sans-serif", google: "Syne", sample: "Aa" },
  { id: "fraunces", label: "Fraunces", family: "Fraunces, Georgia, serif", google: "Fraunces", sample: "Aa" },
  { id: "instrument", label: "Instrument", family: '"Instrument Serif", Georgia, serif', google: "Instrument Serif", sample: "Aa" },
  { id: "playfair", label: "Playfair", family: '"Playfair Display", Georgia, serif', google: "Playfair Display", sample: "Aa" },
  { id: "libre", label: "Libre Baskerville", family: '"Libre Baskerville", Georgia, serif', google: "Libre Baskerville", sample: "Aa" },
  { id: "georgia", label: "Georgia", family: "Georgia, 'Times New Roman', serif", google: null, sample: "Aa" },
  { id: "mono", label: "Mono", family: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", google: null, sample: "Aa" },
];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button type="button" onClick={onClick} className={cn("type-studio-chip", active && "is-active", className)}>
      {children}
    </button>
  );
}

export function TypographyGeneratorTool() {
  const [state, setState] = useState<TypeState>({ ...DEFAULT });
  const [activePreset, setActivePreset] = useState("h1");
  const [sample, setSample] = useState(PRESETS[1].sample ?? "");
  const [className, setClassName] = useState("type");
  const [extraCss, setExtraCss] = useState("");
  const [asVariable, setAsVariable] = useState(false);
  const [previewBg, setPreviewBg] = useState<"light" | "dark" | "paper">("light");
  const [specimen, setSpecimen] = useState<"sample" | "alphabet" | "paragraph" | "scale">("sample");

  const patch = <K extends keyof TypeState>(key: K, value: TypeState[K]) => {
    setActivePreset("custom");
    setState((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const fonts = new Set(
      [...FONT_OPTIONS.map((f) => f.google), ...PRESETS.map((p) => p.state.googleFont)].filter(Boolean) as string[]
    );
    fonts.forEach((font) => {
      const id = `cb-type-font-${font.replace(/\s+/g, "-")}`;
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font).replace(/%20/g, "+")}:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700&display=swap`;
      document.head.appendChild(link);
    });
  }, []);

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

  const previewColor =
    previewBg === "dark" && (state.color === "#0f172a" || state.color === "#334155" || state.color === "#111827")
      ? "#f8fafc"
      : state.color;

  const previewStyle: CSSProperties = {
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
    color: previewColor,
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
    setState({ ...DEFAULT });
    setSample(PRESETS[1].sample ?? "");
    setExtraCss("");
    setAsVariable(false);
    setClassName("type");
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

  const displayText =
    specimen === "alphabet"
      ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz\n0123456789 !?&@"
      : specimen === "paragraph"
        ? "Typography is the craft of arranging type so language is clear, inviting, and alive. Adjust size, weight, leading, and tracking until the rhythm of each line feels inevitable."
        : sample;

  const ladder = [
    { tag: "Display", size: Math.round(state.fontSize * (state.sizeUnit === "rem" ? 1.4 : 1.35)), weight: Math.min(800, state.fontWeight + 100) },
    { tag: "H1", size: state.fontSize, weight: state.fontWeight },
    { tag: "H2", size: Math.max(12, Math.round(state.fontSize * 0.72)), weight: Math.max(500, state.fontWeight - 100) },
    { tag: "Body", size: state.sizeUnit === "rem" ? 1.05 : 17, weight: 400 },
    { tag: "Caption", size: state.sizeUnit === "rem" ? 0.8 : 13, weight: 500 },
  ];

  return (
    <div className="type-studio">
      <div className="type-studio-shell">
        <aside className="type-studio-panel">
          <div className="type-studio-panel-head">
            <p className="type-studio-kicker">Type studio</p>
            <h2 className="type-studio-title">Typography generator</h2>
            <p className="type-studio-muted mt-1">
              Specimens, scale, and export-ready CSS — tuned for product UI and editorial work.
            </p>
            <div className="type-studio-links mt-3">
              <Link href="/font-generator">Fancy fonts</Link>
              <Link href="/css-clamp-generator">Fluid clamp</Link>
              <Link href="/text-shadow-generator">Text shadow</Link>
              <button type="button" className="type-studio-chip" onClick={reset}>
                <RotateCcw className="mr-1 inline h-3 w-3" />
                Reset
              </button>
            </div>
          </div>

          <div className="type-studio-panel-body">
            <section>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="type-studio-section-label mb-0">Presets</p>
                {activePreset === "custom" && <span className="type-studio-muted text-[11px]">Custom</span>}
              </div>
              <div className="type-studio-chip-row">
                {PRESETS.map((preset) => (
                  <Chip key={preset.id} active={activePreset === preset.id} onClick={() => applyPreset(preset)}>
                    {preset.label}
                  </Chip>
                ))}
              </div>
            </section>

            <section>
              <p className="type-studio-section-label">Font family</p>
              <div className="type-studio-font-grid">
                {FONT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFont(opt)}
                    className={cn("type-studio-font-card", state.fontFamily === opt.family && "is-active")}
                  >
                    <div className="sample" style={{ fontFamily: opt.family }}>
                      {opt.sample}
                    </div>
                    <div className="name">{opt.label}</div>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <p className="type-studio-section-label">Scale & rhythm</p>
              <div className="type-studio-chip-row">
                {(["px", "rem"] as const).map((u) => (
                  <Chip key={u} active={state.sizeUnit === u} onClick={() => patch("sizeUnit", u)}>
                    {u}
                  </Chip>
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
                <Slider min={100} max={900} step={100} value={[state.fontWeight]} onValueChange={([n]) => patch("fontWeight", n)} />
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
                <Slider min={28} max={80} value={[state.paragraphWidth]} onValueChange={([n]) => patch("paragraphWidth", n)} />
              </Field>
            </section>

            <section className="space-y-3">
              <p className="type-studio-section-label">Style</p>
              <Field label="Color">
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={state.color.startsWith("#") ? state.color : "#0f172a"}
                    onChange={(e) => patch("color", e.target.value)}
                    className="h-10 w-14 p-1"
                  />
                  <Input
                    value={state.color}
                    onChange={(e) => patch("color", e.target.value)}
                    className="font-mono text-sm uppercase"
                    spellCheck={false}
                  />
                </div>
              </Field>
              <div className="type-studio-chip-row">
                {(
                  [
                    ["none", "Aa"],
                    ["uppercase", "AA"],
                    ["lowercase", "aa"],
                    ["capitalize", "Title"],
                  ] as const
                ).map(([id, name]) => (
                  <Chip key={id} active={state.textTransform === id} onClick={() => patch("textTransform", id)}>
                    {name}
                  </Chip>
                ))}
              </div>
              <div className="type-studio-chip-row">
                {(
                  [
                    ["left", <AlignLeft key="l" className="h-3.5 w-3.5" />],
                    ["center", <AlignCenter key="c" className="h-3.5 w-3.5" />],
                    ["right", <AlignRight key="r" className="h-3.5 w-3.5" />],
                    ["justify", <AlignJustify key="j" className="h-3.5 w-3.5" />],
                  ] as const
                ).map(([id, icon]) => (
                  <Chip key={id} active={state.textAlign === id} onClick={() => patch("textAlign", id)}>
                    {icon}
                  </Chip>
                ))}
                <Chip
                  active={state.fontStyle === "italic"}
                  onClick={() => patch("fontStyle", state.fontStyle === "italic" ? "normal" : "italic")}
                  className="italic"
                >
                  Italic
                </Chip>
                {(
                  [
                    ["none", "Plain"],
                    ["underline", "Underline"],
                    ["line-through", "Strike"],
                  ] as const
                ).map(([id, name]) => (
                  <Chip key={id} active={state.textDecoration === id} onClick={() => patch("textDecoration", id)}>
                    {name}
                  </Chip>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <p className="type-studio-section-label">Content & export</p>
              <Field label="Sample text">
                <Textarea value={sample} onChange={(e) => setSample(e.target.value)} rows={3} className="rounded-xl text-sm" />
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
              <div className="flex flex-wrap gap-2">
                <PrimaryButton type="button" onClick={() => void copyStack()}>
                  <Copy className="h-4 w-4" />
                  Copy font stack
                </PrimaryButton>
                <Button type="button" variant="outline" className="rounded-full" onClick={() => applyPreset(PRESETS[0])}>
                  <Sparkles className="h-3.5 w-3.5" />
                  Display look
                </Button>
              </div>
            </section>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="type-studio-panel">
            <div className="type-studio-panel-head">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="type-studio-kicker">Specimen</p>
                  <h3 className="type-studio-title">Live type stage</h3>
                  <p className="type-studio-muted mt-1 font-mono">
                    {sizeValue} · {state.fontWeight} · lh {state.lineHeight} · {state.paragraphWidth}ch
                    {state.googleFont ? ` · ${state.googleFont}` : ""}
                  </p>
                </div>
                <div className="type-studio-toolbar">
                  {(
                    [
                      ["sample", "Sample"],
                      ["alphabet", "Alphabet"],
                      ["paragraph", "Paragraph"],
                      ["scale", "Scale"],
                    ] as const
                  ).map(([id, name]) => (
                    <Chip key={id} active={specimen === id} onClick={() => setSpecimen(id)}>
                      {name}
                    </Chip>
                  ))}
                  {(
                    [
                      ["light", "Light"],
                      ["paper", "Paper"],
                      ["dark", "Dark"],
                    ] as const
                  ).map(([id, name]) => (
                    <Chip key={id} active={previewBg === id} onClick={() => setPreviewBg(id)}>
                      {name}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              {specimen === "scale" ? (
                <div className="type-studio-ladder">
                  {ladder.map((row) => (
                    <div key={row.tag} className="type-studio-ladder-row">
                      <span className="tag">{row.tag}</span>
                      <p
                        style={{
                          fontFamily: state.fontFamily,
                          fontSize: `${row.size}${state.sizeUnit}`,
                          fontWeight: row.weight,
                          letterSpacing: tracking,
                          lineHeight: state.lineHeight,
                          color: previewBg === "dark" ? "#f8fafc" : state.color,
                          margin: 0,
                        }}
                      >
                        {row.tag === "Body" || row.tag === "Caption"
                          ? "The quick brown fox jumps over the lazy dog."
                          : sample.split("\n")[0] || "Typography"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={cn("type-studio-stage", `is-${previewBg}`)}>
                  <p style={previewStyle} className="type-studio-stage-copy">
                    {displayText}
                  </p>
                </div>
              )}

              <div className="type-studio-metrics">
                {[
                  ["Size", sizeValue],
                  ["Weight", String(state.fontWeight)],
                  ["Leading", String(state.lineHeight)],
                  ["Tracking", tracking],
                ].map(([k, v]) => (
                  <div key={k} className="type-studio-metric">
                    <p className="label">{k}</p>
                    <p className="value">{v}</p>
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
            rows={14}
          />
        </div>
      </div>
    </div>
  );
}
