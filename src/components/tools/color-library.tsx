"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Library,
  Palette,
  Search,
  Sparkles,
  SwatchBook,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getTextColor } from "@/lib/colors/convert";
import {
  BOOTSTRAP_COLORS,
  BRAND_COLORS,
  CSS_NAMED_COLORS,
  MATERIAL_COLORS,
  TAILWIND_COLORS,
  TRENDING_PALETTES,
} from "@/lib/colors/palettes";
import { cn } from "@/lib/utils";

type Library =
  | "named"
  | "material"
  | "tailwind"
  | "bootstrap"
  | "brands"
  | "trending"
  | "inspiration";

const META: Record<
  Library,
  { badge: string; title: string; hint: string; samples: string[] }
> = {
  named: {
    badge: "CSS reference",
    title: "CSS Named Colors",
    hint: "All classic named web colors — search, preview, and copy HEX in one click.",
    samples: ["#DC143C", "#4169E1", "#2E8B57", "#FFD700", "#8A2BE2", "#FF7F50"],
  },
  material: {
    badge: "Material Design",
    title: "Material Colors",
    hint: "Google’s Material palette with full shade scales. Click any shade to copy.",
    samples: ["#F44336", "#E91E63", "#9C27B0", "#3F51B5", "#2196F3", "#009688"],
  },
  tailwind: {
    badge: "Tailwind CSS",
    title: "Tailwind Colors",
    hint: "Complete Tailwind color scales from 50–950. Perfect for design tokens.",
    samples: ["#EF4444", "#F97316", "#EAB308", "#22C55E", "#3B82F6", "#A855F7"],
  },
  bootstrap: {
    badge: "Bootstrap",
    title: "Bootstrap Colors",
    hint: "Theme utility colors used across Bootstrap components and Sass variables.",
    samples: ["#0d6efd", "#6c757d", "#198754", "#dc3545", "#ffc107", "#0dcaf0"],
  },
  brands: {
    badge: "Brand kits",
    title: "Brand Colors",
    hint: "Recognizable brand palettes — steal the vibe, keep the craft.",
    samples: ["#4285F4", "#1877F2", "#E1306C", "#1DB954", "#E50914", "#635BFF"],
  },
  trending: {
    badge: "Trending",
    title: "Trending Palettes",
    hint: "Curated multi-stop palettes ready for landing pages and product UI.",
    samples: ["#023E8A", "#FF6B35", "#2D6A4F", "#FF2E63", "#C08552", "#B83B5E"],
  },
  inspiration: {
    badge: "Inspiration",
    title: "Website Color Inspiration",
    hint: "Mood-forward palettes to spark layouts, hero sections, and brand systems.",
    samples: ["#0F084B", "#08F7FE", "#40916C", "#F7C59F", "#4A1942", "#00B4D8"],
  },
};

async function copyHex(hex: string, label?: string) {
  await navigator.clipboard.writeText(hex);
  toast.success(label ? `${label} · ${hex}` : `${hex} copied`);
}

async function copyLines(lines: string[], success: string) {
  await navigator.clipboard.writeText(lines.join("\n"));
  toast.success(success);
}

function CopyIconButton({
  value,
  label,
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground transition-all hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300"
      aria-label={`Copy ${label ?? value}`}
      onClick={async (e) => {
        e.stopPropagation();
        await copyHex(value, label);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1100);
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function SingleColorCard({
  name,
  hex,
  index,
  active,
  onSelect,
}: {
  name: string;
  hex: string;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  const text = getTextColor(hex);
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[1.35rem] border bg-background/50 transition-all duration-300 animate-rise",
        active
          ? "border-rose-500/50 shadow-[0_18px_40px_-22px_rgba(225,29,72,0.55)] ring-2 ring-rose-500/20"
          : "border-border/50 hover:-translate-y-1 hover:border-rose-500/30 hover:shadow-[0_16px_36px_-22px_rgba(225,29,72,0.35)]"
      )}
      style={{ animationDelay: `${Math.min(index, 16) * 28}ms` }}
    >
      <button
        type="button"
        onClick={onSelect}
        className="relative flex h-[7.25rem] w-full flex-col justify-end p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{
          background: `linear-gradient(155deg, ${hex} 0%, ${hex}e6 58%, ${hex}b8 100%)`,
          color: text,
        }}
        aria-label={`Select ${name} ${hex}`}
        aria-pressed={active}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(255,255,255,0.4),transparent_40%)] opacity-50 transition-opacity duration-300 group-hover:opacity-90" />
        <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-125" />
        <p className="relative font-mono text-[11px] font-semibold uppercase tracking-[0.14em] drop-shadow-sm">
          {hex}
        </p>
      </button>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <p className="truncate text-sm font-semibold tracking-tight capitalize">{name}</p>
        <CopyIconButton value={hex} label={name} />
      </div>
    </div>
  );
}

