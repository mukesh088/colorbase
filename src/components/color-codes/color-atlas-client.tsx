"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/color/copy-button";
import { ColorActions } from "@/components/color-codes/color-actions";
import { parseFlexibleColor } from "@/lib/colors/parse";
import { CSS_NAMED_COLORS } from "@/lib/colors/palettes";
import {
  ATLAS_SYSTEMS,
  atlasTokens,
  compareAcrossSystems,
  type AtlasSystemId,
} from "@/lib/data/color-codes/atlas";
import { getTextColor } from "@/lib/colors/convert";
import { cn } from "@/lib/utils";

export function ColorAtlasClient() {
  const params = useSearchParams();
  const initial = params.get("hex") ? `#${params.get("hex")}` : "";
  const [tab, setTab] = useState<AtlasSystemId>("css");
  const [q, setQ] = useState("");
  const [compare, setCompare] = useState(initial.replace("#", "") ? initial : "Blue");
  const [sort, setSort] = useState<"name" | "hex">("name");

  const tokens = useMemo(() => atlasTokens(tab), [tab]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const next = tokens.filter((t) => !needle || `${t.token} ${t.hex}`.toLowerCase().includes(needle));
    next.sort((a, b) => (sort === "hex" ? a.hex.localeCompare(b.hex) : a.token.localeCompare(b.token)));
    return next.slice(0, 400);
  }, [q, sort, tokens]);

  const seedHex = useMemo(() => {
    const named = CSS_NAMED_COLORS.find((c) => c.name.toLowerCase() === compare.trim().toLowerCase());
    return named?.hex ?? parseFlexibleColor(compare) ?? parseFlexibleColor(`#${compare}`) ?? null;
  }, [compare]);

  const matches = useMemo(() => (seedHex ? compareAcrossSystems(seedHex) : []), [seedHex]);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border/70 p-4">
        <h2 className="font-display text-lg font-semibold">Comparison mode</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter a CSS name or HEX. Official tokens match that HEX exactly. Anything else is a nearest
          CIEDE2000 approximation and is labeled as such.
        </p>
        <Input
          value={compare}
          onChange={(e) => setCompare(e.target.value)}
          placeholder="Blue or #3B82F6"
          className="mt-3 max-w-md"
          aria-label="Compare color"
        />
        {seedHex && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((m) => (
              <div key={m.system} className="rounded-xl border border-border/70 p-3">
                <div className="flex items-center gap-2">
                  <span className="h-8 w-8 rounded-md border" style={{ backgroundColor: m.hex }} />
                  <div>
                    <p className="text-sm font-semibold">{m.label}</p>
                    <p className="font-mono text-[11px]">{m.token}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs">
                  {m.kind === "official" ? (
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">Official token</span>
                  ) : (
                    <span className="font-medium text-amber-700 dark:text-amber-400">
                      Nearest match · ΔE {m.deltaE}
                    </span>
                  )}
                </p>
                <CopyButton value={m.hex} label="HEX" size="sm" className="mt-2 h-8 px-2 text-[11px]" />
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-1.5">
        {ATLAS_SYSTEMS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setTab(s.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium",
              tab === s.id ? "border-rose-500 bg-rose-500/10 text-foreground" : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter tokens…" className="max-w-sm" />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "name" | "hex")}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          aria-label="Sort tokens"
        >
          <option value="name">Sort by name</option>
          <option value="hex">Sort by HEX</option>
        </select>
        <p className="text-xs text-muted-foreground">
          {ATLAS_SYSTEMS.find((s) => s.id === tab)?.note} · showing {filtered.length}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((t) => (
          <article key={`${tab}-${t.token}-${t.hex}`} className="overflow-hidden rounded-xl border border-border/70">
            <Link
              href={`/color/${t.hex.slice(1)}`}
              className="block h-16"
              style={{ backgroundColor: t.hex, color: getTextColor(t.hex) }}
              aria-label={t.token}
            />
            <div className="space-y-2 p-3">
              <p className="truncate text-sm font-medium">{t.token}</p>
              <p className="font-mono text-[11px] text-muted-foreground">{t.hex.toUpperCase()}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Official token
              </p>
              <ColorActions hex={t.hex} compact />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
