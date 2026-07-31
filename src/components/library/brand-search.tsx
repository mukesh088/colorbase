"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { searchBrands } from "@/lib/data/brands";

export function BrandSearch() {
  const [q, setQ] = useState("");
  const results = useMemo(() => searchBrands(q).slice(0, 8), [q]);

  return (
    <div className="max-w-xl space-y-3">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search brands (Nike, Spotify, Google…)"
        aria-label="Search brands"
      />
      {q.trim() && (
        <ul className="glass rounded-xl border border-border/60 p-3 text-sm">
          {results.map((b) => (
            <li key={b.slug}>
              <Link href={`/brands/${b.slug}`} className="block rounded-md px-2 py-1.5 hover:bg-accent">
                {b.name} · {b.category}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
