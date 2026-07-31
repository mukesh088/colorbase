"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchNamedColors, type NamedColorEntry } from "@/lib/data/color-names";
import { FAMILY_LABELS, type ColorFamily } from "@/lib/data/families";
import { cn } from "@/lib/utils";

export function ColorNameSearch({
  families = [],
  onFamilyChange,
  activeFamily,
}: {
  families?: string[];
  onFamilyChange?: (family: string | null) => void;
  activeFamily?: string | null;
}) {
  const [q, setQ] = useState("");
  const results = useMemo(() => searchNamedColors(q), [q]);

  return (
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

      {families.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={!activeFamily}
            onClick={() => onFamilyChange?.(null)}
            label="All"
          />
          {families.map((family) => (
            <FilterChip
              key={family}
              active={activeFamily === family}
              onClick={() => onFamilyChange?.(family)}
              label={FAMILY_LABELS[family as ColorFamily] ?? family}
              swatch={undefined}
            />
          ))}
        </div>
      )}

      {q.trim() && (
        <div className="glass max-h-80 overflow-auto rounded-2xl border border-border/60 p-2 shadow-lg">
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {results.length} matches
          </p>
          <ul className="space-y-0.5">
            {results.map((c) => (
              <ResultRow key={c.slug} color={c} />
            ))}
            {results.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                No colors found for “{q}”
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function FilterChip({
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
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-300",
        active
          ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
          : "border-border/60 bg-background/50 text-muted-foreground hover:-translate-y-0.5 hover:border-primary/30 hover:text-foreground"
      )}
    >
      {swatch && (
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: swatch }} />
      )}
      {label}
    </button>
  );
}

function ResultRow({ color }: { color: NamedColorEntry }) {
  return (
    <li>
      <Link
        href={`/color-names/${color.slug}`}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-accent/80"
      >
        <span
          className="h-8 w-8 shrink-0 rounded-lg border border-black/5 shadow-sm"
          style={{ backgroundColor: color.hex }}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{color.name}</span>
          <span className="block text-[11px] capitalize text-muted-foreground">{color.family}</span>
        </span>
        <span className="font-mono text-xs text-muted-foreground">{color.hex}</span>
      </Link>
    </li>
  );
}
