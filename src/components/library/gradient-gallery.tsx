"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GradientHero } from "@/components/library/gradient-hero";
import { cn } from "@/lib/utils";
import type { GradientCategory, LibraryGradient } from "@/lib/data/gradient-library";

const GradientDialog = dynamic(
  () => import("./gradient-dialog").then((mod) => mod.GradientDialog),
  { ssr: false }
);

export function GradientGallery({
  popular,
  library,
  categories,
  showPopularSection = true,
  initialCategory = null,
  pageSize = 80,
  showFilters = true,
  showHero = false,
  loadFullLibrary = false,
  totalCount = library.length,
}: {
  popular: LibraryGradient[];
  library: LibraryGradient[];
  categories: readonly GradientCategory[];
  showPopularSection?: boolean;
  initialCategory?: string | null;
  pageSize?: number;
  showFilters?: boolean;
  showHero?: boolean;
  loadFullLibrary?: boolean;
  totalCount?: number;
}) {
  const [catalog, setCatalog] = useState(library);
  const [catalogStatus, setCatalogStatus] = useState<"ready" | "loading" | "error">("ready");
  const catalogRequest = useRef<Promise<void> | null>(null);
  const ensureCatalog = () => {
    if (!loadFullLibrary || catalog.length === totalCount || catalogRequest.current) return;
    setCatalogStatus("loading");
    catalogRequest.current = import("@/lib/data/gradient-library")
      .then((mod) => {
        setCatalog(mod.getAllGradients());
        setCatalogStatus("ready");
      })
      .catch(() => setCatalogStatus("error"))
      .finally(() => {
        catalogRequest.current = null;
      });
  };
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string | null>(initialCategory);
  const [newOnly, setNewOnly] = useState(false);
  const [selected, setSelected] = useState<LibraryGradient | null>(null);
  const [open, setOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroWrapRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase().replace(/^#/, "");
    return catalog.filter((g) => {
      if (newOnly && g.collection !== "studio") return false;
      if (category && g.category !== category) return false;
      if (!needle) return true;
      return (
        g.name.toLowerCase().includes(needle) ||
        g.category.includes(needle) ||
        g.colors.some((c) => c.toLowerCase().includes(needle))
      );
    });
  }, [catalog, category, q, newOnly]);

  const resultLimit = newOnly ? Math.max(100, pageSize) : pageSize;
  const strips =
    q.trim() || category || newOnly
      ? filtered.slice(0, resultLimit)
      : popular.length
        ? popular
        : filtered.slice(0, pageSize);

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

  const showStrips = !showHero || Boolean(q.trim() || category || newOnly);

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
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed sm:text-base">
                Find your next background in {totalCount.toLocaleString("en-US")} named gradients,
                including 100 new original recipes. Preview the blend, copy the CSS, or download an
                image.
              </p>
            </header>
          )}
          <div className="relative max-w-xl">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                ensureCatalog();
              }}
              placeholder="Search gradient names or hex…"
              aria-label="Search gradients"
              className="h-12 rounded-2xl pl-11"
            />
          </div>
          {showFilters && (
            <div className="flex flex-wrap gap-2">
              {showPopularSection && (
                <Chip
                  label="Popular"
                  active={!category && !q.trim() && !newOnly}
                  onClick={() => {
                    setCategory(null);
                    setQ("");
                    setNewOnly(false);
                  }}
                />
              )}
              {(loadFullLibrary || library.some((g) => g.collection === "studio")) && (
                <Chip
                  label="100 new"
                  active={newOnly}
                  onClick={() => {
                    ensureCatalog();
                    setNewOnly(!newOnly);
                    setCategory(null);
                    setQ("");
                  }}
                />
              )}
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  active={category === cat}
                  onClick={() => {
                    ensureCatalog();
                    setCategory(category === cat ? null : cat);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {catalogStatus === "loading" && (
          <p role="status" className="text-muted-foreground text-sm">
            Loading all named gradients…
          </p>
        )}
        {catalogStatus === "error" && (
          <p role="alert" className="text-sm">
            The full collection could not load.{" "}
            <button type="button" onClick={ensureCatalog} className="text-primary underline">
              Try again
            </button>
          </p>
        )}
        {showStrips && catalogStatus === "ready" && (
          <section>
            <h2 className="sr-only">Named gradients</h2>
            <p className="text-muted-foreground mb-4 text-sm" role="status">
              {filtered.length
                ? `${filtered.length.toLocaleString("en-US")} gradients${newOnly ? " in the new collection" : " found"}. Select one to preview and copy its code.`
                : "No gradients found. Try another name, color, or category."}
            </p>
            <div className="border-border/40 -mx-4 overflow-hidden border-y sm:-mx-6 lg:mx-0 lg:rounded-2xl lg:border">
              {strips.map((g) => (
                <button
                  key={g.slug}
                  type="button"
                  onClick={() => openGradient(g)}
                  className="focus-visible:ring-ring relative flex h-16 w-full items-center justify-center px-4 text-center transition-[filter,height] duration-300 hover:h-[4.75rem] hover:brightness-105 focus-visible:ring-2 focus-visible:outline-none sm:h-[4.5rem]"
                  style={{ background: g.css }}
                  aria-label={`${g.name} gradient, open details`}
                >
                  <span className="bg-background/95 text-foreground font-display rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm sm:text-base">
                    {g.name}
                  </span>
                </button>
              ))}
            </div>
            {(q.trim() || category || newOnly) && filtered.length > resultLimit && (
              <p className="text-muted-foreground mt-3 text-center text-sm">
                Showing {resultLimit} of {filtered.length.toLocaleString("en-US")}. Refine search or{" "}
                {category ? (
                  <Link
                    href={`/gradient-library/category/${category}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    view all {category}
                  </Link>
                ) : (
                  "open a category."
                )}
              </p>
            )}
          </section>
        )}

        {showPopularSection && !newOnly && !q.trim() && !category && (
          <section>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Popular gradients
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Named palettes with hex stops, angle, and category. Click a card to load it on the
              full-screen stage.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {popular.map((g) => (
                <button
                  key={`popular-${g.slug}`}
                  type="button"
                  onClick={() => (showHero ? pickForHero(g) : openGradient(g))}
                  className="border-border/50 dark:bg-card overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <div className="h-20 w-full" style={{ background: g.css }} />
                  <div className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-lg font-semibold">{g.name}</h3>
                      <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                        {g.category}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {g.angle}° linear · {g.colors.length} stops
                    </p>
                    <p className="text-muted-foreground font-mono text-[11px] leading-relaxed">
                      {g.colors.join("  ")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {selected && <GradientDialog gradient={selected} open={open} onOpenChange={setOpen} />}
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full border px-4 text-xs font-medium capitalize transition-all",
        active
          ? "border-primary/40 bg-primary text-primary-foreground"
          : "border-border/60 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
