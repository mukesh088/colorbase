"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Contrast,
  Copy,
  Heart,
  Pipette,
  Redo2,
  Shuffle,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  checkContrast,
  formatHsl,
  formatRgb,
  generateHarmony,
  getTextColor,
  hexToRgb,
  hslToRgb,
  hsvToRgb,
  isValidHex,
  mixColors,
  normalizeHex,
  randomHex,
  rgbToCmyk,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
} from "@/lib/colors/convert";
import { useFavoriteColors, useHistoryState, useRecentColors } from "@/hooks";
import { cn } from "@/lib/utils";

interface AdvancedColorPickerProps {
  initialColor?: string;
  className?: string;
}

const HARMONIES = [
  { id: "complementary", label: "Complement" },
  { id: "analogous", label: "Analogous" },
  { id: "triadic", label: "Triadic" },
  { id: "tetradic", label: "Tetradic" },
  { id: "split-complementary", label: "Split" },
  { id: "monochromatic", label: "Mono" },
] as const;

function CopyMini({ value, label }: { value: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-muted-foreground transition-all hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300"
      aria-label={`Copy ${label ?? value}`}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        toast.success(`${label ?? "Value"} copied`);
        setOk(true);
        window.setTimeout(() => setOk(false), 1100);
      }}
    >
      {ok ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function FormatRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          value={value}
          readOnly={!onChange}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className="h-10 rounded-xl border-border/50 bg-muted/20 font-mono text-sm"
          aria-label={label}
        />
        <CopyMini value={value} label={label} />
      </div>
    </div>
  );
}

function ChannelSlider({
  label,
  value,
  min,
  max,
  onChange,
  gradient,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  gradient?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs">{label}</Label>
        <Input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isFinite(n)) return;
            onChange(Math.min(max, Math.max(min, Math.round(n))));
          }}
          className="h-8 w-16 rounded-lg border-border/50 bg-muted/20 px-2 text-center font-mono text-xs"
          aria-label={`${label} value`}
        />
      </div>
      {gradient && <div className="h-1.5 rounded-full" style={{ background: gradient }} />}
      <Slider min={min} max={max} step={1} value={[value]} onValueChange={([n]) => onChange(n)} />
    </div>
  );
}

function WcagPill({ label, pass }: { label: string; pass: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        pass
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-border/60 bg-muted/40 text-muted-foreground"
      )}
    >
      {label} {pass ? "✓" : "—"}
    </span>
  );
}