function ShadeScaleCard({
  name,
  shades,
  index,
  selectedHex,
  onSelect,
}: {
  name: string;
  shades: Record<string, string>;
  index: number;
  selectedHex: string | null;
  onSelect: (hex: string, shade: string) => void;
}) {
  const entries = Object.entries(shades);
  return (
    <div
      className="overflow-hidden rounded-[1.35rem] border border-border/50 bg-background/60 shadow-sm transition-all duration-300 animate-rise hover:border-rose-500/25 hover:shadow-[0_16px_36px_-24px_rgba(225,29,72,0.3)]"
      style={{ animationDelay: `${Math.min(index, 14) * 35}ms` }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/40 px-4 py-3">
        <div>
          <p className="text-sm font-semibold capitalize tracking-tight">{name}</p>
          <p className="text-[11px] text-muted-foreground">{entries.length} shades</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 rounded-full text-xs"
          onClick={() =>
            copyLines(
              entries.map(([shade, hex]) => `${name}-${shade}: ${hex}`),
              `${name} scale copied`
            )
          }
        >
          <Copy className="h-3.5 w-3.5" />
          Copy scale
        </Button>
      </div>
      <div className="flex h-24 w-full overflow-hidden sm:h-28">
        {entries.map(([shade, hex]) => {
          const text = getTextColor(hex);
          const active = selectedHex === hex;
          return (
            <button
              key={shade}
              type="button"
              onClick={() => {
                onSelect(hex, shade);
                void copyHex(hex, `${name}-${shade}`);
              }}
              className={cn(
                "group/shade relative min-w-0 flex-1 transition-all duration-300 hover:flex-[1.45] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active && "flex-[1.55] ring-2 ring-inset ring-white/70"
              )}
              style={{ backgroundColor: hex, color: text }}
              aria-label={`${name} ${shade} ${hex}`}
              title={`${name}-${shade}: ${hex}`}
            >
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-0.5 pb-1.5 pt-6 text-center opacity-0 transition-opacity duration-200 group-hover/shade:opacity-100 sm:opacity-100">
                <span className="block text-[10px] font-bold text-white drop-shadow">{shade}</span>
                <span className="hidden font-mono text-[9px] text-white/90 drop-shadow sm:block">
                  {hex.replace("#", "")}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PaletteCard({
  name,
  colors,
  index,
  selectedHex,
  onSelect,
}: {
  name: string;
  colors: string[];
  index: number;
  selectedHex: string | null;
  onSelect: (hex: string) => void;
}) {
  return (
    <div
      className="group overflow-hidden rounded-[1.45rem] border border-border/50 bg-background/60 shadow-sm transition-all duration-300 animate-rise hover:-translate-y-1 hover:border-rose-500/30 hover:shadow-[0_20px_40px_-24px_rgba(225,29,72,0.4)]"
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
    >
      <div className="flex h-36 w-full overflow-hidden sm:h-40">
        {colors.map((hex, i) => {
          const text = getTextColor(hex);
          const active = selectedHex === hex;
          return (
            <button
              key={`${hex}-${i}`}
              type="button"
              onClick={() => {
                onSelect(hex);
                void copyHex(hex);
              }}
              className={cn(
                "relative min-w-0 flex-1 transition-all duration-300 hover:flex-[1.35] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active && "flex-[1.4] ring-2 ring-inset ring-white/60"
              )}
              style={{
                background: `linear-gradient(180deg, ${hex} 0%, ${hex} 70%, color-mix(in srgb, ${hex} 85%, black) 100%)`,
                color: text,
              }}
              aria-label={`Copy ${hex}`}
            >
              <span className="absolute inset-x-0 bottom-2 text-center font-mono text-[10px] font-semibold uppercase tracking-wide opacity-0 drop-shadow transition-opacity duration-200 group-hover:opacity-100">
                {hex}
              </span>
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.22),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">{name}</p>
          <p className="text-[11px] text-muted-foreground">{colors.length} colors</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 shrink-0 rounded-full"
          onClick={() => copyLines(colors, `${name} palette copied`)}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy all
        </Button>
      </div>
    </div>
  );
}

export function ColorLibrary({ library }: { library: Library }) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<{ hex: string; label: string } | null>(null);
  const meta = META[library];

  const filteredSingles = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (library === "named") {
      return CSS_NAMED_COLORS.filter(
        (c) =>
          !query ||
          c.name.toLowerCase().includes(query) ||
          c.hex.toLowerCase().includes(query)
      );
    }
    if (library === "bootstrap") {
      return Object.entries(BOOTSTRAP_COLORS)
        .filter(([name, hex]) => !query || name.includes(query) || hex.toLowerCase().includes(query))
        .map(([name, hex]) => ({ name, hex }));
    }
    return [] as { name: string; hex: string }[];
  }, [library, q]);

  const filteredScales = useMemo(() => {
    if (library !== "material" && library !== "tailwind") return [];
    const source = library === "material" ? MATERIAL_COLORS : TAILWIND_COLORS;
    const query = q.trim().toLowerCase();
    return Object.entries(source).filter(
      ([name, shades]) =>
        !query ||
        name.toLowerCase().includes(query) ||
        Object.values(shades).some((hex) => hex.toLowerCase().includes(query))
    );
  }, [library, q]);

  const filteredPalettes = useMemo(() => {
    if (library !== "brands" && library !== "trending" && library !== "inspiration") return [];
    const list = library === "brands" ? BRAND_COLORS : TRENDING_PALETTES;
    const query = q.trim().toLowerCase();
    return list.filter(
      (p) =>
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.colors.some((hex) => hex.toLowerCase().includes(query))
    );
  }, [library, q]);

  const count =
    library === "named" || library === "bootstrap"
      ? filteredSingles.length
      : library === "material" || library === "tailwind"
        ? filteredScales.length
        : filteredPalettes.length;

  const selectedText = selected ? getTextColor(selected.hex) : "#fff";

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-border/50 bg-background/70 shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(244,63,94,0.16),transparent_42%),radial-gradient(circle_at_90%_8%,rgba(14,165,233,0.12),transparent_36%),radial-gradient(circle_at_70%_90%,rgba(168,85,247,0.08),transparent_40%)]" />
        <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-rose-500/10 blur-3xl animate-pulse" />
        <div className="relative grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-7">
          <div className="flex flex-col justify-center">
            <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-700 dark:text-rose-300">
              <Library className="h-3.5 w-3.5" />
              {meta.badge}
            </div>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {meta.title}
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              {meta.hint}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-medium">
                <SwatchBook className="h-3.5 w-3.5 text-rose-600" />
                {count.toLocaleString()} {library === "named" || library === "bootstrap" ? "colors" : library === "material" || library === "tailwind" ? "families" : "palettes"}
              </span>
              {selected && (
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-medium">
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-black/10"
                    style={{ backgroundColor: selected.hex }}
                  />
                  {selected.label}
                </span>
              )}
              {selected && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-full"
                  onClick={() => copyHex(selected.hex, selected.label)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy selected
                </Button>
              )}
            </div>
          </div>

          <div className="relative min-h-[140px] overflow-hidden rounded-[1.35rem] border border-border/40 shadow-inner">
            <div className="absolute inset-0 flex">
              {meta.samples.map((hex, i) => (
                <div
                  key={hex}
                  className="flex-1 transition-all duration-500 hover:flex-[1.4]"
                  style={{
                    background: hex,
                    animation: `rise-in 0.55s ease both`,
                    animationDelay: `${i * 70}ms`,
                  }}
                />
              ))}
            </div>
            {selected ? (
              <div
                className="absolute inset-0 flex flex-col items-start justify-end p-4 transition-colors duration-300"
                style={{
                  background: `linear-gradient(160deg, ${selected.hex}cc, ${selected.hex})`,
                  color: selectedText,
                }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-80">
                  Selected
                </p>
                <p className="font-display text-xl font-semibold">{selected.label}</p>
                <p className="font-mono text-sm opacity-90">{selected.hex}</p>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 via-black/10 to-transparent p-4">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-sm font-medium">Pick a color to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or hex…"
            aria-label="Filter colors"
            className="h-11 rounded-2xl border-border/60 bg-background/70 pl-10 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Palette className="h-3.5 w-3.5" />
          Click any swatch to copy · hover strips to expand
        </div>
      </div>

      {(library === "named" || library === "bootstrap") && (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredSingles.map((c, i) => (
            <SingleColorCard
              key={`${c.name}-${c.hex}`}
              name={c.name}
              hex={c.hex}
              index={i}
              active={selected?.hex === c.hex && selected.label === c.name}
              onSelect={() => {
                setSelected({ hex: c.hex, label: c.name });
                void copyHex(c.hex, c.name);
              }}
            />
          ))}
        </div>
      )}

      {(library === "material" || library === "tailwind") && (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredScales.map(([name, shades], i) => (
            <ShadeScaleCard
              key={name}
              name={name}
              shades={shades}
              index={i}
              selectedHex={selected?.hex ?? null}
              onSelect={(hex, shade) => setSelected({ hex, label: `${name}-${shade}` })}
            />
          ))}
        </div>
      )}

      {(library === "brands" || library === "trending" || library === "inspiration") && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPalettes.map((p, i) => (
            <PaletteCard
              key={p.name}
              name={p.name}
              colors={p.colors}
              index={i}
              selectedHex={selected?.hex ?? null}
              onSelect={(hex) => setSelected({ hex, label: p.name })}
            />
          ))}
        </div>
      )}

      {count === 0 && (
        <div className="rounded-[1.35rem] border border-dashed border-border/60 bg-muted/20 px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold">No matches</p>
          <p className="mt-1 text-sm text-muted-foreground">Try another name or HEX fragment.</p>
        </div>
      )}
    </div>
  );
}
