"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  Heart,
  Pipette,
  Redo2,
  RotateCcw,
  Shuffle,
  Undo2,
  Sparkles,
  Layers,
  Code2,
  Sun,
  Moon,
  ArrowRight,
  Sliders,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  formatRgb,
  generateHarmony,
  getTextColor,
  hexToRgb,
  hslToRgb,
  isValidHex,
  mixColors,
  normalizeHex,
  randomHex,
  rgbToHex,
  rgbToHsl,
  getContrastRatio,
} from "@/lib/colors/convert";
import { useFavoriteColors, useHistoryState, useLocalStorage, useRecentColors } from "@/hooks";
import { cn } from "@/lib/utils";

const HARMONIES = [
  { id: "complementary", label: "Complementary", hint: "Opposite on the wheel (180°)", offsets: [0, 180] },
  { id: "split-complementary", label: "Split-Comp", hint: "Base + two beside the complement", offsets: [0, 150, 210] },
  { id: "analogous", label: "Analogous", hint: "Adjacent harmonious hues (±30°)", offsets: [-30, 0, 30] },
  { id: "triadic", label: "Triadic", hint: "Three equidistant hues (120° apart)", offsets: [0, 120, 240] },
  { id: "tetradic", label: "Tetradic", hint: "Two complementary pairs (Rectangle)", offsets: [0, 60, 180, 240] },
  { id: "square", label: "Square", hint: "Four hues 90° apart", offsets: [0, 90, 180, 270] },
  { id: "monochromatic", label: "Monochrome", hint: "Single hue with stepped lightness", offsets: [0] },
] as const;

type HarmonyId = (typeof HARMONIES)[number]["id"];

const DEFAULT_HEX = "#E11D48";
const DEFAULT_HARMONY: HarmonyId = "analogous";
const INNER_RATIO = 0.76;
const RING_MID = (1 + INNER_RATIO) / 2;

const DEGREE_TICKS = [
  { deg: 0, label: "0°" },
  { deg: 30, label: "30°" },
  { deg: 60, label: "60°" },
  { deg: 90, label: "90°" },
  { deg: 120, label: "120°" },
  { deg: 150, label: "150°" },
  { deg: 180, label: "180°" },
  { deg: 210, label: "210°" },
  { deg: 240, label: "240°" },
  { deg: 270, label: "270°" },
  { deg: 300, label: "300°" },
  { deg: 330, label: "330°" },
];

const THEORY_HUES = [
  { name: "Red", h: 0, group: "Primary" },
  { name: "Orange", h: 30, group: "Secondary" },
  { name: "Yellow", h: 60, group: "Primary" },
  { name: "Chartreuse", h: 90, group: "Tertiary" },
  { name: "Green", h: 120, group: "Secondary" },
  { name: "Spring", h: 150, group: "Tertiary" },
  { name: "Cyan", h: 180, group: "Primary" },
  { name: "Azure", h: 210, group: "Tertiary" },
  { name: "Blue", h: 240, group: "Secondary" },
  { name: "Violet", h: 270, group: "Tertiary" },
  { name: "Magenta", h: 300, group: "Primary" },
  { name: "Rose", h: 330, group: "Tertiary" },
] as const;

function pointOnWheel(hue: number, radiusPct: number) {
  const rad = (hue * Math.PI) / 180;
  return { x: radiusPct * Math.sin(rad), y: -radiusPct * Math.cos(rad) };
}

function angleFromPoint(dx: number, dy: number) {
  let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg;
}

function lightnessFromAngle(deg: number) {
  return Math.round(50 + 50 * Math.cos((deg * Math.PI) / 180));
}

function angleFromLightness(l: number) {
  const c = Math.min(1, Math.max(-1, (l - 50) / 50));
  return (Math.acos(c) * 180) / Math.PI;
}

function colorsFromOffsets(hex: string, offsets: readonly number[]) {
  const { h, s, l } = rgbToHsl(hexToRgb(hex));
  return offsets.map((d) => rgbToHex(hslToRgb({ h: (h + d + 360) % 360, s, l })));
}

