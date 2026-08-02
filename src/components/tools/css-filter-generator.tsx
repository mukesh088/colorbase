"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Columns2,
  Copy,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
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

type DropShadow = {
  id: string;
  x: number;
  y: number;
  blur: number;
  color: string;
};

type FilterState = {
  blur: number;
  brightness: number;
  contrast: number;
  grayscale: number;
  hueRotate: number;
  invert: number;
  opacity: number;
  saturate: number;
  sepia: number;
  dropShadows: DropShadow[];
};

type PreviewMode = "photo" | "upload" | "card" | "text";
type CompareMode = "after" | "before" | "split";

const DEFAULT_FILTERS: FilterState = {
  blur: 0,
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  hueRotate: 0,
  invert: 0,
  opacity: 100,
  saturate: 100,
  sepia: 0,
  dropShadows: [],
};

const PHOTO =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80&auto=format&fit=crop";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function buildFilterValue(f: FilterState) {
  const parts: string[] = [];
  if (f.blur > 0) parts.push(`blur(${f.blur}px)`);
  if (f.brightness !== 100) parts.push(`brightness(${f.brightness}%)`);
  if (f.contrast !== 100) parts.push(`contrast(${f.contrast}%)`);
  if (f.grayscale > 0) parts.push(`grayscale(${f.grayscale}%)`);
  if (f.hueRotate !== 0) parts.push(`hue-rotate(${f.hueRotate}deg)`);
  if (f.invert > 0) parts.push(`invert(${f.invert}%)`);
  if (f.opacity !== 100) parts.push(`opacity(${f.opacity}%)`);
  if (f.saturate !== 100) parts.push(`saturate(${f.saturate}%)`);
  if (f.sepia > 0) parts.push(`sepia(${f.sepia}%)`);
  for (const s of f.dropShadows) {
    parts.push(`drop-shadow(${s.x}px ${s.y}px ${s.blur}px ${s.color})`);
  }
  return parts.length ? parts.join(" ") : "none";
}

type Preset = { id: string; label: string; filters: Partial<FilterState> };

const PRESETS: Preset[] = [
  { id: "vivid", label: "Vivid", filters: { saturate: 160, contrast: 115, brightness: 105 } },
  { id: "muted", label: "Muted", filters: { saturate: 45, brightness: 105, contrast: 95 } },
  { id: "bw", label: "B&W", filters: { grayscale: 100, contrast: 110 } },
  { id: "sepia", label: "Sepia", filters: { sepia: 80, contrast: 105, brightness: 102 } },
  { id: "cool", label: "Cool hue", filters: { hueRotate: 180, saturate: 120 } },
  { id: "warm", label: "Warm", filters: { hueRotate: 25, saturate: 130, brightness: 105 } },
  { id: "blur", label: "Soft blur", filters: { blur: 6, brightness: 105 } },
  { id: "invert", label: "Invert", filters: { invert: 100 } },
  { id: "high-contrast", label: "High contrast", filters: { contrast: 160, saturate: 110 } },
  { id: "fade", label: "Fade", filters: { opacity: 55, brightness: 110 } },
  {
    id: "shadow",
    label: "Drop shadow",
    filters: {
      dropShadows: [{ id: "1", x: 6, y: 10, blur: 18, color: "rgba(0,0,0,0.45)" }],
    },
  },
  {
    id: "glow",
    label: "Rose glow",
    filters: {
      saturate: 120,
      dropShadows: [
        { id: "1", x: 0, y: 0, blur: 16, color: "rgba(225,29,72,0.55)" },
        { id: "2", x: 0, y: 8, blur: 24, color: "rgba(0,0,0,0.25)" },
      ],
    },
  },
  { id: "original", label: "None", filters: { ...DEFAULT_FILTERS } },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs sm:text-sm">{label}</Label>
      {children}
    </div>
  );
}

