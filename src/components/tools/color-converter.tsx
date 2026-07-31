"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  Check,
  Copy,
  Dice5,
  Droplets,
  Pipette,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import {
  cmykToRgb,
  formatHsl,
  formatRgb,
  getContrastRatio,
  getTextColor,
  hexToRgb,
  hslToRgb,
  hsvToRgb,
  isValidHex,
  normalizeHex,
  parseColor,
  randomHex,
  rgbToCmyk,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
} from "@/lib/colors/convert";
import { analyzeColor, getShades, getTints } from "@/lib/colors/spaces";
import { cn } from "@/lib/utils";

export type ConverterMode = "hex-rgb" | "rgb-hex" | "hex-hsl" | "hsl-hex" | "hsv" | "cmyk";

const MODE_META: Record<
  ConverterMode,
  {
    title: string;
    from: string;
    to: string;
    hint: string;
    swapHref?: string;
    swapLabel?: string;
  }
> = {
  "hex-rgb": {
    title: "HEX → RGB",
    from: "HEX",
    to: "RGB",
    hint: "Paste a hex code and get precise RGB channels instantly.",
    swapHref: "/rgb-to-hex",
    swapLabel: "RGB → HEX",
  },
  "rgb-hex": {
    title: "RGB → HEX",
    from: "RGB",
    to: "HEX",
    hint: "Tune red, green, and blue to produce a clean hex value.",
    swapHref: "/hex-to-rgb",
    swapLabel: "HEX → RGB",
  },
  "hex-hsl": {
    title: "HEX → HSL",
    from: "HEX",
    to: "HSL",
    hint: "Convert hex into hue, saturation, and lightness for CSS.",
    swapHref: "/hsl-to-hex",
    swapLabel: "HSL → HEX",
  },
  "hsl-hex": {
    title: "HSL → HEX",
    from: "HSL",
    to: "HEX",
    hint: "Dial HSL sliders and export a production-ready hex.",
    swapHref: "/hex-to-hsl",
    swapLabel: "HEX → HSL",
  },
  hsv: {
    title: "HSV Converter",
    from: "HSV",
    to: "All formats",
    hint: "Work in HSV/HSB and sync HEX, RGB, HSL, and CMYK.",
  },
  cmyk: {
    title: "CMYK Converter",
    from: "CMYK",
    to: "All formats",
    hint: "Map print CMYK values into web-ready color formats.",
  },
};

const PRESETS = [
  "#E11D48",
  "#F43F5E",
  "#3B82F6",
  "#0EA5E9",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#111827",
  "#F8FAFC",
  "#14B8A6",
];

const SIBLINGS = [
  { href: "/hex-to-rgb", label: "HEX → RGB" },
  { href: "/rgb-to-hex", label: "RGB → HEX" },
  { href: "/hex-to-hsl", label: "HEX → HSL" },
  { href: "/hsl-to-hex", label: "HSL → HEX" },
  { href: "/hsv-converter", label: "HSV" },
  { href: "/cmyk-converter", label: "CMYK" },
];

async function copyText(value: string, label?: string) {
  await navigator.clipboard.writeText(value);
  toast.success(label ? `${label} copied` : "Copied");
}

