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
} from "@/lib/colors/convert";
import { useFavoriteColors, useHistoryState, useLocalStorage, useRecentColors } from "@/hooks";
import { cn } from "@/lib/utils";

const HARMONIES = [
  { id: "complementary", label: "Complementary", hint: "Opposite on the wheel", offsets: [0, 180] },
  { id: "split-complementary", label: "Split", hint: "Base + two beside the complement", offsets: [0, 150, 210] },
  { id: "analogous", label: "Analogous", hint: "Neighbors of the base hue", offsets: [-30, 0, 30] },
  { id: "triadic", label: "Triadic", hint: "Three hues, 120° apart", offsets: [0, 120, 240] },
  { id: "tetradic", label: "Tetradic", hint: "Two complementary pairs", offsets: [0, 60, 180, 240] },
  { id: "square", label: "Square", hint: "Four hues, 90° apart", offsets: [0, 90, 180, 270] },
  { id: "monochromatic", label: "Mono", hint: "One hue, stepped lightness", offsets: [0] },
] as const;

type HarmonyId = (typeof HARMONIES)[number]["id"];

const DEFAULT_HEX = "#e11d48";
const DEFAULT_HARMONY: HarmonyId = "analogous";
const INNER_RATIO = 0.78;
const RING_MID = (1 + INNER_RATIO) / 2;

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

