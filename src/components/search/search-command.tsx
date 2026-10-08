"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
import { flattenHits, querySearch, type SearchHit } from "@/lib/search/query";
import { cn } from "@/lib/utils";

type SearchApi = {
  open: () => void;
  setOpen: (open: boolean) => void;
};

const SearchCommandContext = createContext<SearchApi | null>(null);

export function useSearchCommand() {
  return useContext(SearchCommandContext);
}

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function SearchCommandProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const api = useMemo<SearchApi>(() => ({ open: () => setOpen(true), setOpen }), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !isTypingTarget(e.target)) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <SearchCommandContext.Provider value={api}>
      {children}
      <SearchCommandDialog open={open} onOpenChange={setOpen} />
    </SearchCommandContext.Provider>
  );
}

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery);
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, initialQuery]);

  const result = useMemo(() => querySearch(query), [query]);
  const hits = flattenHits(result);

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
          <DialogDescription>Search colors, HEX, brands, design systems, tools, and guides.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
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
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
            ESC
          </kbd>
        </div>
        <div className="max-h-[min(24rem,60vh)] overflow-y-auto p-2" role="listbox" aria-label="Search results">
          {result.parsedHex && (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              Parsed {result.parsedHex.toUpperCase()} — Enter opens the color page
            </p>
          )}
          {hits.length === 0 ? (
            query.trim() ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                That doesn&apos;t match a color, brand, or tool. Try something like{" "}
                <span className="font-mono text-foreground">#3B82F6</span>.
              </p>
            ) : (
              <div className="px-2 py-2">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
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
                      <span className="h-6 w-6 shrink-0 rounded-[var(--radius-sm)] border border-border" style={{ backgroundColor: item.swatch }} aria-hidden />
                    ) : (
                      <span className="h-6 w-6 shrink-0 rounded-[var(--radius-sm)] border border-dashed border-border" />
                    )}
                    <span className="flex-1 truncate font-medium">{item.label}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{item.hint}</span>
                  </button>
                ))}
              </div>
            )
          ) : (
            result.groups.map((group) => (
              <div key={group.category} className="mb-2">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
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
                        index === active ? "bg-[var(--primary-soft)] text-foreground" : "hover:bg-muted/70"
                      )}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => go(item)}
                    >
                      {item.swatch ? (
                        <span
                          className="h-6 w-6 shrink-0 rounded-md border border-border"
                          style={{ backgroundColor: item.swatch }}
                          aria-hidden
                        />
                      ) : (
                        <span className="h-6 w-6 shrink-0 rounded-md border border-dashed border-border" />
                      )}
                      <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                      {item.hint && <span className="truncate font-mono text-[11px] text-muted-foreground">{item.hint}</span>}
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
