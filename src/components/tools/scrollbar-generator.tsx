"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, RotateCcw, Sparkles, Wand2 } from "lucide-react";
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

type ScrollState = {
  track: string;
  thumb: string;
  thumbHover: string;
  thumbActive: string;
  width: number;
  radius: number;
  thumbBorder: number;
  thumbBorderColor: string;
  firefoxWidth: "auto" | "thin" | "none";
  includeHover: boolean;
  includeCorner: boolean;
  gutter: boolean;
};

const DEFAULT: ScrollState = {
  track: "#fce7f3",
  thumb: "#e11d48",
  thumbHover: "#be123c",
  thumbActive: "#9f1239",
  width: 10,
  radius: 999,
  thumbBorder: 0,
  thumbBorderColor: "#ffffff",
  firefoxWidth: "thin",
  includeHover: true,
  includeCorner: true,
  gutter: false,
};

type Preset = { id: string; label: string; state: Partial<ScrollState> };

const PRESETS: Preset[] = [
  { id: "rose", label: "Rose", state: { ...DEFAULT } },
  {
    id: "minimal",
    label: "Minimal",
    state: {
      track: "#f1f5f9",
      thumb: "#94a3b8",
      thumbHover: "#64748b",
      thumbActive: "#475569",
      width: 8,
      radius: 999,
      firefoxWidth: "thin",
    },
  },
  {
    id: "dark",
    label: "Dark",
    state: {
      track: "#1e293b",
      thumb: "#64748b",
      thumbHover: "#94a3b8",
      thumbActive: "#cbd5e1",
      width: 10,
      radius: 8,
    },
  },
  {
    id: "soft",
    label: "Soft",
    state: {
      track: "#fff1f2",
      thumb: "#fda4af",
      thumbHover: "#fb7185",
      thumbActive: "#f43f5e",
      width: 12,
      radius: 999,
    },
  },
  {
    id: "neon",
    label: "Neon",
    state: {
      track: "#0f172a",
      thumb: "#e11d48",
      thumbHover: "#fb7185",
      thumbActive: "#fecdd3",
      width: 8,
      radius: 4,
      thumbBorder: 1,
      thumbBorderColor: "#fb7185",
    },
  },
  {
    id: "contrast",
    label: "Contrast",
    state: {
      track: "#ffffff",
      thumb: "#0f172a",
      thumbHover: "#334155",
      thumbActive: "#020617",
      width: 14,
      radius: 6,
      firefoxWidth: "auto",
    },
  },
  {
    id: "pill",
    label: "Pill",
    state: {
      track: "#e2e8f0",
      thumb: "#e11d48",
      thumbHover: "#be123c",
      thumbActive: "#9f1239",
      width: 16,
      radius: 999,
      thumbBorder: 3,
      thumbBorderColor: "#e2e8f0",
    },
  },
  {
    id: "thin",
    label: "Thin",
    state: {
      track: "transparent",
      thumb: "#cbd5e1",
      thumbHover: "#94a3b8",
      thumbActive: "#64748b",
      width: 6,
      radius: 999,
      firefoxWidth: "thin",
    },
  },
  {
    id: "thick",
    label: "Thick",
    state: {
      track: "#f8fafc",
      thumb: "#e11d48",
      thumbHover: "#be123c",
      thumbActive: "#9f1239",
      width: 18,
      radius: 10,
      firefoxWidth: "auto",
    },
  },
  {
    id: "invisible",
    label: "Hidden",
    state: {
      track: "transparent",
      thumb: "transparent",
      thumbHover: "transparent",
      thumbActive: "transparent",
      width: 0,
      firefoxWidth: "none",
      includeHover: false,
    },
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

function colorInputValue(c: string) {
  return c.startsWith("#") ? c : "#e11d48";
}

export function ScrollbarGeneratorTool() {
  const scrollId = useId().replace(/:/g, "");
  const [state, setState] = useState<ScrollState>({ ...DEFAULT });
  const [activePreset, setActivePreset] = useState("rose");
  const [className, setClassName] = useState("scroll");
  const [extraCss, setExtraCss] = useState("");
  const [demo, setDemo] = useState<"vertical" | "horizontal" | "both">("vertical");

  const patch = <K extends keyof ScrollState>(key: K, value: ScrollState[K]) => {
    setActivePreset("custom");
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const cls = className.trim() || "scroll";
  const scope = `cb-scroll-${scrollId}`;

  const css = useMemo(() => {
    const lines: string[] = [
      `/* Firefox */`,
      `.${cls} {`,
      `  scrollbar-width: ${state.firefoxWidth};`,
    ];
    if (state.firefoxWidth !== "none") {
      lines.push(`  scrollbar-color: ${state.thumb} ${state.track};`);
    }
    if (state.gutter) lines.push(`  scrollbar-gutter: stable;`);
    if (extraCss.trim()) {
      for (const raw of extraCss.split("\n")) {
        const line = raw.trim();
        if (!line) continue;
        lines.push(`  ${line.endsWith(";") ? line : `${line};`}`);
      }
    }
    lines.push(`}`);
    lines.push(``);
    lines.push(`/* WebKit (Chrome, Safari, Edge) */`);
    lines.push(`.${cls}::-webkit-scrollbar {`);
    lines.push(`  width: ${state.width}px;`);
    lines.push(`  height: ${state.width}px;`);
    lines.push(`}`);
    lines.push(`.${cls}::-webkit-scrollbar-track {`);
    lines.push(`  background: ${state.track};`);
    lines.push(`}`);
    lines.push(`.${cls}::-webkit-scrollbar-thumb {`);
    lines.push(`  background: ${state.thumb};`);
    lines.push(`  border-radius: ${state.radius >= 999 ? "9999px" : `${state.radius}px`};`);
    if (state.thumbBorder > 0) {
      lines.push(
        `  border: ${state.thumbBorder}px solid ${state.thumbBorderColor};`
      );
      lines.push(`  background-clip: padding-box;`);
    }
    lines.push(`}`);
    if (state.includeHover) {
      lines.push(`.${cls}::-webkit-scrollbar-thumb:hover {`);
      lines.push(`  background: ${state.thumbHover};`);
      lines.push(`}`);
      lines.push(`.${cls}::-webkit-scrollbar-thumb:active {`);
      lines.push(`  background: ${state.thumbActive};`);
      lines.push(`}`);
    }
    if (state.includeCorner) {
      lines.push(`.${cls}::-webkit-scrollbar-corner {`);
      lines.push(`  background: ${state.track};`);
      lines.push(`}`);
    }
    return lines.join("\n");
  }, [cls, extraCss, state]);

  const previewCss = useMemo(() => {
    return `
.${scope} {
  scrollbar-width: ${state.firefoxWidth};
  scrollbar-color: ${state.thumb} ${state.track};
  ${state.gutter ? "scrollbar-gutter: stable;" : ""}
}
.${scope}::-webkit-scrollbar {
  width: ${state.width}px;
  height: ${state.width}px;
}
.${scope}::-webkit-scrollbar-track {
  background: ${state.track};
}
.${scope}::-webkit-scrollbar-thumb {
  background: ${state.thumb};
  border-radius: ${state.radius >= 999 ? "9999px" : `${state.radius}px`};
  ${state.thumbBorder > 0 ? `border: ${state.thumbBorder}px solid ${state.thumbBorderColor}; background-clip: padding-box;` : ""}
}
.${scope}::-webkit-scrollbar-thumb:hover {
  background: ${state.thumbHover};
}
.${scope}::-webkit-scrollbar-thumb:active {
  background: ${state.thumbActive};
}
.${scope}::-webkit-scrollbar-corner {
  background: ${state.track};
}
`.trim();
  }, [scope, state]);

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    setState({ ...DEFAULT, ...preset.state });
    toast.success(`Applied “${preset.label}”`);
  };

  const reset = () => applyPreset(PRESETS[0]);

  const copyFirefox = async () => {
    try {
      await navigator.clipboard.writeText(
        `scrollbar-width: ${state.firefoxWidth};\nscrollbar-color: ${state.thumb} ${state.track};`
      );
      toast.success("Firefox scrollbar CSS copied");
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
                  Scrollbar
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  WebKit + Firefox scrollbar styles with live preview.
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
                href="/border-generator"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Borders
              </Link>
              <Link
                href="/css-button-generator"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Buttons
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
                Colors
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Track">
                  <Input
                    type="color"
                    value={colorInputValue(state.track)}
                    onChange={(e) => patch("track", e.target.value)}
                    className="h-10 w-full p-1"
                  />
                </Field>
                <Field label="Thumb">
                  <Input
                    type="color"
                    value={colorInputValue(state.thumb)}
                    onChange={(e) => patch("thumb", e.target.value)}
                    className="h-10 w-full p-1"
                  />
                </Field>
                <Field label="Thumb hover">
                  <Input
                    type="color"
                    value={colorInputValue(state.thumbHover)}
                    onChange={(e) => patch("thumbHover", e.target.value)}
                    className="h-10 w-full p-1"
                  />
                </Field>
                <Field label="Thumb active">
                  <Input
                    type="color"
                    value={colorInputValue(state.thumbActive)}
                    onChange={(e) => patch("thumbActive", e.target.value)}
                    className="h-10 w-full p-1"
                  />
                </Field>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => patch("track", "transparent")}
                  className={cn(
                    "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                    state.track === "transparent"
                      ? "border-rose-500/50 bg-rose-500 text-white"
                      : "border-border/60 bg-muted/30"
                  )}
                >
                  Transparent track
                </button>
              </div>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                WebKit size
              </p>
              <Field label={`Width / height · ${state.width}px`}>
                <Slider min={0} max={24} value={[state.width]} onValueChange={([n]) => patch("width", n)} />
              </Field>
              <Field label={`Thumb radius · ${state.radius >= 999 ? "pill" : `${state.radius}px`}`}>
                <Slider min={0} max={24} value={[Math.min(state.radius, 24)]} onValueChange={([n]) => patch("radius", n)} />
              </Field>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => patch("radius", 999)}
                  className={cn(
                    "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                    state.radius >= 999
                      ? "border-rose-500/50 bg-rose-500 text-white"
                      : "border-border/60 bg-muted/30"
                  )}
                >
                  Pill thumb
                </button>
              </div>
              <Field label={`Thumb border · ${state.thumbBorder}px`}>
                <Slider min={0} max={6} value={[state.thumbBorder]} onValueChange={([n]) => patch("thumbBorder", n)} />
              </Field>
              {state.thumbBorder > 0 && (
                <Field label="Border color">
                  <Input
                    type="color"
                    value={colorInputValue(state.thumbBorderColor)}
                    onChange={(e) => patch("thumbBorderColor", e.target.value)}
                    className="h-10 w-full max-w-[8rem] p-1"
                  />
                </Field>
              )}
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Firefox
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["auto", "Auto"],
                    ["thin", "Thin"],
                    ["none", "None"],
                  ] as const
                ).map(([id, name]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => patch("firefoxWidth", id)}
                    className={cn(
                      "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                      state.firefoxWidth === id
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30"
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Firefox uses scrollbar-width + scrollbar-color (thumb then track).
              </p>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Options
              </p>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={state.includeHover}
                  onChange={(e) => patch("includeHover", e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-rose-500"
                />
                Thumb :hover / :active
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={state.includeCorner}
                  onChange={(e) => patch("includeCorner", e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-rose-500"
                />
                Corner style
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={state.gutter}
                  onChange={(e) => patch("gutter", e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-rose-500"
                />
                scrollbar-gutter: stable
              </label>
              <Field label="Class name">
                <Input
                  value={className}
                  onChange={(e) => setClassName(e.target.value.replace(/[^\w-]/g, ""))}
                  className="font-mono text-sm"
                  spellCheck={false}
                />
              </Field>
              <Field label="Extra CSS on container">
                <Textarea
                  value={extraCss}
                  onChange={(e) => setExtraCss(e.target.value)}
                  placeholder="overflow: auto;"
                  rows={2}
                  className="rounded-xl font-mono text-xs"
                  spellCheck={false}
                />
              </Field>
            </section>

            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="button" onClick={() => void copyFirefox()}>
                <Copy className="h-4 w-4" />
                Copy Firefox CSS
              </PrimaryButton>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => applyPreset(PRESETS[0])}>
                <Sparkles className="h-3.5 w-3.5" />
                Rose
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
                  <p className="text-sm font-semibold">Scroll the panel</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      ["vertical", "Vertical"],
                      ["horizontal", "Horizontal"],
                      ["both", "Both"],
                    ] as const
                  ).map(([id, name]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setDemo(id)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                        demo === id
                          ? "border-rose-500/50 bg-rose-500 text-white"
                          : "border-border/60 bg-muted/30"
                      )}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-3 sm:p-5">
              <style>{previewCss}</style>
              <div
                className={cn(
                  scope,
                  "rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm leading-relaxed",
                  demo === "vertical" && "h-72 overflow-y-auto overflow-x-hidden",
                  demo === "horizontal" && "h-40 overflow-x-auto overflow-y-hidden",
                  demo === "both" && "h-72 overflow-auto"
                )}
              >
                {demo === "horizontal" || demo === "both" ? (
                  <div className={cn(demo === "both" && "min-w-[720px]")}>
                    {demo === "horizontal" && (
                      <div className="flex w-max gap-3 pb-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex h-24 w-40 shrink-0 items-end rounded-2xl p-3 text-xs font-semibold text-white"
                            style={{
                              background: `linear-gradient(135deg, hsl(${(i * 28) % 360} 75% 55%), hsl(${(i * 28 + 40) % 360} 80% 45%))`,
                            }}
                          >
                            Card {i + 1}
                          </div>
                        ))}
                      </div>
                    )}
                    {demo === "both" &&
                      Array.from({ length: 28 }).map((_, i) => (
                        <p key={i} className="mb-2 text-muted-foreground">
                          Scrollbar preview line {i + 1} — customize track, thumb, hover, and radius. Works in WebKit
                          and Firefox.
                        </p>
                      ))}
                  </div>
                ) : (
                  Array.from({ length: 24 }).map((_, i) => (
                    <p key={i} className="mb-2 text-muted-foreground">
                      Scrollbar preview line {i + 1} — customize track, thumb, hover, and radius. Works in WebKit and
                      Firefox.
                    </p>
                  ))
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ["Track", state.track],
                  ["Thumb", state.thumb],
                  ["Width", `${state.width}px`],
                  ["Firefox", state.firefoxWidth],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</p>
                    <p className="truncate font-mono text-xs font-semibold">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <CodeOutput
            value={css}
            filename="scrollbar.css"
            language="css"
            title="CSS output"
            eyebrow="Firefox · WebKit"
            rows={18}
          />
        </div>
      </div>
    </div>
  );
}
