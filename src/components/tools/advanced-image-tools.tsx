"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Download, Pipette, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeExportPanel } from "@/components/library/code-export-panel";
import { CopyButton } from "@/components/color/copy-button";
import { rgbToHex } from "@/lib/colors/convert";
import { exportPalette } from "@/lib/colors/export";
import { cn } from "@/lib/utils";

function quantize(imageData: ImageData, count: number) {
  const buckets = new Map<string, number>();
  const { data, width, height } = imageData;
  for (let i = 0; i < data.length; i += 12) {
    const a = data[i + 3];
    if (a < 128) continue;
    const hex = rgbToHex({
      r: Math.round(data[i] / 16) * 16,
      g: Math.round(data[i + 1] / 16) * 16,
      b: Math.round(data[i + 2] / 16) * 16,
    });
    buckets.set(hex, (buckets.get(hex) ?? 0) + 1);
  }
  const total = [...buckets.values()].reduce((s, n) => s + n, 0) || 1;
  const ranked = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, count);
  return {
    colors: ranked.map(([hex, n]) => ({ hex, pct: Math.round((n / total) * 1000) / 10 })),
    average: averageColor(imageData),
    background: detectBackground(imageData, width, height),
    histogram: buildHistogram(imageData),
  };
}

function averageColor(imageData: ImageData) {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 32) {
    if (data[i + 3] < 128) continue;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    n++;
  }
  if (!n) return "#000000";
  return rgbToHex({ r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) });
}

function detectBackground(imageData: ImageData, width: number, height: number) {
  const ctxBuckets = new Map<string, number>();
  const sample = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    return rgbToHex({
      r: Math.round(imageData.data[i] / 24) * 24,
      g: Math.round(imageData.data[i + 1] / 24) * 24,
      b: Math.round(imageData.data[i + 2] / 24) * 24,
    });
  };
  for (let x = 0; x < width; x += 8) {
    for (const y of [0, height - 1]) {
      const h = sample(x, y);
      ctxBuckets.set(h, (ctxBuckets.get(h) ?? 0) + 1);
    }
  }
  for (let y = 0; y < height; y += 8) {
    for (const x of [0, width - 1]) {
      const h = sample(x, y);
      ctxBuckets.set(h, (ctxBuckets.get(h) ?? 0) + 1);
    }
  }
  return [...ctxBuckets.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "#ffffff";
}

function buildHistogram(imageData: ImageData) {
  const bins = Array.from({ length: 16 }, () => 0);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 40) {
    if (data[i + 3] < 128) continue;
    const lum = Math.round((0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 16);
    bins[Math.min(15, lum)]++;
  }
  const max = Math.max(...bins, 1);
  return bins.map((v) => Math.round((v / max) * 100));
}

function MiniSwatch({
  hex,
  label,
  pct,
}: {
  hex: string;
  label?: string;
  pct?: number;
}) {
  return (
    <div className="group flex min-w-0 items-center gap-2.5 rounded-xl border border-border/40 bg-background/60 p-2 transition-colors hover:border-rose-500/30">
      <span
        className="h-10 w-10 shrink-0 rounded-lg border border-border/40 shadow-sm"
        style={{ backgroundColor: hex }}
        suppressHydrationWarning
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-xs font-medium">{hex}</p>
        <p className="text-[11px] text-muted-foreground">
          {label ?? (pct != null ? `${pct}% of image` : "")}
        </p>
      </div>
      <CopyButton value={hex} size="icon" variant="ghost" className="h-8 w-8 shrink-0 opacity-70 group-hover:opacity-100" />
    </div>
  );
}

