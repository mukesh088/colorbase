"use client";

import { cn } from "@/lib/utils";

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn("flex flex-wrap gap-1 border-b border-border", className)}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              "relative rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition-colors duration-200 ease-out",
              active
                ? "bg-[var(--primary-soft)] text-foreground"
                : "text-muted-foreground hover:bg-[var(--primary-soft)] hover:text-foreground"
            )}
          >
            {item.label}
            {active ? (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" aria-hidden />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
