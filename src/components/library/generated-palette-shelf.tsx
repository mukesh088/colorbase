"use client";

import { useEffect, useState } from "react";
import { PaletteCard } from "@/components/library/palette-card";
import { listGeneratedPalettes, type StoredPalette } from "@/lib/palettes/db";

export function GeneratedPaletteShelf() {
  const [items, setItems] = useState<StoredPalette[]>([]);

  useEffect(() => {
    listGeneratedPalettes()
      .then((rows) => setItems(rows.slice(0, 12)))
      .catch(() => setItems([]));
  }, []);

  if (!items.length) return null;

  return (
    <section>
      <div className="mb-4">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Your generated palettes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Saved on this device when you generate a palette. Heart a palette to add your star.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <PaletteCard
            key={p.id}
            id={p.id}
            href={`/palette-generator?colors=${p.id}`}
            name={p.name}
            colors={p.colors}
            meta="Generated"
          />
        ))}
      </div>
    </section>
  );
}
