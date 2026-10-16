"use client";

import { useState } from "react";
import { Copy, Check, Sparkles, Paintbrush, Filter, ArrowRight } from "lucide-react";
import { CopyButton } from "@/components/color/copy-button";
import { toast } from "sonner";
import Link from "next/link";

export interface ArtPigment {
  name: string;
  hex: string;
  pigmentCode: string; // e.g. PB28, PR108
  opacity: "Transparent" | "Semi-Transparent" | "Semi-Opaque" | "Opaque";
  lightfastness: "ASTM I (Excellent)" | "ASTM II (Very Good)";
  granulation?: "High" | "Medium" | "Non-granulating"; // for watercolor
  washNote: string;
  category: "Earth" | "Warm Primary" | "Cool Primary" | "Botanical" | "Metallic & White";
}

export function ArtPigmentTool({
  medium,
  pigments,
}: {
  medium: "Watercolor" | "Acrylic" | "Colored Pencil";
  pigments: ArtPigment[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const categories = ["All", ...new Set(pigments.map((p) => p.category))];

  const filtered =
    selectedCategory === "All"
      ? pigments
      : pigments.filter((p) => p.category === selectedCategory);

  const copyPalette = async () => {
    const text = filtered.map((p) => `${p.name} (${p.pigmentCode}): ${p.hex}`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopiedKey("all");
    toast.success(`Copied ${filtered.length} pigment codes`);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Category Filter and Copy All */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-primary mr-1" />
          <span className="text-xs font-semibold text-muted-foreground mr-1">Filter Group:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "bg-background border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={copyPalette}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold shadow-xs hover:bg-muted"
        >
          {copiedKey === "all" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          Copy Filtered Swatch Codes
        </button>
      </div>

      {/* Pigment Swatch Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <div
            key={p.name}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-colors hover:border-primary/40 flex flex-col justify-between"
          >
            <div>
              {/* Swatch elevation */}
              <div
                className="h-28 w-full p-3 flex flex-col justify-between shadow-inner"
                style={{ backgroundColor: p.hex }}
              >
                <span className="self-end rounded-md bg-black/40 px-2 py-0.5 font-mono text-[11px] font-bold text-white backdrop-blur-xs">
                  {p.pigmentCode}
                </span>
                <span className="self-start rounded-md bg-black/40 px-2 py-0.5 font-mono text-[10px] text-white backdrop-blur-xs uppercase">
                  {p.hex}
                </span>
              </div>

              {/* Pigment details */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-foreground">{p.name}</h3>
                  <CopyButton value={p.hex} label={p.hex} size="sm" variant="ghost" className="h-7 w-7 p-0" />
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {p.opacity}
                  </span>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {p.lightfastness.split(" ")[0]}
                  </span>
                  {p.granulation && (
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {p.granulation}
                    </span>
                  )}
                </div>

                <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                  {p.washNote}
                </p>
              </div>
            </div>

            <div className="border-t border-border/50 px-4 py-2.5 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{p.category}</span>
              <Link
                href={`/color/${p.hex.replace("#", "")}`}
                className="inline-flex items-center gap-1 font-medium hover:text-primary transition-colors"
              >
                Inspect <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