export function CssFilterGeneratorTool() {
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    saturate: 140,
    contrast: 110,
  });
  const [activePreset, setActivePreset] = useState("vivid");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("photo");
  const [compare, setCompare] = useState<CompareMode>("after");
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [className, setClassName] = useState("filtered");
  const [includeWebkit, setIncludeWebkit] = useState(true);
  const [extraCss, setExtraCss] = useState("");
  const [flashKey, setFlashKey] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (uploadUrl) URL.revokeObjectURL(uploadUrl);
    };
  }, [uploadUrl]);

  const filterValue = useMemo(() => buildFilterValue(filters), [filters]);

  const css = useMemo(() => {
    const cls = className.trim() || "filtered";
    const lines = [`.${cls} {`];
    if (includeWebkit) lines.push(`  -webkit-filter: ${filterValue};`);
    lines.push(`  filter: ${filterValue};`);
    if (extraCss.trim()) {
      for (const raw of extraCss.split("\n")) {
        const line = raw.trim();
        if (!line) continue;
        lines.push(`  ${line.endsWith(";") ? line : `${line};`}`);
      }
    }
    lines.push(`}`);
    return lines.join("\n");
  }, [className, extraCss, filterValue, includeWebkit]);

  const setFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setActivePreset("custom");
    setFilters((prev) => ({ ...prev, [key]: value }));
    setFlashKey((k) => k + 1);
  };

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    setFilters({
      ...DEFAULT_FILTERS,
      ...preset.filters,
      dropShadows: preset.filters.dropShadows
        ? preset.filters.dropShadows.map((s) => ({ ...s, id: uid() }))
        : [],
    });
    setFlashKey((k) => k + 1);
    toast.success(`Applied “${preset.label}”`);
  };

  const reset = () => {
    setActivePreset("original");
    setFilters({ ...DEFAULT_FILTERS });
    setFlashKey((k) => k + 1);
  };

  const addShadow = () => {
    setActivePreset("custom");
    setFilters((prev) => ({
      ...prev,
      dropShadows: [...prev.dropShadows, { id: uid(), x: 4, y: 6, blur: 12, color: "#000000" }],
    }));
  };

  const updateShadow = (id: string, patch: Partial<DropShadow>) => {
    setActivePreset("custom");
    setFilters((prev) => ({
      ...prev,
      dropShadows: prev.dropShadows.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  };

  const removeShadow = (id: string) => {
    setActivePreset("custom");
    setFilters((prev) => ({
      ...prev,
      dropShadows: prev.dropShadows.filter((s) => s.id !== id),
    }));
  };

  const onUpload = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setUploadUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setPreviewMode("upload");
    toast.success("Image loaded");
  };

  const copyFilterOnly = async () => {
    try {
      await navigator.clipboard.writeText(filterValue);
      toast.success("Filter value copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const appliedFilter = compare === "before" ? "none" : filterValue;

  const PreviewSubject = ({ filter }: { filter: string }) => {
    if (previewMode === "text") {
      return (
        <div
          className="mx-auto max-w-md rounded-2xl bg-background/90 px-6 py-10 text-center shadow-lg"
          style={{ filter }}
        >
          <p className="font-display text-3xl font-semibold tracking-tight text-foreground">colorBase</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Filter applies to this entire block — text, colors, and shadows.
          </p>
        </div>
      );
    }

    if (previewMode === "card") {
      return (
        <div
          className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-border/50 bg-background shadow-xl"
          style={{ filter }}
        >
          <div className="h-36 bg-gradient-to-br from-rose-500 via-fuchsia-500 to-amber-400" />
          <div className="space-y-2 p-5">
            <p className="font-display text-lg font-semibold">Filtered card</p>
            <p className="text-sm text-muted-foreground">
              CSS `filter` affects the element and its contents — not the backdrop behind it.
            </p>
            <div className="h-2 w-24 rounded-full bg-rose-500" />
          </div>
        </div>
      );
    }

    const src = previewMode === "upload" && uploadUrl ? uploadUrl : PHOTO;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt="Filter preview"
        className="mx-auto max-h-[22rem] w-full max-w-xl rounded-2xl object-cover shadow-xl shadow-rose-500/10"
        style={{ filter }}
      />
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
                  CSS Filter Generator
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Stack blur, color, and drop-shadow filters on any element.
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
                href="/blur-image"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Image adjustments
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
                Filters
              </p>
              {(
                [
                  ["blur", "Blur", 0, 40, "px", filters.blur],
                  ["brightness", "Brightness", 0, 200, "%", filters.brightness],
                  ["contrast", "Contrast", 0, 200, "%", filters.contrast],
                  ["saturate", "Saturate", 0, 200, "%", filters.saturate],
                  ["grayscale", "Grayscale", 0, 100, "%", filters.grayscale],
                  ["hueRotate", "Hue rotate", 0, 360, "deg", filters.hueRotate],
                  ["sepia", "Sepia", 0, 100, "%", filters.sepia],
                  ["invert", "Invert", 0, 100, "%", filters.invert],
                  ["opacity", "Opacity", 0, 100, "%", filters.opacity],
                ] as const
              ).map(([key, label, min, max, unit, value]) => (
                <Field key={key} label={`${label} · ${value}${unit}`}>
                  <Slider min={min} max={max} value={[value]} onValueChange={([n]) => setFilter(key, n)} />
                </Field>
              ))}
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Drop shadow
                </p>
                <Button type="button" variant="outline" size="sm" className="h-8 rounded-full text-xs" onClick={addShadow}>
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
              {filters.dropShadows.length === 0 && (
                <p className="text-xs text-muted-foreground">Optional drop-shadow layers on the filtered element.</p>
              )}
              {filters.dropShadows.map((shadow, index) => (
                <div key={shadow.id} className="space-y-2 rounded-2xl border border-border/50 bg-muted/20 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Shadow {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeShadow(shadow.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label={`X · ${shadow.x}px`}>
                      <Slider min={-40} max={40} value={[shadow.x]} onValueChange={([n]) => updateShadow(shadow.id, { x: n })} />
                    </Field>
                    <Field label={`Y · ${shadow.y}px`}>
                      <Slider min={-40} max={40} value={[shadow.y]} onValueChange={([n]) => updateShadow(shadow.id, { y: n })} />
                    </Field>
                  </div>
                  <Field label={`Blur · ${shadow.blur}px`}>
                    <Slider min={0} max={60} value={[shadow.blur]} onValueChange={([n]) => updateShadow(shadow.id, { blur: n })} />
                  </Field>
                  <Field label="Color">
                    <Input
                      type="color"
                      value={shadow.color.startsWith("#") ? shadow.color : "#000000"}
                      onChange={(e) => updateShadow(shadow.id, { color: e.target.value })}
                      className="h-10 w-full max-w-[8rem] p-1"
                    />
                  </Field>
                </div>
              ))}
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Preview & output
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["photo", "Photo"],
                    ["card", "Card"],
                    ["text", "Text"],
                    ["upload", "Upload"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      if (id === "upload") fileRef.current?.click();
                      else setPreviewMode(id);
                    }}
                    className={cn(
                      "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                      previewMode === id
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30 hover:bg-muted/60"
                    )}
                  >
                    {id === "upload" ? (
                      <span className="inline-flex items-center gap-1">
                        <Upload className="h-3 w-3" />
                        {label}
                      </span>
                    ) : (
                      label
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
                Include <span className="font-mono text-xs">-webkit-filter</span>
              </label>
              <Field label="Extra CSS">
                <Textarea
                  value={extraCss}
                  onChange={(e) => setExtraCss(e.target.value)}
                  placeholder="transition: filter 200ms ease;"
                  rows={2}
                  className="rounded-xl font-mono text-xs"
                  spellCheck={false}
                />
              </Field>
            </section>

            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="button" onClick={() => void copyFilterOnly()}>
                <Copy className="h-4 w-4" />
                Copy filter value
              </PrimaryButton>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => applyPreset(PRESETS[0])}>
                <Sparkles className="h-3.5 w-3.5" />
                Vivid preset
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
                  <p className="text-sm font-semibold">Live filter</p>
                  <p className="mt-0.5 max-w-xl truncate font-mono text-[11px] text-muted-foreground">
                    {filterValue}
                  </p>
                </div>
                <div className="flex rounded-full border border-border/60 p-0.5">
                  {(
                    [
                      ["after", "After"],
                      ["before", "Before"],
                      ["split", "Split"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setCompare(id)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-medium",
                        compare === id ? "bg-rose-500 text-white" : "text-muted-foreground"
                      )}
                    >
                      {id === "split" ? <Columns2 className="mr-1 inline h-3 w-3" /> : null}
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-3 sm:p-5">
              <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.08),_transparent_55%)] p-4 sm:min-h-[380px] sm:p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${previewMode}-${compare}-${flashKey}`}
                    initial={{ opacity: 0.9, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                  >
                    {compare === "split" ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Before
                          </p>
                          <PreviewSubject filter="none" />
                        </div>
                        <div>
                          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            After
                          </p>
                          <PreviewSubject filter={filterValue} />
                        </div>
                      </div>
                    ) : (
                      <PreviewSubject filter={appliedFilter} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <CodeOutput
            value={css}
            filename="filter.css"
            language="css"
            title="CSS output"
            eyebrow="Copy · Download"
            rows={12}
          />
        </div>
      </div>
    </div>
  );
}
