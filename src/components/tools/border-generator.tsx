"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Link2, Link2Off, RotateCcw, Sparkles, Square } from "lucide-react";
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

type BorderStyle =
  | "solid"
  | "dashed"
  | "dotted"
  | "double"
  | "groove"
  | "ridge"
  | "inset"
  | "outset"
  | "none";

type Side = "top" | "right" | "bottom" | "left";

type SideBorder = {
  width: number;
  style: BorderStyle;
  color: string;
};

type Radii = { tl: number; tr: number; br: number; bl: number };

const STYLES: BorderStyle[] = [
  "solid",
  "dashed",
  "dotted",
  "double",
  "groove",
  "ridge",
  "inset",
  "outset",
  "none",
];

const DEFAULT_SIDE: SideBorder = { width: 3, style: "solid", color: "#e11d48" };

const PRESETS: {
  id: string;
  label: string;
  sides: Record<Side, SideBorder>;
  radii: Radii;
  linkSides: boolean;
  linkRadii: boolean;
}[] = [
  {
    id: "card",
    label: "Card",
    sides: {
      top: { width: 1, style: "solid", color: "#e2e8f0" },
      right: { width: 1, style: "solid", color: "#e2e8f0" },
      bottom: { width: 1, style: "solid", color: "#e2e8f0" },
      left: { width: 1, style: "solid", color: "#e2e8f0" },
    },
    radii: { tl: 16, tr: 16, br: 16, bl: 16 },
    linkSides: true,
    linkRadii: true,
  },
  {
    id: "accent",
    label: "Accent left",
    sides: {
      top: { width: 0, style: "solid", color: "#e11d48" },
      right: { width: 0, style: "solid", color: "#e11d48" },
      bottom: { width: 0, style: "solid", color: "#e11d48" },
      left: { width: 4, style: "solid", color: "#e11d48" },
    },
    radii: { tl: 12, tr: 12, br: 12, bl: 12 },
    linkSides: false,
    linkRadii: true,
  },
  {
    id: "dashed",
    label: "Dashed",
    sides: {
      top: { width: 2, style: "dashed", color: "#db2777" },
      right: { width: 2, style: "dashed", color: "#db2777" },
      bottom: { width: 2, style: "dashed", color: "#db2777" },
      left: { width: 2, style: "dashed", color: "#db2777" },
    },
    radii: { tl: 12, tr: 12, br: 12, bl: 12 },
    linkSides: true,
    linkRadii: true,
  },
  {
    id: "pill",
    label: "Pill",
    sides: {
      top: { width: 2, style: "solid", color: "#e11d48" },
      right: { width: 2, style: "solid", color: "#e11d48" },
      bottom: { width: 2, style: "solid", color: "#e11d48" },
      left: { width: 2, style: "solid", color: "#e11d48" },
    },
    radii: { tl: 999, tr: 999, br: 999, bl: 999 },
    linkSides: true,
    linkRadii: true,
  },
  {
    id: "double",
    label: "Double",
    sides: {
      top: { width: 6, style: "double", color: "#0f172a" },
      right: { width: 6, style: "double", color: "#0f172a" },
      bottom: { width: 6, style: "double", color: "#0f172a" },
      left: { width: 6, style: "double", color: "#0f172a" },
    },
    radii: { tl: 8, tr: 8, br: 8, bl: 8 },
    linkSides: true,
    linkRadii: true,
  },
  {
    id: "asymmetric",
    label: "Asymmetric",
    sides: {
      top: { width: 2, style: "solid", color: "#e11d48" },
      right: { width: 8, style: "solid", color: "#db2777" },
      bottom: { width: 2, style: "solid", color: "#e11d48" },
      left: { width: 8, style: "solid", color: "#db2777" },
    },
    radii: { tl: 24, tr: 4, br: 24, bl: 4 },
    linkSides: false,
    linkRadii: false,
  },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs sm:text-sm">{label}</Label>
      {children}
    </div>
  );
}

