"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Code2,
  Contrast,
  Hash,
  Image,
  LayoutGrid,
  Library,
  Lightbulb,
  Palette,
  Search,
  Share2,
  Sparkles,
  SwatchBook,
  Type,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { CATEGORY_LABELS, TOOLS } from "@/lib/tools-registry";
import { TOOL_ICONS } from "@/lib/nav";
import type { ToolCategory } from "@/types/tools";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<
  ToolCategory,
  { icon: LucideIcon; accent: string; bar: string; blurb: string }
> = {
  "css-generators": {
    icon: Code2,
    accent: "text-rose-600 dark:text-rose-400",
    bar: "bg-rose-500",
    blurb: "Generators for shadows, layout, filters & type",
  },
  "text-tools": {
    icon: Type,
    accent: "text-fuchsia-600 dark:text-fuchsia-400",
    bar: "bg-fuchsia-500",
    blurb: "Case, markdown, slugs, counters & more",
  },
  "developer-tools": {
    icon: Wrench,
    accent: "text-violet-600 dark:text-violet-400",
    bar: "bg-violet-500",
    blurb: "Formatters, encoders, hashes & QR codes",
  },
  image: {
    icon: Image,
    accent: "text-pink-600 dark:text-pink-400",
    bar: "bg-pink-500",
    blurb: "Compress, convert, crop & extract colors",
  },
  "web-tools": {
    icon: LayoutGrid,
    accent: "text-sky-600 dark:text-sky-400",
    bar: "bg-sky-500",
    blurb: "SEO tags, robots, sitemap & minifiers",
  },
  "social-tools": {
    icon: Share2,
    accent: "text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
    blurb: "Hashtags, titles & social copy helpers",
  },
  "utility-tools": {
    icon: Hash,
    accent: "text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
    blurb: "Passwords, randomizers & timestamps",
  },
  converters: {
    icon: Palette,
    accent: "text-rose-700 dark:text-rose-300",
    bar: "bg-rose-600",
    blurb: "HEX, RGB, HSL, HSV & CMYK",
  },
  pickers: {
    icon: Sparkles,
    accent: "text-pink-700 dark:text-pink-300",
    bar: "bg-pink-600",
    blurb: "Visual color pickers",
  },
  gradients: {
    icon: SwatchBook,
    accent: "text-fuchsia-700 dark:text-fuchsia-300",
    bar: "bg-fuchsia-600",
    blurb: "Linear, radial & conic builders",
  },
  palettes: {
    icon: SwatchBook,
    accent: "text-rose-600 dark:text-rose-400",
    bar: "bg-rose-500",
    blurb: "Harmony & random palettes",
  },
  libraries: {
    icon: Library,
    accent: "text-indigo-600 dark:text-indigo-400",
    bar: "bg-indigo-500",
    blurb: "Material, Tailwind, Bootstrap & names",
  },
  accessibility: {
    icon: Contrast,
    accent: "text-teal-600 dark:text-teal-400",
    bar: "bg-teal-500",
    blurb: "Contrast & color-blind checks",
  },
  inspiration: {
    icon: Lightbulb,
    accent: "text-orange-600 dark:text-orange-400",
    bar: "bg-orange-500",
    blurb: "Trending & brand inspiration",
  },
  learning: {
    icon: Library,
    accent: "text-slate-600 dark:text-slate-300",
    bar: "bg-slate-500",
    blurb: "Guides and learning resources",
  },
};

const categories = (Object.keys(CATEGORY_LABELS) as ToolCategory[]).filter(
  (c) => TOOLS.some((t) => t.category === c)
);

