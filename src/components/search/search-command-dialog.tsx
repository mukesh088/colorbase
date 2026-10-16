"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { SearchHit } from "@/lib/search/query";
import { cn } from "@/lib/utils";

export function SearchCommandDialog({
  open,
  onOpenChange,
  initialQuery = "",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [active, setActive] = useState(0);
  const [engine, setEngine] = useState<typeof import("@/lib/search/query") | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery);
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, initialQuery]);

  useEffect(() => {
    if (!open || engine) return;
    let cancelled = false;
    void import("@/lib/search/query").then((mod) => {
      if (!cancelled) setEngine(mod);
    });
    return () => {
      cancelled = true;
    };
  }, [open, engine]);

  const result = useMemo(
    () => (engine ? engine.querySearch(query) : { parsedHex: null as string | null, groups: [] }),
    [engine, query]
  );
  const hits = engine ? engine.flattenHits(result) : [];

  const go = useCallback(
    (hit?: SearchHit) => {
      if (hit) {
        onOpenChange(false);
        router.push(hit.href);
        return;
      }
      if (result.parsedHex) {
        onOpenChange(false);
        router.push(`/color/${result.parsedHex.slice(1)}`);
        return;
      }
      const q = query.trim();
      if (q) {
        onOpenChange(false);
        router.push(`/search?q=${encodeURIComponent(q)}`);
      }
    },
    [onOpenChange, query, result.parsedHex, router]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass top-[12%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0 sm:rounded-[var(--radius-lg)]">
        <DialogHeader className="sr-only">
          <DialogTitle>Search ColorBase</DialogTitle>
          <DialogDescription>
            Search colors, HEX, brands, design systems, tools, and guides.
          </DialogDescription>
        </DialogHeader>
        <div className="border-border flex items-center gap-2 border-b px-3">
          <Search className="text-muted-foreground h-4 w-4" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(i + 1, Math.max(hits.length - 1, 0)));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                go(hits[active]);
              }
            }}
            placeholder="Search a color, HEX, RGB, Tailwind token, brand, or color name…"
            className="h-12 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            aria-label="Global color search"
            autoComplete="off"
          />
          <kbd className="border-border text-muted-foreground hidden rounded border px-1.5 py-0.5 font-mono text-[10px] sm:inline">
            ESC
          </kbd>
        </div>
        <div
          className="max-h-[min(24rem,60vh)] overflow-y-auto p-2"
          role="listbox"
          aria-label="Search results"
        >
          {result.parsedHex && (
            <p className="text-muted-foreground px-2 py-1.5 text-xs">
              Parsed {result.parsedHex.toUpperCase()} — Enter opens the color page
            </p>
          )}
          {hits.length === 0 ? (
            query.trim() ? (
              <p className="text-muted-foreground px-3 py-8 text-center text-sm">
                That doesn&apos;t match a color, brand, or tool. Try something like{" "}
                <span className="text-foreground font-mono">#3B82F6</span>.
              </p>
            ) : (
              <div className="px-2 py-2">
                <p className="text-muted-foreground px-2 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase">
                  Popular
                </p>
                {[
                  { label: "Blue 500", href: "/color/3b82f6", swatch: "#3B82F6", hint: "#3B82F6" },
                  { label: "Color picker", href: "/color-picker", hint: "Tool" },
                  { label: "Tailwind colors", href: "/colors/tailwind", hint: "Design system" },
                  { label: "AI Copilot", href: "/ai-color-copilot", hint: "AI" },
                ].map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-2 py-2 text-left text-sm hover:bg-[var(--primary-soft)]"
                    onClick={() => {
                      onOpenChange(false);
                      router.push(item.href);
                    }}
                  >
                    {item.swatch ? (
                      <span
                        className="border-border h-6 w-6 shrink-0 rounded-[var(--radius-sm)] border"
                        style={{ backgroundColor: item.swatch }}
                        aria-hidden
                      />
                    ) : (
                      <span className="border-border h-6 w-6 shrink-0 rounded-[var(--radius-sm)] border border-dashed" />
                    )}
                    <span className="flex-1 truncate font-medium">{item.label}</span>
                    <span className="text-muted-foreground font-mono text-[11px]">{item.hint}</span>
                  </button>
                ))}
              </div>
            )
          ) : (
            result.groups.map((group) => (
              <div key={group.category} className="mb-2">
                <p className="text-muted-foreground px-2 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase">
                  {group.category}
                </p>
                {group.items.map((item) => {
                  const index = hits.indexOf(item);
                  return (
                    <button
                      key={`${item.category}-${item.href}-${item.label}`}
                      type="button"
                      role="option"
                      aria-selected={index === active}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm",
                        index === active
                          ? "text-foreground bg-[var(--primary-soft)]"
                          : "hover:bg-muted/70"
                      )}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => go(item)}
                    >
                      {item.swatch ? (
                        <span
                          className="border-border h-6 w-6 shrink-0 rounded-md border"
                          style={{ backgroundColor: item.swatch }}
                          aria-hidden
                        />
                      ) : (
                        <span className="border-border h-6 w-6 shrink-0 rounded-md border border-dashed" />
                      )}
                      <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                      {item.hint && (
                        <span className="text-muted-foreground truncate font-mono text-[11px]">
                          {item.hint}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
