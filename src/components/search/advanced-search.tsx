"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchTools } from "@/lib/tools-registry";
import { searchBrands } from "@/lib/data/brands";
import { searchNamedColors } from "@/lib/data/color-names";
import { searchGradients } from "@/lib/data/gradient-library";
import { searchPalettes } from "@/lib/data/palette-library";
import { useLocalStorage } from "@/hooks";
import { TRENDING_PALETTES } from "@/lib/colors/palettes";

const POPULAR = ["hex to rgb", "tailwind", "spotify", "contrast", "neon gradient", "ocean palette"];

export function AdvancedSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [history, setHistory] = useLocalStorage<string[]>("search-history", []);
  const [recentColors] = useLocalStorage<string[]>("recent-colors", []);

  useEffect(() => setQ(initialQuery), [initialQuery]);

  const results = useMemo(() => {
    if (!q.trim()) return null;
    return {
      tools: searchTools(q).slice(0, 8),
      brands: searchBrands(q).slice(0, 6),
      colors: searchNamedColors(q).slice(0, 8),
      gradients: searchGradients(q).slice(0, 6),
      palettes: searchPalettes(q).slice(0, 6),
    };
  }, [q]);

  const commit = (term: string) => {
    const value = term.trim();
    if (!value) return;
    setHistory((prev) => [value, ...prev.filter((h) => h !== value)].slice(0, 12));
    router.push(`/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <div className="space-y-6">
      <form
        className="flex gap-2"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          commit(q);
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search colors, brands, gradients, palettes, tools…"
            className="pl-9"
            aria-label="Global search"
            autoComplete="off"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {q.trim().length > 1 && results && (
        <div className="glass rounded-2xl border border-border/60 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Instant results
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <ResultGroup title="Tools" items={results.tools.map((t) => ({ href: `/${t.slug}`, label: t.title }))} />
            <ResultGroup title="Brands" items={results.brands.map((b) => ({ href: `/brands/${b.slug}`, label: b.name }))} />
            <ResultGroup title="Colors" items={results.colors.map((c) => ({ href: `/color-names/${c.slug}`, label: c.name }))} />
            <ResultGroup title="Gradients" items={results.gradients.map((g) => ({ href: `/gradient-library/${g.slug}`, label: g.name }))} />
            <ResultGroup title="Palettes" items={results.palettes.map((p) => ({ href: `/palette-library/${p.slug}`, label: p.name }))} />
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <ChipList title="Popular searches" items={POPULAR} onPick={commit} />
        <ChipList title="Search history" items={history} onPick={commit} />
        <div>
          <p className="mb-2 text-sm font-semibold">Trending palettes</p>
          <ul className="space-y-1 text-sm">
            {TRENDING_PALETTES.slice(0, 6).map((p) => (
              <li key={p.name}>
                <Link href="/trending-palettes" className="text-muted-foreground hover:text-foreground">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
          {recentColors.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold">Recently viewed colors</p>
              <div className="flex flex-wrap gap-2">
                {recentColors.slice(0, 10).map((c) => (
                  <Link
                    key={c}
                    href={`/color/${c.slice(1)}`}
                    className="h-7 w-7 rounded-md border border-border/50"
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultGroup({
  title,
  items,
}: {
  title: string;
  items: { href: string; label: string }[];
}) {
  if (!items.length) return null;
  return (
    <div>
      <p className="mb-1 text-sm font-medium">{title}</p>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="hover:text-foreground hover:underline">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChipList({
  title,
  items,
  onPick,
}: {
  title: string;
  items: string[];
  onPick: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Nothing yet</p>}
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPick(item)}
            className="rounded-full border border-border/60 px-3 py-1 text-xs hover:border-primary/40"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
