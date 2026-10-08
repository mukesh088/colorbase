"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { flattenHits, querySearch } from "@/lib/search/query";
import { cn } from "@/lib/utils";

export function ColorSearchBox({
  autoFocus = false,
  size = "lg",
}: {
  autoFocus?: boolean;
  size?: "md" | "lg";
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const result = useMemo(() => querySearch(query), [query]);
  const hits = flattenHits(result);

  const commit = (href?: string) => {
    if (href) {
      router.push(href);
      return;
    }
    if (result.parsedHex) {
      router.push(`/color/${result.parsedHex.slice(1)}`);
      return;
    }
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="relative">
      <form
        role="search"
        className="relative"
        onSubmit={(e) => {
          e.preventDefault();
          commit(hits[active]?.href);
        }}
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 150);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => Math.min(i + 1, Math.max(hits.length - 1, 0)));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder="Search a color, HEX, RGB, Tailwind token, brand, or color name…"
          aria-label="Search colors, HEX, RGB, brands, and tools"
          autoComplete="off"
          className={cn(
            "rounded-[var(--radius-lg)] border-border bg-background pl-11 pr-28 shadow-[var(--shadow-sm)] transition-[border-color,box-shadow] duration-200 ease-out focus-visible:border-primary",
            size === "lg" ? "h-14 text-base md:h-14 md:text-[15px]" : "h-11"
          )}
        />
        <kbd className="pointer-events-none absolute right-[4.75rem] top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
          /
        </kbd>
        <Button
          type="submit"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[var(--radius-sm)]"
        >
          Search
        </Button>
      </form>
      <p className="mt-2 px-1 text-xs text-muted-foreground">
        Example: <span className="font-mono text-[12px] font-medium text-foreground">#3B82F6</span>
        {result.parsedHex ? ` → ${result.parsedHex.toUpperCase()}` : null}
      </p>
      {open && query.trim() && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          {hits.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              Enter a valid HEX color such as #3B82F6.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto p-1" role="listbox">
              {hits.slice(0, 12).map((hit, index) => (
                <li key={`${hit.href}-${hit.label}`}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm",
                      index === active ? "bg-[var(--primary-soft)]" : "hover:bg-muted/70"
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => commit(hit.href)}
                  >
                    {hit.swatch ? (
                      <span className="h-5 w-5 rounded-md border border-border" style={{ backgroundColor: hit.swatch }} />
                    ) : null}
                    <span className="flex-1 truncate">{hit.label}</span>
                    <span className="text-[11px] text-muted-foreground">{hit.category}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
