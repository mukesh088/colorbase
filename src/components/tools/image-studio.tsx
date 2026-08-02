"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Columns2,
  Download,
  Eraser,
  ImageIcon,
  Loader2,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CopyButton } from "@/components/color/copy-button";
import { PrimaryButton } from "@/components/tools/suite/workbench";
import { ImageStudioCrop } from "@/components/tools/image-studio-crop";
import { ImageStudioSvg } from "@/components/tools/image-studio-svg";
import {
  RESIZE_PRESETS,
  type ImageStudioMode,
  type OutputMime,
  blobToDataUrl,
  buildFilterCss,
  canvasToBlob,
  createSampleImageFile,
  defaultMimeForMode,
  downloadBlob,
  extForMime,
  extractColors,
  fitContain,
  fitCover,
  formatBytes,
  loadImageFromFile,
  modeHint,
  modeTitle,
  savingsPercent,
} from "@/lib/image-studio";
import { cn } from "@/lib/utils";

type FitMode = "stretch" | "contain" | "cover";
type CompareMode = "after" | "before" | "split";

type BatchItem = {
  id: string;
  file: File;
  status: "pending" | "done" | "error";
  previewUrl?: string;
  outBlob?: Blob;
  outName?: string;
  error?: string;
};

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return {
    r: parseInt(full.slice(0, 2), 16) || 0,
    g: parseInt(full.slice(2, 4), 16) || 0,
    b: parseInt(full.slice(4, 6), 16) || 0,
  };
}

export function ImageStudioTool({ mode }: { mode: ImageStudioMode }) {
  if (mode === "svg-optimizer") return <ImageStudioSvg />;
  if (mode === "image-crop") return <ImageStudioCrop />;
  return <ImageStudioRaster mode={mode} />;
}

