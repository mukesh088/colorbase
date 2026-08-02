"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutGrid,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CodeOutput } from "@/components/tools/suite/code-output";
import { PrimaryButton } from "@/components/tools/suite/workbench";
import { cn } from "@/lib/utils";

type JustifyItems = "stretch" | "start" | "center" | "end";
type AlignItems = JustifyItems;
type JustifyContent =
  | "start"
  | "center"
  | "end"
  | "space-between"
  | "space-around"
  | "space-evenly"
  | "stretch";
type AlignContent = JustifyContent;

type GridItem = {
  id: string;
  label: string;
  colStart: number;
  colSpan: number;
  rowStart: number;
  rowSpan: number;
  color: string;
};

type GridState = {
  cols: string[];
  rows: string[];
  gap: number;
  rowGap: number;
  columnGap: number;
  useAxisGap: boolean;
  justifyItems: JustifyItems;
  alignItems: AlignItems;
  justifyContent: JustifyContent;
  alignContent: AlignContent;
  padding: number;
  className: string;
  autoFlow: "row" | "column" | "dense" | "row dense" | "column dense";
};

const COLORS = ["#e11d48", "#db2777", "#c026d3", "#7c3aed", "#2563eb", "#0891b2", "#059669", "#d97706"];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function makeTracks(count: number, value = "1fr") {
  return Array.from({ length: count }, () => value);
}

function makeItem(index: number, partial?: Partial<GridItem>): GridItem {
  return {
    id: uid(),
    label: String(index + 1),
    colStart: (index % 3) + 1,
    colSpan: 1,
    rowStart: Math.floor(index / 3) + 1,
    rowSpan: 1,
    color: COLORS[index % COLORS.length],
    ...partial,
  };
}

const DEFAULT_GRID: GridState = {
  cols: makeTracks(3),
  rows: makeTracks(2),
  gap: 12,
  rowGap: 12,
  columnGap: 12,
  useAxisGap: false,
  justifyItems: "stretch",
  alignItems: "stretch",
  justifyContent: "stretch",
  alignContent: "stretch",
  padding: 16,
  className: "grid-container",
  autoFlow: "row",
};

