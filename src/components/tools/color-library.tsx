"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Contrast,
  Copy,
  Library,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getContrastRatio,
  getTextColor,
  hexToRgb,
  rgbToHsl,
} from "@/lib/colors/convert";
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

type CopyFormat = "hex" | "rgb" | "hsl" | "css-var";

const META: Record<
  Library,
  {
    badge: string;
    title: string;
    hint: string;
    samples: string[];
    href: string;
  }
> = {
  named: {
    badge: "CSS reference",
    title: "CSS Named Colors",
    hint: "Classic named web colors — search, inspect formats, and copy in one click.",
    samples: ["#DC143C", "#4169E1", "#2E8B57", "#FFD700", "#8A2BE2", "#FF7F50"],
    href: "/css-named-colors",
  },
  material: {
    badge: "Material Design",
    title: "Material Colors",
    hint: "Google Material palettes with full shade scales. Expand strips and copy tokens.",
    samples: ["#F44336", "#E91E63", "#9C27B0", "#3F51B5", "#2196F3", "#009688"],
    href: "/material-colors",
  },
  tailwind: {
    badge: "Tailwind CSS",
    title: "Tailwind Colors",
    hint: "Complete Tailwind scales from 50–950 — ideal for design tokens and utilities.",
    samples: ["#EF4444", "#F97316", "#EAB308", "#22C55E", "#3B82F6", "#A855F7"],
    href: "/tailwind-colors",
  },
  bootstrap: {
    badge: "Bootstrap",
    title: "Bootstrap Colors",
    hint: "Theme utility colors used across Bootstrap components and Sass variables.",
    samples: ["#0d6efd", "#6c757d", "#198754", "#dc3545", "#ffc107", "#0dcaf0"],
    href: "/bootstrap-colors",
  },
  brands: {
    badge: "Brand kits",
    title: "Brand Colors",
    hint: "Recognizable brand palettes for mood boards and competitive references.",
    samples: ["#4285F4", "#1877F2", "#E1306C", "#1DB954", "#E50914", "#635BFF"],
    href: "/brand-colors",
  },
  trending: {
    badge: "Trending",
    title: "Trending Palettes",
    hint: "Curated multi-stop palettes ready for landing pages and product UI.",
    samples: ["#023E8A", "#FF6B35", "#2D6A4F", "#FF2E63", "#C08552", "#B83B5E"],
    href: "/trending-palettes",
  },
  inspiration: {
    badge: "Inspiration",
    title: "Website Color Inspiration",
    hint: "Mood-forward palettes to spark layouts, heroes, and brand systems.",
    samples: ["#0F084B", "#08F7FE", "#40916C", "#F7C59F", "#4A1942", "#00B4D8"],
    href: "/website-color-inspiration",
  },
};

const RELATED: { id: Library; label: string; href: string }[] = [
  { id: "material", label: "Material", href: "/material-colors" },
  { id: "tailwind", label: "Tailwind", href: "/tailwind-colors" },
  { id: "bootstrap", label: "Bootstrap", href: "/bootstrap-colors" },
  { id: "named", label: "Named", href: "/css-named-colors" },
  { id: "brands", label: "Brands", href: "/brand-colors" },
  { id: "trending", label: "Trending", href: "/trending-palettes" },
  { id: "inspiration", label: "Inspiration", href: "/website-color-inspiration" },
];