function ChannelSlider({
  label,
  value,
  max,
  unit = "",
  track,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  unit?: string;
  track?: string;
  onChange: (n: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={max}
            value={value}
            onChange={(e) => onChange(clampNum(Number(e.target.value), 0, max))}
            className="h-8 w-20 rounded-xl font-mono text-xs"
          />
          <span className="w-4 text-[11px] text-muted-foreground">{unit}</span>
        </div>
      </div>
      <div
        className="rounded-full p-[1px]"
        style={
          track
            ? { background: track }
            : undefined
        }
      >
        <Slider
          min={0}
          max={max}
          step={1}
          value={[value]}
          onValueChange={([n]) => onChange(n)}
          className="py-1"
        />
      </div>
    </div>
  );
}

function clampNum(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function FormatRow({
  label,
  value,
  emphasize,
  delay = 0,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  delay?: number;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-2xl border px-3 py-2.5 transition-all duration-300 animate-rise",
        emphasize
          ? "border-rose-500/35 bg-rose-500/5 shadow-sm"
          : "border-border/50 bg-muted/15 hover:border-rose-500/25 hover:bg-muted/30"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p className="truncate font-mono text-sm font-medium">{value}</p>
      </div>
      <button
        type="button"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-muted-foreground transition-colors hover:border-rose-500/30 hover:text-rose-700 dark:hover:text-rose-300"
        aria-label={`Copy ${label}`}
        onClick={async () => {
          await copyText(value, label);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1100);
        }}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function Panel({
  eyebrow,
  title,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-border/50 bg-background/70 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-3 border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
            {eyebrow}
          </p>
          <p className="text-sm font-semibold">{title}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="space-y-4 p-4 sm:p-5">{children}</div>
    </div>
  );
}

export function ColorConverter({ mode }: { mode: ConverterMode }) {
  const meta = MODE_META[mode];
  const [hex, setHex] = useState("#3B82F6");
  const [hexDraft, setHexDraft] = useState("#3B82F6");
  const [r, setR] = useState(59);
  const [g, setG] = useState(130);
  const [b, setB] = useState(246);
  const [h, setH] = useState(217);
  const [s, setS] = useState(91);
  const [l, setL] = useState(60);
  const [v, setV] = useState(96);
  const [c, setC] = useState(76);
  const [m, setM] = useState(47);
  const [y, setY] = useState(0);
  const [k, setK] = useState(4);
  const [waveKey, setWaveKey] = useState(0);
  const [pasteHint, setPasteHint] = useState(false);

  const syncFromHex = (value: string, animate = true) => {
    if (!isValidHex(value)) return false;
    const n = normalizeHex(value);
    setHex(n);
    setHexDraft(n);
    const rgb = hexToRgb(n);
    setR(rgb.r);
    setG(rgb.g);
    setB(rgb.b);
    const hsl = rgbToHsl(rgb);
    setH(hsl.h);
    setS(hsl.s);
    setL(hsl.l);
    const hsv = rgbToHsv(rgb);
    setV(hsv.v);
    const cmyk = rgbToCmyk(rgb);
    setC(cmyk.c);
    setM(cmyk.m);
    setY(cmyk.y);
    setK(cmyk.k);
    if (animate) setWaveKey((k) => k + 1);
    return true;
  };

  const syncFromRgb = (nr: number, ng: number, nb: number, animate = false) => {
    const rr = clampNum(nr, 0, 255);
    const gg = clampNum(ng, 0, 255);
    const bb = clampNum(nb, 0, 255);
    setR(rr);
    setG(gg);
    setB(bb);
    const nhex = rgbToHex({ r: rr, g: gg, b: bb });
    setHex(nhex);
    setHexDraft(nhex);
    const hsl = rgbToHsl({ r: rr, g: gg, b: bb });
    setH(hsl.h);
    setS(hsl.s);
    setL(hsl.l);
    setV(rgbToHsv({ r: rr, g: gg, b: bb }).v);
    const cmyk = rgbToCmyk({ r: rr, g: gg, b: bb });
    setC(cmyk.c);
    setM(cmyk.m);
    setY(cmyk.y);
    setK(cmyk.k);
    if (animate) setWaveKey((key) => key + 1);
  };

  useEffect(() => {
    setWaveKey((k) => k + 1);
  }, [mode]);

  const analysis = useMemo(() => analyzeColor(hex), [hex]);
  const textOn = getTextColor(hex);
  const contrastWhite = getContrastRatio(hex, "#ffffff");
  const contrastBlack = getContrastRatio(hex, "#000000");
  const tints = useMemo(() => getTints(hex, 7), [hex]);
  const shades = useMemo(() => getShades(hex, 7), [hex]);

  const primaryOut = useMemo(() => {
    if (mode === "hex-rgb" || mode === "rgb-hex") return formatRgb({ r, g, b });
    if (mode === "hex-hsl" || mode === "hsl-hex") return formatHsl({ h, s, l });
    if (mode === "hsv") return `hsv(${h}, ${s}%, ${v}%)`;
    return `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`;
  }, [mode, r, g, b, h, s, l, v, c, m, y, k]);

  const applyPaste = (raw: string) => {
    const parsed = parseColor(raw);
    if (!parsed) {
      toast.error("Could not parse that color");
      return;
    }
    syncFromHex(parsed.hex);
    toast.success("Color applied");
  };

  const tryEyeDropper = async () => {
    const ED = (window as Window & { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper;
    if (!ED) {
      toast.error("EyeDropper not supported in this browser");
      return;
    }
    try {
      const result = await new ED().open();
      syncFromHex(result.sRGBHex);
      toast.success("Color picked");
    } catch {
      /* user cancelled */
    }
  };

  const emphasizeLabel =
    mode === "hex-rgb"
      ? "RGB"
      : mode === "rgb-hex"
        ? "HEX"
        : mode === "hex-hsl"
          ? "HSL"
          : mode === "hsl-hex"
            ? "HEX"
            : mode === "hsv"
              ? "HSV"
              : "CMYK";

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-border/50 bg-background/70 shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(244,63,94,0.14),transparent_42%),radial-gradient(circle_at_88%_0%,rgba(59,130,246,0.12),transparent_36%)]" />
        <div className="relative grid gap-5 p-4 sm:p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center">
            <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-700 dark:text-rose-300">
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Color converter
            </div>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {meta.title}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              {meta.hint}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium">
                {meta.from} → {meta.to}
              </span>
              {meta.swapHref && (
                <Link
                  href={meta.swapHref}
                  className="rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-500/15 dark:text-rose-300"
                >
                  Swap to {meta.swapLabel}
                </Link>
              )}
            </div>
          </div>

          <div
            key={waveKey}
            className="relative min-h-40 overflow-hidden rounded-[1.35rem] border border-black/5 shadow-inner animate-rise sm:min-h-48"
            style={{ backgroundColor: hex, color: textOn }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.28),transparent_40%)]" />
            <div className="relative flex h-full flex-col justify-between p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
                    Live preview
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold tracking-tight">{hex}</p>
                </div>
                <Droplets className="h-5 w-5 opacity-70" />
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] font-medium">
                <span className="rounded-full bg-black/20 px-2.5 py-1 backdrop-blur-sm">
                  vs white {contrastWhite.toFixed(2)}:1
                </span>
                <span className="rounded-full bg-black/20 px-2.5 py-1 backdrop-blur-sm">
                  vs black {contrastBlack.toFixed(2)}:1
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {SIBLINGS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-rose-500/30 hover:text-rose-700 dark:hover:text-rose-300"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          eyebrow="Input"
          title={`Adjust ${meta.from}`}
          actions={
            <>
              <Button type="button" size="sm" variant="outline" className="h-8 rounded-full" onClick={tryEyeDropper}>
                <Pipette className="h-3.5 w-3.5" />
                Pick
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 rounded-full"
                onClick={() => syncFromHex(randomHex())}
              >
                <Dice5 className="h-3.5 w-3.5" />
                Random
              </Button>
            </>
          }
        >
          {(mode === "hex-rgb" || mode === "hex-hsl") && (
            <div className="space-y-2">
              <Label htmlFor="hex-input">HEX</Label>
              <div className="flex gap-2">
                <Input
                  id="hex-input"
                  value={hexDraft}
                  onChange={(e) => {
                    const next = e.target.value;
                    setHexDraft(next);
                    syncFromHex(next, false);
                  }}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData("text");
                    if (parseColor(text)) {
                      e.preventDefault();
                      applyPaste(text);
                    }
                  }}
                  className="h-11 rounded-2xl font-mono"
                  spellCheck={false}
                />
                <CopyButton value={hex} label="HEX" className="h-11 rounded-2xl" />
              </div>
              {!isValidHex(hexDraft) && hexDraft.trim() && (
                <p className="text-xs text-rose-600">Enter a valid HEX like #3B82F6</p>
              )}
            </div>
          )}

          {(mode === "rgb-hex" || mode === "hex-rgb") && (
            <div className="space-y-4">
              <ChannelSlider
                label="Red"
                value={r}
                max={255}
                track="linear-gradient(90deg,#000,#ef4444)"
                onChange={(n) => syncFromRgb(n, g, b)}
              />
              <ChannelSlider
                label="Green"
                value={g}
                max={255}
                track="linear-gradient(90deg,#000,#22c55e)"
                onChange={(n) => syncFromRgb(r, n, b)}
              />
              <ChannelSlider
                label="Blue"
                value={b}
                max={255}
                track="linear-gradient(90deg,#000,#3b82f6)"
                onChange={(n) => syncFromRgb(r, g, n)}
              />
            </div>
          )}

          {(mode === "hsl-hex" || mode === "hex-hsl") && (
            <div className="space-y-4">
              <ChannelSlider
                label="Hue"
                value={h}
                max={360}
                unit="°"
                track="linear-gradient(90deg,#ef4444,#f59e0b,#22c55e,#06b6d4,#3b82f6,#a855f7,#ef4444)"
                onChange={(n) => {
                  setH(n);
                  const rgb = hslToRgb({ h: n, s, l });
                  syncFromRgb(rgb.r, rgb.g, rgb.b);
                }}
              />
              <ChannelSlider
                label="Saturation"
                value={s}
                max={100}
                unit="%"
                track={`linear-gradient(90deg,hsl(${h},0%,${l}%),hsl(${h},100%,${l}%))`}
                onChange={(n) => {
                  setS(n);
                  const rgb = hslToRgb({ h, s: n, l });
                  syncFromRgb(rgb.r, rgb.g, rgb.b);
                }}
              />
              <ChannelSlider
                label="Lightness"
                value={l}
                max={100}
                unit="%"
                track={`linear-gradient(90deg,#000,hsl(${h},${s}%,50%),#fff)`}
                onChange={(n) => {
                  setL(n);
                  const rgb = hslToRgb({ h, s, l: n });
                  syncFromRgb(rgb.r, rgb.g, rgb.b);
                }}
              />
            </div>
          )}

          {mode === "hsv" && (
            <div className="space-y-4">
              <ChannelSlider
                label="Hue"
                value={h}
                max={360}
                unit="°"
                track="linear-gradient(90deg,#ef4444,#f59e0b,#22c55e,#06b6d4,#3b82f6,#a855f7,#ef4444)"
                onChange={(n) => {
                  setH(n);
                  const rgb = hsvToRgb({ h: n, s, v });
                  syncFromRgb(rgb.r, rgb.g, rgb.b);
                }}
              />
              <ChannelSlider
                label="Saturation"
                value={s}
                max={100}
                unit="%"
                onChange={(n) => {
                  setS(n);
                  const rgb = hsvToRgb({ h, s: n, v });
                  syncFromRgb(rgb.r, rgb.g, rgb.b);
                }}
              />
              <ChannelSlider
                label="Value"
                value={v}
                max={100}
                unit="%"
                onChange={(n) => {
                  setV(n);
                  const rgb = hsvToRgb({ h, s, v: n });
                  syncFromRgb(rgb.r, rgb.g, rgb.b);
                }}
              />
            </div>
          )}

          {mode === "cmyk" && (
            <div className="space-y-4">
              {(
                [
                  { label: "Cyan", key: "c" as const, value: c, track: "linear-gradient(90deg,#fff,#06b6d4)" },
                  { label: "Magenta", key: "m" as const, value: m, track: "linear-gradient(90deg,#fff,#d946ef)" },
                  { label: "Yellow", key: "y" as const, value: y, track: "linear-gradient(90deg,#fff,#eab308)" },
                  { label: "Black", key: "k" as const, value: k, track: "linear-gradient(90deg,#fff,#111)" },
                ] as const
              ).map((row) => (
                <ChannelSlider
                  key={row.key}
                  label={row.label}
                  value={row.value}
                  max={100}
                  unit="%"
                  track={row.track}
                  onChange={(n) => {
                    const next = {
                      c: row.key === "c" ? n : c,
                      m: row.key === "m" ? n : m,
                      y: row.key === "y" ? n : y,
                      k: row.key === "k" ? n : k,
                    };
                    if (row.key === "c") setC(n);
                    if (row.key === "m") setM(n);
                    if (row.key === "y") setY(n);
                    if (row.key === "k") setK(n);
                    const rgb = cmykToRgb(next);
                    syncFromRgb(rgb.r, rgb.g, rgb.b);
                  }}
                />
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="smart-paste">Smart paste</Label>
            <Input
              id="smart-paste"
              placeholder="Paste hex, rgb(), hsl()…"
              className={cn(
                "h-11 rounded-2xl font-mono text-sm transition-shadow",
                pasteHint && "ring-2 ring-rose-500/30"
              )}
              onFocus={() => setPasteHint(true)}
              onBlur={() => setPasteHint(false)}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text");
                e.preventDefault();
                applyPaste(text);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyPaste((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = "";
                }
              }}
            />
            <p className="text-[11px] text-muted-foreground">
              Accepts HEX, RGB, and HSL strings — press Enter to apply.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Presets
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-label={`Use ${p}`}
                  className={cn(
                    "h-9 w-9 rounded-xl border border-black/10 shadow-sm transition-transform hover:scale-110",
                    hex.toLowerCase() === p.toLowerCase() && "ring-2 ring-rose-500 ring-offset-2 ring-offset-background"
                  )}
                  style={{ backgroundColor: p }}
                  onClick={() => syncFromHex(p)}
                />
              ))}
            </div>
          </div>
        </Panel>

        <Panel
          eyebrow="Output"
          title="All formats"
          actions={
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 rounded-full"
              onClick={() =>
                copyText(
                  [
                    analysis.hex,
                    analysis.rgba,
                    analysis.hsl,
                    analysis.hsv,
                    analysis.cmyk,
                    analysis.cssVar,
                    analysis.tailwind,
                  ].join("\n"),
                  "All formats"
                )
              }
            >
              <Sparkles className="h-3.5 w-3.5" />
              Copy all
            </Button>
          }
        >
          <div
            key={`out-${waveKey}`}
            className="space-y-2"
          >
            <FormatRow label="HEX" value={analysis.hex} emphasize={emphasizeLabel === "HEX"} delay={0} />
            <FormatRow label="RGB" value={formatRgb({ r, g, b })} emphasize={emphasizeLabel === "RGB"} delay={40} />
            <FormatRow label="RGBA" value={analysis.rgba} delay={80} />
            <FormatRow label="HSL" value={formatHsl({ h, s, l })} emphasize={emphasizeLabel === "HSL"} delay={120} />
            <FormatRow label="HSV" value={`hsv(${h}, ${s}%, ${v}%)`} emphasize={emphasizeLabel === "HSV"} delay={160} />
            <FormatRow label="CMYK" value={`cmyk(${c}%, ${m}%, ${y}%, ${k}%)`} emphasize={emphasizeLabel === "CMYK"} delay={200} />
            <FormatRow label="CSS var" value={analysis.cssVar} delay={240} />
            <FormatRow label="Tailwind nearest" value={analysis.tailwind} delay={280} />
            <FormatRow label="OKLCH" value={analysis.oklch} delay={320} />
          </div>

          <div className="rounded-2xl border border-border/50 bg-muted/20 p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Primary result
            </p>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate font-mono text-sm font-semibold">{primaryOut}</code>
              <CopyButton value={primaryOut} label="Result" />
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel eyebrow="Harmony" title="Tints">
          <div className="flex overflow-hidden rounded-2xl border border-border/50">
            {tints.map((t) => (
              <button
                key={`tint-${t}`}
                type="button"
                className="h-16 flex-1 transition-transform hover:scale-y-110"
                style={{ backgroundColor: t }}
                aria-label={`Apply tint ${t}`}
                title={t}
                onClick={() => syncFromHex(t)}
              />
            ))}
          </div>
        </Panel>
        <Panel eyebrow="Harmony" title="Shades">
          <div className="flex overflow-hidden rounded-2xl border border-border/50">
            {shades.map((t) => (
              <button
                key={`shade-${t}`}
                type="button"
                className="h-16 flex-1 transition-transform hover:scale-y-110"
                style={{ backgroundColor: t }}
                aria-label={`Apply shade ${t}`}
                title={t}
                onClick={() => syncFromHex(t)}
              />
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "On white", value: `${analysis.contrastOnWhite}:1` },
          { label: "On black", value: `${analysis.contrastOnBlack}:1` },
          { label: "Text on color", value: analysis.textOnColor },
        ].map((item, i) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border/50 bg-muted/15 px-4 py-3 animate-rise"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-1 font-display text-xl font-semibold tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
