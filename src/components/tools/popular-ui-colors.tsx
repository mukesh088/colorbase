"use client";

import { useMemo, useState } from "react";
import { Check, Copy, LayoutDashboard, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getTextColor } from "@/lib/colors/convert";
import {
  POPULAR_UI_COLOR_GROUPS,
  type PopularUiColor,
  type PopularUiGroup,
} from "@/lib/colors/palettes";
import { cn } from "@/lib/utils";

const GROUP_META: Record<
  PopularUiGroup,
  { label: string; hint: string }
> = {
  backgrounds: {
    label: "Backgrounds",
    hint: "Surfaces, canvases, and app shells",
  },
  accents: {
    label: "Accents",
    hint: "Buttons, links, and brand highlights",
  },
  borders: {
    label: "Borders",
    hint: "Dividers, inputs, and card edges",
  },
  text: {
    label: "Text",
    hint: "Headings, body, and muted copy",
  },
  states: {
    label: "States",
    hint: "Success, warning, danger, and info",
  },
  neutrals: {
    label: "Neutrals",
    hint: "Flexible gray scales for UI systems",
  },
};

async function copyHex(hex: string) {
  await navigator.clipboard.writeText(hex);
  toast.success(`${hex} copied`);
}

function UiColorCard({
  color,
  active,
  onSelect,
  index,
}: {
  color: PopularUiColor;
  active: boolean;
  onSelect: () => void;
  index: number;
}) {
  const text = getTextColor(color.hex);
  const [copied, setCopied] = useState(false);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[1.35rem] border bg-background/40 transition-all duration-300 animate-rise",
        active
          ? "border-rose-500/50 shadow-[0_18px_40px_-24px_rgba(225,29,72,0.55)] ring-2 ring-rose-500/25"
          : "border-border/50 hover:-translate-y-1 hover:border-rose-500/30 hover:shadow-[0_16px_32px_-20px_rgba(225,29,72,0.35)]"
      )}
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <button
        type="button"
        onClick={onSelect}
        className="relative flex h-28 w-full flex-col justify-end p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{
          background: `linear-gradient(155deg, ${color.hex} 0%, ${color.hex}dd 62%, ${color.hex}aa 100%)`,
          color: text,
        }}
        aria-label={`Select ${color.name} ${color.hex}`}
        aria-pressed={active}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.35),transparent_42%)] opacity-40 transition-opacity duration-300 group-hover:opacity-75" />
        <p className="relative font-mono text-xs font-semibold uppercase tracking-wider drop-shadow-sm">
          {color.hex}
        </p>
      </button>

      <div className="space-y-2 px-3 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">{color.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{color.use}</p>
          </div>
          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/30 text-muted-foreground transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300"
            aria-label={`Copy ${color.hex}`}
            onClick={async () => {
              await copyHex(color.hex);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1200);
            }}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function LiveUiPreview({
  bg,
  accent,
  border,
  text,
  muted,
}: {
  bg: string;
  accent: string;
  border: string;
  text: string;
  muted: string;
}) {
  return (
    <div
      className="overflow-hidden rounded-[1.5rem] border shadow-sm transition-colors duration-500"
      style={{ backgroundColor: bg, borderColor: border }}
    >
      <div
        className="flex items-center justify-between gap-3 border-b px-4 py-3"
        style={{ borderColor: border }}
      >
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold text-white"
            style={{ backgroundColor: accent }}
          >
            UI
          </span>
          <div>
            <p className="text-sm font-semibold" style={{ color: text }}>
              Dashboard
            </p>
            <p className="text-[11px]" style={{ color: muted }}>
              Live preview of your picks
            </p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: accent }}
        >
          New item
        </button>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-[1.1fr_0.9fr]">
        <div
          className="rounded-2xl border p-4"
          style={{ borderColor: border, backgroundColor: `${bg}` }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: muted }}>
            Overview
          </p>
          <p className="mt-1 font-display text-xl font-semibold tracking-tight" style={{ color: text }}>
            Design tokens that feel product-ready
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: muted }}>
            Backgrounds, accents, borders, and text working together in a flexible UI kit.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: accent }}
            >
              Primary
            </span>
            <span
              className="rounded-full border px-3 py-1 text-xs font-semibold"
              style={{ borderColor: border, color: text }}
            >
              Secondary
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {[72, 54, 38].map((w, i) => (
            <div
              key={w}
              className="rounded-xl border px-3 py-3"
              style={{ borderColor: border }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: text }}>
                  Metric {i + 1}
                </span>
                <span className="text-[11px] font-semibold" style={{ color: accent }}>
                  +{12 + i * 4}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: border }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${w}%`, backgroundColor: accent }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PopularUiColorsTool() {
  const groups = Object.keys(POPULAR_UI_COLOR_GROUPS) as PopularUiGroup[];
  const [activeGroup, setActiveGroup] = useState<PopularUiGroup | "all">("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<PopularUiColor>(
    POPULAR_UI_COLOR_GROUPS.accents[0]
  );

  const flat = useMemo(
    () =>
      groups.flatMap((group) =>
        POPULAR_UI_COLOR_GROUPS[group].map((color) => ({ ...color, group }))
      ),
    [groups]
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return flat.filter((c) => {
      if (activeGroup !== "all" && c.group !== activeGroup) return false;
      if (!query) return true;
      return (
        c.name.toLowerCase().includes(query) ||
        c.hex.toLowerCase().includes(query) ||
        c.use.toLowerCase().includes(query) ||
        c.group.includes(query)
      );
    });
  }, [activeGroup, flat, q]);

  const preview = useMemo(() => {
    const bg =
      selected.group === "backgrounds"
        ? selected.hex
        : POPULAR_UI_COLOR_GROUPS.backgrounds[0].hex;
    const accent =
      selected.group === "accents" || selected.group === "states"
        ? selected.hex
        : POPULAR_UI_COLOR_GROUPS.accents[0].hex;
    const border =
      selected.group === "borders"
        ? selected.hex
        : POPULAR_UI_COLOR_GROUPS.borders[0].hex;
    const textMain =
      selected.group === "text"
        ? selected.hex
        : POPULAR_UI_COLOR_GROUPS.text[0].hex;
    const muted = POPULAR_UI_COLOR_GROUPS.text[2]?.hex ?? "#64748B";

    return { bg, accent, border, text: textMain, muted };
  }, [selected]);

  const copyPalette = async () => {
    const lines = filtered.map((c) => `${c.name}: ${c.hex}`);
    await navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Visible colors copied");
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-border/50 bg-background/70 shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(244,63,94,0.16),transparent_42%),radial-gradient(circle_at_88%_10%,rgba(14,165,233,0.12),transparent_36%)]" />
        <div className="relative grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-7">
          <div className="flex flex-col justify-center">
            <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-700 dark:text-rose-300">
              <LayoutDashboard className="h-3.5 w-3.5" />
              UI color kit
            </div>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Popular UI Colors
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Battle-tested tokens for backgrounds, accents, borders, text, and states.
              Click a swatch to preview it in a flexible interface mockup.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-medium"
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border border-black/10"
                  style={{ backgroundColor: selected.hex }}
                />
                {selected.name}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 rounded-full"
                onClick={() => copyHex(selected.hex)}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy selected
              </Button>
            </div>
          </div>

          <LiveUiPreview
            bg={preview.bg}
            accent={preview.accent}
            border={preview.border}
            text={preview.text}
            muted={preview.muted}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, hex, or use…"
            aria-label="Search UI colors"
            className="h-11 rounded-2xl border-border/60 bg-background/70 pl-10 shadow-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-muted-foreground">
            {filtered.length} color{filtered.length === 1 ? "" : "s"}
          </p>
          <Button type="button" size="sm" variant="outline" className="h-9 rounded-full" onClick={copyPalette}>
            <Sparkles className="h-3.5 w-3.5" />
            Copy visible
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveGroup("all")}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
            activeGroup === "all"
              ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
              : "border-border/60 bg-background/60 text-muted-foreground hover:border-rose-500/25 hover:text-foreground"
          )}
        >
          All groups
        </button>
        {groups.map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => setActiveGroup(group)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
              activeGroup === group
                ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                : "border-border/60 bg-background/60 text-muted-foreground hover:border-rose-500/25 hover:text-foreground"
            )}
          >
            {GROUP_META[group].label}
          </button>
        ))}
      </div>

      {activeGroup !== "all" && (
        <div className="rounded-2xl border border-border/50 bg-muted/20 px-4 py-3">
          <p className="text-sm font-semibold">{GROUP_META[activeGroup].label}</p>
          <p className="text-xs text-muted-foreground">{GROUP_META[activeGroup].hint}</p>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border/60 bg-muted/15 px-6 text-center">
          <p className="font-display text-lg font-semibold">No colors found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try another search or group filter.</p>
        </div>
      ) : activeGroup === "all" ? (
        <div className="space-y-8">
          {groups.map((group) => {
            const colors = filtered.filter((c) => c.group === group);
            if (!colors.length) return null;
            return (
              <section key={group} className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                      {GROUP_META[group].label}
                    </p>
                    <p className="text-sm text-muted-foreground">{GROUP_META[group].hint}</p>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">{colors.length}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {colors.map((color, index) => (
                    <UiColorCard
                      key={`${group}-${color.hex}-${color.name}`}
                      color={color}
                      active={selected.hex === color.hex && selected.name === color.name}
                      onSelect={() => setSelected(color)}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((color, index) => (
            <UiColorCard
              key={`${color.group}-${color.hex}-${color.name}`}
              color={color}
              active={selected.hex === color.hex && selected.name === color.name}
              onSelect={() => setSelected(color)}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