function ImageStudioRaster({
  mode,
}: {
  mode: Exclude<ImageStudioMode, "svg-optimizer" | "image-crop">;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceMeta, setSourceMeta] = useState<{ w: number; h: number; size: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outBlob, setOutBlob] = useState<Blob | null>(null);
  const [outMeta, setOutMeta] = useState<{ w: number; h: number; size: number } | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [base64, setBase64] = useState("");
  const [processing, setProcessing] = useState(false);
  const [waveKey, setWaveKey] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [compare, setCompare] = useState<CompareMode>("after");
  const [batch, setBatch] = useState<BatchItem[]>([]);

  const [mime, setMime] = useState<OutputMime>(() => defaultMimeForMode(mode));
  const [quality, setQuality] = useState(0.82);
  const [maxEdge, setMaxEdge] = useState(0);
  const [jpgBg, setJpgBg] = useState("#ffffff");

  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [lockAspect, setLockAspect] = useState(true);
  const [fit, setFit] = useState<FitMode>("contain");
  const [scalePct, setScalePct] = useState(100);
  const aspectRef = useRef(16 / 9);

  const [blur, setBlur] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [grayscale, setGrayscale] = useState(0);

  const [rotate, setRotate] = useState(90);
  const [flip, setFlip] = useState<"h" | "v">("h");
  const [paletteCount, setPaletteCount] = useState(mode === "dominant-color-extractor" ? 5 : 8);

  const file = files[activeIdx] ?? null;
  const showQuality = mime === "image/jpeg" || mime === "image/webp";
  const showConvert =
    mode === "image-compressor" ||
    mode === "png-to-jpg" ||
    mode === "jpg-to-png" ||
    mode === "webp-converter" ||
    mode === "image-resizer" ||
    mode === "blur-image" ||
    mode === "rotate-image" ||
    mode === "flip-image" ||
    mode === "image-to-base64";
  const showPalette = mode === "dominant-color-extractor" || mode === "color-palette-from-image";
  const batchEnabled =
    mode === "image-compressor" ||
    mode === "webp-converter" ||
    mode === "png-to-jpg" ||
    mode === "jpg-to-png" ||
    mode === "image-resizer";

  useEffect(() => {
    setMime(defaultMimeForMode(mode));
    setPaletteCount(mode === "dominant-color-extractor" ? 5 : 8);
    setPreviewUrl(null);
    setOutBlob(null);
    setColors([]);
    setBase64("");
    setCompare("after");
  }, [mode]);

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

  const loadFiles = useCallback(
    async (list: File[]) => {
      const images = list.filter((f) => f.type.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(f.name));
      if (!images.length) {
        toast.error("Choose image files");
        return;
      }
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      setFiles(images);
      setActiveIdx(0);
      setBatch(
        batchEnabled
          ? images.map((f, i) => ({ id: `${f.name}-${i}`, file: f, status: "pending" as const }))
          : []
      );
      const first = images[0];
      const url = URL.createObjectURL(first);
      setSourceUrl(url);
      setPreviewUrl(null);
      setOutBlob(null);
      setColors([]);
      setBase64("");
      try {
        const img = await loadImageFromFile(first);
        aspectRef.current = img.width / Math.max(1, img.height);
        setSourceMeta({ w: img.width, h: img.height, size: first.size });
        if (mode === "image-resizer" && lockAspect) {
          setHeight(Math.max(1, Math.round(width / aspectRef.current)));
        }
        toast.success(images.length > 1 ? `Loaded ${images.length} images` : "Image loaded");
      } catch {
        toast.error("Could not load image");
      }
    },
    [batchEnabled, lockAspect, mode, sourceUrl, width]
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith("image/"));
      const f = item?.getAsFile();
      if (f) void loadFiles([f]);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [loadFiles]);

  useEffect(() => {
    if (!files[activeIdx]) return;
    const f = files[activeIdx];
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    const url = URL.createObjectURL(f);
    setSourceUrl(url);
    setPreviewUrl(null);
    setOutBlob(null);
    void loadImageFromFile(f).then((img) => {
      aspectRef.current = img.width / Math.max(1, img.height);
      setSourceMeta({ w: img.width, h: img.height, size: f.size });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  const processOne = useCallback(
    async (input: File) => {
      const img = await loadImageFromFile(input);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");

      let outW = img.width;
      let outH = img.height;
      let draw = () => {
        ctx.drawImage(img, 0, 0, outW, outH);
      };

      if (mode === "image-resizer") {
        const targetW = Math.max(1, Math.round(width * (scalePct / 100)));
        const targetH = Math.max(1, Math.round(height * (scalePct / 100)));
        if (fit === "stretch") {
          outW = targetW;
          outH = targetH;
          canvas.width = outW;
          canvas.height = outH;
          draw = () => ctx.drawImage(img, 0, 0, outW, outH);
        } else if (fit === "contain") {
          const sized = fitContain(img.width, img.height, targetW, targetH);
          outW = targetW;
          outH = targetH;
          canvas.width = outW;
          canvas.height = outH;
          if (mime === "image/jpeg") {
            const { r, g, b } = hexToRgb(jpgBg);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(0, 0, outW, outH);
          }
          const dx = Math.round((outW - sized.w) / 2);
          const dy = Math.round((outH - sized.h) / 2);
          draw = () => ctx.drawImage(img, dx, dy, sized.w, sized.h);
        } else {
          const cover = fitCover(img.width, img.height, targetW, targetH);
          outW = targetW;
          outH = targetH;
          canvas.width = outW;
          canvas.height = outH;
          draw = () => ctx.drawImage(img, cover.sx, cover.sy, cover.sw, cover.sh, 0, 0, outW, outH);
        }
      } else if (mode === "rotate-image") {
        const rad = (rotate * Math.PI) / 180;
        const cos = Math.abs(Math.cos(rad));
        const sin = Math.abs(Math.sin(rad));
        outW = Math.round(img.width * cos + img.height * sin);
        outH = Math.round(img.width * sin + img.height * cos);
        canvas.width = outW;
        canvas.height = outH;
        draw = () => {
          ctx.translate(outW / 2, outH / 2);
          ctx.rotate(rad);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
        };
      } else if (mode === "flip-image") {
        canvas.width = outW;
        canvas.height = outH;
        draw = () => {
          ctx.translate(flip === "h" ? outW : 0, flip === "v" ? outH : 0);
          ctx.scale(flip === "h" ? -1 : 1, flip === "v" ? -1 : 1);
          ctx.drawImage(img, 0, 0, outW, outH);
        };
      } else if (mode === "blur-image") {
        let w = img.width;
        let h = img.height;
        if (maxEdge > 0 && Math.max(w, h) > maxEdge) {
          const s = maxEdge / Math.max(w, h);
          w = Math.round(w * s);
          h = Math.round(h * s);
        }
        outW = w;
        outH = h;
        canvas.width = outW;
        canvas.height = outH;
        const filter = buildFilterCss({ blur, brightness, contrast, saturate, grayscale });
        draw = () => {
          ctx.filter = filter;
          ctx.drawImage(img, 0, 0, outW, outH);
          ctx.filter = "none";
        };
      } else {
        let w = img.width;
        let h = img.height;
        if (maxEdge > 0 && Math.max(w, h) > maxEdge) {
          const s = maxEdge / Math.max(w, h);
          w = Math.round(w * s);
          h = Math.round(h * s);
        }
        outW = w;
        outH = h;
        canvas.width = outW;
        canvas.height = outH;
        if (mime === "image/jpeg") {
          const { r, g, b } = hexToRgb(jpgBg);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(0, 0, outW, outH);
        }
        draw = () => ctx.drawImage(img, 0, 0, outW, outH);
      }

      if (canvas.width === 0) {
        canvas.width = outW;
        canvas.height = outH;
      }
      draw();

      const palette =
        showPalette ? extractColors(ctx, canvas.width, canvas.height, paletteCount) : [];

      const blob = await canvasToBlob(canvas, mime, quality);
      const dataUrl = await blobToDataUrl(blob);
      return {
        blob,
        dataUrl,
        w: canvas.width,
        h: canvas.height,
        colors: palette,
      };
    },
    [
      blur,
      brightness,
      contrast,
      fit,
      flip,
      grayscale,
      height,
      jpgBg,
      maxEdge,
      mime,
      mode,
      paletteCount,
      quality,
      rotate,
      saturate,
      scalePct,
      showPalette,
      width,
    ]
  );

  const process = useCallback(async () => {
    if (!file) {
      toast.error("Upload an image first");
      return;
    }
    setProcessing(true);
    setWaveKey((k) => k + 1);
    await new Promise((r) => setTimeout(r, 280));
    try {
      const result = await processOne(file);
      setPreviewUrl(result.dataUrl);
      setOutBlob(result.blob);
      setOutMeta({ w: result.w, h: result.h, size: result.blob.size });
      setColors(result.colors);
      if (mode === "image-to-base64") setBase64(result.dataUrl);
      else setBase64("");
      toast.success("Processed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Processing failed");
    } finally {
      setProcessing(false);
    }
  }, [file, mode, processOne]);

  const processBatch = useCallback(async () => {
    if (!batch.length) {
      toast.error("Upload multiple images for batch");
      return;
    }
    setProcessing(true);
    setWaveKey((k) => k + 1);
    const next = [...batch];
    for (let i = 0; i < next.length; i++) {
      try {
        const result = await processOne(next[i].file);
        next[i] = {
          ...next[i],
          status: "done",
          previewUrl: result.dataUrl,
          outBlob: result.blob,
          outName: `${next[i].file.name.replace(/\.[^.]+$/, "")}.${extForMime(mime)}`,
        };
      } catch (e) {
        next[i] = {
          ...next[i],
          status: "error",
          error: e instanceof Error ? e.message : "Failed",
        };
      }
      setBatch([...next]);
    }
    setProcessing(false);
    toast.success("Batch complete");
  }, [batch, mime, processOne]);

  const downloadAllBatch = () => {
    const done = batch.filter((b) => b.outBlob && b.outName);
    if (!done.length) {
      toast.error("Nothing to download");
      return;
    }
    done.forEach((b, i) => {
      window.setTimeout(() => {
        if (b.outBlob && b.outName) downloadBlob(b.outBlob, b.outName);
      }, i * 200);
    });
    toast.success(`Downloading ${done.length} files`);
  };

  const cssSnippet = useMemo(() => {
    if (!base64) return "";
    return `.hero {\n  background-image: url("${base64}");\n  background-size: cover;\n}`;
  }, [base64]);

  const htmlSnippet = useMemo(() => {
    if (!base64) return "";
    return `<img src="${base64}" alt="" />`;
  }, [base64]);

  const savings =
    sourceMeta && outMeta ? savingsPercent(sourceMeta.size, outMeta.size) : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
          <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Workspace
                </p>
                <h2 className="font-display text-base font-semibold tracking-tight sm:text-lg">
                  {modeTitle(mode)}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{modeHint(mode)}</p>
              </div>
              <Badge variant="secondary" className="rounded-full">
                <ImageIcon className="mr-1 h-3.5 w-3.5" />
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
                void loadFiles([...e.dataTransfer.files]);
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-8 text-center transition",
                dragOver || file ? "border-rose-500/40 bg-rose-500/5" : "border-border/60 hover:bg-muted/30"
              )}
            >
              <Upload className="h-6 w-6 text-rose-500" />
              <span className="text-sm font-medium">
                {file ? file.name : batchEnabled ? "Drop images (batch supported)" : "Drop or choose an image"}
              </span>
              <span className="text-xs text-muted-foreground">Paste from clipboard · PNG JPG WebP</span>
              <input
                type="file"
                accept="image/*"
                multiple={batchEnabled}
                className="hidden"
                onChange={(e) => e.target.files && void loadFiles([...e.target.files])}
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 rounded-full"
                onClick={() => void createSampleImageFile().then((f) => loadFiles([f]))}
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
                  setFiles([]);
                  setSourceUrl(null);
                  setPreviewUrl(null);
                  setOutBlob(null);
                  setSourceMeta(null);
                  setOutMeta(null);
                  setColors([]);
                  setBase64("");
                  setBatch([]);
                }}
              >
                <Eraser className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>

            {files.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {files.map((f, i) => (
                  <button
                    key={`${f.name}-${i}`}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className={cn(
                      "max-w-[9rem] truncate rounded-full border px-2.5 py-1 text-[11px] font-medium",
                      i === activeIdx
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30"
                    )}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}

            {sourceMeta && (
              <p className="text-[11px] text-muted-foreground">
                Source {sourceMeta.w}×{sourceMeta.h} · {formatBytes(sourceMeta.size)}
              </p>
            )}

            {showConvert && (
              <div className="space-y-2">
                <Label>Output format</Label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["image/jpeg", "JPEG"],
                      ["image/png", "PNG"],
                      ["image/webp", "WebP"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setMime(id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium",
                        mime === id
                          ? "border-rose-500/50 bg-rose-500 text-white"
                          : "border-border/60 bg-muted/30 hover:bg-muted/60"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showQuality && (
              <div className="space-y-1.5">
                <Label>Quality · {Math.round(quality * 100)}%</Label>
                <Slider min={0.1} max={1} step={0.05} value={[quality]} onValueChange={([n]) => setQuality(n)} />
              </div>
            )}

            {(mode === "image-compressor" ||
              mode === "webp-converter" ||
              mode === "png-to-jpg" ||
              mode === "blur-image") && (
              <div className="space-y-1.5">
                <Label>Max edge (0 = original) · {maxEdge || "off"}</Label>
                <Slider min={0} max={4096} step={64} value={[maxEdge]} onValueChange={([n]) => setMaxEdge(n)} />
              </div>
            )}

            {mime === "image/jpeg" && (
              <div className="space-y-1.5">
                <Label>JPEG background</Label>
                <Input type="color" value={jpgBg} onChange={(e) => setJpgBg(e.target.value)} className="h-10 w-full p-1" />
              </div>
            )}

            {mode === "image-resizer" && (
              <>
                <div className="space-y-2">
                  <Label>Presets</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {RESIZE_PRESETS.filter((p) => p.id !== "custom").map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setWidth(p.w);
                          setHeight(p.h);
                          aspectRef.current = p.w / p.h;
                        }}
                        className="rounded-full border border-border/60 px-2.5 py-1 text-[11px] font-medium hover:bg-muted/50"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Width</Label>
                    <Input
                      type="number"
                      min={1}
                      value={width}
                      onChange={(e) => {
                        const w = Number(e.target.value);
                        setWidth(w);
                        if (lockAspect) setHeight(Math.max(1, Math.round(w / aspectRef.current)));
                      }}
                      className="h-9 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Height</Label>
                    <Input
                      type="number"
                      min={1}
                      value={height}
                      onChange={(e) => {
                        const h = Number(e.target.value);
                        setHeight(h);
                        if (lockAspect) setWidth(Math.max(1, Math.round(h * aspectRef.current)));
                      }}
                      className="h-9 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setLockAspect((v) => !v)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium",
                      lockAspect ? "border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-300" : "border-border/60"
                    )}
                  >
                    Lock aspect {lockAspect ? "on" : "off"}
                  </button>
                </div>
                <div className="space-y-2">
                  <Label>Fit mode</Label>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["contain", "Contain"],
                        ["cover", "Cover"],
                        ["stretch", "Stretch"],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setFit(id)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium",
                          fit === id
                            ? "border-rose-500/50 bg-rose-500 text-white"
                            : "border-border/60 bg-muted/30"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Scale · {scalePct}%</Label>
                  <Slider min={10} max={200} step={5} value={[scalePct]} onValueChange={([n]) => setScalePct(n)} />
                </div>
              </>
            )}

            {mode === "blur-image" && (
              <>
                <div className="space-y-1.5">
                  <Label>Blur · {blur}px</Label>
                  <Slider min={0} max={24} value={[blur]} onValueChange={([n]) => setBlur(n)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Brightness · {brightness}%</Label>
                  <Slider min={20} max={200} value={[brightness]} onValueChange={([n]) => setBrightness(n)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Contrast · {contrast}%</Label>
                  <Slider min={20} max={200} value={[contrast]} onValueChange={([n]) => setContrast(n)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Saturate · {saturate}%</Label>
                  <Slider min={0} max={200} value={[saturate]} onValueChange={([n]) => setSaturate(n)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Grayscale · {grayscale}%</Label>
                  <Slider min={0} max={100} value={[grayscale]} onValueChange={([n]) => setGrayscale(n)} />
                </div>
              </>
            )}

            {mode === "rotate-image" && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {[90, 180, 270].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRotate(n)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium",
                        rotate === n
                          ? "border-rose-500/50 bg-rose-500 text-white"
                          : "border-border/60 bg-muted/30"
                      )}
                    >
                      {n}°
                    </button>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <Label>Angle · {rotate}°</Label>
                  <Slider min={0} max={360} step={1} value={[rotate]} onValueChange={([n]) => setRotate(n)} />
                </div>
              </div>
            )}

            {mode === "flip-image" && (
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["h", "Horizontal"],
                    ["v", "Vertical"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFlip(id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium",
                      flip === id
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {showPalette && (
              <>
                <div className="space-y-1.5">
                  <Label>Color count · {paletteCount}</Label>
                  <Slider min={3} max={12} value={[paletteCount]} onValueChange={([n]) => setPaletteCount(n)} />
                </div>
                <Link
                  href="/image-palette-extractor"
                  className="inline-flex text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
                >
                  Open advanced palette extractor →
                </Link>
              </>
            )}

            <div className="flex flex-wrap gap-2">
              <PrimaryButton disabled={processing || !file} onClick={() => void process()}>
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Process
                  </>
                )}
              </PrimaryButton>
              {batchEnabled && batch.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  disabled={processing}
                  onClick={() => void processBatch()}
                >
                  Process batch ({batch.length})
                </Button>
              )}
            </div>
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
                <p className="text-sm font-medium">Processing…</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Result
                </p>
                <p className="text-sm font-semibold">
                  {outMeta
                    ? `${outMeta.w}×${outMeta.h} · ${formatBytes(outMeta.size)}${
                        savings !== null ? ` · ${savings > 0 ? "−" : "+"}${Math.abs(savings)}%` : ""
                      }`
                    : "Preview"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {previewUrl && sourceUrl && (
                  <div className="flex rounded-full border border-border/60 p-0.5">
                    {(
                      [
                        ["after", "After"],
                        ["before", "Before"],
                        ["split", "Split"],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setCompare(id)}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-medium",
                          compare === id ? "bg-rose-500 text-white" : "text-muted-foreground"
                        )}
                      >
                        {id === "split" ? <Columns2 className="mr-1 inline h-3 w-3" /> : null}
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                {outBlob && (
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 rounded-full"
                    onClick={() => {
                      downloadBlob(
                        outBlob,
                        `${(file?.name ?? "image").replace(/\.[^.]+$/, "")}.${extForMime(mime)}`
                      );
                      toast.success("Downloaded");
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 p-3 sm:p-5">
            {!previewUrl && !colors.length && !base64 ? (
              <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 px-4 text-center text-sm text-muted-foreground">
                {sourceUrl ? "Press Process to generate output" : "Upload an image to begin"}
              </div>
            ) : (
              <>
                {(previewUrl || sourceUrl) && (
                  <div className="overflow-hidden rounded-2xl border border-border/50 bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.1),_transparent_55%)] p-4">
                    {compare === "split" && previewUrl && sourceUrl ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={sourceUrl} alt="Before" className="mx-auto max-h-72 rounded-xl object-contain" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={previewUrl} alt="After" className="mx-auto max-h-72 rounded-xl object-contain" />
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={compare === "before" && sourceUrl ? sourceUrl : previewUrl ?? sourceUrl ?? ""}
                        alt="Preview"
                        className="mx-auto max-h-80 rounded-xl object-contain shadow-lg shadow-rose-500/10"
                      />
                    )}
                  </div>
                )}

                {showPalette && colors.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">
                        {mode === "dominant-color-extractor" ? "Dominant colors" : "Palette"}
                      </p>
                      <CopyButton value={colors.join(", ")} label="Copy all" className="h-8 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {colors.map((c, i) => (
                        <div
                          key={`${c}-${i}`}
                          className="overflow-hidden rounded-2xl border border-border/50 bg-muted/20"
                        >
                          <div className="h-16 w-full" style={{ backgroundColor: c }} />
                          <div className="flex items-center justify-between gap-1 px-2.5 py-2">
                            <p className="font-mono text-[11px] font-medium">{c}</p>
                            <CopyButton value={c} label="Copy" className="h-7 rounded-full px-2 text-[10px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mode === "image-to-base64" && base64 && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <CopyButton value={base64} label="Copy data URL" className="h-8 rounded-full" />
                      <CopyButton value={cssSnippet} label="Copy CSS" className="h-8 rounded-full" />
                      <CopyButton value={htmlSnippet} label="Copy HTML" className="h-8 rounded-full" />
                    </div>
                    <pre className="max-h-40 overflow-auto rounded-2xl border border-border/50 bg-[#0d1117] p-3 font-mono text-[10px] leading-relaxed break-all whitespace-pre-wrap text-[#e6edf3]">
                      {base64}
                    </pre>
                  </div>
                )}
              </>
            )}

            {batch.length > 1 && (
              <div className="space-y-2 rounded-2xl border border-border/50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">Batch queue</p>
                  <Button type="button" size="sm" variant="outline" className="h-8 rounded-full" onClick={downloadAllBatch}>
                    <Download className="h-3.5 w-3.5" />
                    Download all
                  </Button>
                </div>
                <ul className="max-h-40 space-y-1 overflow-auto text-xs">
                  {batch.map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted/20 px-2 py-1.5">
                      <span className="truncate">{b.file.name}</span>
                      <span className="shrink-0 text-muted-foreground">{b.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" aria-hidden />
    </div>
  );
}
