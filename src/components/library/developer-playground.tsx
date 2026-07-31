"use client";

import { useCallback, useState } from "react";
import {
  Dice5,
  Palette,
  Pipette,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CodeExportPanel } from "@/components/library/code-export-panel";
import {
  generateHarmony,
  isValidHex,
  normalizeHex,
  randomHex,
} from "@/lib/colors/convert";
import type { CodeFormat } from "@/lib/codegen";
import { cn } from "@/lib/utils";

const DEFAULT_PALETTE = ["#e11d48", "#db2777", "#c026d3", "#f59e0b", "#111827"];

const HARMONIES = [
  { value: "analogous", label: "Analogous" },
  { value: "complementary", label: "Complementary" },
  { value: "triadic", label: "Triadic" },
  { value: "tetradic", label: "Tetradic" },
  { value: "split-complementary", label: "Split complementary" },
  { value: "monochromatic", label: "Monochromatic" },
] as const;

export function DeveloperPlayground({ initialFormat }: { initialFormat?: string }) {
  const [colors, setColors] = useState<string[]>(DEFAULT_PALETTE);
  const [base, setBase] = useState("#e11d48");
  const [harmony, setHarmony] = useState("analogous");
  const [tokenName, setTokenName] = useState("brand");

  const updateColor = useCallback((index: number, value: string) => {
    setColors((prev) => {
      const next = [...prev];
      next[index] = isValidHex(value) ? normalizeHex(value) : value;
      return next;
    });
  }, []);

  const removeColor = (index: number) => {
    setColors((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const addColor = () => {
    setColors((prev) => (prev.length >= 12 ? prev : [...prev, randomHex()]));
  };

  const randomize = () => {
    const count = Math.max(4, colors.length);
    setColors(Array.from({ length: count }, () => randomHex()));
  };

  const generateFromBase = () => {
    const hex = isValidHex(base) ? normalizeHex(base) : "#e11d48";
    setBase(hex);
    setColors(generateHarmony(hex, harmony));
  };

  const validColors = colors.filter(isValidHex).map(normalizeHex);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm backdrop-blur-sm">
        <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/10 to-transparent px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Palette builder
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">
                Pick colors or randomize
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={randomize}
                className="rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white shadow-md shadow-rose-500/25"
              >
                <Dice5 className="h-4 w-4" />
                Random palette
              </Button>
              <Button type="button" variant="outline" className="rounded-full" onClick={addColor}>
                <Plus className="h-4 w-4" />
                Add color
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="flex h-20 overflow-hidden rounded-2xl border border-border/40 shadow-inner sm:h-28">
            {validColors.length > 0 ? (
              validColors.map((hex, i) => (
                <div
                  key={`${hex}-${i}`}
                  className="relative flex-1 transition-transform duration-300 hover:scale-[1.02] hover:z-10"
                  style={{ backgroundColor: hex }}
                  title={hex}
                  suppressHydrationWarning
                />
              ))
            ) : (
              <div className="flex flex-1 items-center justify-center bg-muted text-sm text-muted-foreground">
                Add or pick at least one valid color
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {colors.map((color, index) => {
              const hex = isValidHex(color) ? normalizeHex(color) : color;
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/80 p-3 transition-shadow hover:shadow-md hover:shadow-rose-500/10"
                >
                  <label className="relative mb-3 block h-16 cursor-pointer overflow-hidden rounded-xl border border-border/40">
                    <span
                      className="absolute inset-0"
                      style={{
                        backgroundColor: isValidHex(hex) ? normalizeHex(hex) : "#e11d48",
                      }}
                      suppressHydrationWarning
                    />
                    <input
                      type="color"
                      value={isValidHex(hex) ? normalizeHex(hex) : "#e11d48"}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      aria-label={`Pick color ${index + 1}`}
                    />
                    <span className="pointer-events-none absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm">
                      <Pipette className="h-3.5 w-3.5" />
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className={cn(
                        "h-9 font-mono text-xs",
                        !isValidHex(color) && color.length > 0 && "border-destructive"
                      )}
                      aria-label={`Hex for color ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                      onClick={() => removeColor(index)}
                      disabled={colors.length <= 1}
                      aria-label={`Remove color ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-dashed border-rose-500/25 bg-rose-500/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-rose-600 dark:text-rose-300" />
              Generate from a base color
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dev-base">Base</Label>
                <div className="flex gap-2">
                  <Input
                    id="dev-base"
                    type="color"
                    value={isValidHex(base) ? normalizeHex(base) : "#e11d48"}
                    onChange={(e) => setBase(e.target.value)}
                    className="h-10 w-14 cursor-pointer p-1"
                    aria-label="Base color picker"
                  />
                  <Input
                    value={base}
                    onChange={(e) => setBase(e.target.value)}
                    className="w-28 font-mono text-sm"
                    aria-label="Base color hex"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Harmony</Label>
                <Select value={harmony} onValueChange={setHarmony}>
                  <SelectTrigger className="w-48 rounded-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HARMONIES.map((h) => (
                      <SelectItem key={h.value} value={h.value}>
                        {h.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" variant="outline" className="rounded-full" onClick={generateFromBase}>
                <Palette className="h-4 w-4" />
                Build harmony
              </Button>
              <div className="space-y-1.5">
                <Label htmlFor="token-name">Token name</Label>
                <Input
                  id="token-name"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, "") || "brand")}
                  className="w-32"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {validColors.length > 0 && (
        <CodeExportPanel
          colors={validColors}
          name={tokenName || "brand"}
          initialFormat={initialFormat as CodeFormat | undefined}
        />
      )}
    </div>
  );
}