export function AdvancedImageColorTools() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [count, setCount] = useState("10");
  const [result, setResult] = useState<ReturnType<typeof quantize> | null>(null);
  const [dragging, setDragging] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState(false);

  const analyze = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const max = 720;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setResult(quantize(imageData, Number(count)));
        setHasImage(true);
        setPicked(null);
        URL.revokeObjectURL(url);
        toast.success("Palette extracted");
      };
      img.src = url;
    },
    [count]
  );

  const gradientCss = useMemo(() => {
    if (!result?.colors.length) return "";
    return `linear-gradient(90deg, ${result.colors.map((c) => c.hex).join(", ")})`;
  }, [result]);

  const onPickPixel = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    setPicked(rgbToHex({ r, g, b }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        {/* Left: image */}
        <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm backdrop-blur-sm lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100dvh-5.5rem)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 px-4 py-3 sm:px-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Source
              </p>
              <h2 className="font-display text-lg font-semibold tracking-tight">Image</h2>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="extract-count" className="sr-only">
                Colors to extract
              </Label>
              <Select value={count} onValueChange={setCount}>
                <SelectTrigger id="extract-count" className="h-9 w-[7.5rem] rounded-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["5", "10", "20"].map((n) => (
                    <SelectItem key={n} value={n}>
                      Top {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <label
              className={cn(
                "flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center transition-colors",
                hasImage && "hidden",
                dragging
                  ? "border-rose-500 bg-rose-500/5"
                  : "border-border/70 bg-muted/20 hover:border-rose-500/40"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) analyze(file);
              }}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white shadow-lg shadow-rose-500/25">
                <Upload className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">Drag & drop an image</span>
              <span className="text-xs text-muted-foreground">or click to upload · PNG, JPG, WebP</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) analyze(file);
                }}
              />
              <Button type="button" variant="outline" className="mt-1 rounded-full" asChild>
                <span>Choose image</span>
              </Button>
            </label>

            <div className={cn(!hasImage && "sr-only")}>
              <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-muted/20">
                <canvas
                  ref={canvasRef}
                  className="mx-auto max-h-[min(58vh,520px)] w-full cursor-crosshair object-contain"
                  onClick={onPickPixel}
                  aria-label="Uploaded image — click to pick a pixel color"
                />
                {hasImage && (
                  <p className="flex items-center justify-center gap-1.5 border-t border-border/40 bg-background/70 px-3 py-2 text-[11px] text-muted-foreground">
                    <Pipette className="h-3.5 w-3.5" />
                    Click the image to pick a pixel color
                  </p>
                )}
              </div>
              {hasImage && (
                <label className="mt-3 inline-flex cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) analyze(file);
                    }}
                  />
                  <span className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium transition-colors hover:border-rose-500/40 hover:text-rose-700 dark:hover:text-rose-300">
                    <Upload className="h-3.5 w-3.5" />
                    Replace image
                  </span>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Right: extracted results */}
        <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm backdrop-blur-sm lg:max-h-[calc(100dvh-5.5rem)] lg:overflow-y-auto">
          <div className="sticky top-0 z-10 border-b border-border/40 bg-background/90 px-4 py-3 backdrop-blur-md sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Results
                </p>
                <h2 className="font-display text-lg font-semibold tracking-tight">Extracted colors</h2>
              </div>
              {result && (
                <div className="flex flex-wrap gap-2">
                  <CopyButton
                    value={result.colors.map((c) => c.hex).join(", ")}
                    label="Copy all"
                    className="h-8 rounded-full text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-full text-xs"
                    onClick={() =>
                      exportPalette(
                        result.colors.map((c) => ({ hex: c.hex })),
                        "json",
                        "image-palette"
                      )
                    }
                  >
                    <Download className="h-3.5 w-3.5" />
                    JSON
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5 p-4 sm:p-5">
            {!result ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/10 px-6 py-12 text-center">
                <p className="text-sm font-medium">No colors yet</p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  Upload an image on the left — the palette, average, and histogram appear here on
                  the same screen.
                </p>
              </div>
            ) : (
              <>
                {gradientCss && (
                  <div
                    className="h-12 overflow-hidden rounded-2xl border border-border/40 shadow-inner"
                    style={{ background: gradientCss }}
                    suppressHydrationWarning
                    aria-label="Palette preview strip"
                  />
                )}

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <MiniSwatch hex={result.average} label="Average" />
                  <MiniSwatch hex={result.background} label="Background" />
                  {picked && <MiniSwatch hex={picked} label="Picked pixel" />}
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold">Dominant palette</h3>
                  <div className="grid max-h-[min(42vh,360px)] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                    {result.colors.map((c) => (
                      <MiniSwatch key={c.hex} hex={c.hex} pct={c.pct} />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold">Luminance histogram</h3>
                  <div className="flex h-20 items-end gap-0.5 rounded-xl border border-border/40 bg-muted/20 p-2">
                    {result.histogram.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-rose-600 to-fuchsia-400"
                        style={{ height: `${Math.max(6, h)}%` }}
                        title={`Bin ${i}`}
                      />
                    ))}
                  </div>
                </div>

                {gradientCss && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">CSS gradient</h3>
                    <div className="flex gap-2">
                      <code className="max-h-20 flex-1 overflow-auto rounded-xl bg-muted/40 p-2 font-mono text-[10px] leading-relaxed">
                        background: {gradientCss};
                      </code>
                      <CopyButton value={`background: ${gradientCss};`} label="CSS" className="shrink-0" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {result && (
        <CodeExportPanel colors={result.colors.map((c) => c.hex)} name="image" />
      )}
    </div>
  );
}
