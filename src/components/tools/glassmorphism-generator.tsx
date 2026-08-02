"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, RotateCcw, Sparkles, Upload, Wand2 } from "lucide-react";
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

type SceneId = "gradient" | "mesh" | "aurora" | "photo" | "cards" | "upload";
type ShapeId = "card" | "panel" | "button" | "badge";

type GlassState = {
  tint: string;
  opacity: number;
  blur: number;
  saturate: number;
  brightness: number;
  contrast: number;
  borderWidth: number;
  borderColor: string;
  borderOpacity: number;
  radius: number;
  paddingX: number;
  paddingY: number;
  width: number;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowOpacity: number;
};

const DEFAULT: GlassState = {
  tint: "#ffffff",
  opacity: 22,
  blur: 14,
  saturate: 145,
  brightness: 105,
  contrast: 100,
  borderWidth: 1,
  borderColor: "#ffffff",
  borderOpacity: 42,
  radius: 20,
  paddingX: 28,
  paddingY: 24,
  width: 280,
  shadowX: 0,
  shadowY: 18,
  shadowBlur: 40,
  shadowOpacity: 22,
};

const PHOTO =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80&auto=format&fit=crop";

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full || "000000", 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function hexToRgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 1000) / 1000})`;
}

type Preset = { id: string; label: string; state: Partial<GlassState>; scene?: SceneId };

const PRESETS: Preset[] = [
  { id: "frosted", label: "Frosted", state: { ...DEFAULT } },
  {
    id: "crystal",
    label: "Crystal",
    state: { opacity: 14, blur: 20, saturate: 160, borderOpacity: 55, brightness: 110 },
  },
  {
    id: "dark",
    label: "Dark glass",
    state: {
      tint: "#0f172a",
      opacity: 42,
      blur: 18,
      saturate: 120,
      borderColor: "#ffffff",
      borderOpacity: 18,
      brightness: 95,
    },
  },
  {
    id: "rose",
    label: "Rose tint",
    state: {
      tint: "#e11d48",
      opacity: 28,
      blur: 16,
      saturate: 140,
      borderColor: "#ffffff",
      borderOpacity: 35,
    },
  },
  {
    id: "heavy",
    label: "Heavy blur",
    state: { blur: 28, opacity: 30, saturate: 130, shadowBlur: 48, shadowOpacity: 28 },
  },
  {
    id: "subtle",
    label: "Subtle",
    state: { blur: 8, opacity: 18, saturate: 120, borderOpacity: 28, shadowOpacity: 12 },
  },
  {
    id: "neon",
    label: "Neon edge",
    state: {
      tint: "#0f172a",
      opacity: 35,
      blur: 16,
      borderColor: "#fb7185",
      borderOpacity: 70,
      borderWidth: 1,
      shadowOpacity: 35,
    },
  },
  {
    id: "milk",
    label: "Milky",
    state: { opacity: 55, blur: 12, saturate: 110, borderOpacity: 50, brightness: 108 },
  },
  {
    id: "thin",
    label: "Thin border",
    state: { borderWidth: 1, borderOpacity: 60, opacity: 16, blur: 18 },
  },
];

const SCENES: { id: SceneId; label: string }[] = [
  { id: "gradient", label: "Gradient" },
  { id: "mesh", label: "Mesh" },
  { id: "aurora", label: "Aurora" },
  { id: "photo", label: "Photo" },
  { id: "cards", label: "Cards" },
  { id: "upload", label: "Upload" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs sm:text-sm">{label}</Label>
      {children}
    </div>
  );
}

function SceneBackdrop({ scene, uploadUrl }: { scene: SceneId; uploadUrl: string | null }) {
  if (scene === "upload" && uploadUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={uploadUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
    );
  }
  if (scene === "photo") {
    return (
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${PHOTO})` }} />
    );
  }
  if (scene === "cards") {
    return (
      <div className="absolute inset-0 overflow-hidden bg-slate-900 p-4 sm:p-6">
        <div className="grid h-full grid-cols-2 gap-3 sm:grid-cols-3">
          {["Rose", "Amber", "Emerald", "Sky", "Violet", "Fuchsia"].map((name, i) => (
            <div
              key={name}
              className="flex flex-col justify-end rounded-2xl p-3 text-white shadow-md"
              style={{
                background: [
                  "linear-gradient(135deg,#e11d48,#fb7185)",
                  "linear-gradient(135deg,#d97706,#fbbf24)",
                  "linear-gradient(135deg,#059669,#34d399)",
                  "linear-gradient(135deg,#0284c7,#38bdf8)",
                  "linear-gradient(135deg,#7c3aed,#a78bfa)",
                  "linear-gradient(135deg,#c026d3,#e879f9)",
                ][i],
              }}
            >
              <span className="text-xs font-semibold">{name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (scene === "mesh") {
    return (
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#0f172a",
          backgroundImage: `
            radial-gradient(at 20% 20%, #fb7185 0px, transparent 45%),
            radial-gradient(at 80% 10%, #60a5fa 0px, transparent 40%),
            radial-gradient(at 50% 80%, #34d399 0px, transparent 45%),
            radial-gradient(at 90% 70%, #f59e0b 0px, transparent 40%)
          `,
        }}
      />
    );
  }
  if (scene === "aurora") {
    return (
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(125deg,#0f172a 0%,#1e1b4b 35%,#831843 65%,#0c4a6e 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 30% 20%, rgba(244,63,94,0.45), transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(56,189,248,0.35), transparent 45%), radial-gradient(ellipse at 40% 80%, rgba(52,211,153,0.3), transparent 40%)",
          }}
        />
      </div>
    );
  }
  return (
    <div
      className="absolute inset-0"
      style={{
        background: "linear-gradient(135deg, #fb7185 0%, #e11d48 35%, #7c3aed 70%, #0ea5e9 100%)",
      }}
    />
  );
}

export function GlassmorphismGeneratorTool() {
  const [state, setState] = useState<GlassState>({ ...DEFAULT });
  const [activePreset, setActivePreset] = useState("frosted");
  const [scene, setScene] = useState<SceneId>("gradient");
  const [shape, setShape] = useState<ShapeId>("card");
  const [title, setTitle] = useState("Frosted panel");
  const [subtitle, setSubtitle] = useState("Glass over vivid color");
  const [className, setClassName] = useState("glass");
  const [includeWebkit, setIncludeWebkit] = useState(true);
  const [extraCss, setExtraCss] = useState("");
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (uploadUrl) URL.revokeObjectURL(uploadUrl);
    };
  }, [uploadUrl]);

  const patch = <K extends keyof GlassState>(key: K, value: GlassState[K]) => {
    setActivePreset("custom");
    setState((prev) => ({ ...prev, [key]: value }));
    setFlashKey((k) => k + 1);
  };

  const backdropValue = useMemo(() => {
    const parts = [`blur(${state.blur}px)`];
    if (state.saturate !== 100) parts.push(`saturate(${state.saturate}%)`);
    if (state.brightness !== 100) parts.push(`brightness(${state.brightness}%)`);
    if (state.contrast !== 100) parts.push(`contrast(${state.contrast}%)`);
    return parts.join(" ");
  }, [state.blur, state.saturate, state.brightness, state.contrast]);

  const bg = hexToRgba(state.tint, state.opacity / 100);
  const border = `${state.borderWidth}px solid ${hexToRgba(state.borderColor, state.borderOpacity / 100)}`;
  const boxShadow =
    state.shadowOpacity > 0
      ? `${state.shadowX}px ${state.shadowY}px ${state.shadowBlur}px ${hexToRgba("#000000", state.shadowOpacity / 100)}`
      : "none";

  const panelStyle: React.CSSProperties = {
    background: bg,
    backdropFilter: backdropValue,
    WebkitBackdropFilter: backdropValue,
    border,
    borderRadius: state.radius,
    boxShadow,
    padding: `${state.paddingY}px ${state.paddingX}px`,
    width: shape === "badge" ? "auto" : state.width,
    maxWidth: "100%",
  };

  const css = useMemo(() => {
    const cls = className.trim() || "glass";
    const lines = [`.${cls} {`, `  background: ${bg};`];
    if (includeWebkit) lines.push(`  -webkit-backdrop-filter: ${backdropValue};`);
    lines.push(`  backdrop-filter: ${backdropValue};`);
    lines.push(`  border: ${border};`);
    lines.push(`  border-radius: ${state.radius}px;`);
    if (boxShadow !== "none") lines.push(`  box-shadow: ${boxShadow};`);
    lines.push(`  padding: ${state.paddingY}px ${state.paddingX}px;`);
    if (extraCss.trim()) {
      for (const raw of extraCss.split("\n")) {
        const line = raw.trim();
        if (!line) continue;
        lines.push(`  ${line.endsWith(";") ? line : `${line};`}`);
      }
    }
    lines.push(`}`);
    return lines.join("\n");
  }, [
    backdropValue,
    bg,
    border,
    boxShadow,
    className,
    extraCss,
    includeWebkit,
    state.paddingX,
    state.paddingY,
    state.radius,
  ]);

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    setState({ ...DEFAULT, ...preset.state });
    if (preset.scene) setScene(preset.scene);
    setFlashKey((k) => k + 1);
    toast.success(`Applied “${preset.label}”`);
  };

  const reset = () => {
    setActivePreset("frosted");
    setState({ ...DEFAULT });
    setFlashKey((k) => k + 1);
  };

  const onUpload = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setUploadUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setScene("upload");
    toast.success("Background loaded");
  };

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(
        `backdrop-filter: ${backdropValue};\nbackground: ${bg};`
      );
      toast.success("Core glass CSS copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const textTone = state.tint.toLowerCase() === "#ffffff" || state.opacity < 35 ? "light" : "dark";
  const textClass = textTone === "light" ? "text-slate-900" : "text-white";
  const mutedClass = textTone === "light" ? "text-slate-700/80" : "text-white/75";

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
                  Glassmorphism
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Frosted glass panels with blur, tint, border, and depth.
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
                href="/backdrop-filter-generator"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Backdrop filter
              </Link>
              <Link
                href="/neumorphism-generator"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Neumorphism
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
                Glass
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tint">
                  <Input
                    type="color"
                    value={state.tint}
                    onChange={(e) => patch("tint", e.target.value)}
                    className="h-10 w-full p-1"
                  />
                </Field>
                <Field label="Border color">
                  <Input
                    type="color"
                    value={state.borderColor}
                    onChange={(e) => patch("borderColor", e.target.value)}
                    className="h-10 w-full p-1"
                  />
                </Field>
              </div>
              {(
                [
                  ["opacity", "Transparency", 5, 80, "%", state.opacity],
                  ["blur", "Blur", 0, 40, "px", state.blur],
                  ["saturate", "Saturate", 50, 200, "%", state.saturate],
                  ["brightness", "Brightness", 50, 150, "%", state.brightness],
                  ["contrast", "Contrast", 50, 150, "%", state.contrast],
                  ["borderWidth", "Border width", 0, 4, "px", state.borderWidth],
                  ["borderOpacity", "Border opacity", 0, 90, "%", state.borderOpacity],
                  ["radius", "Radius", 0, 48, "px", state.radius],
                ] as const
              ).map(([key, label, min, max, unit, value]) => (
                <Field key={key} label={`${label} · ${value}${unit}`}>
                  <Slider min={min} max={max} value={[value]} onValueChange={([n]) => patch(key, n)} />
                </Field>
              ))}
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Layout & shadow
              </p>
              {(
                [
                  ["width", "Width", 160, 420, "px", state.width],
                  ["paddingX", "Padding X", 8, 64, "px", state.paddingX],
                  ["paddingY", "Padding Y", 8, 64, "px", state.paddingY],
                  ["shadowX", "Shadow X", -40, 40, "px", state.shadowX],
                  ["shadowY", "Shadow Y", 0, 60, "px", state.shadowY],
                  ["shadowBlur", "Shadow blur", 0, 80, "px", state.shadowBlur],
                  ["shadowOpacity", "Shadow opacity", 0, 60, "%", state.shadowOpacity],
                ] as const
              ).map(([key, label, min, max, unit, value]) => (
                <Field key={key} label={`${label} · ${value}${unit}`}>
                  <Slider min={min} max={max} value={[value]} onValueChange={([n]) => patch(key, n)} />
                </Field>
              ))}
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Preview
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SCENES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      if (s.id === "upload") fileRef.current?.click();
                      else setScene(s.id);
                    }}
                    className={cn(
                      "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                      scene === s.id
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30 hover:bg-muted/60"
                    )}
                  >
                    {s.id === "upload" ? (
                      <span className="inline-flex items-center gap-1">
                        <Upload className="h-3 w-3" />
                        {s.label}
                      </span>
                    ) : (
                      s.label
                    )}
                  </button>
                ))}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onUpload(e.target.files?.[0])}
              />
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["card", "Card"],
                    ["panel", "Panel"],
                    ["button", "Button"],
                    ["badge", "Badge"],
                  ] as const
                ).map(([id, label]) => (
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
                    {label}
                  </button>
                ))}
              </div>
              <Field label="Title">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" />
              </Field>
              <Field label="Subtitle">
                <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="rounded-xl" />
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
                  checked={includeWebkit}
                  onChange={(e) => setIncludeWebkit(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-rose-500"
                />
                Include <span className="font-mono text-xs">-webkit-backdrop-filter</span>
              </label>
              <Field label="Extra CSS">
                <Textarea
                  value={extraCss}
                  onChange={(e) => setExtraCss(e.target.value)}
                  placeholder="color: #0f172a;"
                  rows={2}
                  className="rounded-xl font-mono text-xs"
                  spellCheck={false}
                />
              </Field>
            </section>

            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="button" onClick={() => void copySnippet()}>
                <Copy className="h-4 w-4" />
                Copy core CSS
              </PrimaryButton>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => applyPreset(PRESETS[0])}>
                <Sparkles className="h-3.5 w-3.5" />
                Frosted
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
              <p className="text-sm font-semibold">Live glass panel</p>
              <p className="mt-0.5 max-w-xl truncate font-mono text-[11px] text-muted-foreground">
                {backdropValue}
              </p>
            </div>
            <div className="p-3 sm:p-5">
              <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl sm:min-h-[400px]">
                <SceneBackdrop scene={scene} uploadUrl={uploadUrl} />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${shape}-${flashKey}`}
                    initial={{ opacity: 0.85, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    className="relative z-[1] m-4"
                    style={panelStyle}
                  >
                    {shape === "badge" ? (
                      <span className={cn("text-xs font-semibold", textClass)}>{title || "Badge"}</span>
                    ) : shape === "button" ? (
                      <span className={cn("block text-center text-sm font-semibold", textClass)}>
                        {title || "Glass button"}
                      </span>
                    ) : (
                      <div className="space-y-1.5 text-left">
                        <p className={cn("font-display text-lg font-semibold tracking-tight", textClass)}>
                          {title || "Frosted panel"}
                        </p>
                        {shape === "card" && (
                          <p className={cn("text-sm", mutedClass)}>{subtitle}</p>
                        )}
                        {shape === "panel" && (
                          <>
                            <p className={cn("text-sm", mutedClass)}>{subtitle}</p>
                            <div className="mt-3 h-1.5 w-16 rounded-full bg-rose-500/80" />
                          </>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <CodeOutput
            value={css}
            filename="glassmorphism.css"
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