export function ToolsDirectory({
  initialCategory,
}: {
  initialCategory?: ToolCategory;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<ToolCategory | null>(initialCategory ?? null);

  const selectMenu = (cat: ToolCategory | null) => {
    setActive(cat);
    setQuery("");
    if (cat) router.replace(`/tools?category=${cat}`, { scroll: false });
    else router.replace("/tools", { scroll: false });
  };

  const menuStats = useMemo(
    () =>
      categories.map((category) => ({
        category,
        count: TOOLS.filter((t) => t.category === category).length,
        meta: CATEGORY_META[category],
        label: CATEGORY_LABELS[category],
      })),
    []
  );

  const listTools = useMemo(() => {
    if (!active) return [];
    const q = query.trim().toLowerCase();
    return TOOLS.filter((t) => {
      if (t.category !== active) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.shortTitle.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.includes(q))
      );
    }).sort((a, b) => a.title.localeCompare(b.title));
  }, [active, query]);

  const globalSearch = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || active) return [];
    return TOOLS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.shortTitle.toLowerCase().includes(q) ||
        CATEGORY_LABELS[t.category].toLowerCase().includes(q)
    )
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, 40);
  }, [query, active]);

  /* —— List view for one menu —— */
  if (active) {
    const meta = CATEGORY_META[active];
    const MenuIcon = meta.icon;

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-border/60 bg-background/80">
          <div className="flex flex-wrap items-center gap-3 border-b border-border/50 px-4 py-4 sm:px-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => selectMenu(null)}
            >
              <ArrowLeft className="h-4 w-4" />
              All menus
            </Button>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted",
                  meta.accent
                )}
              >
                <MenuIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h1 className="truncate font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  {CATEGORY_LABELS[active]}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {listTools.length} tools · name list
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-border/50 px-4 py-3 sm:px-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter by tool name…"
                className="h-10 rounded-lg border-border/60 bg-background pl-9"
                aria-label="Filter tools in this menu"
              />
            </div>
          </div>

          {listTools.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              No tools match your filter.
            </div>
          ) : (
            <ul className="divide-y divide-border/50" role="list">
              {listTools.map((tool, index) => {
                const Icon = TOOL_ICONS[tool.icon] ?? Sparkles;
                return (
                  <li key={tool.slug}>
                    <Link
                      href={`/${tool.slug}`}
                      className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-rose-500/[0.06] sm:px-6"
                    >
                      <span className="w-7 shrink-0 text-center font-mono text-xs text-muted-foreground/70">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/80",
                          meta.accent
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium tracking-tight text-foreground group-hover:text-rose-700 dark:group-hover:text-rose-300">
                        {tool.title}
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  }

  /* —— Menu cards overview —— */
  return (
    <div className="space-y-8">
      <header className="border-b border-border/50 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Directory
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Our Tools
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Choose a menu to open its tool list. {TOOLS.length} utilities across{" "}
              {categories.length} categories.
            </p>
          </div>
          <div className="rounded-xl border border-border/60 px-4 py-3 text-right">
            <p className="font-display text-2xl font-semibold tabular-nums">{TOOLS.length}</p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Total tools</p>
          </div>
        </div>

        <div className="relative mt-6 max-w-lg">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tool names across all menus…"
            className="h-11 rounded-lg border-border/60 bg-background pl-9"
            aria-label="Search all tools"
          />
        </div>
      </header>

      {globalSearch.length > 0 ? (
        <div className="rounded-2xl border border-border/60 bg-background/80">
          <div className="border-b border-border/50 px-4 py-3 sm:px-6">
            <p className="text-sm font-medium">
              Search results{" "}
              <span className="text-muted-foreground">({globalSearch.length})</span>
            </p>
          </div>
          <ul className="divide-y divide-border/50">
            {globalSearch.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={`/${tool.slug}`}
                  className="group flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 sm:px-6"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{tool.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {CATEGORY_LABELS[tool.category]}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {menuStats.map(({ category, count, meta, label }) => {
            const Icon = meta.icon;
            return (
              <button
                key={category}
                type="button"
                onClick={() => selectMenu(category)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-background text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-500/35 hover:shadow-lg hover:shadow-rose-500/10"
              >
                <div className={cn("h-1 w-full", meta.bar)} aria-hidden />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl bg-muted transition-transform duration-300 group-hover:scale-105",
                        meta.accent
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="rounded-md border border-border/60 bg-muted/40 px-2 py-1 font-mono text-xs tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  </div>
                  <h2 className="mt-4 font-display text-xl font-semibold tracking-tight text-foreground group-hover:text-rose-700 dark:group-hover:text-rose-300">
                    {label}
                  </h2>
                  <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{meta.blurb}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition-all group-hover:gap-2.5 group-hover:text-rose-600 dark:group-hover:text-rose-300">
                    View tools
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
