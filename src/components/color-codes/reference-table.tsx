"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/color/copy-button";
import { Input } from "@/components/ui/input";
import { getTextColor } from "@/lib/colors/convert";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

export type ReferenceRow = {
  id: string;
  name: string;
  hex: string;
  [key: string]: string | number;
};

export type ReferenceColumn = {
  id: string;
  header: string;
  copy?: boolean;
  mono?: boolean;
};

function rowHref(row: ReferenceRow, detailBase?: string) {
  if (detailBase) return `${detailBase}/${row.id}`;
  return `/color/${String(row.hex).replace("#", "").toLowerCase()}`;
}

export function ColorReferenceTable({
  rows,
  columns,
  searchPlaceholder = "Search name, HEX, or code…",
  detailBase,
}: {
  rows: ReferenceRow[];
  columns: ReferenceColumn[];
  searchPlaceholder?: string;
  detailBase?: string;
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" }>({ id: "name", dir: "asc" });

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const next = rows.filter((row) => {
      if (!needle) return true;
      return Object.values(row).some((v) => String(v).toLowerCase().includes(needle));
    });
    next.sort((a, b) => {
      const av = String(a[sort.id] ?? "");
      const bv = String(b[sort.id] ?? "");
      const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" });
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return next;
  }, [q, rows, sort]);

  const toggleSort = (id: string) => {
    setSort((prev) => (prev.id === id ? { id, dir: prev.dir === "asc" ? "desc" : "asc" } : { id, dir: "asc" }));
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Filter color table"
          className="max-w-md"
        />
        <p className="text-xs text-muted-foreground">
          {filtered.length} of {rows.length}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No colors match"
          description="Try a HEX value such as #3B82F6, a color name, or a code from this table."
        />
      ) : null}

      <div className={cn(filtered.length === 0 ? "hidden" : "hidden overflow-x-auto rounded-[var(--radius-lg)] border border-border md:block")}>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="sticky top-0 bg-muted/90 text-xs uppercase tracking-[0.08em] text-muted-foreground backdrop-blur-sm">
            <tr>
              <th className="px-3 py-3">Color</th>
              {columns.map((col) => (
                <th key={col.id} className="px-3 py-3">
                  <button type="button" className="font-semibold hover:text-foreground" onClick={() => toggleSort(col.id)}>
                    {col.header}
                    {sort.id === col.id ? (sort.dir === "asc" ? " ↑" : " ↓") : ""}
                  </button>
                </th>
              ))}
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-border/60 transition-colors duration-150 hover:bg-[var(--primary-soft)]">
                <td className="px-3 py-2">
                  <Link
                    href={rowHref(row, detailBase)}
                    className="block h-9 w-14 rounded-lg border border-border/70"
                    style={{ backgroundColor: String(row.hex) }}
                    aria-label={`Open ${row.name}`}
                  />
                </td>
                {columns.map((col) => {
                  const value = String(row[col.id] ?? "");
                  return (
                    <td key={col.id} className={cn("px-3 py-2", col.mono && "font-mono text-[13px]")}>
                      {value}
                    </td>
                  );
                })}
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {columns
                      .filter((c) => c.copy)
                      .map((c) => (
                        <CopyButton key={c.id} value={String(row[c.id] ?? "")} label={c.header} size="sm" className="h-8 px-2 text-[11px]" />
                      ))}
                    <Link
                      href={rowHref(row, detailBase)}
                      className="inline-flex h-8 items-center rounded-lg border border-border px-2 text-[11px] font-medium hover:bg-muted"
                    >
                      Open
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={cn("grid gap-3 md:hidden", filtered.length === 0 && "hidden")}>
        {filtered.map((row) => (
          <article key={row.id} className="overflow-hidden rounded-2xl border border-border/70 bg-card">
            <div className="flex h-16" style={{ backgroundColor: String(row.hex), color: getTextColor(String(row.hex)) }}>
              <Link
                href={rowHref(row, detailBase)}
                className="flex flex-1 items-end p-3 font-display text-sm font-semibold"
              >
                {row.name}
              </Link>
            </div>
            <div className="space-y-1.5 p-3 text-sm">
              {columns.map((col) => (
                <div key={col.id} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">{col.header}</span>
                  <span className={cn("truncate", col.mono && "font-mono text-[12px]")}>{String(row[col.id] ?? "")}</span>
                </div>
              ))}
              <div className="flex flex-wrap gap-1 pt-1">
                {columns
                  .filter((c) => c.copy)
                  .map((c) => (
                    <CopyButton key={c.id} value={String(row[c.id] ?? "")} label={c.header} size="sm" className="h-8 px-2 text-[11px]" />
                  ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
