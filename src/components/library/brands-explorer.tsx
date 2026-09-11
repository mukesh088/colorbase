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

      <div className="flex flex-wrap gap-2">
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
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((brand, index) => (
            <div
              key={brand.slug}
              className="animate-rise"
              style={{ animationDelay: `${Math.min(index, 18) * 35}ms` }}
            >
              <BrandCard
                slug={brand.slug}
                name={brand.name}
                overview={brand.overview}
                category={brand.category}
                colors={brand.colors}
              />
            </div>
          ))}
        </div>
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
        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-300",
        active
          ? "border-primary/40 bg-primary text-primary-foreground shadow-sm"
          : "border-border/60 bg-background/50 text-muted-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
