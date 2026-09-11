"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GradientDialog } from "@/components/library/gradient-dialog";
import { GradientHero } from "@/components/library/gradient-hero";
import { cn } from "@/lib/utils";
import type { GradientCategory, LibraryGradient } from "@/lib/data/gradient-library";

export function GradientGallery({
  popular,
  library,
  categories,
  showPopularSection = true,
  initialCategory = null,
  pageSize = 80,
  showFilters = true,
  showHero = false,
}: {
  popular: LibraryGradient[];
  library: LibraryGradient[];
  categories: readonly GradientCategory[];
  showPopularSection?: boolean;
  initialCategory?: string | null;
  pageSize?: number;
  showFilters?: boolean;
  showHero?: boolean;
}) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string | null>(initialCategory);
  const [selected, setSelected] = useState<LibraryGradient | null>(null);
  const [open, setOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroWrapRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase().replace(/^#/, "");
    return library.filter((g) => {
      if (category && g.category !== category) return false;
      if (!needle) return true;
      return (
        g.name.toLowerCase().includes(needle) ||
        g.category.includes(needle) ||
        g.colors.some((c) => c.toLowerCase().includes(needle))
      );
    });
  }, [library, category, q]);

  const strips = q.trim() || category ? filtered.slice(0, pageSize) : popular.length ? popular : filtered.slice(0, pageSize);

  const playlist = popular.length ? popular : library.slice(0, 48);

  const openGradient = (g: LibraryGradient) => {
    setSelected(g);
    setOpen(true);
  };

  const pickForHero = (g: LibraryGradient) => {
    const i = playlist.findIndex((item) => item.slug === g.slug);
    if (i >= 0) {
      setHeroIndex(i);
      heroWrapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    openGradient(g);
  };

  const showStrips = !showHero || Boolean(q.trim() || category);

  return (
    <div>
      {showHero && (
        <div ref={heroWrapRef}>
          <GradientHero
            gradients={playlist}
            index={Math.min(heroIndex, Math.max(playlist.length - 1, 0))}
            onIndexChange={setHeroIndex}
            onDetails={openGradient}
            paused={open}
          />
        </div>
      )}

      <div className={cn("space-y-12", showHero && "mx-auto max-w-7xl px-4 py-10 lg:px-6")}>
      <div className="space-y-4">
        {showHero && (
          <header className="max-w-3xl">
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Gradient Library
            </h1>
            <p className="mt-2 text-muted-foreground">
              Named palettes with copy-ready CSS, Tailwind, and SCSS.
            </p>
          </header>
        )}
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search gradient names or hex…"
            aria-label="Search gradients"
            className="h-12 rounded-2xl pl-11"
          />
        </div>
        {showFilters && (
        <div className="flex flex-wrap gap-2">
          {showPopularSection && (
            <Chip label="Popular" active={!category && !q.trim()} onClick={() => { setCategory(null); setQ(""); }} />
          )}
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              active={category === cat}
              onClick={() => setCategory(category === cat ? null : cat)}
            />
          ))}
        </div>
        )}
      </div>

      {showStrips && (
      <section>
        <h2 className="sr-only">Named gradients</h2>
        <div className="-mx-4 overflow-hidden border-y border-border/40 sm:-mx-6 lg:mx-0 lg:rounded-2xl lg:border">
          {strips.map((g) => (
            <button
              key={g.slug}
              type="button"
              onClick={() => openGradient(g)}
              className="relative flex h-16 w-full items-center justify-center px-4 text-center transition-[filter,height] duration-300 hover:h-[4.75rem] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-[4.5rem]"
              style={{ background: g.css }}
              aria-label={`${g.name} gradient, open details`}
            >
              <span className="font-display text-base font-semibold tracking-wide text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] sm:text-lg">
                {g.name}
              </span>
            </button>
          ))}
        </div>
        {(q.trim() || category) && filtered.length > pageSize && (
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Showing {pageSize} of {filtered.length.toLocaleString()}. Refine search or{" "}
            {category ? (
              <Link href={`/gradient-library/category/${category}`} className="text-primary underline-offset-4 hover:underline">
                view all {category}
              </Link>
            ) : (
              "open a category."
            )}
          </p>
        )}
      </section>
      )}

      {showPopularSection && (
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Popular gradients</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Named palettes with hex stops, angle, and category. Click a card to load it on the full-screen stage.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {popular.map((g) => (
              <button
                key={`popular-${g.slug}`}
                type="button"
                onClick={() => (showHero ? pickForHero(g) : openGradient(g))}
                className="overflow-hidden rounded-2xl border border-border/50 bg-white text-left shadow-sm transition-transform hover:-translate-y-0.5 dark:bg-card"
              >
                <div className="h-20 w-full" style={{ background: g.css }} />
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold">{g.name}</h3>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {g.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{g.angle}° linear · {g.colors.length} stops</p>
                  <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                    {g.colors.join("  ")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <GradientDialog gradient={selected} open={open} onOpenChange={setOpen} />
      </div>
    </div>
  );
}

function Chip({
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
        "rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-all",
        active
          ? "border-primary/40 bg-primary text-primary-foreground"
          : "border-border/60 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
