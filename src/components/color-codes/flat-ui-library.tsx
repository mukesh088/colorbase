"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { analyzeColor } from "@/lib/colors/spaces";
import { getTextColor } from "@/lib/colors/convert";
import { CopyButton } from "@/components/color/copy-button";
import { ColorActions } from "@/components/color-codes/color-actions";
import { Input } from "@/components/ui/input";
import type { FlatUiColor } from "@/lib/data/color-codes/flat-ui";

export function FlatUiLibrary({ colors }: { colors: FlatUiColor[] }) {
  const [q, setQ] = useState("");
  const [collection, setCollection] = useState<"all" | "Original" | "American">("all");
  const [family, setFamily] = useState("all");

  const families = useMemo(() => ["all", ...Array.from(new Set(colors.map((c) => c.family)))], [colors]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return colors.filter((c) => {
      if (collection !== "all" && c.collection !== collection) return false;
      if (family !== "all" && c.family !== family) return false;
      if (!needle) return true;
      return `${c.name} ${c.hex} ${c.collection}`.toLowerCase().includes(needle);
    });
  }, [colors, collection, family, q]);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Flat UI colors…" className="max-w-sm" />
        <select
          value={collection}
          onChange={(e) => setCollection(e.target.value as typeof collection)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          aria-label="Filter collection"
        >
          <option value="all">All collections</option>
          <option value="Original">Original</option>
          <option value="American">American</option>
        </select>
        <select
          value={family}
          onChange={(e) => setFamily(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          aria-label="Filter family"
        >
          {families.map((f) => (
            <option key={f} value={f}>
              {f === "all" ? "All families" : f}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">{filtered.length} colors</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => {
          const a = analyzeColor(c.hex);
          const text = getTextColor(c.hex);
          return (
            <article key={`${c.collection}-${c.name}`} className="overflow-hidden rounded-2xl border border-border/70 bg-card">
              <Link
                href={`/color/${c.hex.slice(1)}`}
                className="flex h-28 flex-col justify-end p-3"
                style={{ backgroundColor: c.hex, color: text }}
              >
                <p className="font-display text-lg font-semibold">{c.name}</p>
                <p className="font-mono text-xs opacity-90">{c.hex.toUpperCase()}</p>
              </Link>
              <div className="space-y-2 p-3 text-sm">
                <p className="text-xs text-muted-foreground">
                  {c.collection} · {c.family}
                </p>
                <div className="grid gap-1 font-mono text-[12px]">
                  <p>{`rgb(${a.rgb.r}, ${a.rgb.g}, ${a.rgb.b})`}</p>
                  <p>{a.hsl}</p>
                  <p className="truncate">{a.oklch}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <CopyButton value={c.hex.toUpperCase()} label="HEX" size="sm" className="h-8 px-2 text-[11px]" />
                  <CopyButton value={`rgb(${a.rgb.r}, ${a.rgb.g}, ${a.rgb.b})`} label="RGB" size="sm" className="h-8 px-2 text-[11px]" />
                </div>
                <ColorActions hex={c.hex} />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
