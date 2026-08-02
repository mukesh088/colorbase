"use client";

import { useMemo, useRef, useState } from "react";
import { Plus, RotateCcw, Trash2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ToolWorkbench, OutputBox, PrimaryButton } from "@/components/tools/suite/workbench";
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

type PanelState = {
  bgColor: string;
  bgOpacity: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  radius: number;
  className: string;
  extraCss: string;
};

type SceneId = "gradient" | "mesh" | "photo" | "aurora" | "upload" | "html";

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

const DEFAULT_PANEL: PanelState = {
  bgColor: "#ffffff",
  bgOpacity: 40,
  width: 70,
  height: 180,
  offsetX: 0,
  offsetY: 0,
  radius: 20,
  className: "backdrop-panel",
  extraCss: "",
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full || "ffffff", 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 1000) / 1000})`;
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

type Preset = { id: string; label: string; filters: Partial<FilterState>; panel?: Partial<PanelState> };

const PRESETS: Preset[] = [
  { id: "original", label: "Original", filters: { ...DEFAULT_FILTERS }, panel: { bgOpacity: 40 } },
  { id: "blur", label: "Blur", filters: { blur: 12, saturate: 120 }, panel: { bgOpacity: 35 } },
  { id: "brightness", label: "Brightness", filters: { brightness: 140 }, panel: { bgOpacity: 30 } },
  { id: "contrast", label: "Contrast", filters: { contrast: 160 }, panel: { bgOpacity: 35 } },
  { id: "grayscale", label: "Grayscale", filters: { grayscale: 100 }, panel: { bgOpacity: 45 } },
  { id: "hue", label: "Hue rotate", filters: { hueRotate: 180, saturate: 130 }, panel: { bgOpacity: 35 } },
  { id: "invert", label: "Invert", filters: { invert: 100 }, panel: { bgOpacity: 25, bgColor: "#000000" } },
  { id: "opacity", label: "Opacity", filters: { opacity: 55 }, panel: { bgOpacity: 20 } },
  { id: "saturate", label: "Saturate", filters: { saturate: 180, blur: 4 }, panel: { bgOpacity: 30 } },
  { id: "sepia", label: "Sepia", filters: { sepia: 85, contrast: 110 }, panel: { bgOpacity: 40 } },
  {
    id: "shadow",
    label: "Drop shadow",
    filters: {
      blur: 8,
      dropShadows: [{ id: "1", x: 4, y: 8, blur: 16, color: "rgba(0,0,0,0.45)" }],
    },
    panel: { bgOpacity: 35 },
  },
  {
    id: "shadows",
    label: "Multi shadow",
    filters: {
      blur: 10,
      saturate: 130,
      dropShadows: [
        { id: "1", x: 2, y: 4, blur: 8, color: "rgba(225,29,72,0.45)" },
        { id: "2", x: -4, y: 10, blur: 18, color: "rgba(0,0,0,0.35)" },
      ],
    },
    panel: { bgOpacity: 30 },
  },
  {
    id: "contrast-gray",
    label: "Contrast + gray",
    filters: { contrast: 140, grayscale: 60, blur: 6 },
    panel: { bgOpacity: 40 },
  },
  {
    id: "contrast-sepia",
    label: "Contrast + sepia",
    filters: { contrast: 130, sepia: 55, blur: 8, saturate: 110 },
    panel: { bgOpacity: 38 },
  },
];

const SCENES: { id: SceneId; label: string }[] = [
  { id: "gradient", label: "Gradient" },
  { id: "mesh", label: "Mesh" },
  { id: "aurora", label: "Aurora" },
  { id: "photo", label: "Photo" },
  { id: "html", label: "HTML" },
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

function SceneBackdrop({
  scene,
  uploadUrl,
  previewBg,
}: {
  scene: SceneId;
  uploadUrl: string | null;
  previewBg: string;
}) {
  if (scene === "upload" && uploadUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={uploadUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
    );
  }

  if (scene === "photo") {
    return (
      <>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80&auto=format&fit=crop)",
          }}
        />
        <div className="absolute inset-0 bg-black/15" />
      </>
    );
  }

  if (scene === "html") {
    return (
      <div className="absolute inset-0 overflow-hidden p-4 sm:p-6" style={{ background: previewBg }}>
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
              <span className="text-[10px] opacity-80">card {i + 1}</span>
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
          backgroundColor: previewBg,
          backgroundImage: `
            radial-gradient(at 20% 20%, #fb7185 0px, transparent 45%),
            radial-gradient(at 80% 10%, #60a5fa 0px, transparent 40%),
            radial-gradient(at 50% 80%, #34d399 0px, transparent 45%),
            radial-gradient(at 90% 70%, #f59e0b 0px, transparent 40%),
            radial-gradient(at 10% 70%, #a78bfa 0px, transparent 40%)
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
          background: `
            linear-gradient(120deg, #0f172a 0%, #1e1b4b 40%, #831843 100%),
            radial-gradient(ellipse at 30% 40%, rgba(56,189,248,0.55), transparent 55%),
            radial-gradient(ellipse at 70% 60%, rgba(244,114,182,0.5), transparent 50%)
          `,
          backgroundBlendMode: "normal, screen, screen",
        }}
      >
        <div className="absolute left-[12%] top-[20%] h-28 w-28 rounded-full bg-cyan-300/40 blur-2xl" />
        <div className="absolute bottom-[18%] right-[15%] h-36 w-36 rounded-full bg-pink-400/35 blur-2xl" />
      </div>
    );
  }

  // gradient (default) + upload fallback
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(125deg, #fb7185 0%, #f59e0b 28%, #34d399 58%, #60a5fa 100%)`,
      }}
    >
      <div className="absolute -left-8 top-8 h-28 w-28 rounded-full bg-white/35 blur-md" />
      <div className="absolute bottom-6 right-10 h-24 w-40 rotate-12 rounded-3xl bg-fuchsia-800/45" />
      <div className="absolute left-1/3 top-1/2 h-16 w-16 -translate-y-1/2 rounded-2xl bg-sky-900/30" />
    </div>
  );
}

