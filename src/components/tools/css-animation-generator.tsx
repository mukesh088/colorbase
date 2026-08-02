"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Star,
  Wand2,
} from "lucide-react";
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

type ShapeId =
  | "heart"
  | "star"
  | "circle"
  | "square"
  | "soft"
  | "pill"
  | "diamond"
  | "triangle"
  | "ring"
  | "blob"
  | "text";

type AnimPresetId =
  | "pulse"
  | "bounce"
  | "spin"
  | "fade"
  | "shake"
  | "float"
  | "wiggle"
  | "heartbeat"
  | "flip"
  | "swing"
  | "rubber"
  | "glow"
  | "zoom"
  | "slide"
  | "jelly"
  | "blink";

const ANIM_PRESETS: Record<
  AnimPresetId,
  { label: string; keyframes: string; hint: string; defaultShape?: ShapeId }
> = {
  pulse: {
    label: "Pulse",
    hint: "scale",
    keyframes: `0%, 100% { transform: scale(1); }\n  50% { transform: scale(1.1); }`,
  },
  bounce: {
    label: "Bounce",
    hint: "translateY",
    keyframes: `0%, 100% { transform: translateY(0); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }\n  50% { transform: translateY(-32%); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }`,
  },
  spin: {
    label: "Spin",
    hint: "rotate",
    keyframes: `from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }`,
  },
  fade: {
    label: "Fade",
    hint: "opacity",
    keyframes: `0%, 100% { opacity: 1; }\n  50% { opacity: 0.25; }`,
  },
  shake: {
    label: "Shake",
    hint: "translateX",
    keyframes: `0%, 100% { transform: translateX(0); }\n  20%, 60% { transform: translateX(-10px); }\n  40%, 80% { transform: translateX(10px); }`,
  },
  float: {
    label: "Float",
    hint: "translateY",
    keyframes: `0%, 100% { transform: translateY(0); }\n  50% { transform: translateY(-14px); }`,
  },
  wiggle: {
    label: "Wiggle",
    hint: "rotate",
    keyframes: `0%, 100% { transform: rotate(-4deg); }\n  50% { transform: rotate(4deg); }`,
  },
  heartbeat: {
    label: "Heartbeat",
    hint: "scale",
    defaultShape: "heart",
    keyframes: `0%, 100% { transform: scale(1); }\n  14% { transform: scale(1.18); }\n  28% { transform: scale(1); }\n  42% { transform: scale(1.18); }\n  70% { transform: scale(1); }`,
  },
  flip: {
    label: "Flip",
    hint: "rotateY",
    keyframes: `0% { transform: perspective(400px) rotateY(0); }\n  100% { transform: perspective(400px) rotateY(360deg); }`,
  },
  swing: {
    label: "Swing",
    hint: "rotate",
    keyframes: `20% { transform: rotate(15deg); }\n  40% { transform: rotate(-10deg); }\n  60% { transform: rotate(5deg); }\n  80% { transform: rotate(-5deg); }\n  100% { transform: rotate(0deg); }`,
  },
  rubber: {
    label: "Rubber",
    hint: "scale",
    keyframes: `0% { transform: scale(1); }\n  30% { transform: scaleX(1.25) scaleY(0.75); }\n  40% { transform: scaleX(0.75) scaleY(1.25); }\n  60% { transform: scaleX(1.15) scaleY(0.85); }\n  100% { transform: scale(1); }`,
  },
  glow: {
    label: "Glow",
    hint: "box-shadow",
    keyframes: `0%, 100% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.45); filter: brightness(1); }\n  50% { box-shadow: 0 0 28px 10px rgba(225, 29, 72, 0.35); filter: brightness(1.08); }`,
  },
  zoom: {
    label: "Zoom",
    hint: "scale",
    keyframes: `0% { transform: scale(0.6); opacity: 0; }\n  60% { transform: scale(1.08); opacity: 1; }\n  100% { transform: scale(1); opacity: 1; }`,
  },
  slide: {
    label: "Slide",
    hint: "translateX",
    keyframes: `0% { transform: translateX(-40%); opacity: 0; }\n  100% { transform: translateX(0); opacity: 1; }`,
  },
  jelly: {
    label: "Jelly",
    hint: "skew",
    keyframes: `0%, 100% { transform: skewX(0deg) scale(1); }\n  25% { transform: skewX(8deg) scale(1.05); }\n  50% { transform: skewX(-6deg) scale(0.98); }\n  75% { transform: skewX(3deg) scale(1.02); }`,
  },
  blink: {
    label: "Blink",
    hint: "opacity",
    keyframes: `0%, 50%, 100% { opacity: 1; }\n  25%, 75% { opacity: 0; }`,
  },
};