const PRESETS: {
  id: string;
  label: string;
  grid: Partial<GridState> & { cols: string[]; rows: string[] };
  items: Omit<GridItem, "id" | "color">[];
}[] = [
  {
    id: "cards",
    label: "Cards",
    grid: { cols: makeTracks(3), rows: makeTracks(2), gap: 16 },
    items: Array.from({ length: 6 }, (_, i) => ({
      label: String(i + 1),
      colStart: (i % 3) + 1,
      colSpan: 1,
      rowStart: Math.floor(i / 3) + 1,
      rowSpan: 1,
    })),
  },
  {
    id: "sidebar",
    label: "Sidebar",
    grid: { cols: ["220px", "1fr"], rows: ["1fr"], gap: 16 },
    items: [
      { label: "Nav", colStart: 1, colSpan: 1, rowStart: 1, rowSpan: 1 },
      { label: "Main", colStart: 2, colSpan: 1, rowStart: 1, rowSpan: 1 },
    ],
  },
  {
    id: "holy",
    label: "Header · Main",
    grid: { cols: ["1fr", "2fr", "1fr"], rows: ["64px", "1fr", "48px"], gap: 12 },
    items: [
      { label: "Header", colStart: 1, colSpan: 3, rowStart: 1, rowSpan: 1 },
      { label: "Side", colStart: 1, colSpan: 1, rowStart: 2, rowSpan: 1 },
      { label: "Main", colStart: 2, colSpan: 1, rowStart: 2, rowSpan: 1 },
      { label: "Aside", colStart: 3, colSpan: 1, rowStart: 2, rowSpan: 1 },
      { label: "Footer", colStart: 1, colSpan: 3, rowStart: 3, rowSpan: 1 },
    ],
  },
  {
    id: "gallery",
    label: "Gallery",
    grid: {
      cols: ["1fr", "1fr", "1fr", "1fr"],
      rows: ["140px", "140px"],
      gap: 10,
    },
    items: [
      { label: "1", colStart: 1, colSpan: 2, rowStart: 1, rowSpan: 2 },
      { label: "2", colStart: 3, colSpan: 1, rowStart: 1, rowSpan: 1 },
      { label: "3", colStart: 4, colSpan: 1, rowStart: 1, rowSpan: 1 },
      { label: "4", colStart: 3, colSpan: 2, rowStart: 2, rowSpan: 1 },
    ],
  },
  {
    id: "autofit",
    label: "Auto-fit",
    grid: {
      cols: ["repeat(auto-fit, minmax(140px, 1fr))"],
      rows: ["auto"],
      gap: 14,
    },
    items: Array.from({ length: 5 }, (_, i) => ({
      label: String(i + 1),
      colStart: 0,
      colSpan: 1,
      rowStart: 0,
      rowSpan: 1,
    })),
  },
  {
    id: "twelve",
    label: "12-col",
    grid: { cols: makeTracks(12, "1fr"), rows: ["80px", "80px"], gap: 8 },
    items: [
      { label: "4", colStart: 1, colSpan: 4, rowStart: 1, rowSpan: 1 },
      { label: "8", colStart: 5, colSpan: 8, rowStart: 1, rowSpan: 1 },
      { label: "6", colStart: 1, colSpan: 6, rowStart: 2, rowSpan: 1 },
      { label: "6b", colStart: 7, colSpan: 6, rowStart: 2, rowSpan: 1 },
    ],
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

function ChipGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-full border px-2 py-1 text-[10px] font-medium transition-colors",
            value === opt
              ? "border-rose-500/50 bg-rose-500 text-white"
              : "border-border/60 bg-muted/30 hover:bg-muted/60"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function tracksToCss(tracks: string[]) {
  return tracks.join(" ");
}

export function CssGridGeneratorTool() {
  const [grid, setGrid] = useState<GridState>(DEFAULT_GRID);
  const [items, setItems] = useState<GridItem[]>(() =>
    Array.from({ length: 6 }, (_, i) =>
      makeItem(i, {
        colStart: (i % 3) + 1,
        rowStart: Math.floor(i / 3) + 1,
      })
    )
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState("cards");
  const [showLines, setShowLines] = useState(true);

  const selected = items.find((i) => i.id === selectedId) ?? null;
  const isAutoFit = grid.cols.some((c) => c.includes("auto-fit") || c.includes("auto-fill"));

  const patchGrid = <K extends keyof GridState>(key: K, value: GridState[K]) => {
    setActivePreset("custom");
    setGrid((prev) => ({ ...prev, [key]: value }));
  };

  const setColCount = (n: number) => {
    const count = Math.max(1, Math.min(12, n));
    setActivePreset("custom");
    setGrid((prev) => {
      const next = [...prev.cols];
      while (next.length < count) next.push("1fr");
      while (next.length > count) next.pop();
      return { ...prev, cols: next };
    });
  };

  const setRowCount = (n: number) => {
    const count = Math.max(1, Math.min(8, n));
    setActivePreset("custom");
    setGrid((prev) => {
      const next = [...prev.rows];
      while (next.length < count) next.push("1fr");
      while (next.length > count) next.pop();
      return { ...prev, rows: next };
    });
  };

  const updateTrack = (axis: "cols" | "rows", index: number, value: string) => {
    setActivePreset("custom");
    setGrid((prev) => {
      const list = [...prev[axis]];
      list[index] = value;
      return { ...prev, [axis]: list };
    });
  };

  const patchItem = (id: string, patch: Partial<GridItem>) => {
    setActivePreset("custom");
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const addItem = () => {
    if (items.length >= 16) {
      toast.error("Max 16 items");
      return;
    }
    const next = makeItem(items.length, {
      colStart: 1,
      rowStart: 1,
      colSpan: 1,
      rowSpan: 1,
    });
    setItems((prev) => [...prev, next]);
    setSelectedId(next.id);
    setActivePreset("custom");
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (selectedId === id) setSelectedId(null);
    setActivePreset("custom");
  };

  const reset = () => {
    setGrid(DEFAULT_GRID);
    setItems(
      Array.from({ length: 6 }, (_, i) =>
        makeItem(i, {
          colStart: (i % 3) + 1,
          rowStart: Math.floor(i / 3) + 1,
        })
      )
    );
    setSelectedId(null);
    setActivePreset("cards");
  };

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setActivePreset(preset.id);
    setGrid((prev) => ({ ...prev, ...preset.grid }));
    setItems(
      preset.items.map((it, i) =>
        makeItem(i, {
          ...it,
          color: COLORS[i % COLORS.length],
        })
      )
    );
    setSelectedId(null);
    toast.success(`Applied “${preset.label}”`);
  };

  const css = useMemo(() => {
    const cls = grid.className.trim() || "grid-container";
    const gapLine = grid.useAxisGap
      ? `  row-gap: ${grid.rowGap}px;\n  column-gap: ${grid.columnGap}px;`
      : `  gap: ${grid.gap}px;`;

    const lines = [
      `.${cls} {`,
      `  display: grid;`,
      `  grid-template-columns: ${tracksToCss(grid.cols)};`,
      `  grid-template-rows: ${tracksToCss(grid.rows)};`,
      `  grid-auto-flow: ${grid.autoFlow};`,
      `  justify-items: ${grid.justifyItems};`,
      `  align-items: ${grid.alignItems};`,
      `  justify-content: ${grid.justifyContent};`,
      `  align-content: ${grid.alignContent};`,
      gapLine,
      `  padding: ${grid.padding}px;`,
      `}`,
    ];

    items.forEach((it, i) => {
      const placed = it.colStart > 0 && it.rowStart > 0;
      if (!placed && it.colSpan === 1 && it.rowSpan === 1) return;
      lines.push("");
      lines.push(`.${cls} > .item-${i + 1} {`);
      if (placed) {
        lines.push(
          `  grid-column: ${it.colStart} / span ${it.colSpan};`,
          `  grid-row: ${it.rowStart} / span ${it.rowSpan};`
        );
      } else if (it.colSpan > 1 || it.rowSpan > 1) {
        lines.push(`  grid-column: span ${it.colSpan};`, `  grid-row: span ${it.rowSpan};`);
      }
      lines.push(`}`);
    });

    return lines.join("\n");
  }, [grid, items]);

  const htmlSnippet = useMemo(() => {
    const cls = grid.className.trim() || "grid-container";
    const kids = items.map((it, i) => `  <div class="item-${i + 1}">${it.label}</div>`).join("\n");
    return `<div class="${cls}">\n${kids}\n</div>`;
  }, [grid.className, items]);

  const previewStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: tracksToCss(grid.cols),
    gridTemplateRows: tracksToCss(grid.rows),
    gridAutoFlow: grid.autoFlow,
    justifyItems: grid.justifyItems,
    alignItems: grid.alignItems,
    justifyContent: grid.justifyContent,
    alignContent: grid.alignContent,
    ...(grid.useAxisGap
      ? { rowGap: grid.rowGap, columnGap: grid.columnGap }
      : { gap: grid.gap }),
    padding: grid.padding,
    minHeight: 360,
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
                  CSS Grid Generator
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Tracks, gaps, placement, and spans — with live CSS output.
                </p>
              </div>
              <Badge variant="secondary" className="rounded-full">
                <LayoutGrid className="mr-1 h-3.5 w-3.5" />
                Live
              </Badge>
            </div>
          </div>

          <div className="max-h-[min(70vh,52rem)] space-y-5 overflow-y-auto p-3 sm:p-5">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/flexbox-playground"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                Flexbox
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
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={cn(
                      "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                      activePreset === p.id
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30 hover:bg-muted/60"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Template
              </p>
              {!isAutoFit && (
                <>
                  <Field label={`Columns · ${grid.cols.length}`}>
                    <Slider
                      min={1}
                      max={12}
                      value={[grid.cols.length]}
                      onValueChange={([n]) => setColCount(n)}
                    />
                  </Field>
                  <Field label={`Rows · ${grid.rows.length}`}>
                    <Slider
                      min={1}
                      max={8}
                      value={[grid.rows.length]}
                      onValueChange={([n]) => setRowCount(n)}
                    />
                  </Field>
                </>
              )}

              <div className="space-y-2">
                <p className="text-[11px] font-medium text-muted-foreground">Column tracks</p>
                {grid.cols.map((track, i) => (
                  <Input
                    key={`c-${i}`}
                    value={track}
                    onChange={(e) => updateTrack("cols", i, e.target.value)}
                    className="h-9 font-mono text-xs"
                    spellCheck={false}
                    placeholder="1fr · 200px · minmax(120px,1fr)"
                  />
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-muted-foreground">Row tracks</p>
                {grid.rows.map((track, i) => (
                  <Input
                    key={`r-${i}`}
                    value={track}
                    onChange={(e) => updateTrack("rows", i, e.target.value)}
                    className="h-9 font-mono text-xs"
                    spellCheck={false}
                    placeholder="1fr · auto · 120px"
                  />
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {["1fr", "auto", "minmax(120px, 1fr)", "200px"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setActivePreset("custom");
                      setGrid((prev) => ({
                        ...prev,
                        cols: prev.cols.map(() => v),
                      }));
                    }}
                    className="rounded-full border border-border/60 px-2 py-1 text-[10px] font-medium hover:bg-muted/50"
                  >
                    Cols → {v}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setActivePreset("custom");
                    setGrid((prev) => ({
                      ...prev,
                      cols: ["repeat(auto-fit, minmax(140px, 1fr))"],
                      rows: ["auto"],
                    }));
                  }}
                  className="rounded-full border border-border/60 px-2 py-1 text-[10px] font-medium hover:bg-muted/50"
                >
                  auto-fit
                </button>
              </div>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Alignment & gap
              </p>
              <Field label="justify-items">
                <ChipGroup
                  value={grid.justifyItems}
                  options={["stretch", "start", "center", "end"] as const}
                  onChange={(v) => patchGrid("justifyItems", v)}
                />
              </Field>
              <Field label="align-items">
                <ChipGroup
                  value={grid.alignItems}
                  options={["stretch", "start", "center", "end"] as const}
                  onChange={(v) => patchGrid("alignItems", v)}
                />
              </Field>
              <Field label="justify-content">
                <ChipGroup
                  value={grid.justifyContent}
                  options={
                    ["start", "center", "end", "space-between", "space-around", "space-evenly", "stretch"] as const
                  }
                  onChange={(v) => patchGrid("justifyContent", v)}
                />
              </Field>
              <Field label="align-content">
                <ChipGroup
                  value={grid.alignContent}
                  options={
                    ["start", "center", "end", "space-between", "space-around", "space-evenly", "stretch"] as const
                  }
                  onChange={(v) => patchGrid("alignContent", v)}
                />
              </Field>
              <Field label="grid-auto-flow">
                <ChipGroup
                  value={grid.autoFlow}
                  options={["row", "column", "dense", "row dense", "column dense"] as const}
                  onChange={(v) => patchGrid("autoFlow", v)}
                />
              </Field>

              <button
                type="button"
                onClick={() => patchGrid("useAxisGap", !grid.useAxisGap)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium",
                  grid.useAxisGap
                    ? "border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                    : "border-border/60"
                )}
              >
                Separate row / column gap {grid.useAxisGap ? "on" : "off"}
              </button>

              {grid.useAxisGap ? (
                <>
                  <Field label={`row-gap · ${grid.rowGap}px`}>
                    <Slider min={0} max={48} value={[grid.rowGap]} onValueChange={([n]) => patchGrid("rowGap", n)} />
                  </Field>
                  <Field label={`column-gap · ${grid.columnGap}px`}>
                    <Slider
                      min={0}
                      max={48}
                      value={[grid.columnGap]}
                      onValueChange={([n]) => patchGrid("columnGap", n)}
                    />
                  </Field>
                </>
              ) : (
                <Field label={`gap · ${grid.gap}px`}>
                  <Slider min={0} max={48} value={[grid.gap]} onValueChange={([n]) => patchGrid("gap", n)} />
                </Field>
              )}

              <Field label={`padding · ${grid.padding}px`}>
                <Slider min={0} max={48} value={[grid.padding]} onValueChange={([n]) => patchGrid("padding", n)} />
              </Field>
              <Field label="Class name">
                <Input
                  value={grid.className}
                  onChange={(e) => patchGrid("className", e.target.value.replace(/[^\w-]/g, ""))}
                  className="font-mono text-sm"
                  spellCheck={false}
                />
              </Field>
              <button
                type="button"
                onClick={() => setShowLines((v) => !v)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium",
                  showLines
                    ? "border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                    : "border-border/60"
                )}
              >
                Grid lines {showLines ? "on" : "off"}
              </button>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Items · {items.length}
                </p>
                <Button type="button" size="sm" variant="outline" className="h-8 rounded-full" onClick={addItem}>
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
              <div className="space-y-1.5">
                {items.map((it) => (
                  <div
                    key={it.id}
                    onClick={() => setSelectedId(it.id)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-xl border px-2 py-2",
                      selectedId === it.id
                        ? "border-rose-500/50 bg-rose-500/10"
                        : "border-border/50 bg-muted/15 hover:bg-muted/30"
                    )}
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
                      style={{ background: it.color }}
                    >
                      {it.label.slice(0, 2)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-medium">
                      {it.label}
                      {it.colStart > 0
                        ? ` · c${it.colStart}/span ${it.colSpan} · r${it.rowStart}/span ${it.rowSpan}`
                        : ` · span ${it.colSpan}×${it.rowSpan}`}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(it.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            {selected && (
              <section className="space-y-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Selected · {selected.label}
                </p>
                <Field label="Label">
                  <Input
                    value={selected.label}
                    onChange={(e) => patchItem(selected.id, { label: e.target.value })}
                    className="h-9"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={`Col start · ${selected.colStart || "auto"}`}>
                    <Slider
                      min={0}
                      max={Math.max(12, grid.cols.length)}
                      value={[selected.colStart]}
                      onValueChange={([n]) => patchItem(selected.id, { colStart: n })}
                    />
                  </Field>
                  <Field label={`Col span · ${selected.colSpan}`}>
                    <Slider
                      min={1}
                      max={Math.max(12, grid.cols.length)}
                      value={[selected.colSpan]}
                      onValueChange={([n]) => patchItem(selected.id, { colSpan: n })}
                    />
                  </Field>
                  <Field label={`Row start · ${selected.rowStart || "auto"}`}>
                    <Slider
                      min={0}
                      max={Math.max(8, grid.rows.length)}
                      value={[selected.rowStart]}
                      onValueChange={([n]) => patchItem(selected.id, { rowStart: n })}
                    />
                  </Field>
                  <Field label={`Row span · ${selected.rowSpan}`}>
                    <Slider
                      min={1}
                      max={Math.max(8, grid.rows.length)}
                      value={[selected.rowSpan]}
                      onValueChange={([n]) => patchItem(selected.id, { rowSpan: n })}
                    />
                  </Field>
                </div>
                <p className="text-[10px] text-muted-foreground">Set start to 0 for auto placement.</p>
                <Field label="Color">
                  <Input
                    type="color"
                    value={selected.color}
                    onChange={(e) => patchItem(selected.id, { color: e.target.value })}
                    className="h-10 w-full max-w-[8rem] p-1"
                  />
                </Field>
              </section>
            )}

            <PrimaryButton type="button" onClick={() => applyPreset(PRESETS[2])}>
              <Sparkles className="h-4 w-4" />
              Header · Main preset
            </PrimaryButton>
          </div>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
            <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Preview
              </p>
              <p className="text-sm font-semibold">
                {tracksToCss(grid.cols)} × {tracksToCss(grid.rows)}
              </p>
            </div>
            <div className="p-3 sm:p-5">
              <div
                className={cn(
                  "rounded-2xl border border-dashed border-border/60 bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.08),_transparent_55%)]",
                  showLines && "bg-[linear-gradient(to_right,rgba(225,29,72,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(225,29,72,0.06)_1px,transparent_1px)] bg-[size:24px_24px]"
                )}
                style={previewStyle}
              >
                <AnimatePresence initial={false}>
                  {items.map((it) => (
                    <motion.button
                      key={it.id}
                      type="button"
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setSelectedId(it.id)}
                      className={cn(
                        "flex min-h-[64px] items-center justify-center rounded-xl px-3 py-4 text-sm font-bold text-white shadow-md transition",
                        selectedId === it.id && "ring-2 ring-white ring-offset-2 ring-offset-background"
                      )}
                      style={{
                        background: `linear-gradient(135deg, ${it.color}, ${it.color}cc)`,
                        ...(it.colStart > 0
                          ? {
                              gridColumn: `${it.colStart} / span ${it.colSpan}`,
                              gridRow: `${it.rowStart} / span ${it.rowSpan}`,
                            }
                          : {
                              gridColumn: `span ${it.colSpan}`,
                              gridRow: `span ${it.rowSpan}`,
                            }),
                      }}
                    >
                      {it.label}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <CodeOutput
            value={css}
            filename="grid.css"
            language="css"
            title="CSS output"
            eyebrow="Template + item placement"
            rows={16}
          />
          <CodeOutput
            value={htmlSnippet}
            filename="grid.html"
            language="html"
            title="HTML structure"
            eyebrow="Markup"
            rows={8}
            animate={false}
          />
        </div>
      </div>
    </div>
  );
}