export function BackdropFilterGenerator() {
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS, blur: 12, saturate: 120 });
  const [panel, setPanel] = useState<PanelState>(DEFAULT_PANEL);
  const [scene, setScene] = useState<SceneId>("gradient");
  const [previewBg, setPreviewBg] = useState("#120810");
  const [activePreset, setActivePreset] = useState("blur");
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filterValue = useMemo(() => buildFilterValue(filters), [filters]);
  const panelBg = useMemo(
    () => hexToRgba(panel.bgColor, panel.bgOpacity / 100),
    [panel.bgColor, panel.bgOpacity]
  );

  const css = useMemo(() => {
    const cls = panel.className.trim() || "backdrop-panel";
    const lines = [
      `.${cls} {`,
      `  width: ${panel.width}%;`,
      `  height: ${panel.height}px;`,
      `  background-color: ${panelBg};`,
      `  backdrop-filter: ${filterValue};`,
      `  -webkit-backdrop-filter: ${filterValue};`,
      `  border-radius: ${panel.radius}px;`,
    ];
    if (panel.offsetX || panel.offsetY) {
      lines.push(`  transform: translate(${panel.offsetX}px, ${panel.offsetY}px);`);
    }
    if (panel.extraCss.trim()) {
      for (const raw of panel.extraCss.split("\n")) {
        const line = raw.trim();
        if (!line) continue;
        lines.push(`  ${line.endsWith(";") ? line : `${line};`}`);
      }
    }
    lines.push(`}`);
    return lines.join("\n");
  }, [filterValue, panel, panelBg]);

  const setFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setActivePreset("custom");
    setFilters((prev) => ({ ...prev, [key]: value }));
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
    if (preset.panel) setPanel((p) => ({ ...p, ...preset.panel }));
  };

  const resetFilters = () => {
    setActivePreset("original");
    setFilters({ ...DEFAULT_FILTERS });
  };

  const addShadow = () => {
    setActivePreset("custom");
    setFilters((prev) => ({
      ...prev,
      dropShadows: [
        ...prev.dropShadows,
        { id: uid(), x: 4, y: 6, blur: 12, color: "#000000" },
      ],
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
    setScene("upload");
  };

  return (
    <ToolWorkbench
      title="Style editor"
      hint="Apply backdrop-filter effects behind a translucent panel — blur, color, and drop-shadow."
      controls={
        <div className="space-y-6">
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Samples
              </p>
              <Button type="button" variant="ghost" size="sm" className="h-8 rounded-full text-xs" onClick={resetFilters}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset filters
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    activePreset === preset.id
                      ? "border-rose-500/50 bg-rose-500 text-white shadow-sm shadow-rose-500/25"
                      : "border-border/60 bg-muted/30 text-foreground hover:bg-muted/60"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
              backdrop-filter
            </p>
            <Field label={`Blur · ${filters.blur}px`}>
              <Slider min={0} max={40} value={[filters.blur]} onValueChange={([n]) => setFilter("blur", n)} />
            </Field>
            <Field label={`Brightness · ${filters.brightness}%`}>
              <Slider min={0} max={200} value={[filters.brightness]} onValueChange={([n]) => setFilter("brightness", n)} />
            </Field>
            <Field label={`Contrast · ${filters.contrast}%`}>
              <Slider min={0} max={200} value={[filters.contrast]} onValueChange={([n]) => setFilter("contrast", n)} />
            </Field>
            <Field label={`Grayscale · ${filters.grayscale}%`}>
              <Slider min={0} max={100} value={[filters.grayscale]} onValueChange={([n]) => setFilter("grayscale", n)} />
            </Field>
            <Field label={`Hue rotate · ${filters.hueRotate}deg`}>
              <Slider min={0} max={360} value={[filters.hueRotate]} onValueChange={([n]) => setFilter("hueRotate", n)} />
            </Field>
            <Field label={`Invert · ${filters.invert}%`}>
              <Slider min={0} max={100} value={[filters.invert]} onValueChange={([n]) => setFilter("invert", n)} />
            </Field>
            <Field label={`Opacity · ${filters.opacity}%`}>
              <Slider min={0} max={100} value={[filters.opacity]} onValueChange={([n]) => setFilter("opacity", n)} />
            </Field>
            <Field label={`Saturate · ${filters.saturate}%`}>
              <Slider min={0} max={200} value={[filters.saturate]} onValueChange={([n]) => setFilter("saturate", n)} />
            </Field>
            <Field label={`Sepia · ${filters.sepia}%`}>
              <Slider min={0} max={100} value={[filters.sepia]} onValueChange={([n]) => setFilter("sepia", n)} />
            </Field>
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
              <p className="text-xs text-muted-foreground">No drop-shadows yet. Add one to cast a shadow along the panel.</p>
            )}
            {filters.dropShadows.map((shadow, index) => (
              <div key={shadow.id} className="space-y-2 rounded-2xl border border-border/50 bg-muted/20 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">drop-shadow {index + 1}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeShadow(shadow.id)} aria-label="Remove shadow">
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
              Panel
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Background">
                <Input
                  type="color"
                  value={panel.bgColor}
                  onChange={(e) => setPanel((p) => ({ ...p, bgColor: e.target.value }))}
                  className="h-10 w-full p-1"
                />
              </Field>
              <Field label={`Opacity · ${panel.bgOpacity}%`}>
                <Slider
                  min={0}
                  max={100}
                  value={[panel.bgOpacity]}
                  onValueChange={([n]) => setPanel((p) => ({ ...p, bgOpacity: n }))}
                />
              </Field>
            </div>
            <Field label={`Width · ${panel.width}%`}>
              <Slider min={20} max={100} value={[panel.width]} onValueChange={([n]) => setPanel((p) => ({ ...p, width: n }))} />
            </Field>
            <Field label={`Height · ${panel.height}px`}>
              <Slider min={80} max={320} value={[panel.height]} onValueChange={([n]) => setPanel((p) => ({ ...p, height: n }))} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={`Offset X · ${panel.offsetX}px`}>
                <Slider min={-80} max={80} value={[panel.offsetX]} onValueChange={([n]) => setPanel((p) => ({ ...p, offsetX: n }))} />
              </Field>
              <Field label={`Offset Y · ${panel.offsetY}px`}>
                <Slider min={-80} max={80} value={[panel.offsetY]} onValueChange={([n]) => setPanel((p) => ({ ...p, offsetY: n }))} />
              </Field>
            </div>
            <Field label={`Radius · ${panel.radius}px`}>
              <Slider min={0} max={48} value={[panel.radius]} onValueChange={([n]) => setPanel((p) => ({ ...p, radius: n }))} />
            </Field>
            <Field label="Class name">
              <Input
                value={panel.className}
                onChange={(e) => setPanel((p) => ({ ...p, className: e.target.value.replace(/[^\w-]/g, "") }))}
                className="font-mono text-sm"
                spellCheck={false}
              />
            </Field>
            <Field label="Extra CSS (optional)">
              <Input
                value={panel.extraCss}
                onChange={(e) => setPanel((p) => ({ ...p, extraCss: e.target.value }))}
                placeholder="border: 1px solid rgba(255,255,255,0.4);"
                className="font-mono text-xs"
                spellCheck={false}
              />
            </Field>
          </section>

          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
              Preview scene
            </p>
            <div className="flex flex-wrap gap-2">
              {SCENES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (s.id === "upload") fileRef.current?.click();
                    else setScene(s.id);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    scene === s.id
                      ? "border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                      : "border-border/60 bg-background hover:bg-muted/50"
                  )}
                >
                  {s.id === "upload" ? (
                    <span className="inline-flex items-center gap-1">
                      <Upload className="h-3 w-3" />
                      Upload
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
            <Field label="Preview background">
              <Input
                type="color"
                value={previewBg}
                onChange={(e) => setPreviewBg(e.target.value)}
                className="h-10 w-full max-w-[8rem] p-1"
              />
            </Field>
            {scene === "upload" && !uploadUrl && (
              <PrimaryButton type="button" size="sm" className="w-full sm:w-auto" onClick={() => fileRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" />
                Choose image
              </PrimaryButton>
            )}
          </section>
        </div>
      }
      preview={
        <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm">
          <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
              Preview
            </p>
            <p className="text-sm font-semibold">Live backdrop-filter</p>
          </div>
          <div className="p-4 sm:p-5">
            <div
              className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl"
              style={{ backgroundColor: previewBg }}
            >
              <SceneBackdrop scene={scene} uploadUrl={uploadUrl} previewBg={previewBg} />
              <div className="relative z-10 flex w-full items-center justify-center p-4 sm:p-6">
                <div
                  className="flex flex-col items-center justify-center border border-white/35 px-5 py-6 text-center shadow-lg"
                  style={{
                    width: `${panel.width}%`,
                    height: panel.height,
                    backgroundColor: panelBg,
                    backdropFilter: filterValue,
                    WebkitBackdropFilter: filterValue,
                    borderRadius: panel.radius,
                    transform: `translate(${panel.offsetX}px, ${panel.offsetY}px)`,
                  }}
                >
                  <p className="text-sm font-semibold text-foreground drop-shadow-sm sm:text-base">
                    Frosted panel
                  </p>
                  <p className="mt-1 max-w-[16rem] text-[11px] text-foreground/80 sm:text-xs">
                    Effects apply to content behind this element
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      output={<OutputBox value={css} label="CSS" filename="backdrop-filter.css" language="css" rows={12} />}
    />
  );
}
