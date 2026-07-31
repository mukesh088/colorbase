"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  getAllNamedColors,
  getFeaturedNamedColors,
  getNamedColorFamilies,
  searchNamedColors,
  type NamedColorEntry,
} from "@/lib/data/color-names";
import { FAMILY_LABELS, FAMILY_SWATCH, type ColorFamily } from "@/lib/data/families";
import { LibraryColorCard } from "@/components/library/library-color-card";
import { PaletteStrip } from "@/components/library/palette-strip";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function ColorNamesExplorer() {
  const [q, setQ] = useState("");
  const [family, setFamily] = useState<string | null>(null);
  const families = useMemo(() => getNamedColorFamilies(), []);
  const featured = useMemo(() => getFeaturedNamedColors(72), []);
  const total = useMemo(() => getAllNamedColors().length, []);

  const instantResults = useMemo(() => {
    if (!q.trim()) return [];
    return searchNamedColors(q);
  }, [q]);

  const gridColors = useMemo(() => {
    let list: NamedColorEntry[] = featured;
    if (family) {
      list = getAllNamedColors().filter((c) => c.family === family).slice(0, 72);
    }
    if (q.trim()) {
      list = instantResults.slice(0, 72);
    }
    return list;
  }, [featured, family, q, instantResults]);

  const heroStrip = useMemo(
    () => featured.slice(0, 8).map((c) => c.hex),
    [featured]
  );

  return (
    <div className="space-y-10">
      <div className="card-lift overflow-hidden rounded-[1.75rem] border border-border/50">
        <PaletteStrip colors={heroStrip} height="lg" />
      </div>

      <div className="space-y-4">
        <div className="relative max-w-2xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search color names, families, or HEX…"
            aria-label="Search color names"
            className="h-12 rounded-2xl border-border/60 bg-background/70 pl-11 pr-11 text-base shadow-sm backdrop-blur-sm transition-shadow duration-300 focus-visible:shadow-[0_0_0_4px_rgba(14,165,233,0.12)]"
          />
          {q && (
            <button
              type="button"
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setQ("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip
            active={!family}
            onClick={() => setFamily(null)}
            label={`All · ${total.toLocaleString()}`}
          />
          {families.map((f) => (
            <Chip
              key={f}
              active={family === f}
              onClick={() => setFamily(f === family ? null : f)}
              label={FAMILY_LABELS[f as ColorFamily] ?? f}
              swatch={FAMILY_SWATCH[f as ColorFamily]}
            />
          ))}
        </div>
      </div>

      {q.trim() && instantResults.length > 0 && (
        <div className="glass rounded-2xl border border-border/60 p-2 shadow-lg">
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Quick matches · {instantResults.length}
          </p>
          <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {instantResults.slice(0, 9).map((c) => (
              <li key={`quick-${c.slug}`}>
                <Link
                  href={`/color-names/${c.slug}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-accent/80"
                >
                  <span
                    className="h-8 w-8 shrink-0 rounded-lg border border-black/5 shadow-sm"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{c.name}</span>
                    <span className="block text-[11px] capitalize text-muted-foreground">
                      {c.family}
                    </span>
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{c.hex}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section>
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {q.trim()
                ? "Search results"
                : family
                  ? `${FAMILY_LABELS[family as ColorFamily] ?? family} names`
                  : "Featured color names"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {gridColors.length} colors · click any card for meaning, formats, and harmonies
            </p>
          </div>
        </div>

        {gridColors.length === 0 ? (
          <div className="glass rounded-3xl border border-dashed border-border/70 px-6 py-16 text-center">
            <p className="font-display text-xl font-semibold">No colors found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try another name, family, or HEX value.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {gridColors.map((c, index) => (
              <div
                key={c.slug}
                className="animate-rise"
                style={{ animationDelay: `${Math.min(index, 20) * 22}ms` }}
              >
                <LibraryColorCard
                  href={`/color-names/${c.slug}`}
                  hex={c.hex}
                  name={c.name}
                  meta={FAMILY_LABELS[c.family as ColorFamily] ?? c.family}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
  swatch,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  swatch?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-all duration-300",
        active
          ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
          : "border-border/60 bg-background/50 text-muted-foreground hover:-translate-y-0.5 hover:border-primary/30 hover:text-foreground"
      )}
    >
      {swatch && (
        <span
          className="h-2.5 w-2.5 rounded-full ring-1 ring-black/5"
          style={{ backgroundColor: swatch }}
        />
      )}
      {label}
    </button>
  );
}