function sameSides(sides: Record<Side, SideBorder>) {
  const t = sides.top;
  return (["right", "bottom", "left"] as const).every(
    (s) =>
      sides[s].width === t.width &&
      sides[s].style === t.style &&
      sides[s].color === t.color
  );
}

function sameRadii(r: Radii) {
  return r.tl === r.tr && r.tr === r.br && r.br === r.bl;
}

export function BorderGeneratorTool() {
  const [sides, setSides] = useState<Record<Side, SideBorder>>({
    top: { ...DEFAULT_SIDE },
    right: { ...DEFAULT_SIDE },
    bottom: { ...DEFAULT_SIDE },
    left: { ...DEFAULT_SIDE },
  });
  const [radii, setRadii] = useState<Radii>({ tl: 16, tr: 16, br: 16, bl: 16 });
  const [linkSides, setLinkSides] = useState(true);
  const [linkRadii, setLinkRadii] = useState(true);
  const [activePreset, setActivePreset] = useState("custom");
  const [className, setClassName] = useState("border-box");
  const [fill, setFill] = useState("#ffffff");
  const [previewBg, setPreviewBg] = useState("#f8fafc");
  const [extraCss, setExtraCss] = useState("");
  const [boxW, setBoxW] = useState(280);
  const [boxH, setBoxH] = useState(180);
  const [flashKey, setFlashKey] = useState(0);

  const updateAllSides = (patch: Partial<SideBorder>) => {
    setActivePreset("custom");
    setSides((prev) => {
      const next = { ...prev };
      (Object.keys(next) as Side[]).forEach((s) => {
        next[s] = { ...next[s], ...patch };
      });
      return next;
    });
    setFlashKey((k) => k + 1);
  };

  const updateSide = (side: Side, patch: Partial<SideBorder>) => {
    setActivePreset("custom");
    if (linkSides) {
      updateAllSides(patch);
      return;
    }
    setSides((prev) => ({ ...prev, [side]: { ...prev[side], ...patch } }));
    setFlashKey((k) => k + 1);
  };

  const updateRadii = (key: keyof Radii, value: number) => {
    setActivePreset("custom");
    if (linkRadii) {
      setRadii({ tl: value, tr: value, br: value, bl: value });
    } else {
      setRadii((prev) => ({ ...prev, [key]: value }));
    }
    setFlashKey((k) => k + 1);
  };

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setActivePreset(preset.id);
    setSides({
      top: { ...preset.sides.top },
      right: { ...preset.sides.right },
      bottom: { ...preset.sides.bottom },
      left: { ...preset.sides.left },
    });
    setRadii({ ...preset.radii });
    setLinkSides(preset.linkSides);
    setLinkRadii(preset.linkRadii);
    setFlashKey((k) => k + 1);
    toast.success(`Applied “${preset.label}”`);
  };

  const reset = () => {
    setSides({
      top: { ...DEFAULT_SIDE },
      right: { ...DEFAULT_SIDE },
      bottom: { ...DEFAULT_SIDE },
      left: { ...DEFAULT_SIDE },
    });
    setRadii({ tl: 16, tr: 16, br: 16, bl: 16 });
    setLinkSides(true);
    setLinkRadii(true);
    setActivePreset("custom");
    setFlashKey((k) => k + 1);
  };

  const css = useMemo(() => {
    const cls = className.trim() || "border-box";
    const lines: string[] = [`.${cls} {`];

    if (sameSides(sides)) {
      const t = sides.top;
      if (t.width === 0 || t.style === "none") {
        lines.push(`  border: none;`);
      } else {
        lines.push(`  border: ${t.width}px ${t.style} ${t.color};`);
      }
    } else {
      (["top", "right", "bottom", "left"] as const).forEach((side) => {
        const b = sides[side];
        if (b.width === 0 || b.style === "none") {
          lines.push(`  border-${side}: none;`);
        } else {
          lines.push(`  border-${side}: ${b.width}px ${b.style} ${b.color};`);
        }
      });
    }

    if (sameRadii(radii)) {
      lines.push(`  border-radius: ${radii.tl}px;`);
    } else {
      lines.push(`  border-radius: ${radii.tl}px ${radii.tr}px ${radii.br}px ${radii.bl}px;`);
    }

    lines.push(`  background: ${fill};`);
    if (extraCss.trim()) {
      for (const raw of extraCss.split("\n")) {
        const line = raw.trim();
        if (!line) continue;
        lines.push(`  ${line.endsWith(";") ? line : `${line};`}`);
      }
    }
    lines.push(`}`);
    return lines.join("\n");
  }, [className, extraCss, fill, radii, sides]);

  const previewStyle: React.CSSProperties = {
    width: boxW,
    height: boxH,
    background: fill,
    borderTop: `${sides.top.width}px ${sides.top.style} ${sides.top.color}`,
    borderRight: `${sides.right.width}px ${sides.right.style} ${sides.right.color}`,
    borderBottom: `${sides.bottom.width}px ${sides.bottom.style} ${sides.bottom.color}`,
    borderLeft: `${sides.left.width}px ${sides.left.style} ${sides.left.color}`,
    borderRadius: `${radii.tl}px ${radii.tr}px ${radii.br}px ${radii.bl}px`,
  };

  const copyBorderShorthand = async () => {
    const t = sides.top;
    const value = sameSides(sides)
      ? `${t.width}px ${t.style} ${t.color}`
      : [
          `${sides.top.width}px ${sides.top.style} ${sides.top.color}`,
          `${sides.right.width}px ${sides.right.style} ${sides.right.color}`,
          `${sides.bottom.width}px ${sides.bottom.style} ${sides.bottom.color}`,
          `${sides.left.width}px ${sides.left.style} ${sides.left.color}`,
        ].join(" / ");
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Border value copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const sideControls = (side: Side, label: string) => {
    const b = sides[side];
    const disabled = linkSides && side !== "top";
    return (
      <div
        key={side}
        className={cn(
          "space-y-2 rounded-2xl border border-border/50 bg-muted/15 p-3",
          disabled && "opacity-60"
        )}
      >
        <p className="text-xs font-semibold capitalize">{label}</p>
        <Field label={`Width · ${b.width}px`}>
          <Slider
            min={0}
            max={32}
            value={[b.width]}
            disabled={disabled}
            onValueChange={([n]) => updateSide(side, { width: n })}
          />
        </Field>
        <Field label="Style">
          <div className="flex flex-wrap gap-1">
            {STYLES.map((st) => (
              <button
                key={st}
                type="button"
                disabled={disabled}
                onClick={() => updateSide(side, { style: st })}
                className={cn(
                  "rounded-full border px-2 py-1 text-[10px] font-medium capitalize disabled:cursor-not-allowed",
                  b.style === st
                    ? "border-rose-500/50 bg-rose-500 text-white"
                    : "border-border/60 bg-background hover:bg-muted/50"
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Color">
          <Input
            type="color"
            value={b.color}
            disabled={disabled}
            onChange={(e) => updateSide(side, { color: e.target.value })}
            className="h-10 w-full max-w-[8rem] p-1 disabled:opacity-50"
          />
        </Field>
      </div>
    );
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
                  Border Generator
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Per-side borders, styles, colors, and corner radii — live CSS.
                </p>
              </div>
              <Badge variant="secondary" className="rounded-full">
                <Square className="mr-1 h-3.5 w-3.5" />
                Live
              </Badge>
            </div>
          </div>

          <div className="max-h-[min(70vh,52rem)] space-y-5 overflow-y-auto p-3 sm:p-5">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/outline-generator"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Outline generator
              </Link>
              <Link
                href="/css-border-radius-generator"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Radius studio
              </Link>
              <Button type="button" size="sm" variant="ghost" className="h-8 rounded-full" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>

            <section className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Presets
              </p>
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
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Borders
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setLinkSides((v) => {
                      if (!v) {
                        setSides((prev) => ({
                          top: { ...prev.top },
                          right: { ...prev.top },
                          bottom: { ...prev.top },
                          left: { ...prev.top },
                        }));
                      }
                      return !v;
                    });
                    setActivePreset("custom");
                  }}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                    linkSides
                      ? "border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                      : "border-border/60"
                  )}
                >
                  {linkSides ? <Link2 className="h-3 w-3" /> : <Link2Off className="h-3 w-3" />}
                  Link sides
                </button>
              </div>
              {linkSides
                ? sideControls("top", "All sides")
                : (
                  <div className="space-y-2">
                    {sideControls("top", "Top")}
                    {sideControls("right", "Right")}
                    {sideControls("bottom", "Bottom")}
                    {sideControls("left", "Left")}
                  </div>
                )}
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Radius
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setLinkRadii((v) => {
                      const next = !v;
                      if (next) setRadii({ tl: radii.tl, tr: radii.tl, br: radii.tl, bl: radii.tl });
                      return next;
                    });
                    setActivePreset("custom");
                  }}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                    linkRadii
                      ? "border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                      : "border-border/60"
                  )}
                >
                  {linkRadii ? <Link2 className="h-3 w-3" /> : <Link2Off className="h-3 w-3" />}
                  Link corners
                </button>
              </div>
              {linkRadii ? (
                <Field label={`All corners · ${radii.tl}px`}>
                  <Slider min={0} max={999} value={[radii.tl]} onValueChange={([n]) => updateRadii("tl", n)} />
                </Field>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      ["tl", "Top left"],
                      ["tr", "Top right"],
                      ["bl", "Bottom left"],
                      ["br", "Bottom right"],
                    ] as const
                  ).map(([key, label]) => (
                    <Field key={key} label={`${label} · ${radii[key]}px`}>
                      <Slider min={0} max={120} value={[radii[key]]} onValueChange={([n]) => updateRadii(key, n)} />
                    </Field>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Box & output
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label={`Preview W · ${boxW}px`}>
                  <Slider min={120} max={420} value={[boxW]} onValueChange={([n]) => setBoxW(n)} />
                </Field>
                <Field label={`Preview H · ${boxH}px`}>
                  <Slider min={80} max={320} value={[boxH]} onValueChange={([n]) => setBoxH(n)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Fill">
                  <Input type="color" value={fill} onChange={(e) => setFill(e.target.value)} className="h-10 w-full p-1" />
                </Field>
                <Field label="Stage">
                  <Input
                    type="color"
                    value={previewBg}
                    onChange={(e) => setPreviewBg(e.target.value)}
                    className="h-10 w-full p-1"
                  />
                </Field>
              </div>
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
                  placeholder="box-shadow: 0 8px 24px rgba(0,0,0,0.08);"
                  rows={2}
                  className="rounded-xl font-mono text-xs"
                  spellCheck={false}
                />
              </Field>
            </section>

            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="button" onClick={() => void copyBorderShorthand()}>
                <Copy className="h-4 w-4" />
                Copy border value
              </PrimaryButton>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => applyPreset(PRESETS[0])}>
                <Sparkles className="h-3.5 w-3.5" />
                Card preset
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
              <p className="text-sm font-semibold">Live border</p>
            </div>
            <div className="p-3 sm:p-5">
              <div
                className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl sm:min-h-[380px]"
                style={{
                  backgroundColor: previewBg,
                  backgroundImage:
                    "radial-gradient(circle at 20% 20%, rgba(225,29,72,0.08), transparent 40%), radial-gradient(circle at 80% 70%, rgba(219,39,119,0.08), transparent 45%)",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={flashKey}
                    initial={{ opacity: 0.9, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.22 }}
                    className="flex items-center justify-center bg-background/80 text-sm font-semibold text-foreground shadow-lg shadow-rose-500/10"
                    style={previewStyle}
                  >
                    Preview
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <CodeOutput
            value={css}
            filename="border.css"
            language="css"
            title="CSS output"
            eyebrow="Copy · Download"
            rows={14}
            emptyMessage="CSS will appear here"
          />
        </div>
      </div>
    </div>
  );
}