export function ColorWheelTool() {
  const { state: hex, set, undo, redo, canUndo, canRedo } = useHistoryState(DEFAULT_HEX);
  const [liveHex, setLiveHex] = useState(hex);
  const [hexInput, setHexInput] = useState(hex);
  const [harmony, setHarmony] = useState<HarmonyId>(DEFAULT_HARMONY);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<"swatches" | "preview" | "code">("swatches");

  const [session, setSession, sessionReady] = useLocalStorage<{ hex: string; harmony: HarmonyId }>(
    "colorbase-color-wheel",
    { hex: DEFAULT_HEX, harmony: DEFAULT_HARMONY }
  );
  const [readyToSave, setReadyToSave] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"wheel" | "light" | null>(null);
  const restored = useRef(false);
  const hexRef = useRef(hex);
  const liveRef = useRef(liveHex);
  hexRef.current = hex;
  liveRef.current = liveHex;

  const { add: addRecent, colors: recent } = useRecentColors();
  const { toggle, has, colors: favorites } = useFavoriteColors();

  const rgb = useMemo(() => hexToRgb(liveHex), [liveHex]);
  const hsl = useMemo(() => rgbToHsl(rgb), [rgb]);
  const activeHarmony = HARMONIES.find((h) => h.id === harmony) ?? HARMONIES[2];

  const harmonyColors = useMemo(
    () =>
      harmony === "monochromatic"
        ? generateHarmony(liveHex, "monochromatic")
        : colorsFromOffsets(liveHex, activeHarmony.offsets),
    [liveHex, harmony, activeHarmony.offsets]
  );

  const tints = useMemo(
    () => [0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((w) => mixColors(liveHex, "#ffffff", w)),
    [liveHex]
  );
  const shades = useMemo(
    () => [0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((w) => mixColors(liveHex, "#000000", w)),
    [liveHex]
  );
  const tones = useMemo(
    () => [0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((w) => mixColors(liveHex, "#808080", w)),
    [liveHex]
  );

  const persist = useCallback(
    (nextHex: string, nextHarmony: HarmonyId) => {
      setSession({ hex: nextHex, harmony: nextHarmony });
    },
    [setSession]
  );

  const commit = useCallback(
    (next: string) => {
      const n = normalizeHex(next);
      setLiveHex(n);
      setHexInput(n);
      if (n.toLowerCase() === hexRef.current.toLowerCase()) return;
      set(n);
      addRecent(n);
    },
    [set, addRecent]
  );

  const preview = useCallback((next: string) => {
    const n = normalizeHex(next);
    setLiveHex(n);
    setHexInput(n);
  }, []);

  const fromPartialHsl = useCallback((partial: Partial<typeof hsl>, source: string) => {
    return rgbToHex(hslToRgb({ ...rgbToHsl(hexToRgb(source)), ...partial }));
  }, []);

  const previewHsl = useCallback(
    (partial: Partial<typeof hsl>) => {
      preview(fromPartialHsl(partial, liveRef.current));
    },
    [fromPartialHsl, preview]
  );

  const commitHsl = useCallback(
    (partial: Partial<typeof hsl>) => {
      commit(fromPartialHsl(partial, liveRef.current));
    },
    [fromPartialHsl, commit]
  );

  useEffect(() => {
    if (dragging.current) return;
    setLiveHex(hex);
    setHexInput(hex);
  }, [hex]);

  useEffect(() => {
    if (!sessionReady || restored.current) return;
    restored.current = true;
    if (isValidHex(session.hex) && normalizeHex(session.hex).toLowerCase() !== hexRef.current.toLowerCase()) {
      const n = normalizeHex(session.hex);
      set(n);
      setLiveHex(n);
      setHexInput(n);
    }
    if (HARMONIES.some((item) => item.id === session.harmony)) {
      setHarmony(session.harmony);
    }
    setReadyToSave(true);
  }, [sessionReady, session, set]);

  useEffect(() => {
    if (!readyToSave) return;
    persist(hex, harmony);
  }, [hex, harmony, readyToSave, persist]);

  // Pointer interactions
  const applyFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = stageRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const outerR = rect.width / 2;
      const innerR = outerR * INNER_RATIO;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const deg = angleFromPoint(dx, dy);
      const mode = dragging.current;

      if (mode === "light" || (mode === null && dist >= innerR * 0.94 && dist <= outerR + 10)) {
        dragging.current = "light";
        const l = lightnessFromAngle(deg);
        previewHsl({ l });
        return;
      }

      if (mode === "wheel" || mode === null) {
        dragging.current = "wheel";
        const satPct = Math.min(100, Math.max(0, Math.round((dist / innerR) * 100)));
        previewHsl({ h: Math.round(deg), s: satPct });
      }
    },
    [previewHsl]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    applyFromPointer(e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    e.preventDefault();
    applyFromPointer(e.clientX, e.clientY);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    dragging.current = null;
    commit(liveRef.current);
  };

  const applyHexInput = () => {
    if (isValidHex(hexInput)) commit(hexInput);
    else setHexInput(hex);
  };

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied to clipboard`);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const pickFromScreen = async () => {
    type EyeDropperConstructor = new () => { open: () => Promise<{ sRGBHex: string }> };
    const ED = (window as unknown as { EyeDropper?: EyeDropperConstructor }).EyeDropper;
    if (!ED) {
      toast.error("EyeDropper is not supported in this browser.");
      return;
    }
    try {
      const result = await new ED().open();
      commit(result.sRGBHex);
    } catch {
      // cancelled
    }
  };

  const innerHandles =
    harmony === "monochromatic"
      ? [{ offset: 0, hue: hsl.h, color: liveHex }]
      : activeHarmony.offsets.map((offset) => {
          const hue = (hsl.h + offset + 360) % 360;
          return {
            offset,
            hue,
            color: rgbToHex(hslToRgb({ h: hue, s: hsl.s, l: hsl.l })),
          };
        });

  const chordPoints = innerHandles
    .map((item) => {
      const pos = pointOnWheel(item.hue, (hsl.s / 100) * INNER_RATIO * 50);
      return `${50 + pos.x},${50 + pos.y}`;
    })
    .join(" ");

  const lightPos = pointOnWheel(angleFromLightness(hsl.l), RING_MID * 50);
  const lightColor = rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: hsl.l }));

  // Dynamic CSS & Tailwind code generation
  const cssVariablesCode = `:root {\n${harmonyColors
    .map((c, i) => `  --color-${i === 0 ? "primary" : `harmony-${i}`}: ${c};`)
    .join("\n")}\n}`;

  const tailwindCode = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${harmonyColors
    .map((c, i) => `        ${i === 0 ? "primary" : `accent${i}`}: '${c}',`)
    .join("\n")}\n      }\n    }\n  }\n};`;

  return (
    <div className="space-y-8">
      {/* Main Color Wheel Stage Container with Glassmorphism */}
      <div className="relative overflow-hidden rounded-[2.25rem] border border-border/70 bg-gradient-to-b from-card via-card/90 to-card/60 p-4 shadow-2xl backdrop-blur-xl sm:p-6 lg:p-8">
        
        {/* Top Floating Glass Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/60 p-3 backdrop-blur-md shadow-xs">
          {/* Harmony Chords Pill Selector */}
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {HARMONIES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setHarmony(item.id)}
                className={cn(
                  "relative inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold tracking-tight transition-all duration-200",
                  harmony === item.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.03]"
                    : "border border-border/50 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Hex Direct Input Pill */}
            <div className="flex items-center rounded-xl border border-border/70 bg-background/80 px-2.5 py-1 shadow-2xs">
              <span className="font-mono text-xs font-bold text-primary mr-1">#</span>
              <Input
                value={hexInput.replace("#", "")}
                onChange={(e) => setHexInput(`#${e.target.value}`)}
                onBlur={applyHexInput}
                onKeyDown={(e) => e.key === "Enter" && applyHexInput()}
                className="h-7 w-20 border-0 bg-transparent p-0 font-mono text-xs font-bold uppercase shadow-none focus-visible:ring-0"
                maxLength={6}
                aria-label="Direct HEX Input"
              />
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 rounded-xl border-border/70 text-xs font-semibold hover:border-primary/40"
              onClick={() => commit(randomHex())}
            >
              <Shuffle className="h-3.5 w-3.5" />
              Random
            </Button>

            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-xl border-border/70"
              onClick={pickFromScreen}
              aria-label="Eyedropper Sample"
            >
              <Pipette className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-xl border-border/70"
              onClick={() => {
                const wasFav = has(liveHex);
                toggle(liveHex);
                toast.success(wasFav ? "Removed from favorites" : "Saved to favorites");
              }}
              aria-label="Save Favorite"
            >
              <Heart className={cn("h-4 w-4", has(liveHex) && "fill-rose-500 text-rose-500")} />
            </Button>

            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-xl border-border/70"
              disabled={!canUndo}
              onClick={undo}
              aria-label="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-xl border-border/70"
              disabled={!canRedo}
              onClick={redo}
              aria-label="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-xl border-border/70"
              onClick={() => commit(DEFAULT_HEX)}
              aria-label="Reset Wheel"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Wheel & Visual Workspace Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
          {/* Left Column: Interactive Wheel with Glowing Aesthetic */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <div
              ref={stageRef}
              role="slider"
              tabIndex={0}
              aria-label="Interactive Harmonic Color Wheel"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="relative aspect-square w-full max-w-[28rem] cursor-crosshair touch-none select-none outline-none"
            >
              {/* Outer Precision Degree Ticks */}
              {DEGREE_TICKS.map((t) => {
                const pt = pointOnWheel(t.deg, 51.5);
                return (
                  <span
                    key={t.deg}
                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 font-mono text-[9px] font-bold text-muted-foreground/60 select-none"
                    style={{ left: `calc(50% + ${pt.x}%)`, top: `calc(50% + ${pt.y}%)` }}
                  >
                    {t.label}
                  </span>
                );
              })}

              {/* Lightness Outer Ring */}
              <div
                className="absolute inset-[3%] rounded-full shadow-[0_0_50px_rgba(0,0,0,0.25)] transition-all"
                style={{
                  background: `conic-gradient(from 0deg, hsl(${hsl.h} ${hsl.s}% 100%), hsl(${hsl.h} ${hsl.s}% 75%), hsl(${hsl.h} ${hsl.s}% 50%), hsl(${hsl.h} ${hsl.s}% 25%), hsl(${hsl.h} ${hsl.s}% 0%), hsl(${hsl.h} ${hsl.s}% 25%), hsl(${hsl.h} ${hsl.s}% 50%), hsl(${hsl.h} ${hsl.s}% 75%), hsl(${hsl.h} ${hsl.s}% 100%))`,
                }}
              />

              {/* Separator Ring */}
              <div
                className="absolute rounded-full bg-background/90 shadow-[0_0_12px_rgba(0,0,0,0.15)] backdrop-blur-sm"
                style={{ inset: `${((1 - INNER_RATIO) / 2) * 100 + 1}%` }}
              />

              {/* Conical Hue + Saturation Disc */}
              <div
                className="absolute overflow-hidden rounded-full shadow-inner"
                style={{
                  inset: `${((1 - INNER_RATIO) / 2) * 100 + 2.5}%`,
                  background: [
                    "radial-gradient(circle closest-side, #ffffff 0%, rgba(255,255,255,0.92) 10%, transparent 80%)",
                    "conic-gradient(from 0deg, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))",
                  ].join(", "),
                }}
              />

              {/* SVG Connecting Harmony Chords / Web */}
              <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 z-[2] h-full w-full">
                {innerHandles.length >= 2 &&
                  (innerHandles.length === 2 ? (
                    <line
                      x1={50 + pointOnWheel(innerHandles[0].hue, (hsl.s / 100) * INNER_RATIO * 50).x}
                      y1={50 + pointOnWheel(innerHandles[0].hue, (hsl.s / 100) * INNER_RATIO * 50).y}
                      x2={50 + pointOnWheel(innerHandles[1].hue, (hsl.s / 100) * INNER_RATIO * 50).x}
                      y2={50 + pointOnWheel(innerHandles[1].hue, (hsl.s / 100) * INNER_RATIO * 50).y}
                      stroke="white"
                      strokeWidth="1.8"
                      strokeDasharray="2,2"
                      style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,0.8))" }}
                    />
                  ) : (
                    <polygon
                      points={chordPoints}
                      fill="rgba(255,255,255,0.22)"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                      style={{ filter: "drop-shadow(0 0 6px rgba(0,0,0,0.75))" }}
                    />
                  ))}
              </svg>

              {/* Interactive Node Handles */}
              {innerHandles.map((item) => {
                const pos = pointOnWheel(item.hue, (hsl.s / 100) * INNER_RATIO * 50);
                const isBase = item.offset === 0;
                return (
                  <div
                    key={item.offset}
                    className={cn(
                      "pointer-events-none absolute z-[3] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white transition-transform duration-75",
                      isBase
                        ? "h-8 w-8 shadow-[0_0_20px_rgba(255,255,255,0.9)] ring-4 ring-black/40 scale-110"
                        : "h-6 w-6 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                    )}
                    style={{
                      left: `calc(50% + ${pos.x}%)`,
                      top: `calc(50% + ${pos.y}%)`,
                      backgroundColor: item.color,
                    }}
                  >
                    {isBase && (
                      <span className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-white shadow-xs" />
                    )}
                  </div>
                );
              })}

              {/* Lightness Slider Pin on Outer Ring */}
              <div
                className="pointer-events-none absolute z-[3] h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_0_15px_rgba(0,0,0,0.6)] ring-2 ring-black/30"
                style={{
                  left: `calc(50% + ${lightPos.x}%)`,
                  top: `calc(50% + ${lightPos.y}%)`,
                  backgroundColor: lightColor,
                }}
              />

              {/* Center Glass Droplet Pill */}
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 z-[4] flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-4 border-white/95 shadow-2xl backdrop-blur-md"
                style={{ backgroundColor: liveHex }}
              >
                <span className="font-mono text-[11px] font-extrabold uppercase text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                  {liveHex}
                </span>
                <span className="text-[9px] font-bold text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {hsl.h}°
                </span>
              </div>
            </div>

            {/* Instruction Tip */}
            <p className="text-center text-xs text-muted-foreground font-medium">
              💡 Drag the <strong>inner disc</strong> for Hue &amp; Saturation · Drag the <strong>outer ring</strong> for Lightness.
            </p>

            {/* HSL Sliders */}
            <div className="w-full max-w-md grid gap-3 sm:grid-cols-3">
              <Channel
                label="Hue"
                value={hsl.h}
                min={0}
                max={360}
                suffix="°"
                gradient="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
                onChange={(h) => previewHsl({ h })}
                onCommit={(h) => commitHsl({ h })}
              />
              <Channel
                label="Saturation"
                value={hsl.s}
                min={0}
                max={100}
                suffix="%"
                gradient={`linear-gradient(to right, hsl(${hsl.h} 0% ${hsl.l}%), hsl(${hsl.h} 100% ${hsl.l}%))`}
                onChange={(s) => previewHsl({ s })}
                onCommit={(s) => commitHsl({ s })}
              />
              <Channel
                label="Lightness"
                value={hsl.l}
                min={0}
                max={100}
                suffix="%"
                gradient={`linear-gradient(to right, #000, hsl(${hsl.h} ${hsl.s}% 50%), #fff)`}
                onChange={(l) => previewHsl({ l })}
                onCommit={(l) => commitHsl({ l })}
              />
            </div>
          </div>

          {/* Right Column: Palette Swatches & Live Preview Workspace */}
          <div className="flex flex-col rounded-3xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm shadow-sm space-y-5">
            {/* Tab Navigation */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("swatches")}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
                    activeTab === "swatches"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  Harmonic Swatches
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
                    activeTab === "preview"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  Live UI Preview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("code")}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
                    activeTab === "code"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  Code Tokens
                </button>
              </div>

              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                {activeHarmony.label}
              </span>
            </div>

            {/* TAB 1: Harmonic Swatches */}
            {activeTab === "swatches" && (
              <div className="space-y-4">
                <div className="flex h-56 w-full overflow-hidden rounded-2xl border border-border shadow-inner">
                  {harmonyColors.map((color, i) => {
                    const textColor = getTextColor(color);
                    const contrastOnWhite = getContrastRatio(color, "#FFFFFF").toFixed(1);
                    const isBase = harmony === "monochromatic" ? i === 0 : activeHarmony.offsets[i] === 0;

                    return (
                      <div
                        key={`${color}-${i}`}
                        className="group relative flex flex-1 flex-col justify-between p-3.5 transition-all duration-300 hover:flex-[1.5]"
                        style={{ backgroundColor: color, color: textColor }}
                      >
                        <div className="flex items-start justify-between">
                          <span className="rounded-md bg-black/40 px-2 py-0.5 font-mono text-[10px] font-bold text-white backdrop-blur-xs">
                            {isBase ? "Anchor" : `+${activeHarmony.offsets[i]}°`}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(color, `swatch-${i}`)}
                            className="rounded-lg bg-black/40 p-1.5 text-white backdrop-blur-xs hover:bg-black/60 transition-colors"
                            aria-label="Copy color"
                          >
                            {copiedKey === `swatch-${i}` ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>

                        <div>
                          <p className="font-mono text-xs font-extrabold uppercase tracking-tight drop-shadow-xs">
                            {color}
                          </p>
                          <p className="text-[10px] opacity-80 mt-0.5 font-medium">
                            Contrast {contrastOnWhite}:1
                          </p>
                          {!isBase && (
                            <button
                              type="button"
                              onClick={() => commit(color)}
                              className="mt-2 hidden rounded-md bg-white/20 px-2 py-1 text-[9px] font-bold text-white uppercase backdrop-blur-xs hover:bg-white/30 group-hover:inline-block"
                            >
                              Make Anchor
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>{activeHarmony.hint}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(harmonyColors.join(", "), "all-hex")}
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                  >
                    {copiedKey === "all-hex" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy All Swatches
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Live UI Component Preview */}
            {activeTab === "preview" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Product UI Mockup</span>
                  <button
                    type="button"
                    onClick={() => setPreviewTheme(previewTheme === "light" ? "dark" : "light")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted"
                  >
                    {previewTheme === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                    {previewTheme === "light" ? "Dark Surface" : "Light Surface"}
                  </button>
                </div>

                {/* Simulated UI App Card */}
                <div
                  className={`overflow-hidden rounded-2xl border p-5 transition-colors duration-300 shadow-md ${
                    previewTheme === "dark" ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-3 border-neutral-500/20">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: liveHex }} />
                      <span className="font-display text-xs font-bold tracking-tight">ColorBase Studio</span>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-xs"
                      style={{
                        backgroundColor: harmonyColors[1] || liveHex,
                        color: getTextColor(harmonyColors[1] || liveHex),
                      }}
                    >
                      {activeHarmony.label}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-display text-base font-bold">Harmonious Design System</h5>
                    <p className="mt-1 text-xs opacity-70 leading-relaxed">
                      Notice how the primary color anchors the surface, while the complementary accent draws visual attention.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        className="rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-opacity hover:opacity-90"
                        style={{
                          backgroundColor: liveHex,
                          color: getTextColor(liveHex),
                        }}
                      >
                        Primary Action
                      </button>
                      <button
                        type="button"
                        className="rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-opacity hover:opacity-90"
                        style={{
                          backgroundColor: harmonyColors[1] || "#64748b",
                          color: getTextColor(harmonyColors[1] || "#64748b"),
                        }}
                      >
                        Accent Button
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Developer Code Tokens */}
            {activeTab === "code" && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-semibold text-muted-foreground">CSS Custom Properties</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(cssVariablesCode, "css")}
                      className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                    >
                      {copiedKey === "css" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      Copy CSS
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-3 font-mono text-xs text-neutral-200">
                    {cssVariablesCode}
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-semibold text-muted-foreground">Tailwind Config</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(tailwindCode, "tw")}
                      className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                    >
                      {copiedKey === "tw" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      Copy Tailwind
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-3 font-mono text-xs text-neutral-200">
                    {tailwindCode}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tints, Shades, and Tones Scales */}
      <div className="grid gap-4">
        <ShadeRow label="Tints" caption="Lightness scale with white" colors={tints} onPick={commit} />
        <ShadeRow label="Shades" caption="Depth scale with black" colors={shades} onPick={commit} />
        <ShadeRow label="Tones" caption="Desaturated with grey" colors={tones} onPick={commit} />
      </div>

      {/* Recent & Favorites Strips */}
      {(recent.length > 0 || favorites.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {recent.length > 0 && (
            <ColorStrip label="Recent Palette Seeds" colors={recent.slice(0, 12)} current={liveHex} onPick={commit} />
          )}
          {favorites.length > 0 && (
            <ColorStrip label="Starred Favorites" colors={favorites.slice(0, 12)} current={liveHex} onPick={commit} />
          )}
        </div>
      )}

      {/* Color Theory Reference */}
      <TheoryGuide onPick={(h) => commitHsl({ h, s: 90, l: 50 })} />
    </div>
  );
}

function Channel({
  label,
  value,
  min,
  max,
  suffix,
  gradient,
  onChange,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  gradient: string;
  onChange: (n: number) => void;
  onCommit: (n: number) => void;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n)));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
        <span className="font-mono text-xs font-bold text-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-2 rounded-full shadow-inner" style={{ background: gradient }} />
      <Slider
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={([n]) => onChange(n)}
        onValueCommit={([n]) => onCommit(clamp(n))}
        className="cursor-pointer"
      />
    </div>
  );
}

function ShadeRow({
  label,
  caption,
  colors,
  onPick,
}: {
  label: string;
  caption: string;
  colors: string[];
  onPick: (hex: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs">
      <div className="flex items-baseline justify-between pb-2.5">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">{label}</p>
        <p className="text-[11px] text-muted-foreground">{caption}</p>
      </div>
      <div className="flex h-16 overflow-hidden rounded-xl border border-border sm:h-20">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            className="group relative min-w-0 flex-1 transition-all hover:z-10 hover:scale-[1.04]"
            style={{ backgroundColor: color }}
            aria-label={`${label} ${color}`}
            onClick={() => onPick(color)}
            title={color}
          >
            <span
              className="pointer-events-none absolute inset-x-0 bottom-1.5 text-center font-mono text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100"
              style={{ color: getTextColor(color) }}
            >
              {color.replace("#", "").toUpperCase()}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorStrip({
  label,
  colors,
  current,
  onPick,
}: {
  label: string;
  colors: string[];
  current: string;
  onPick: (hex: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onPick(color)}
            className={cn(
              "h-8 w-8 rounded-full border border-black/10 shadow-xs transition-transform hover:scale-115",
              color.toLowerCase() === current.toLowerCase() && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
            style={{ backgroundColor: color }}
            aria-label={color}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}

function TheoryGuide({ onPick }: { onPick: (h: number) => void }) {
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-6 sm:p-8" aria-labelledby="color-theory-heading">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Color Theory Architecture
        </span>
        <h2 id="color-theory-heading" className="mt-1 font-display text-xl font-bold tracking-tight sm:text-2xl">
          Harmonic Principles of the Color Wheel
        </h2>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground sm:text-sm">
          Rotate through the 360° spectrum. Combine high-contrast complementary opposites, balanced triadic triads, or comforting analogous chords.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Complementary (180°)",
            body: "Maximum contrast pair. Perfect for eye-catching hero CTA buttons, notification badges, and high-impact accents.",
          },
          {
            title: "Analogous (±30°)",
            body: "Adjacent hues sharing undertones. Creates tranquil, serene, and naturally cohesive user interfaces.",
          },
          {
            title: "Triadic (120°)",
            body: "Equilateral chromatic triangle. Balances high energy with geometric harmony when one hue leads.",
          },
          {
            title: "Split-Complementary",
            body: "Base hue plus two neighbors of its complement. High vibrancy with less eye strain and visual tension.",
          },
          {
            title: "Tetradic & Square",
            body: "Four-color geometric schemas. Provides rich palette variety for complex infographics and design systems.",
          },
          {
            title: "Tints, Shades & Tones",
            body: "Lightness and saturation scales. The secret to building full accessible UI surfaces, borders, and typography.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-border/80 bg-background/50 p-4 shadow-2xs"
          >
            <h3 className="font-display text-sm font-bold text-foreground">{card.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{card.body}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-xs">
        <div className="px-4 py-2.5 border-b border-border/60">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            12 Canonical Wheel Hues (Click to Seed)
          </p>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12">
          {THEORY_HUES.map((item) => {
            const color = rgbToHex(hslToRgb({ h: item.h, s: 90, l: 50 }));
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => onPick(item.h)}
                className="flex min-h-[4.5rem] flex-col justify-end p-2.5 text-left transition-all hover:brightness-110"
                style={{ backgroundColor: color, color: getTextColor(color) }}
              >
                <span className="text-[9px] font-bold uppercase tracking-wide opacity-80">{item.group}</span>
                <span className="text-xs font-bold">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