export function AdvancedColorPicker({
  initialColor = "#e11d48",
  className,
}: AdvancedColorPickerProps) {
  const { state: hex, set, undo, redo, canUndo, canRedo } = useHistoryState(
    normalizeHex(initialColor)
  );
  const [hexInput, setHexInput] = useState(hex);
  const [harmony, setHarmony] = useState<(typeof HARMONIES)[number]["id"]>("analogous");
  const [mode, setMode] = useState<"hsv" | "rgb" | "hsl">("hsv");
  const satRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const { add: addRecent, colors: recent } = useRecentColors();
  const { toggle, has, colors: favorites } = useFavoriteColors();

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => rgbToHsl(rgb), [rgb]);
  const hsv = useMemo(() => rgbToHsv(rgb), [rgb]);
  const cmyk = useMemo(() => rgbToCmyk(rgb), [rgb]);
  const textOn = useMemo(() => getTextColor(hex), [hex]);
  const vsWhite = useMemo(() => checkContrast(hex, "#ffffff"), [hex]);
  const vsBlack = useMemo(() => checkContrast(hex, "#000000"), [hex]);

  const tints = useMemo(
    () => [0.15, 0.3, 0.45, 0.6, 0.75].map((w) => mixColors(hex, "#ffffff", w)),
    [hex]
  );
  const shades = useMemo(
    () => [0.15, 0.3, 0.45, 0.6, 0.75].map((w) => mixColors(hex, "#000000", w)),
    [hex]
  );
  const harmonyColors = useMemo(() => generateHarmony(hex, harmony), [hex, harmony]);

  const cssVars = useMemo(
    () =>
      [
        `--color: ${hex};`,
        `--color-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};`,
        `--color-hsl: ${hsl.h} ${hsl.s}% ${hsl.l}%;`,
        `background: ${hex};`,
        `color: ${textOn};`,
      ].join("\n"),
    [hex, rgb, hsl, textOn]
  );

  useEffect(() => {
    setHexInput(hex);
  }, [hex]);

  const commit = useCallback(
    (next: string) => {
      const n = normalizeHex(next);
      set(n);
      setHexInput(n);
      addRecent(n);
    },
    [set, addRecent]
  );

  const updateHsv = useCallback(
    (partial: Partial<typeof hsv>) => {
      commit(rgbToHex(hsvToRgb({ ...hsv, ...partial })));
    },
    [hsv, commit]
  );

  const updateHsl = useCallback(
    (partial: Partial<typeof hsl>) => {
      commit(rgbToHex(hslToRgb({ ...hsl, ...partial })));
    },
    [hsl, commit]
  );

  const updateRgb = useCallback(
    (partial: Partial<typeof rgb>) => {
      commit(rgbToHex({ ...rgb, ...partial }));
    },
    [rgb, commit]
  );

  const pickFromPlane = useCallback(
    (clientX: number, clientY: number) => {
      const el = satRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
      updateHsv({
        s: Math.round((x / rect.width) * 100),
        v: Math.round(100 - (y / rect.height) * 100),
      });
    },
    [updateHsv]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    pickFromPlane(e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    pickFromPlane(e.clientX, e.clientY);
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  const pickFromScreen = async () => {
    if (!("EyeDropper" in window)) {
      toast.error("EyeDropper API is not supported in this browser");
      return;
    }
    try {
      // @ts-expect-error EyeDropper is not in all TS libs
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      commit(result.sRGBHex);
      toast.success("Color sampled");
    } catch {
      toast.message("Eyedropper cancelled");
    }
  };

  const copyAll = async () => {
    const block = [
      `HEX: ${hex}`,
      `RGB: ${formatRgb(rgb)}`,
      `HSL: ${formatHsl(hsl)}`,
      `HSV: hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
      `CMYK: cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
      "",
      cssVars,
    ].join("\n");
    await navigator.clipboard.writeText(block);
    toast.success("All formats copied");
  };

  return (
    <div className={cn("space-y-5", className)}>
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[1.75rem] border border-border/50 bg-background/70 shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(244,63,94,0.14),transparent_42%),radial-gradient(circle_at_88%_10%,rgba(14,165,233,0.1),transparent_36%)]" />
        <div className="relative grid gap-5 p-4 sm:p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-7">
          <div className="flex flex-col justify-center">
            <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-700 dark:text-rose-300">
              <Pipette className="h-3.5 w-3.5" />
              Flagship picker
            </div>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Advanced Color Picker
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Sample from screen, fine-tune HSV/RGB/HSL, copy every format, explore harmonies, and
              check contrast — built for designers and developers.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" size="sm" className="h-9 rounded-full" onClick={pickFromScreen}>
                <Pipette className="h-3.5 w-3.5" />
                Eye dropper
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9 rounded-full"
                onClick={() => commit(randomHex())}
              >
                <Shuffle className="h-3.5 w-3.5" />
                Random
              </Button>
              <Button type="button" size="sm" variant="outline" className="h-9 rounded-full" onClick={copyAll}>
                <Copy className="h-3.5 w-3.5" />
                Copy all
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9 rounded-full"
                onClick={() => {
                  const wasFav = has(hex);
                  toggle(hex);
                  toast.success(wasFav ? "Removed from favorites" : "Saved to favorites");
                }}
              >
                <Heart className={cn("h-3.5 w-3.5", has(hex) && "fill-rose-500 text-rose-500")} />
                {has(hex) ? "Favorited" : "Favorite"}
              </Button>
            </div>
          </div>

          <div
            className="relative min-h-[180px] overflow-hidden rounded-[1.35rem] border border-black/5 shadow-inner transition-colors duration-300 sm:min-h-[200px]"
            style={{ background: hex, color: textOn }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.28),transparent_40%)]" />
            <div className="relative flex h-full flex-col justify-between p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">
                    Live preview
                  </p>
                  <p className="mt-1 font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
                    {hex.toUpperCase()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full bg-black/10 hover:bg-black/15"
                    style={{ color: textOn }}
                    disabled={!canUndo}
                    onClick={undo}
                    aria-label="Undo"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full bg-black/10 hover:bg-black/15"
                    style={{ color: textOn }}
                    disabled={!canRedo}
                    onClick={redo}
                    aria-label="Redo"
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">The quick brown fox</p>
                  <p className="text-xs opacity-75">Aa Bb Cc · 123 · UI text sample</p>
                </div>
                <button
                  type="button"
                  className="rounded-full px-4 py-2 text-xs font-semibold shadow-lg transition-transform hover:scale-105"
                  style={{
                    background: textOn,
                    color: hex,
                  }}
                >
                  Primary action
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Picker workspace */}
        <div className="overflow-hidden rounded-[1.5rem] border border-border/50 bg-background/70 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-4 py-3 sm:px-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Workspace
              </p>
              <p className="text-sm font-semibold">Saturation · Value · Hue</p>
            </div>
            <div className="flex gap-1.5">
              {(["hsv", "rgb", "hsl"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition-all",
                    mode === m
                      ? "border-rose-500/40 bg-rose-500 text-white"
                      : "border-border/60 bg-background/80 text-muted-foreground hover:border-rose-500/30"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5 p-4 sm:p-5">
            <div
              ref={satRef}
              role="slider"
              aria-label="Saturation and value"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={hsv.s}
              tabIndex={0}
              className="relative aspect-[1.6/1] w-full cursor-crosshair touch-none overflow-hidden rounded-2xl border border-border/40 shadow-inner sm:aspect-[1.75/1]"
              style={{
                background: `
                  linear-gradient(to top, #000, transparent),
                  linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))
                `,
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") updateHsv({ s: Math.min(100, hsv.s + 1) });
                if (e.key === "ArrowLeft") updateHsv({ s: Math.max(0, hsv.s - 1) });
                if (e.key === "ArrowUp") updateHsv({ v: Math.min(100, hsv.v + 1) });
                if (e.key === "ArrowDown") updateHsv({ v: Math.max(0, hsv.v - 1) });
              }}
            >
              <div
                className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_2px_12px_rgba(0,0,0,0.45)] ring-1 ring-black/20 transition-transform"
                style={{
                  left: `${hsv.s}%`,
                  top: `${100 - hsv.v}%`,
                  backgroundColor: hex,
                }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Hue · {hsv.h}°</Label>
              </div>
              <div
                role="slider"
                aria-label="Hue"
                aria-valuemin={0}
                aria-valuemax={360}
                aria-valuenow={hsv.h}
                tabIndex={0}
                className="relative h-4 w-full cursor-ew-resize touch-none rounded-full border border-border/30 shadow-inner"
                style={{
                  background:
                    "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
                }}
                onPointerDown={(e) => {
                  const el = e.currentTarget;
                  el.setPointerCapture?.(e.pointerId);
                  const update = (clientX: number) => {
                    const rect = el.getBoundingClientRect();
                    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
                    updateHsv({ h: Math.round((x / rect.width) * 360) });
                  };
                  update(e.clientX);
                  const move = (ev: PointerEvent) => update(ev.clientX);
                  const up = () => {
                    window.removeEventListener("pointermove", move);
                    window.removeEventListener("pointerup", up);
                  };
                  window.addEventListener("pointermove", move);
                  window.addEventListener("pointerup", up);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") updateHsv({ h: Math.min(360, hsv.h + 1) });
                  if (e.key === "ArrowLeft") updateHsv({ h: Math.max(0, hsv.h - 1) });
                }}
              >
                <div
                  className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_2px_10px_rgba(0,0,0,0.4)] ring-1 ring-black/15"
                  style={{
                    left: `${(hsv.h / 360) * 100}%`,
                    backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
                  }}
                />
              </div>
            </div>

            {mode === "hsv" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <ChannelSlider label="Saturation" value={hsv.s} min={0} max={100} onChange={(s) => updateHsv({ s })} />
                <ChannelSlider label="Value / Brightness" value={hsv.v} min={0} max={100} onChange={(v) => updateHsv({ v })} />
              </div>
            )}

            {mode === "rgb" && (
              <div className="grid gap-4">
                <ChannelSlider
                  label="Red"
                  value={rgb.r}
                  min={0}
                  max={255}
                  onChange={(r) => updateRgb({ r })}
                  gradient={`linear-gradient(to right, rgb(0,${rgb.g},${rgb.b}), rgb(255,${rgb.g},${rgb.b}))`}
                />
                <ChannelSlider
                  label="Green"
                  value={rgb.g}
                  min={0}
                  max={255}
                  onChange={(g) => updateRgb({ g })}
                  gradient={`linear-gradient(to right, rgb(${rgb.r},0,${rgb.b}), rgb(${rgb.r},255,${rgb.b}))`}
                />
                <ChannelSlider
                  label="Blue"
                  value={rgb.b}
                  min={0}
                  max={255}
                  onChange={(b) => updateRgb({ b })}
                  gradient={`linear-gradient(to right, rgb(${rgb.r},${rgb.g},0), rgb(${rgb.r},${rgb.g},255))`}
                />
              </div>
            )}

            {mode === "hsl" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <ChannelSlider label="Saturation" value={hsl.s} min={0} max={100} onChange={(s) => updateHsl({ s })} />
                <ChannelSlider label="Lightness" value={hsl.l} min={0} max={100} onChange={(l) => updateHsl({ l })} />
              </div>
            )}

            <div className="grid grid-cols-[auto_1fr_auto] items-end gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Native
                </Label>
                <Input
                  type="color"
                  value={hex}
                  onChange={(e) => commit(e.target.value)}
                  className="h-11 w-14 cursor-pointer rounded-xl border-border/50 p-1"
                  aria-label="Native color input"
                />
              </div>
              <FormatRow
                label="HEX"
                value={hexInput}
                onChange={(v) => {
                  setHexInput(v);
                  if (isValidHex(v)) commit(v);
                }}
              />
            </div>
          </div>
        </div>

        {/* Values + contrast */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[1.5rem] border border-border/50 bg-background/70 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
            <div className="border-b border-border/40 px-4 py-3 sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Formats
              </p>
              <p className="text-sm font-semibold">Copy-ready values</p>
            </div>
            <div className="space-y-3 p-4 sm:p-5">
              <FormatRow label="RGB" value={formatRgb(rgb)} />
              <FormatRow label="HSL" value={formatHsl(hsl)} />
              <FormatRow label="HSV" value={`hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`} />
              <FormatRow
                label="CMYK"
                value={`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`}
              />
              <FormatRow label="CSS vars" value={`--color: ${hex};`} />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 flex-1 rounded-full"
                  onClick={async () => {
                    await navigator.clipboard.writeText(cssVars);
                    toast.success("CSS snippet copied");
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy full CSS snippet
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-border/50 bg-background/70 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
            <div className="border-b border-border/40 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <Contrast className="h-4 w-4 text-rose-600" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                    Accessibility
                  </p>
                  <p className="text-sm font-semibold">Contrast vs white & black</p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
              {[
                { bg: "#ffffff", label: "On white", result: vsWhite },
                { bg: "#000000", label: "On black", result: vsBlack },
              ].map((item) => (
                <div
                  key={item.label}
                  className="overflow-hidden rounded-2xl border border-border/50"
                >
                  <div
                    className="flex h-16 items-center justify-center px-3 text-center text-sm font-semibold"
                    style={{ background: item.bg, color: hex }}
                  >
                    Aa sample
                  </div>
                  <div className="space-y-2 p-3">
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="font-mono text-sm font-semibold">
                      {item.result.ratio.toFixed(2)}:1
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <WcagPill label="AA" pass={item.result.normalAA} />
                      <WcagPill label="AAA" pass={item.result.normalAAA} />
                      <WcagPill label="AA Large" pass={item.result.largeAA} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tints / shades */}
      <div className="overflow-hidden rounded-[1.5rem] border border-border/50 bg-background/70 shadow-sm">
        <div className="border-b border-border/40 px-4 py-3 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
            Scale
          </p>
          <p className="text-sm font-semibold">Tints & shades</p>
        </div>
        <div className="space-y-3 p-4 sm:p-5">
          <div className="flex h-14 overflow-hidden rounded-2xl border border-border/40 sm:h-16">
            {[...tints].reverse().map((c) => (
              <button
                key={`t-${c}`}
                type="button"
                className="flex-1 transition-all hover:flex-[1.35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ background: c }}
                aria-label={`Tint ${c}`}
                onClick={() => commit(c)}
                title={c}
              />
            ))}
            <button
              type="button"
              className="flex-[1.4] ring-2 ring-inset ring-white/70"
              style={{ background: hex }}
              aria-label={`Base ${hex}`}
              onClick={() => commit(hex)}
              title={hex}
            />
            {shades.map((c) => (
              <button
                key={`s-${c}`}
                type="button"
                className="flex-1 transition-all hover:flex-[1.35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ background: c }}
                aria-label={`Shade ${c}`}
                onClick={() => commit(c)}
                title={c}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Harmonies */}
      <div className="overflow-hidden rounded-[1.5rem] border border-border/50 bg-background/70 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
              Harmonies
            </p>
            <p className="text-sm font-semibold">Related color schemes</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {HARMONIES.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setHarmony(h.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] font-semibold transition-all",
                  harmony === h.id
                    ? "border-rose-500/40 bg-rose-500 text-white"
                    : "border-border/60 bg-background/80 text-muted-foreground hover:border-rose-500/30"
                )}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:p-5 md:grid-cols-5">
          {harmonyColors.map((c, i) => (
            <div
              key={`${c}-${i}`}
              className="group overflow-hidden rounded-2xl border border-border/50 transition-all hover:-translate-y-0.5 hover:border-rose-500/30 hover:shadow-[0_14px_28px_-18px_rgba(225,29,72,0.4)]"
            >
              <button
                type="button"
                onClick={() => commit(c)}
                className="block h-20 w-full transition-transform duration-300 group-hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ background: c }}
                aria-label={`Select ${c}`}
              />
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <button
                  type="button"
                  onClick={() => commit(c)}
                  className="truncate font-mono text-xs font-semibold uppercase hover:text-rose-700 dark:hover:text-rose-300"
                >
                  {c}
                </button>
                <CopyMini value={c} label="Harmony" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent + favorites */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[1.5rem] border border-border/50 bg-background/70 shadow-sm">
          <div className="border-b border-border/40 px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
              History
            </p>
            <p className="text-sm font-semibold">Recent colors</p>
          </div>
          <div className="p-4 sm:p-5">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Pick colors to build history.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {recent.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={cn(
                      "h-10 w-10 rounded-xl border border-border/50 shadow-sm transition-transform hover:-translate-y-0.5 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      c.toLowerCase() === hex.toLowerCase() && "ring-2 ring-rose-500/50"
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={`Select ${c}`}
                    onClick={() => commit(c)}
                    title={c}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-border/50 bg-background/70 shadow-sm">
          <div className="border-b border-border/40 px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
              Saved
            </p>
            <p className="text-sm font-semibold">Favorites</p>
          </div>
          <div className="p-4 sm:p-5">
            {favorites.length === 0 ? (
              <p className="text-sm text-muted-foreground">Heart a color to save it here.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {favorites.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="h-10 w-10 rounded-xl border border-border/50 shadow-sm transition-transform hover:-translate-y-0.5 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ backgroundColor: c }}
                    aria-label={`Select favorite ${c}`}
                    onClick={() => commit(c)}
                    title={c}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
