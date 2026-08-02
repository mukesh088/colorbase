"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crop, Download, Eraser, Loader2, Sparkles, Upload, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PrimaryButton } from "@/components/tools/suite/workbench";
import {
  CROP_RATIOS,
  type CropRatioValue,
  type CropRect,
  centeredCrop,
  clampCrop,
  createSampleImageFile,
  downloadDataUrl,
  formatBytes,
  loadImageFromFile,
} from "@/lib/image-studio";
import { cn } from "@/lib/utils";

export function ImageStudioCrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{
    mode: "move" | "nw" | "ne" | "sw" | "se";
    startX: number;
    startY: number;
    origin: CropRect;
  } | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [display, setDisplay] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 200, h: 200 });
  const [ratio, setRatio] = useState<CropRatioValue>("free");
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [waveKey, setWaveKey] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

  const measureDisplay = () => {
    const el = imgRef.current;
    if (!el) return;
    setDisplay({ w: el.clientWidth, h: el.clientHeight });
  };

  useEffect(() => {
    if (!sourceUrl) return;
    const onResize = () => measureDisplay();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [sourceUrl]);

  const scaleX = display.w > 0 && natural.w > 0 ? display.w / natural.w : 1;
  const scaleY = display.h > 0 && natural.h > 0 ? display.h / natural.h : 1;
  const isCircle = ratio === "circle";

  const applyRatio = (value: CropRatioValue) => {
    setRatio(value);
    if (!natural.w) return;
    const item = CROP_RATIOS.find((r) => r.value === value);
    setCrop(centeredCrop(natural.w, natural.h, item?.ratio ?? null));
  };

  const onUpload = async (next: File) => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    const url = URL.createObjectURL(next);
    setSourceUrl(url);
    setFile(next);
    setPreview(null);
    try {
      const img = await loadImageFromFile(next);
      setNatural({ w: img.width, h: img.height });
      const item = CROP_RATIOS.find((r) => r.value === ratio);
      setCrop(centeredCrop(img.width, img.height, item?.ratio ?? null));
      requestAnimationFrame(() => measureDisplay());
      toast.success("Image loaded");
    } catch {
      toast.error("Could not load that image");
    }
  };

  const toDisplay = (rect: CropRect) => ({
    left: rect.x * scaleX,
    top: rect.y * scaleY,
    width: rect.w * scaleX,
    height: rect.h * scaleY,
  });

  const onPointerDown = (mode: "move" | "nw" | "ne" | "sw" | "se") => (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { mode, startX: e.clientX, startY: e.clientY, origin: { ...crop } };

    const handleMove = (ev: PointerEvent) => {
      if (!dragRef.current || !natural.w) return;
      const drag = dragRef.current;
      const dx = (ev.clientX - drag.startX) / scaleX;
      const dy = (ev.clientY - drag.startY) / scaleY;
      const aspect = CROP_RATIOS.find((r) => r.value === ratio)?.ratio ?? null;
      const origin = drag.origin;
      let next = { ...origin };

      if (drag.mode === "move") {
        next = { ...origin, x: origin.x + dx, y: origin.y + dy };
      } else {
        if (drag.mode.includes("w")) {
          next.x = origin.x + dx;
          next.w = origin.w - dx;
        }
        if (drag.mode.includes("e")) next.w = origin.w + dx;
        if (drag.mode.includes("n")) {
          next.y = origin.y + dy;
          next.h = origin.h - dy;
        }
        if (drag.mode.includes("s")) next.h = origin.h + dy;

        if (aspect) {
          if (drag.mode === "se" || drag.mode === "ne") {
            next.h = next.w / aspect;
            if (drag.mode === "ne") next.y = origin.y + origin.h - next.h;
          } else {
            next.w = next.h * aspect;
            if (drag.mode === "nw" || drag.mode === "sw") next.x = origin.x + origin.w - next.w;
            if (drag.mode === "nw") next.y = origin.y + origin.h - next.h;
          }
        }
      }
      setCrop(clampCrop(next, natural.w, natural.h));
    };

    const handleUp = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const applyCrop = async () => {
    if (!sourceUrl || !natural.w) {
      toast.error("Upload an image first");
      return;
    }
    setProcessing(true);
    setWaveKey((k) => k + 1);
    try {
      const img = new window.Image();
      img.src = sourceUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
      });
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const safe = clampCrop(crop, natural.w, natural.h);
      canvas.width = safe.w;
      canvas.height = safe.h;
      ctx.clearRect(0, 0, safe.w, safe.h);
      if (isCircle) {
        ctx.beginPath();
        ctx.arc(safe.w / 2, safe.h / 2, Math.min(safe.w, safe.h) / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      }
      ctx.drawImage(img, safe.x, safe.y, safe.w, safe.h, 0, 0, safe.w, safe.h);
      await new Promise((r) => setTimeout(r, 280));
      setPreview(canvas.toDataURL("image/png"));
      toast.success("Crop applied");
    } catch {
      toast.error("Crop failed");
    } finally {
      setProcessing(false);
    }
  };

  const box = toDisplay(crop);

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
        <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Workspace
              </p>
              <h2 className="font-display text-base font-semibold tracking-tight sm:text-lg">Image Crop</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Drag the frame, lock ratios or circle mask, then apply.
              </p>
            </div>
            <Badge variant="secondary" className="rounded-full">
              <Crop className="mr-1 h-3.5 w-3.5" />
              Local
            </Badge>
          </div>
        </div>
        <div className="space-y-4 p-3 sm:p-5">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) void onUpload(f);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-8 text-center transition",
              dragOver || file ? "border-rose-500/40 bg-rose-500/5" : "border-border/60 hover:bg-muted/30"
            )}
          >
            <Upload className="h-6 w-6 text-rose-500" />
            <span className="text-sm font-medium">{file ? file.name : "Drop or choose an image"}</span>
            <span className="text-xs text-muted-foreground">PNG, JPG, WebP</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && void onUpload(e.target.files[0])}
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 rounded-full"
              onClick={() => void createSampleImageFile().then(onUpload)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Sample
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 rounded-full"
              onClick={() => {
                if (sourceUrl) URL.revokeObjectURL(sourceUrl);
                setSourceUrl(null);
                setFile(null);
                setPreview(null);
                setNatural({ w: 0, h: 0 });
              }}
            >
              <Eraser className="h-3.5 w-3.5" />
              Clear
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Aspect ratio</Label>
            <div className="flex flex-wrap gap-1.5">
              {CROP_RATIOS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  disabled={!natural.w}
                  onClick={() => applyRatio(item.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40",
                    ratio === item.value
                      ? "border-rose-500/50 bg-rose-500 text-white"
                      : "border-border/60 bg-muted/30 hover:bg-muted/60"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {natural.w > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["x", "X"],
                  ["y", "Y"],
                  ["w", "Width"],
                  ["h", "Height"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-1">
                  <Label>{label}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={crop[key]}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      const aspect = CROP_RATIOS.find((r) => r.value === ratio)?.ratio;
                      setCrop((prev) => {
                        const next = { ...prev, [key]: value };
                        if (aspect && key === "w") next.h = value / aspect;
                        if (aspect && key === "h") next.w = value * aspect;
                        return clampCrop(next, natural.w, natural.h);
                      });
                    }}
                    className="h-9 rounded-xl"
                  />
                </div>
              ))}
            </div>
          )}

          {file && (
            <p className="text-[11px] text-muted-foreground">
              {natural.w}×{natural.h} · {formatBytes(file.size)} · Selection {crop.w}×{crop.h}
            </p>
          )}

          <canvas ref={canvasRef} className="hidden" aria-hidden />

          <PrimaryButton className="w-full sm:w-auto" disabled={!sourceUrl || processing} onClick={() => void applyCrop()}>
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cropping…
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Apply crop
              </>
            )}
          </PrimaryButton>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
        <AnimatePresence>
          {processing && (
            <motion.div
              key={waveKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-sm"
            >
              <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              <p className="text-sm font-medium">Applying crop…</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Result
              </p>
              <p className="text-sm font-semibold">{preview ? "Cropped output" : sourceUrl ? "Adjust frame" : "Crop studio"}</p>
            </div>
            {preview && (
              <Button
                type="button"
                size="sm"
                className="h-9 rounded-full"
                onClick={() => {
                  downloadDataUrl(preview, `crop-${crop.w}x${crop.h}.png`);
                  toast.success("Downloaded");
                }}
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-4 p-3 sm:p-5">
          {!sourceUrl ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 px-4 text-center text-sm text-muted-foreground">
              Upload an image to start cropping
            </div>
          ) : (
            <div className="mx-auto w-fit max-w-full rounded-2xl border border-border/50 bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.1),_transparent_55%)] p-3">
              <div className="relative inline-block max-w-full touch-none select-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={sourceUrl}
                  alt="Crop source"
                  className="block h-auto max-h-[22rem] w-auto max-w-full rounded-xl"
                  draggable={false}
                  onLoad={measureDisplay}
                />
                {display.w > 0 && (
                  <div
                    className={cn(
                      "absolute cursor-move border-2 border-rose-500 shadow-[0_0_0_9999px_rgba(15,15,20,0.45)]",
                      isCircle ? "rounded-full" : "rounded-sm"
                    )}
                    style={{
                      left: box.left,
                      top: box.top,
                      width: Math.max(box.width, 8),
                      height: Math.max(box.height, 8),
                    }}
                    onPointerDown={onPointerDown("move")}
                  >
                    {!isCircle && (
                      <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-80">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <span key={i} className="border border-white/30" />
                        ))}
                      </div>
                    )}
                    {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                      <button
                        key={corner}
                        type="button"
                        aria-label={`Resize ${corner}`}
                        className={cn(
                          "absolute z-10 h-3.5 w-3.5 rounded-full border-2 border-white bg-rose-500 shadow",
                          corner === "nw" && "-left-1.5 -top-1.5 cursor-nwse-resize",
                          corner === "ne" && "-right-1.5 -top-1.5 cursor-nesw-resize",
                          corner === "sw" && "-bottom-1.5 -left-1.5 cursor-nesw-resize",
                          corner === "se" && "-bottom-1.5 -right-1.5 cursor-nwse-resize"
                        )}
                        onPointerDown={onPointerDown(corner)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {preview && (
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-muted/15 p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Output
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Cropped"
                className={cn(
                  "mx-auto max-h-64 object-contain shadow-lg shadow-rose-500/10",
                  isCircle ? "rounded-full" : "rounded-xl"
                )}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