function formats(hex: string, label?: string) {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  const slug = (label ?? "color")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return {
    hex: hex.toUpperCase(),
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${Math.round(hsl.h)} ${Math.round(hsl.s)}% ${Math.round(hsl.l)}%)`,
    cssVar: `--color-${slug || "swatch"}: ${hex.toLowerCase()};`,
  };
}

function valueForFormat(hex: string, format: CopyFormat, label?: string) {
  const f = formats(hex, label);
  if (format === "hex") return f.hex;
  if (format === "rgb") return f.rgb;
  if (format === "hsl") return f.hsl;
  return f.cssVar;
}

async function copyText(value: string, success: string) {
  await navigator.clipboard.writeText(value);
  toast.success(success);
}

function CopyChip({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await copyText(value, `${label} copied`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1000);
      }}
      className="group flex w-full items-center justify-between gap-2 rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-left transition-colors hover:border-rose-500/30 hover:bg-rose-500/5"
    >
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate font-mono text-xs font-medium">{value}</p>
      </div>
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-rose-600" />
      )}
    </button>
  );
}

function SingleColorCard({
  name,
  hex,
  active,
  format,
  onSelect,
}: {
  name: string;
  hex: string;
  active: boolean;
  format: CopyFormat;
  onSelect: () => void;
}) {
  const text = getTextColor(hex);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group overflow-hidden rounded-2xl border text-left transition-all duration-300",
        active
          ? "border-rose-500/50 shadow-[0_16px_36px_-22px_rgba(225,29,72,0.5)] ring-2 ring-rose-500/20"
          : "border-border/50 hover:-translate-y-0.5 hover:border-rose-500/30 hover:shadow-md"
      )}
      aria-pressed={active}
    >
      <div
        className="relative flex h-24 flex-col justify-end p-3 sm:h-28"
        style={{
          background: `linear-gradient(155deg, ${hex} 0%, color-mix(in srgb, ${hex} 88%, black) 100%)`,
          color: text,
        }}
      >
        <span className="relative font-mono text-[11px] font-semibold tracking-wide drop-shadow-sm">
          {valueForFormat(hex, format === "css-var" ? "hex" : format, name)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 bg-background/80 px-3 py-2.5">
        <p className="truncate text-sm font-semibold capitalize tracking-tight">{name}</p>
        <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100" />
      </div>
    </button>
  );
}

function ShadeScaleCard({
  name,
  shades,
  selectedHex,
  format,
  onSelect,
}: {
  name: string;
  shades: Record<string, string>;
  selectedHex: string | null;
  format: CopyFormat;
  onSelect: (hex: string, shade: string) => void;
}) {
  const entries = Object.entries(shades);
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm transition-colors hover:border-rose-500/25">
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
            void copyText(
              entries
                .map(([shade, hex]) =>
                  format === "css-var"
                    ? `--${name}-${shade}: ${hex};`
                    : `${name}-${shade}: ${valueForFormat(hex, format, `${name}-${shade}`)}`
                )
                .join("\n"),
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
              onClick={() => onSelect(hex, shade)}
              className={cn(
                "group/shade relative min-w-0 flex-1 transition-all duration-300 hover:flex-[1.4] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active && "flex-[1.5] ring-2 ring-inset ring-white/70"
              )}
              style={{ backgroundColor: hex, color: text }}
              title={`${name}-${shade}: ${hex}`}
            >
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-0.5 pb-1.5 pt-6 text-center opacity-0 transition-opacity group-hover/shade:opacity-100 sm:opacity-100">
                <span className="block text-[10px] font-bold text-white drop-shadow">{shade}</span>
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
  selectedHex,
  format,
  onSelect,
}: {
  name: string;
  colors: string[];
  selectedHex: string | null;
  format: CopyFormat;
  onSelect: (hex: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm transition-all hover:-translate-y-0.5 hover:border-rose-500/30 hover:shadow-md">
      <div className="flex h-32 w-full overflow-hidden sm:h-36">
        {colors.map((hex, i) => {
          const active = selectedHex === hex;
          return (
            <button
              key={`${hex}-${i}`}
              type="button"
              onClick={() => onSelect(hex)}
              className={cn(
                "relative min-w-0 flex-1 transition-all duration-300 hover:flex-[1.3] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active && "flex-[1.35] ring-2 ring-inset ring-white/60"
              )}
              style={{ backgroundColor: hex }}
              aria-label={`Select ${hex}`}
            >
              <span className="absolute inset-x-0 bottom-2 text-center font-mono text-[10px] font-semibold text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100 hover:opacity-100" />
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
          onClick={() =>
            void copyText(
              colors.map((hex, i) => valueForFormat(hex, format, `${name}-${i + 1}`)).join("\n"),
              `${name} palette copied`
            )
          }
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
  const [format, setFormat] = useState<CopyFormat>("hex");
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

  const unitLabel =
    library === "named" || library === "bootstrap"
      ? "colors"
      : library === "material" || library === "tailwind"
        ? "families"
        : "palettes";

  const selectColor = (hex: string, label: string, copy = true) => {
    setSelected({ hex, label });
    if (copy) void copyText(valueForFormat(hex, format, label), `${label} · copied`);
  };

  const selectedFormats = selected ? formats(selected.hex, selected.label) : null;
  const textOnSelected = selected ? getTextColor(selected.hex) : "#fff";
  const aaWhite = selected ? getContrastRatio("#ffffff", selected.hex) : 0;
  const aaBlack = selected ? getContrastRatio("#000000", selected.hex) : 0;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] xl:items-start">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
            <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                    {meta.badge}
                  </p>
                  <h2 className="font-display text-base font-semibold tracking-tight sm:text-lg">
                    {meta.title}
                  </h2>
                  <p className="mt-0.5 max-w-xl text-xs text-muted-foreground">{meta.hint}</p>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  <Wand2 className="mr-1 h-3.5 w-3.5" />
                  {count.toLocaleString()} {unitLabel}
                </Badge>
              </div>
            </div>

            <div className="space-y-4 p-3 sm:p-5">
              <div className="flex flex-wrap gap-1.5">
                {RELATED.map((r) => (
                  <Link
                    key={r.id}
                    href={r.href}
                    className={cn(
                      "rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                      r.id === library
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30 hover:bg-muted/60"
                    )}
                  >
                    {r.label}
                  </Link>
                ))}
                <Link
                  href="/popular-ui-colors"
                  className="rounded-full border border-border/60 px-2.5 py-1.5 text-[11px] font-medium hover:bg-muted/60"
                >
                  Popular UI
                </Link>
                <Link
                  href="/color-picker"
                  className="rounded-full border border-border/60 px-2.5 py-1.5 text-[11px] font-medium hover:bg-muted/60"
                >
                  Picker
                </Link>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by name or hex…"
                    aria-label="Filter colors"
                    className="h-11 rounded-2xl border-border/60 bg-background/80 pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      ["hex", "HEX"],
                      ["rgb", "RGB"],
                      ["hsl", "HSL"],
                      ["css-var", "CSS var"],
                    ] as const
                  ).map(([id, name]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFormat(id)}
                      className={cn(
                        "rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                        format === id
                          ? "border-rose-500/50 bg-rose-500 text-white"
                          : "border-border/60 bg-muted/30 hover:bg-muted/60"
                      )}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex h-14 overflow-hidden rounded-2xl border border-border/40">
                {meta.samples.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    className="min-w-0 flex-1 transition-all hover:flex-[1.35]"
                    style={{ background: hex }}
                    onClick={() => selectColor(hex, hex)}
                    aria-label={`Select sample ${hex}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {(library === "named" || library === "bootstrap") && (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredSingles.map((c) => (
                <SingleColorCard
                  key={`${c.name}-${c.hex}`}
                  name={c.name}
                  hex={c.hex}
                  format={format}
                  active={selected?.hex === c.hex && selected.label === c.name}
                  onSelect={() => selectColor(c.hex, c.name)}
                />
              ))}
            </div>
          )}

          {(library === "material" || library === "tailwind") && (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredScales.map(([name, shades]) => (
                <ShadeScaleCard
                  key={name}
                  name={name}
                  shades={shades}
                  format={format}
                  selectedHex={selected?.hex ?? null}
                  onSelect={(hex, shade) => selectColor(hex, `${name}-${shade}`)}
                />
              ))}
            </div>
          )}

          {(library === "brands" || library === "trending" || library === "inspiration") && (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredPalettes.map((p) => (
                <PaletteCard
                  key={p.name}
                  name={p.name}
                  colors={p.colors}
                  format={format}
                  selectedHex={selected?.hex ?? null}
                  onSelect={(hex) => selectColor(hex, p.name)}
                />
              ))}
            </div>
          )}

          {count === 0 && (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-16 text-center">
              <p className="font-display text-lg font-semibold">No matches</p>
              <p className="mt-1 text-sm text-muted-foreground">Try another name or HEX fragment.</p>
            </div>
          )}
        </div>

        <div className="xl:sticky xl:top-24">
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
            <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Inspector
              </p>
              <p className="text-sm font-semibold">Selected color</p>
            </div>
            <div className="space-y-4 p-3 sm:p-5">
              {selected && selectedFormats ? (
                <>
                  <div
                    className="relative flex min-h-[140px] flex-col justify-end overflow-hidden rounded-2xl p-4"
                    style={{
                      background: `linear-gradient(155deg, ${selected.hex} 0%, color-mix(in srgb, ${selected.hex} 80%, black) 100%)`,
                      color: textOnSelected,
                    }}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-80">Selected</p>
                    <p className="font-display text-xl font-semibold tracking-tight">{selected.label}</p>
                    <p className="font-mono text-sm opacity-90">{selected.hex.toUpperCase()}</p>
                  </div>

                  <div className="space-y-2">
                    <CopyChip value={selectedFormats.hex} label="HEX" />
                    <CopyChip value={selectedFormats.rgb} label="RGB" />
                    <CopyChip value={selectedFormats.hsl} label="HSL" />
                    <CopyChip value={selectedFormats.cssVar} label="CSS variable" />
                  </div>

                  <div className="rounded-2xl border border-border/50 bg-muted/20 p-3">
                    <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Contrast className="h-3.5 w-3.5" />
                      Contrast
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-border/40 bg-white px-3 py-2 text-center text-black">
                        <p className="font-mono text-sm font-semibold">{aaBlack.toFixed(2)}</p>
                        <p className="text-[10px] text-black/60">Black text</p>
                      </div>
                      <div className="rounded-xl border border-border/40 bg-slate-950 px-3 py-2 text-center text-white">
                        <p className="font-mono text-sm font-semibold">{aaWhite.toFixed(2)}</p>
                        <p className="text-[10px] text-white/60">White text</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="w-full rounded-full"
                    onClick={() =>
                      void copyText(
                        valueForFormat(selected.hex, format, selected.label),
                        "Copied in preferred format"
                      )
                    }
                  >
                    <Copy className="h-4 w-4" />
                    Copy as {format === "css-var" ? "CSS var" : format.toUpperCase()}
                  </Button>
                </>
              ) : (
                <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/10 px-4 text-center">
                  <Library className="mb-3 h-8 w-8 text-rose-500/70" />
                  <p className="font-display text-base font-semibold">Pick a swatch</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Formats, contrast, and copy actions appear here.
                  </p>
                  <div className="mt-4 flex gap-1.5">
                    {meta.samples.slice(0, 4).map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        className="h-8 w-8 rounded-full border border-border/50"
                        style={{ background: hex }}
                        onClick={() => selectColor(hex, hex, false)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full border border-border/50 px-2.5 py-1">
                  <Sparkles className="h-3 w-3 text-rose-500" />
                  Click to copy
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/50 px-2.5 py-1">
                  Format · {format === "css-var" ? "CSS var" : format.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
