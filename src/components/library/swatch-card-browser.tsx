"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SwatchCard = {
  href: string;
  title: string;
  /** Small text under the title (e.g. league). */
  meta?: string;
  /** Image shown in the card (e.g. a real flag); otherwise a large color stripe. */
  image?: { src: string; alt: string };
  colors: string[];
  /** Filter tab id (e.g. league). */
  group?: string;
  /** A–Z anchor letter. */
  letter: string;
};

/**
 * Searchable grid of color cards used by the flag and team hubs. Every card is
 * in the server HTML; search, tabs and the A–Z jump only filter it.
 */
export function SwatchCardBrowser({
  items,
  placeholder,
  groups,
}: {
  items: SwatchCard[];
  placeholder: string;
  groups?: { id: string; label: string }[];
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string>("all");
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hex = q.startsWith("#") ? q : `#${q}`;
    return items.filter(
      (it) =>
        (group === "all" || it.group === group) &&
        (!q || it.title.toLowerCase().includes(q) || it.colors.some((c) => c.toLowerCase().startsWith(hex)))
    );
  }, [items, query, group]);
  const filtering = Boolean(query) || group !== "all";
  const letters = [...new Set(items.map((i) => i.letter))];

  return (
    <div>
      {groups && (
        <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter">
          {[{ id: "all", label: "All" }, ...groups].map((g) => (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={group === g.id}
              onClick={() => setGroup(g.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                group === g.id ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block w-full sm:max-w-sm">
          <span className="sr-only">{placeholder}</span>
          <Search aria-hidden className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} className="pl-9" />
        </label>
        <p className="text-muted-foreground text-sm">
          {shown.length} of {items.length}
        </p>
      </div>
      {!filtering && (
        <nav aria-label="Jump to letter" className="mt-4 flex flex-wrap gap-1.5 text-sm">
          {letters.map((l) => (
            <a key={l} href={`#letter-${l}`} className="border-border hover:border-primary/50 rounded-md border px-2 py-1 font-medium uppercase">
              {l}
            </a>
          ))}
        </nav>
      )}
      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {shown.map((it, i) => {
          const anchor = !filtering && (i === 0 || shown[i - 1].letter !== it.letter);
          return (
            <li key={it.href} id={anchor ? `letter-${it.letter}` : undefined} className="scroll-mt-24">
              <Link
                href={it.href}
                className="group border-border/60 bg-card hover:border-primary/50 block overflow-hidden rounded-2xl border transition-shadow hover:shadow-md"
              >
                {it.image ? (
                  <span className="bg-muted/40 flex aspect-[3/2] items-center justify-center overflow-hidden p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.image.src}
                      alt={it.image.alt}
                      width={320}
                      height={213}
                      loading="lazy"
                      decoding="async"
                      className="max-h-full w-auto rounded-sm object-contain shadow-sm transition-transform group-hover:scale-[1.03]"
                    />
                  </span>
                ) : (
                  <span className="flex aspect-[3/2] overflow-hidden" aria-hidden>
                    {it.colors.map((c, j) => (
                      <span key={`${c}-${j}`} className="flex-1 transition-[flex] group-hover:first:flex-[1.4]" style={{ background: c }} />
                    ))}
                  </span>
                )}
                <span className="block p-3">
                  <span className="block truncate text-sm font-medium">{it.title}</span>
                  {it.meta && <span className="text-muted-foreground block text-xs">{it.meta}</span>}
                  {it.image && (
                    <span className="mt-2 flex h-3 overflow-hidden rounded-full" aria-hidden>
                      {it.colors.map((c, j) => (
                        <span key={`${c}-${j}`} className="flex-1" style={{ background: c }} />
                      ))}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {shown.length === 0 && <p className="text-muted-foreground mt-6 text-sm">Nothing matches “{query}”.</p>}
    </div>
  );
}