function CopyMini({ value, label }: { value: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-black/20 text-white/90 backdrop-blur-sm transition hover:bg-black/35"
      aria-label={`Copy ${label ?? value}`}
      onClick={async (e) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(value);
        toast.success(`${label ?? "Value"} copied`);
        setOk(true);
        window.setTimeout(() => setOk(false), 1100);
      }}
    >
      {ok ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

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
  const [session, setSession, sessionReady] = useLocalStorage<{ hex: string; harmony: HarmonyId }>(
    "colorbase-color-wheel",
    { hex: DEFAULT_HEX, harmony: DEFAULT_HARMONY }
  );
  const [readyToSave, setReadyToSave] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"wheel" | "light" | null>(null);
  const dragOffset = useRef(0);
  const restored = useRef(false);
  const hexRef = useRef(hex);
  const liveRef = useRef(liveHex);
  hexRef.current = hex;
  liveRef.current = liveHex;

  const { add: addRecent, colors: recent } = useRecentColors();
  const { toggle, has, colors: favorites } = useFavoriteColors();

  const rgb = useMemo(() => hexToRgb(liveHex), [liveHex]);
  const hsl = useMemo(() => rgbToHsl(rgb), [rgb]);
  const textOn = useMemo(() => getTextColor(liveHex), [liveHex]);
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable=true]")) return;
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key.toLowerCase() === "z" && e.shiftKey) || e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

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

      if (mode === "light" || (mode === null && dist >= innerR * 0.96 && dist <= outerR + 8)) {
        previewHsl({ l: lightnessFromAngle(deg) });
        return "light" as const;
      }

      const sat = Math.round((Math.min(dist, innerR) / innerR) * 100);
      const handleHue = deg;
      const baseHue = (handleHue - dragOffset.current + 360) % 360;
      preview(fromPartialHsl({ h: Math.round(baseHue), s: sat }, liveRef.current));
      return "wheel" as const;
    },
    [fromPartialHsl, preview, previewHsl]
  );

  const nearestOffset = (clientX: number, clientY: number) => {
    const el = stageRef.current;
    if (!el || harmony === "monochromatic") return 0;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let best = 0;
    let bestDist = Infinity;
    for (const offset of activeHarmony.offsets) {
      const hue = (hsl.h + offset + 360) % 360;
      const pos = pointOnWheel(hue, (hsl.s / 100) * INNER_RATIO * 50);
      const px = cx + (pos.x / 100) * rect.width;
      const py = cy + (pos.y / 100) * rect.height;
      const d = Math.hypot(clientX - px, clientY - py);
      if (d < bestDist) {
        bestDist = d;
        best = offset;
      }
    }
    return bestDist < 28 ? best : 0;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    dragOffset.current = nearestOffset(e.clientX, e.clientY);
    const mode = applyFromPointer(e.clientX, e.clientY);
    dragging.current = mode ?? "wheel";
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    applyFromPointer(e.clientX, e.clientY);
  };

  const onPointerUp = () => {
    dragging.current = null;
    commit(liveRef.current);
  };

  const onWheelKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      commitHsl({ h: (hsl.h - step + 360) % 360 });
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      commitHsl({ h: (hsl.h + step) % 360 });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      commitHsl({ s: Math.min(100, hsl.s + step) });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      commitHsl({ s: Math.max(0, hsl.s - step) });
    }
  };

  const applyHexInput = () => {
    if (!isValidHex(hexInput)) {
      toast.error("Enter a valid HEX color");
      setHexInput(liveHex);
      return;
    }
    commit(hexInput);
  };

  const copyHarmony = async () => {
    await navigator.clipboard.writeText(harmonyColors.join("\n"));
    toast.success("Harmony HEX copied");
  };

  const pickFromScreen = async () => {
    const ED = (window as Window & { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } })
      .EyeDropper;
    if (!ED) {
      toast.error("Eyedropper is not supported in this browser");
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

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[1.75rem] border border-border/50 bg-background/80 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/40 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
            {HARMONIES.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.hint}
                onClick={() => setHarmony(item.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-wide transition-all",
                  harmony === item.id
                    ? "border-rose-500/40 bg-rose-500 text-white shadow-sm shadow-rose-500/25"
                    : "border-border/60 bg-background/70 text-muted-foreground hover:border-rose-500/30 hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/20 pl-3 pr-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                HEX
              </span>
              <Input
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                onBlur={applyHexInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyHexInput();
                }}
                className="h-8 w-[7.5rem] border-0 bg-transparent px-1 font-mono text-sm uppercase shadow-none focus-visible:ring-0"
                aria-label="HEX"
              />
            </div>
            <Button type="button" size="sm" className="h-8 rounded-full" onClick={() => commit(randomHex())}>
              <Shuffle className="h-3.5 w-3.5" />
              Random
            </Button>
            <Button type="button" size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={pickFromScreen} aria-label="Sample from screen">
              <Pipette className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={copyHarmony} aria-label="Copy palette">
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-full"
              onClick={() => {
                const wasFav = has(liveHex);
                toggle(liveHex);
                toast.success(wasFav ? "Removed from favorites" : "Saved to favorites");
              }}
              aria-label={has(liveHex) ? "Remove favorite" : "Save favorite"}
            >
              <Heart className={cn("h-3.5 w-3.5", has(liveHex) && "fill-rose-500 text-rose-500")} />
            </Button>
            <Button type="button" size="icon" variant="outline" className="h-8 w-8 rounded-full" disabled={!canUndo} onClick={undo} aria-label="Undo">
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" size="icon" variant="outline" className="h-8 w-8 rounded-full" disabled={!canRedo} onClick={redo} aria-label="Redo">
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => commit(DEFAULT_HEX)} aria-label="Reset">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="flex flex-col justify-center gap-5 p-4 sm:p-6 lg:p-8">
            <div
              ref={stageRef}
              role="slider"
              tabIndex={0}
              aria-label="Color wheel. Drag the inner disc for hue and saturation, the outer ring for lightness. Harmony handles move together."
              aria-valuemin={0}
              aria-valuemax={360}
              aria-valuenow={hsl.h}
              aria-valuetext={`${activeHarmony.label}. Hue ${hsl.h}°, saturation ${hsl.s}%, lightness ${hsl.l}%`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={onWheelKey}
              className="relative mx-auto aspect-square w-full max-w-[26rem] cursor-crosshair touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div
                className="absolute inset-0 rounded-full shadow-[0_18px_50px_-20px_rgba(15,23,42,0.55)]"
                style={{
                  background: `conic-gradient(from 0deg, hsl(${hsl.h} ${hsl.s}% 100%), hsl(${hsl.h} ${hsl.s}% 75%), hsl(${hsl.h} ${hsl.s}% 50%), hsl(${hsl.h} ${hsl.s}% 25%), hsl(${hsl.h} ${hsl.s}% 0%), hsl(${hsl.h} ${hsl.s}% 25%), hsl(${hsl.h} ${hsl.s}% 50%), hsl(${hsl.h} ${hsl.s}% 75%), hsl(${hsl.h} ${hsl.s}% 100%))`,
                }}
              />
              <div
                className="absolute rounded-full bg-background shadow-[0_0_0_3px_rgba(255,255,255,0.55)]"
                style={{ inset: `${((1 - INNER_RATIO) / 2) * 100}%` }}
              />
              <div
                className="absolute overflow-hidden rounded-full"
                style={{
                  inset: `${((1 - INNER_RATIO) / 2) * 100 + 0.6}%`,
                  background: [
                    "radial-gradient(circle closest-side, #fff 0%, rgba(255,255,255,0.92) 8%, transparent 70%)",
                    "conic-gradient(from 0deg, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))",
                  ].join(", "),
                }}
              />
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[18%] w-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-lg"
                style={{ backgroundColor: liveHex }}
              />
              <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 z-[2] h-full w-full">
                {innerHandles.length >= 2 &&
                  (innerHandles.length === 2 ? (
                    <line
                      x1={50 + pointOnWheel(innerHandles[0].hue, (hsl.s / 100) * INNER_RATIO * 50).x}
                      y1={50 + pointOnWheel(innerHandles[0].hue, (hsl.s / 100) * INNER_RATIO * 50).y}
                      x2={50 + pointOnWheel(innerHandles[1].hue, (hsl.s / 100) * INNER_RATIO * 50).x}
                      y2={50 + pointOnWheel(innerHandles[1].hue, (hsl.s / 100) * INNER_RATIO * 50).y}
                      stroke="white"
                      strokeWidth="1.1"
                      strokeOpacity="0.9"
                    />
                  ) : (
                    <polygon
                      points={chordPoints}
                      fill="rgba(255,255,255,0.16)"
                      stroke="white"
                      strokeWidth="1.1"
                      strokeLinejoin="round"
                    />
                  ))}
              </svg>
              {innerHandles.map((item) => {
                const pos = pointOnWheel(item.hue, (hsl.s / 100) * INNER_RATIO * 50);
                const isBase = item.offset === 0;
                return (
                  <div
                    key={item.offset}
                    className={cn(
                      "pointer-events-none absolute z-[3] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_2px_10px_rgba(0,0,0,0.35)]",
                      isBase ? "h-7 w-7 ring-2 ring-black/20" : "h-5 w-5"
                    )}
                    style={{
                      left: `calc(50% + ${pos.x}%)`,
                      top: `calc(50% + ${pos.y}%)`,
                      backgroundColor: item.color,
                    }}
                  />
                );
              })}
              <div
                className="pointer-events-none absolute z-[3] h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_2px_10px_rgba(0,0,0,0.4)]"
                style={{
                  left: `calc(50% + ${lightPos.x}%)`,
                  top: `calc(50% + ${lightPos.y}%)`,
                  backgroundColor: lightColor,
                }}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Inner disc: hue + saturation. Outer ring: lightness. Handles stay locked as a {activeHarmony.label.toLowerCase()} chord.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Channel
                label="H"
                value={hsl.h}
                min={0}
                max={360}
                suffix="°"
                gradient="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
                onChange={(h) => previewHsl({ h })}
                onCommit={(h) => commitHsl({ h })}
              />
              <Channel
                label="S"
                value={hsl.s}
                min={0}
                max={100}
                suffix="%"
                gradient={`linear-gradient(to right, hsl(${hsl.h} 0% ${hsl.l}%), hsl(${hsl.h} 100% ${hsl.l}%))`}
                onChange={(s) => previewHsl({ s })}
                onCommit={(s) => commitHsl({ s })}
              />
              <Channel
                label="L"
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

          <div className="flex min-h-[280px] flex-col border-t border-border/40 lg:border-l lg:border-t-0">
            <div className="flex min-h-[320px] flex-1 overflow-hidden lg:min-h-full">
              {harmonyColors.map((color, i) => {
                const onSwatch = getTextColor(color);
                const offset = harmony === "monochromatic" ? null : (activeHarmony.offsets[i] ?? 0);
                const isBase =
                  harmony === "monochromatic"
                    ? color.toLowerCase() === liveHex.toLowerCase()
                    : offset === 0;
                const caption =
                  harmony === "monochromatic"
                    ? `L ${rgbToHsl(hexToRgb(color)).l}%`
                    : isBase
                      ? "Base"
                      : `${(offset ?? 0) > 0 ? "+" : ""}${offset}°`;
                return (
                  <div
                    key={`${color}-${i}`}
                    className={cn("relative flex min-w-0 flex-1 flex-col", isBase && "z-10")}
                    style={{ backgroundColor: color, color: onSwatch }}
                  >
                    {isBase && <span className="absolute inset-x-0 top-0 h-1 bg-white/80" />}
                    <button
                      type="button"
                      onClick={() => commit(color)}
                      className="min-h-[8rem] flex-1"
                      aria-label={`Use ${color}`}
                    />
                    <div className="flex items-center justify-between gap-1 p-3 sm:p-4">
                      <div>
                        <p className="font-mono text-sm font-semibold tracking-tight sm:text-base">
                          {color.toUpperCase()}
                        </p>
                        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] opacity-70">
                          {caption}
                        </p>
                      </div>
                      <CopyMini value={color} label="HEX" />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-border/40 bg-background/70 px-4 py-2.5">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{activeHarmony.label}</span>
                {" · "}
                {activeHarmony.hint}
              </p>
              <span className="font-mono text-[11px] text-muted-foreground">{formatRgb(rgb)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <ShadeRow label="Tints" caption="Add white" colors={tints} onPick={commit} />
        <ShadeRow label="Shades" caption="Add black" colors={shades} onPick={commit} />
        <ShadeRow label="Tones" caption="Add gray" colors={tones} onPick={commit} />
      </div>

      {(recent.length > 0 || favorites.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {recent.length > 0 && (
            <ColorStrip label="Recent" colors={recent.slice(0, 12)} current={liveHex} onPick={commit} />
          )}
          {favorites.length > 0 && (
            <ColorStrip label="Favorites" colors={favorites.slice(0, 12)} current={liveHex} onPick={commit} />
          )}
        </div>
      )}

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
        <Label className="text-[11px] font-semibold uppercase tracking-wide">{label}</Label>
        <span className="font-mono text-[11px] text-muted-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: gradient }} />
      <Slider
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={([n]) => onChange(n)}
        onValueCommit={([n]) => onCommit(clamp(n))}
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
    <div className="overflow-hidden rounded-[1.35rem] border border-border/50 bg-background/70 shadow-sm">
      <div className="flex items-baseline justify-between px-4 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">{label}</p>
        <p className="text-[11px] text-muted-foreground">{caption}</p>
      </div>
      <div className="flex h-16 overflow-hidden sm:h-[4.5rem]">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            className="group relative min-w-0 flex-1 transition-transform hover:z-10 hover:scale-[1.03]"
            style={{ backgroundColor: color }}
            aria-label={`${label} ${color}`}
            onClick={() => onPick(color)}
            title={color}
          >
            <span
              className="pointer-events-none absolute inset-x-0 bottom-1 text-center font-mono text-[10px] font-medium opacity-0 transition-opacity group-hover:opacity-100"
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
    <div className="overflow-hidden rounded-[1.35rem] border border-border/50 bg-background/70 p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onPick(color)}
            className={cn(
              "h-8 w-8 rounded-full border border-black/10 shadow-sm transition-transform hover:scale-110",
              color.toLowerCase() === current.toLowerCase() && "ring-2 ring-rose-500 ring-offset-2 ring-offset-background"
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
    <section className="space-y-4" aria-labelledby="color-theory-heading">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
          Color theory
        </p>
        <h2 id="color-theory-heading" className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
          How the wheel builds a palette
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Hue runs around the circle, saturation falls toward the center, and the outer ring lightens or darkens the
          chord. Pick a harmony, then fine-tune tints, shades, and tones.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Complementary",
            body: "Two hues opposite each other. High contrast — use one as the dominant color and the other as an accent.",
          },
          {
            title: "Analogous",
            body: "Neighbors on the wheel. Soft, cohesive palettes that show up often in product UI and brand systems.",
          },
          {
            title: "Triadic",
            body: "Three hues 120° apart. Bright and balanced when one color leads and the others support.",
          },
          {
            title: "Split complementary",
            body: "Base plus the two hues beside its complement. Easier to live with than a raw complementary pair.",
          },
          {
            title: "Tetradic & square",
            body: "Four hues: tetradic is two complementary pairs; square is even 90° steps. Best as a starting palette.",
          },
          {
            title: "Tints, shades, tones",
            body: "White, black, and gray variants of the base. Use them for surfaces, type, hover states, and depth.",
          },
        ].map((card) => (
          <article
            key={card.title}
            className="card-lift rounded-[1.35rem] border border-border/50 bg-background/70 p-4 shadow-sm"
          >
            <h3 className="font-display text-sm font-semibold">{card.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
          </article>
        ))}
      </div>
      <div className="overflow-hidden rounded-[1.35rem] border border-border/50 bg-background/70 shadow-sm">
        <div className="px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
            12 hues on this RGB wheel
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
                className="flex min-h-[4.5rem] flex-col justify-end p-2 text-left transition hover:brightness-110"
                style={{ backgroundColor: color, color: getTextColor(color) }}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{item.group}</span>
                <span className="text-xs font-semibold">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
