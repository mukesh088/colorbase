"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Palette, X } from "lucide-react";
import { CATEGORY_LABELS, TOOLS } from "@/lib/tools-registry";
import type { ToolCategory } from "@/types/tools";
import { TOOL_ICONS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const categories = Object.keys(CATEGORY_LABELS) as ToolCategory[];

export function ToolsPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(categories.map((c, i) => [c, i < 2]))
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    // Auto-expand the category that contains the active tool
    const active = TOOLS.find((t) => pathname === `/${t.slug}`);
    if (active) {
      setExpanded((prev) => ({ ...prev, [active.category]: true }));
    }
  }, [pathname]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => onOpenChange(false)}
        aria-hidden={!open}
      />

      <aside
        id="tools-panel"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-none flex-col border-l border-border/60 bg-background/95 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-2xl shadow-rose-500/10 backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:w-[min(100vw,22rem)] sm:max-w-[22rem]",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Tools menu"
        aria-hidden={!open}
      >
        <div className="border-b border-border/50 px-4 py-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white shadow-lg shadow-rose-500/30">
                <Palette className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold tracking-tight">Quick tools menu</p>
                <p className="text-[11px] text-muted-foreground">{TOOLS.length} utilities</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close tools menu"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Link
            href="/tools"
            onClick={() => onOpenChange(false)}
            className="mt-3 flex flex-col gap-0.5 rounded-2xl border border-rose-500/20 bg-gradient-to-r from-rose-500/10 to-fuchsia-500/10 px-3 py-2.5 text-sm font-medium text-rose-700 transition-colors hover:border-rose-500/40 dark:text-rose-300 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>Browse Our Tools page</span>
            <span className="text-xs opacity-70">Full catalog →</span>
          </Link>
        </div>

        <ScrollArea className="flex-1 px-2 py-3">
          <nav aria-label="Tool categories" className="space-y-2 pb-8">
            {categories.map((category) => {
              const tools = TOOLS.filter((t) => t.category === category);
              if (!tools.length) return null;
              const isOpen = expanded[category] ?? false;
              return (
                <div
                  key={category}
                  className="overflow-hidden rounded-2xl border border-border/40 bg-background/40"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-accent/60"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setExpanded((prev) => ({ ...prev, [category]: !prev[category] }))
                    }
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/80">
                      {CATEGORY_LABELS[category]}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-300">
                        {tools.length}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-300",
                          isOpen && "rotate-180"
                        )}
                      />
                    </span>
                  </button>
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-out",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <ul className="space-y-0.5 px-1.5 pb-2">
                        {tools.map((tool) => {
                          const Icon = TOOL_ICONS[tool.icon] ?? Palette;
                          const active = pathname === `/${tool.slug}`;
                          return (
                            <li key={tool.slug}>
                              <Link
                                href={`/${tool.slug}`}
                                onClick={() => onOpenChange(false)}
                                className={cn(
                                  "flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm transition-all duration-200",
                                  active
                                    ? "bg-gradient-to-r from-rose-500/15 to-fuchsia-500/10 font-medium text-rose-700 dark:text-rose-300"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                                aria-current={active ? "page" : undefined}
                              >
                                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                                <span className="truncate">{tool.shortTitle}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
}
