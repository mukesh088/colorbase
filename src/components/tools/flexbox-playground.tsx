"use client";

import { useMemo, useState, type DragEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  GripVertical,
  LayoutDashboard,
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

type FlexDirection = "row" | "column" | "row-reverse" | "column-reverse";
type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";
type Justify =
  | "flex-start"
  | "center"
  | "flex-end"
  | "space-between"
  | "space-around"
  | "space-evenly";
type AlignItems = "stretch" | "flex-start" | "center" | "flex-end" | "baseline";
type AlignContent =
  | "stretch"
  | "flex-start"
  | "center"
  | "flex-end"
  | "space-between"
  | "space-around"
  | "space-evenly";
type AlignSelf = "auto" | AlignItems;

type FlexItem = {
  id: string;
  label: string;
  grow: number;
  shrink: number;
  basis: string;
  alignSelf: AlignSelf;
  order: number;
  width: number;
  height: number;
  color: string;
};

type ContainerState = {
  direction: FlexDirection;
  wrap: FlexWrap;
  justify: Justify;
  alignItems: AlignItems;
  alignContent: AlignContent;
  gap: number;
  rowGap: number;
  columnGap: number;
  useAxisGap: boolean;
  padding: number;
  className: string;
};

const COLORS = ["#e11d48", "#db2777", "#c026d3", "#7c3aed", "#2563eb", "#0891b2", "#059669", "#d97706"];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function makeItem(index: number, partial?: Partial<FlexItem>): FlexItem {
  return {
    id: uid(),
    label: String(index + 1),
    grow: 0,
    shrink: 1,
    basis: "auto",
    alignSelf: "auto",
    order: 0,
    width: 72,
    height: 72,
    color: COLORS[index % COLORS.length],
    ...partial,
  };
}

const DEFAULT_CONTAINER: ContainerState = {
  direction: "row",
  wrap: "wrap",
  justify: "flex-start",
  alignItems: "stretch",
  alignContent: "stretch",
  gap: 12,
  rowGap: 12,
  columnGap: 12,
  useAxisGap: false,
  padding: 16,
  className: "flex-container",
};

const PRESETS: { id: string; label: string; container: Partial<ContainerState>; items?: number }[] = [
  { id: "navbar", label: "Navbar", container: { direction: "row", justify: "space-between", alignItems: "center", wrap: "nowrap", gap: 12 }, items: 4 },
  { id: "center", label: "Center", container: { direction: "row", justify: "center", alignItems: "center", wrap: "nowrap", gap: 16 }, items: 3 },
  { id: "cards", label: "Cards wrap", container: { direction: "row", justify: "flex-start", alignItems: "stretch", wrap: "wrap", gap: 16 }, items: 6 },
  { id: "stack", label: "Column stack", container: { direction: "column", justify: "flex-start", alignItems: "stretch", wrap: "nowrap", gap: 10 }, items: 4 },
  { id: "spread", label: "Space evenly", container: { direction: "row", justify: "space-evenly", alignItems: "center", wrap: "nowrap", gap: 8 }, items: 4 },
  { id: "end", label: "Pack end", container: { direction: "row", justify: "flex-end", alignItems: "flex-end", wrap: "wrap", gap: 12 }, items: 5 },
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

export function FlexboxPlaygroundTool() {
  const [container, setContainer] = useState<ContainerState>(DEFAULT_CONTAINER);
  const [items, setItems] = useState<FlexItem[]>(() =>
    Array.from({ length: 4 }, (_, i) => makeItem(i))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState("custom");

  const selected = items.find((i) => i.id === selectedId) ?? null;

  const patchContainer = <K extends keyof ContainerState>(key: K, value: ContainerState[K]) => {
    setActivePreset("custom");
    setContainer((prev) => ({ ...prev, [key]: value }));
  };

  const patchItem = (id: string, patch: Partial<FlexItem>) => {
    setActivePreset("custom");
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const addItem = () => {
    if (items.length >= 12) {
      toast.error("Max 12 items");
      return;
    }
    const next = makeItem(items.length);
    setItems((prev) => [...prev, next]);
    setSelectedId(next.id);
    setActivePreset("custom");
    toast.success("Item added");
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (selectedId === id) setSelectedId(null);
    setActivePreset("custom");
  };

  const reset = () => {
    setContainer(DEFAULT_CONTAINER);
    const next = Array.from({ length: 4 }, (_, i) => makeItem(i));
    setItems(next);
    setSelectedId(null);
    setActivePreset("custom");
  };

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setActivePreset(preset.id);
    setContainer((prev) => ({ ...prev, ...preset.container }));
    const count = preset.items ?? 4;
    setItems(Array.from({ length: count }, (_, i) => makeItem(i)));
    setSelectedId(null);
    toast.success(`Applied “${preset.label}”`);
  };

  const onDragStart = (id: string) => (e: DragEvent) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const onDragOver = (id: string) => (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== overId) setOverId(id);
  };

  const onDrop = (targetId: string) => (e: DragEvent) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain") || dragId;
    setDragId(null);
    setOverId(null);
    if (!sourceId || sourceId === targetId) return;
    setItems((prev) => {
      const from = prev.findIndex((i) => i.id === sourceId);
      const to = prev.findIndex((i) => i.id === targetId);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next.map((it, idx) => ({ ...it, label: String(idx + 1) }));
    });
    setActivePreset("custom");
  };

  const onDragEnd = () => {
    setDragId(null);
    setOverId(null);
  };

  const css = useMemo(() => {
    const cls = container.className.trim() || "flex-container";
    const gapLine = container.useAxisGap
      ? `  row-gap: ${container.rowGap}px;\n  column-gap: ${container.columnGap}px;`
      : `  gap: ${container.gap}px;`;

    const lines = [
      `.${cls} {`,
      `  display: flex;`,
      `  flex-direction: ${container.direction};`,
      `  flex-wrap: ${container.wrap};`,
      `  justify-content: ${container.justify};`,
      `  align-items: ${container.alignItems};`,
      `  align-content: ${container.alignContent};`,
      gapLine,
      `  padding: ${container.padding}px;`,
      `}`,
    ];

    const customized = items.filter(
      (it) =>
        it.grow !== 0 ||
        it.shrink !== 1 ||
        it.basis !== "auto" ||
        it.alignSelf !== "auto" ||
        it.order !== 0
    );

    customized.forEach((it, i) => {
      lines.push("");
      lines.push(`.${cls} > .item-${i + 1} {`);
      if (it.grow !== 0) lines.push(`  flex-grow: ${it.grow};`);
      if (it.shrink !== 1) lines.push(`  flex-shrink: ${it.shrink};`);
      if (it.basis !== "auto") lines.push(`  flex-basis: ${it.basis};`);
      if (it.alignSelf !== "auto") lines.push(`  align-self: ${it.alignSelf};`);
      if (it.order !== 0) lines.push(`  order: ${it.order};`);
      lines.push(`}`);
    });

    return lines.join("\n");
  }, [container, items]);

  const htmlSnippet = useMemo(() => {
    const cls = container.className.trim() || "flex-container";
    const kids = items
      .map((it, i) => `  <div class="item-${i + 1}">${it.label}</div>`)
      .join("\n");
    return `<div class="${cls}">\n${kids}\n</div>`;
  }, [container.className, items]);

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
                  Flexbox Playground
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Drag items to reorder. Tune container and per-item flex props.
                </p>
              </div>
              <Badge variant="secondary" className="rounded-full">
                <LayoutDashboard className="mr-1 h-3.5 w-3.5" />
                Live
              </Badge>
            </div>
          </div>

          <div className="max-h-[min(70vh,52rem)] space-y-5 overflow-y-auto p-3 sm:p-5">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/css-grid-generator"
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                CSS Grid
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
                Container
              </p>
              <Field label="flex-direction">
                <ChipGroup
                  value={container.direction}
                  options={["row", "column", "row-reverse", "column-reverse"] as const}
                  onChange={(v) => patchContainer("direction", v)}
                />
              </Field>
              <Field label="flex-wrap">
                <ChipGroup
                  value={container.wrap}
                  options={["nowrap", "wrap", "wrap-reverse"] as const}
                  onChange={(v) => patchContainer("wrap", v)}
                />
              </Field>
              <Field label="justify-content">
                <ChipGroup
                  value={container.justify}
                  options={
                    [
                      "flex-start",
                      "center",
                      "flex-end",
                      "space-between",
                      "space-around",
                      "space-evenly",
                    ] as const
                  }
                  onChange={(v) => patchContainer("justify", v)}
                />
              </Field>
              <Field label="align-items">
                <ChipGroup
                  value={container.alignItems}
                  options={["stretch", "flex-start", "center", "flex-end", "baseline"] as const}
                  onChange={(v) => patchContainer("alignItems", v)}
                />
              </Field>
              <Field label="align-content">
                <ChipGroup
                  value={container.alignContent}
                  options={
                    [
                      "stretch",
                      "flex-start",
                      "center",
                      "flex-end",
                      "space-between",
                      "space-around",
                      "space-evenly",
                    ] as const
                  }
                  onChange={(v) => patchContainer("alignContent", v)}
                />
              </Field>

              <button
                type="button"
                onClick={() => patchContainer("useAxisGap", !container.useAxisGap)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium",
                  container.useAxisGap
                    ? "border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                    : "border-border/60"
                )}
              >
                Separate row / column gap {container.useAxisGap ? "on" : "off"}
              </button>

              {container.useAxisGap ? (
                <>
                  <Field label={`row-gap · ${container.rowGap}px`}>
                    <Slider
                      min={0}
                      max={48}
                      value={[container.rowGap]}
                      onValueChange={([n]) => patchContainer("rowGap", n)}
                    />
                  </Field>
                  <Field label={`column-gap · ${container.columnGap}px`}>
                    <Slider
                      min={0}
                      max={48}
                      value={[container.columnGap]}
                      onValueChange={([n]) => patchContainer("columnGap", n)}
                    />
                  </Field>
                </>
              ) : (
                <Field label={`gap · ${container.gap}px`}>
                  <Slider
                    min={0}
                    max={48}
                    value={[container.gap]}
                    onValueChange={([n]) => patchContainer("gap", n)}
                  />
                </Field>
              )}

              <Field label={`padding · ${container.padding}px`}>
                <Slider
                  min={0}
                  max={48}
                  value={[container.padding]}
                  onValueChange={([n]) => patchContainer("padding", n)}
                />
              </Field>
              <Field label="Class name">
                <Input
                  value={container.className}
                  onChange={(e) => patchContainer("className", e.target.value.replace(/[^\w-]/g, ""))}
                  className="font-mono text-sm"
                  spellCheck={false}
                />
              </Field>
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
              <p className="text-[11px] text-muted-foreground">
                Drag handles to reorder. Click an item in the preview to edit flex properties.
              </p>
              <div className="space-y-1.5">
                {items.map((it) => (
                  <div
                    key={it.id}
                    draggable
                    onDragStart={onDragStart(it.id)}
                    onDragOver={onDragOver(it.id)}
                    onDrop={onDrop(it.id)}
                    onDragEnd={onDragEnd}
                    onClick={() => setSelectedId(it.id)}
                    className={cn(
                      "flex cursor-grab items-center gap-2 rounded-xl border px-2 py-2 active:cursor-grabbing",
                      selectedId === it.id
                        ? "border-rose-500/50 bg-rose-500/10"
                        : "border-border/50 bg-muted/15 hover:bg-muted/30",
                      dragId === it.id && "opacity-50",
                      overId === it.id && dragId !== it.id && "ring-2 ring-rose-500/40"
                    )}
                  >
                    <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
                      style={{ background: it.color }}
                    >
                      {it.label}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-medium">Item {it.label}</span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(it.id);
                      }}
                      aria-label={`Remove item ${it.label}`}
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
                  Selected · Item {selected.label}
                </p>
                <Field label={`flex-grow · ${selected.grow}`}>
                  <Slider
                    min={0}
                    max={5}
                    step={1}
                    value={[selected.grow]}
                    onValueChange={([n]) => patchItem(selected.id, { grow: n })}
                  />
                </Field>
                <Field label={`flex-shrink · ${selected.shrink}`}>
                  <Slider
                    min={0}
                    max={5}
                    step={1}
                    value={[selected.shrink]}
                    onValueChange={([n]) => patchItem(selected.id, { shrink: n })}
                  />
                </Field>
                <Field label="flex-basis">
                  <div className="flex flex-wrap gap-1">
                    {["auto", "0", "50%", "100%", "120px"].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => patchItem(selected.id, { basis: b })}
                        className={cn(
                          "rounded-full border px-2 py-1 text-[10px] font-medium",
                          selected.basis === b
                            ? "border-rose-500/50 bg-rose-500 text-white"
                            : "border-border/60 bg-background"
                        )}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={selected.basis}
                    onChange={(e) => patchItem(selected.id, { basis: e.target.value })}
                    className="mt-2 h-9 font-mono text-xs"
                    spellCheck={false}
                  />
                </Field>
                <Field label="align-self">
                  <ChipGroup
                    value={selected.alignSelf}
                    options={["auto", "stretch", "flex-start", "center", "flex-end", "baseline"] as const}
                    onChange={(v) => patchItem(selected.id, { alignSelf: v })}
                  />
                </Field>
                <Field label={`order · ${selected.order}`}>
                  <Slider
                    min={-5}
                    max={5}
                    value={[selected.order]}
                    onValueChange={([n]) => patchItem(selected.id, { order: n })}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={`Width · ${selected.width}px`}>
                    <Slider
                      min={40}
                      max={200}
                      value={[selected.width]}
                      onValueChange={([n]) => patchItem(selected.id, { width: n })}
                    />
                  </Field>
                  <Field label={`Height · ${selected.height}px`}>
                    <Slider
                      min={40}
                      max={200}
                      value={[selected.height]}
                      onValueChange={([n]) => patchItem(selected.id, { height: n })}
                    />
                  </Field>
                </div>
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

            <PrimaryButton type="button" onClick={() => applyPreset(PRESETS[0])}>
              <Sparkles className="h-4 w-4" />
              Navbar preset
            </PrimaryButton>
          </div>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
            <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Playground
              </p>
              <p className="text-sm font-semibold">Drag · drop · select</p>
            </div>
            <div className="p-3 sm:p-5">
              <div
                className="min-h-[320px] rounded-2xl border border-dashed border-border/60 bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.08),_transparent_55%)] sm:min-h-[400px]"
                style={{
                  display: "flex",
                  flexDirection: container.direction,
                  flexWrap: container.wrap,
                  justifyContent: container.justify,
                  alignItems: container.alignItems,
                  alignContent: container.alignContent,
                  ...(container.useAxisGap
                    ? { rowGap: container.rowGap, columnGap: container.columnGap }
                    : { gap: container.gap }),
                  padding: container.padding,
                }}
              >
                <AnimatePresence initial={false}>
                  {items.map((it, index) => (
                    <motion.div
                      key={it.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative"
                      style={{
                        width: it.width,
                        height: it.height,
                        flexGrow: it.grow,
                        flexShrink: it.shrink,
                        flexBasis: it.basis,
                        alignSelf: it.alignSelf === "auto" ? undefined : it.alignSelf,
                        order: it.order,
                      }}
                    >
                      {/* Native HTML5 DnD on a plain div — Framer Motion's onDrag* is a different API */}
                      <div
                        draggable
                        onDragStart={onDragStart(it.id)}
                        onDragOver={onDragOver(it.id)}
                        onDrop={onDrop(it.id)}
                        onDragEnd={onDragEnd}
                        onClick={() => setSelectedId(it.id)}
                        title={`Item ${it.label} — drag to reorder`}
                        className={cn(
                          "absolute inset-0 flex cursor-grab items-center justify-center rounded-xl text-sm font-bold text-white shadow-md active:cursor-grabbing",
                          selectedId === it.id && "ring-2 ring-white ring-offset-2 ring-offset-background",
                          dragId === it.id && "opacity-60",
                          overId === it.id && dragId !== it.id && "ring-2 ring-rose-300"
                        )}
                        style={{
                          background: `linear-gradient(135deg, ${it.color}, ${it.color}cc)`,
                        }}
                      >
                        <span className="pointer-events-none absolute left-1 top-1 opacity-70">
                          <GripVertical className="h-3.5 w-3.5" />
                        </span>
                        {it.label}
                        <span className="pointer-events-none absolute bottom-1 right-1 text-[9px] opacity-70">
                          {index + 1}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <CodeOutput
            value={css}
            filename="flexbox.css"
            language="css"
            title="CSS output"
            eyebrow="Container + item rules"
            rows={14}
          />

          <CodeOutput
            value={htmlSnippet}
            filename="flexbox.html"
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
