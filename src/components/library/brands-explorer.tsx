"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BrandCard } from "@/components/library/brand-card";
import { cn } from "@/lib/utils";

type BrandItem = {
  slug: string;
  name: string;
  overview: string;
  category: string;
  colors: string[];
  logoUrl?: string;
  unverified?: string[];
};

export function BrandsExplorer({
  brands,
  categories,
}: {
  brands: BrandItem[];
  categories: string[];
}) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [shownState, setShownState] = useState({ key: "", shown: 24 });
  const filterKey = `${category ?? ""}:${q}`;
  const shown = shownState.key === filterKey ? shownState.shown : 24;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase().replace(/^#/, "");
    return brands.filter((b) => {
      if (category && b.category !== category) return false;
      if (!needle) return true;
      return (
        b.name.toLowerCase().includes(needle) ||
        b.category.toLowerCase().includes(needle) ||
        b.overview.toLowerCase().includes(needle) ||
        b.colors.some((c) => c.toLowerCase().includes(needle))
      );
    });
  }, [brands, category, q]);

  return (
    <div className="space-y-8">
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search brands (Swiggy, McDonald's, Arsenal, #FC8019…)"
          aria-label="Search brands"
          className="h-12 rounded-2xl pl-11"
        />
      </div>

      <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <FilterChip
          label={`All · ${brands.length}`}
          active={!category}
          onClick={() => setCategory(null)}
        />
        {categories.map((cat) => (
          <FilterChip
            key={cat}
            label={cat}
            active={category === cat}
            onClick={() => setCategory(category === cat ? null : cat)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
          No brands match that search.
        </p>
      ) : (
        <>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
            {filtered.slice(0, shown).map((brand, index) => (
              <div
                key={brand.slug}
                className={cn("min-w-0", index < 8 && "animate-rise")}
                style={index < 8 ? { animationDelay: `${index * 35}ms` } : undefined}
              >
                <BrandCard
                  slug={brand.slug}
                  name={brand.name}
                  overview={brand.overview}
                  category={brand.category}
                  colors={brand.colors}
                  logoUrl={brand.logoUrl}
                  unverified={brand.unverified}
                  priority={index < 2}
                />
              </div>
            ))}
          </div>
          {shown < filtered.length ? (
            <div className="flex justify-center">
              <button
                type="button"
                className="min-h-11 rounded-full border border-border/70 px-5 text-sm font-medium hover:border-primary/40"
                onClick={() => setShownState({ key: filterKey, shown: shown + 24 })}
              >
                Show more brands ({filtered.length - shown} left)
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-4 min-h-11 text-xs font-medium transition-all duration-300",
        active
          ? "border-primary/40 bg-primary text-primary-foreground shadow-sm"
          : "border-border/60 bg-background/50 text-muted-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
