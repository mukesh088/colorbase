"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  INTERIOR_ROOM_TYPES,
  INTERIOR_STYLES,
  ROOM_LABELS,
  STYLE_LABELS,
} from "@/lib/interior/catalog";
import { COLOR_FAMILIES, FAMILY_LABELS } from "@/lib/data/families";

export function InteriorFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const room = params.get("room") ?? "";
  const style = params.get("style") ?? "";
  const family = params.get("family") ?? "";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.push(qs ? `/interior-colors?${qs}` : "/interior-colors");
  }

  const selectClass =
    "h-10 rounded-[var(--radius-md)] border border-input bg-background px-3 text-sm";

  return (
    <form className="mt-6 grid gap-3 sm:grid-cols-3" onSubmit={(e) => e.preventDefault()}>
      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
        Room type
        <select
          className={selectClass}
          value={room}
          onChange={(e) => update("room", e.target.value)}
          aria-label="Filter by room type"
        >
          <option value="">All rooms</option>
          {INTERIOR_ROOM_TYPES.map((value) => (
            <option key={value} value={value}>
              {ROOM_LABELS[value]}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
        Style
        <select
          className={selectClass}
          value={style}
          onChange={(e) => update("style", e.target.value)}
          aria-label="Filter by design style"
        >
          <option value="">All styles</option>
          {INTERIOR_STYLES.map((value) => (
            <option key={value} value={value}>
              {STYLE_LABELS[value]}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
        Color family
        <select
          className={selectClass}
          value={family}
          onChange={(e) => update("family", e.target.value)}
          aria-label="Filter by color family"
        >
          <option value="">All families</option>
          {COLOR_FAMILIES.map((value) => (
            <option key={value} value={value}>
              {FAMILY_LABELS[value]}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