const SHAPES: { id: ShapeId; label: string }[] = [
  { id: "heart", label: "Heart" },
  { id: "star", label: "Star" },
  { id: "circle", label: "Circle" },
  { id: "square", label: "Square" },
  { id: "soft", label: "Soft" },
  { id: "pill", label: "Pill" },
  { id: "diamond", label: "Diamond" },
  { id: "triangle", label: "Triangle" },
  { id: "ring", label: "Ring" },
  { id: "blob", label: "Blob" },
  { id: "text", label: "Text" },
];

const EASINGS: { value: string; label: string }[] = [
  { value: "ease", label: "ease" },
  { value: "ease-in", label: "ease-in" },
  { value: "ease-out", label: "ease-out" },
  { value: "ease-in-out", label: "ease-in-out" },
  { value: "linear", label: "linear" },
  { value: "cubic-bezier(0.34, 1.56, 0.64, 1)", label: "springy" },
  { value: "cubic-bezier(0.4, 0, 0.2, 1)", label: "material" },
  { value: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", label: "back" },
  { value: "steps(5, end)", label: "steps" },
  { value: "custom", label: "custom…" },
];

function mixHex(hex: string, toward: "white" | "black", amount: number) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full || "000000", 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const t = toward === "white" ? 255 : 0;
  const m = (c: number) => Math.round(c + (t - c) * amount);
  return `#${[m(r), m(g), m(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs sm:text-sm">{label}</Label>
      {children}
    </div>
  );
}

function shapeClip(shape: ShapeId): string | undefined {
  switch (shape) {
    case "star":
      return "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
    case "diamond":
      return "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
    case "triangle":
      return "polygon(50% 0%, 0% 100%, 100% 100%)";
    case "blob":
      return "polygon(40% 0%, 70% 10%, 95% 35%, 90% 70%, 60% 95%, 25% 90%, 5% 60%, 10% 25%)";
    default:
      return undefined;
  }
}

function shapeRadius(shape: ShapeId, size: number): string | number {
  if (shape === "circle" || shape === "ring") return "9999px";
  if (shape === "pill") return "9999px";
  if (shape === "soft") return Math.round(size * 0.22);
  if (shape === "square") return 8;
  return 0;
}

export function CssAnimationGeneratorTool() {
  const uid = useId().replace(/:/g, "");
  const [preset, setPreset] = useState<AnimPresetId>("heartbeat");
  const [shape, setShape] = useState<ShapeId>("heart");
  const [color, setColor] = useState("#e11d48");
  const [color2, setColor2] = useState("#fb7185");
  const [useGradient, setUseGradient] = useState(true);
  const [size, setSize] = useState(96);
  const [duration, setDuration] = useState(1.2);
  const [delay, setDelay] = useState(0);
  const [iterations, setIterations] = useState("infinite");
  const [customIter, setCustomIter] = useState(3);
  const [direction, setDirection] = useState("normal");
  const [fillMode, setFillMode] = useState("both");
  const [easing, setEasing] = useState("ease-in-out");
  const [customBezier, setCustomBezier] = useState("0.42, 0, 0.58, 1");
  const [className, setClassName] = useState("animated");
  const [animName, setAnimName] = useState("cb-anim");
  const [label, setLabel] = useState("colorBase");
  const [extraCss, setExtraCss] = useState("");
  const [playing, setPlaying] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const [includeReduced, setIncludeReduced] = useState(true);

  const resolvedEasing = easing === "custom" ? `cubic-bezier(${customBezier})` : easing;
  const iterValue = iterations === "infinite" ? "infinite" : String(customIter);
  const keyName = `${animName.trim() || "cb-anim"}-${uid}`;

  const background = useGradient
    ? `linear-gradient(145deg, ${color}, ${color2})`
    : color;

  const shapeStyles = useMemo(() => {
    const clip = shapeClip(shape);
    const base: React.CSSProperties = {
      width: shape === "pill" ? size * 1.6 : size,
      height: shape === "pill" ? Math.round(size * 0.55) : size,
      background: shape === "text" || shape === "ring" ? "transparent" : background,
      borderRadius: shapeRadius(shape, size),
      clipPath: clip,
      boxShadow:
        shape === "text" || shape === "ring"
          ? "none"
          : `0 12px 28px ${mixHex(color, "black", 0.35)}55`,
    };
    if (shape === "ring") {
      base.background = "transparent";
      base.border = `${Math.max(6, Math.round(size * 0.12))}px solid ${color}`;
      base.boxShadow = "none";
      base.boxSizing = "border-box";
    }
    return base;
  }, [background, color, shape, size]);

  const animationShorthand = `${keyName} ${duration}s ${resolvedEasing} ${delay}s ${iterValue} ${direction} ${fillMode}`;

  const css = useMemo(() => {
    const cls = className.trim() || "animated";
    const clip = shapeClip(shape);
    const lines: string[] = [
      `@keyframes ${animName.trim() || "cb-anim"} {`,
      `  ${ANIM_PRESETS[preset].keyframes}`,
      `}`,
      ``,
      `.${cls} {`,
    ];

    if (shape === "heart") {
      const s = size;
      lines.push(`  position: relative;`);
      lines.push(`  width: ${s}px;`);
      lines.push(`  height: ${Math.round(s * 0.9)}px;`);
      lines.push(`  background: transparent;`);
      lines.push(`  display: inline-block;`);
      lines.push(`}`);
      lines.push(``);
      lines.push(`.${cls}::before,`);
      lines.push(`.${cls}::after {`);
      lines.push(`  content: "";`);
      lines.push(`  position: absolute;`);
      lines.push(`  top: 0;`);
      lines.push(`  width: ${Math.round(s * 0.52)}px;`);
      lines.push(`  height: ${Math.round(s * 0.8)}px;`);
      lines.push(`  border-radius: ${Math.round(s * 0.52)}px ${Math.round(s * 0.52)}px 0 0;`);
      lines.push(`  background: ${useGradient ? background : color};`);
      lines.push(`}`);
      lines.push(`.${cls}::before {`);
      lines.push(`  left: ${Math.round(s * 0.48)}px;`);
      lines.push(`  transform: rotate(-45deg);`);
      lines.push(`  transform-origin: 0 100%;`);
      lines.push(`}`);
      lines.push(`.${cls}::after {`);
      lines.push(`  left: 0;`);
      lines.push(`  transform: rotate(45deg);`);
      lines.push(`  transform-origin: 100% 100%;`);
      lines.push(`}`);
      lines.push(``);
      lines.push(`.${cls} {`);
      lines.push(`  animation: ${animName.trim() || "cb-anim"} ${duration}s ${resolvedEasing} ${delay}s ${iterValue} ${direction} ${fillMode};`);
    } else if (shape === "text") {
      lines.push(`  display: inline-block;`);
      lines.push(`  font-size: ${Math.round(size * 0.42)}px;`);
      lines.push(`  font-weight: 700;`);
      lines.push(`  color: ${color};`);
      lines.push(`  animation: ${animName.trim() || "cb-anim"} ${duration}s ${resolvedEasing} ${delay}s ${iterValue} ${direction} ${fillMode};`);
    } else if (shape === "ring") {
      const bw = Math.max(6, Math.round(size * 0.12));
      lines.push(`  width: ${size}px;`);
      lines.push(`  height: ${size}px;`);
      lines.push(`  border-radius: 9999px;`);
      lines.push(`  border: ${bw}px solid ${color};`);
      lines.push(`  background: transparent;`);
      lines.push(`  box-sizing: border-box;`);
      lines.push(`  animation: ${animName.trim() || "cb-anim"} ${duration}s ${resolvedEasing} ${delay}s ${iterValue} ${direction} ${fillMode};`);
    } else {
      const w = shape === "pill" ? Math.round(size * 1.6) : size;
      const h = shape === "pill" ? Math.round(size * 0.55) : size;
      lines.push(`  width: ${w}px;`);
      lines.push(`  height: ${h}px;`);
      lines.push(`  background: ${useGradient ? background : color};`);
      const rad = shapeRadius(shape, size);
      lines.push(`  border-radius: ${typeof rad === "number" ? `${rad}px` : rad};`);
      if (clip) lines.push(`  clip-path: ${clip};`);
      lines.push(`  animation: ${animName.trim() || "cb-anim"} ${duration}s ${resolvedEasing} ${delay}s ${iterValue} ${direction} ${fillMode};`);
    }

    if (extraCss.trim()) {
      for (const raw of extraCss.split("\n")) {
        const line = raw.trim();
        if (!line) continue;
        lines.push(`  ${line.endsWith(";") ? line : `${line};`}`);
      }
    }
    lines.push(`}`);

    if (includeReduced) {
      lines.push(``);
      lines.push(`@media (prefers-reduced-motion: reduce) {`);
      lines.push(`  .${cls} {`);
      lines.push(`    animation: none;`);
      lines.push(`  }`);
      lines.push(`}`);
    }

    return lines.join("\n");
  }, [
    animName,
    background,
    className,
    color,
    delay,
    direction,
    duration,
    extraCss,
    fillMode,
    includeReduced,
    iterValue,
    preset,
    resolvedEasing,
    shape,
    size,
    useGradient,
  ]);

  const previewCss = useMemo(() => {
    return [
      `@keyframes ${keyName} {`,
      `  ${ANIM_PRESETS[preset].keyframes}`,
      `}`,
    ].join("\n");
  }, [keyName, preset]);

  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-cb-anim-gen", uid);
    style.textContent = previewCss;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, [previewCss, uid]);

  const applyPreset = (id: AnimPresetId) => {
    setPreset(id);
    const def = ANIM_PRESETS[id].defaultShape;
    if (def) setShape(def);
    setReplayKey((k) => k + 1);
    setPlaying(true);
    toast.success(`Applied “${ANIM_PRESETS[id].label}”`);
  };

  const reset = () => {
    setPreset("heartbeat");
    setShape("heart");
    setColor("#e11d48");
    setColor2("#fb7185");
    setUseGradient(true);
    setSize(96);
    setDuration(1.2);
    setDelay(0);
    setIterations("infinite");
    setDirection("normal");
    setFillMode("both");
    setEasing("ease-in-out");
    setPlaying(true);
    setReplayKey((k) => k + 1);
  };

  const restart = () => {
    setPlaying(true);
    setReplayKey((k) => k + 1);
  };

  const copyShorthand = async () => {
    try {
      await navigator.clipboard.writeText(
        `animation: ${animName.trim() || "cb-anim"} ${duration}s ${resolvedEasing} ${delay}s ${iterValue} ${direction} ${fillMode};`
      );
      toast.success("animation shorthand copied");
    } catch {
      toast.error("Copy failed");
    }
  };

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
                  CSS Animation
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Keyframes, shapes, timing, and IDE-ready CSS.
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
                href="/css-transition-generator"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Transitions
              </Link>
              <Link
                href="/css-transform-generator"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Transforms
              </Link>
              <Button type="button" size="sm" variant="ghost" className="h-8 rounded-full" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>

            <section className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Animation presets
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(ANIM_PRESETS) as AnimPresetId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => applyPreset(id)}
                    className={cn(
                      "rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                      preset === id
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30 hover:bg-muted/60"
                    )}
                  >
                    {ANIM_PRESETS[id].label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Affects · {ANIM_PRESETS[preset].hint}
              </p>
            </section>

            <section className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Shapes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SHAPES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setShape(s.id);
                      setReplayKey((k) => k + 1);
                    }}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                      shape === s.id
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30 hover:bg-muted/60"
                    )}
                  >
                    {s.id === "heart" ? <Heart className="h-3 w-3" /> : null}
                    {s.id === "star" ? <Star className="h-3 w-3" /> : null}
                    {s.id === "square" ? <Square className="h-3 w-3" /> : null}
                    {s.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Appearance
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Color">
                  <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-full p-1" />
                </Field>
                <Field label="Accent">
                  <Input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="h-10 w-full p-1" />
                </Field>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useGradient}
                  onChange={(e) => setUseGradient(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-rose-500"
                />
                Gradient fill
              </label>
              <Field label={`Size · ${size}px`}>
                <Slider min={48} max={180} value={[size]} onValueChange={([n]) => setSize(n)} />
              </Field>
              {shape === "text" && (
                <Field label="Text">
                  <Input value={label} onChange={(e) => setLabel(e.target.value)} className="rounded-xl" />
                </Field>
              )}
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Timing
              </p>
              <Field label={`Duration · ${duration.toFixed(1)}s`}>
                <Slider
                  min={0.2}
                  max={5}
                  step={0.1}
                  value={[duration]}
                  onValueChange={([n]) => setDuration(n)}
                />
              </Field>
              <Field label={`Delay · ${delay.toFixed(1)}s`}>
                <Slider min={0} max={3} step={0.1} value={[delay]} onValueChange={([n]) => setDelay(n)} />
              </Field>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setIterations("infinite")}
                  className={cn(
                    "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                    iterations === "infinite"
                      ? "border-rose-500/50 bg-rose-500 text-white"
                      : "border-border/60 bg-muted/30"
                  )}
                >
                  Infinite
                </button>
                <button
                  type="button"
                  onClick={() => setIterations("finite")}
                  className={cn(
                    "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                    iterations === "finite"
                      ? "border-rose-500/50 bg-rose-500 text-white"
                      : "border-border/60 bg-muted/30"
                  )}
                >
                  Finite
                </button>
              </div>
              {iterations === "finite" && (
                <Field label={`Iterations · ${customIter}`}>
                  <Slider min={1} max={20} value={[customIter]} onValueChange={([n]) => setCustomIter(n)} />
                </Field>
              )}
              <Field label="Easing">
                <div className="flex flex-wrap gap-1.5">
                  {EASINGS.map((e) => (
                    <button
                      key={e.value}
                      type="button"
                      onClick={() => setEasing(e.value)}
                      className={cn(
                        "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                        easing === e.value
                          ? "border-rose-500/50 bg-rose-500 text-white"
                          : "border-border/60 bg-muted/30 hover:bg-muted/60"
                      )}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </Field>
              {easing === "custom" && (
                <Field label="cubic-bezier values">
                  <Input
                    value={customBezier}
                    onChange={(e) => setCustomBezier(e.target.value)}
                    className="font-mono text-xs"
                    placeholder="0.42, 0, 0.58, 1"
                    spellCheck={false}
                  />
                </Field>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Field label="Direction">
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm"
                  >
                    {["normal", "reverse", "alternate", "alternate-reverse"].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Fill mode">
                  <select
                    value={fillMode}
                    onChange={(e) => setFillMode(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm"
                  >
                    {["none", "forwards", "backwards", "both"].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Output
              </p>
              <Field label="Animation name">
                <Input
                  value={animName}
                  onChange={(e) => setAnimName(e.target.value.replace(/[^\w-]/g, ""))}
                  className="font-mono text-sm"
                  spellCheck={false}
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
                  checked={includeReduced}
                  onChange={(e) => setIncludeReduced(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-rose-500"
                />
                Include prefers-reduced-motion
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
                Copy animation
              </PrimaryButton>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => applyPreset("heartbeat")}>
                <Sparkles className="h-3.5 w-3.5" />
                Heartbeat
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
                  <p className="text-sm font-semibold">
                    {ANIM_PRESETS[preset].label} · {SHAPES.find((s) => s.id === shape)?.label}
                  </p>
                  <p className="mt-0.5 max-w-xl truncate font-mono text-[11px] text-muted-foreground">
                    {duration}s · {resolvedEasing} · {iterValue}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-full"
                    onClick={() => setPlaying((p) => !p)}
                  >
                    {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {playing ? "Pause" : "Play"}
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="h-8 rounded-full" onClick={restart}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restart
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-3 sm:p-5">
              <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.1),_transparent_55%),linear-gradient(180deg,rgba(244,63,94,0.04),transparent)] sm:min-h-[400px]">
                <div
                  key={replayKey}
                  className="relative"
                  style={{
                    animation: playing ? animationShorthand : "none",
                    transformOrigin: "center",
                  }}
                >
                  {shape === "heart" ? (
                    <div
                      className="relative"
                      style={{
                        width: size,
                        height: Math.round(size * 0.9),
                      }}
                    >
                      <span
                        className="absolute top-0 block"
                        style={{
                          left: Math.round(size * 0.48),
                          width: Math.round(size * 0.52),
                          height: Math.round(size * 0.8),
                          borderRadius: `${Math.round(size * 0.52)}px ${Math.round(size * 0.52)}px 0 0`,
                          background,
                          transform: "rotate(-45deg)",
                          transformOrigin: "0 100%",
                          boxShadow: `0 8px 20px ${mixHex(color, "black", 0.3)}44`,
                        }}
                      />
                      <span
                        className="absolute top-0 left-0 block"
                        style={{
                          width: Math.round(size * 0.52),
                          height: Math.round(size * 0.8),
                          borderRadius: `${Math.round(size * 0.52)}px ${Math.round(size * 0.52)}px 0 0`,
                          background,
                          transform: "rotate(45deg)",
                          transformOrigin: "100% 100%",
                        }}
                      />
                    </div>
                  ) : shape === "text" ? (
                    <span
                      className="font-display font-bold tracking-tight"
                      style={{ fontSize: Math.round(size * 0.42), color }}
                    >
                      {label || "Aa"}
                    </span>
                  ) : (
                    <div style={shapeStyles} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <CodeOutput
            value={css}
            filename="animation.css"
            language="css"
            title="CSS output"
            eyebrow="Keyframes · Class"
            rows={18}
          />
        </div>
      </div>
    </div>
  );
}
