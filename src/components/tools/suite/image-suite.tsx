"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Crop, Download, ImageIcon, Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ToolWorkbench, ActionRow, PrimaryButton } from "./workbench";
import { CopyButton } from "@/components/color/copy-button";
import { rgbToHex } from "@/lib/colors/convert";
import { minifyCss } from "./helpers";
import type { ImageSuiteMode } from "@/lib/suite-modes";
import { cn } from "@/lib/utils";

export type { ImageSuiteMode };
export { isImageSuite } from "@/lib/suite-modes";

const MODE_META: Record<ImageSuiteMode, { title: string; hint: string }> = {
  "image-compressor": { title: "Compressor", hint: "Shrink JPEG size with adjustable quality." },
  "image-resizer": { title: "Resizer", hint: "Scale images to exact width and height." },
  "png-to-jpg": { title: "PNG → JPG", hint: "Convert PNG uploads to JPEG." },
  "jpg-to-png": { title: "JPG → PNG", hint: "Convert JPEG uploads to PNG." },
  "webp-converter": { title: "WebP", hint: "Export images as modern WebP." },
  "svg-optimizer": { title: "SVG optimizer", hint: "Minify SVG markup for smaller files." },
  "blur-image": { title: "Blur", hint: "Apply a soft blur filter to your image." },
  "image-crop": { title: "Crop", hint: "Drag the frame, pick a ratio, then apply a precise crop." },
  "rotate-image": { title: "Rotate", hint: "Rotate by 90°, 180°, or 270°." },
  "flip-image": { title: "Flip", hint: "Mirror horizontally or vertically." },
  "dominant-color-extractor": { title: "Dominant colors", hint: "Pull the strongest colors from an image." },
  "color-palette-from-image": { title: "Image palette", hint: "Build a palette from photo colors." },
  "image-to-base64": { title: "Base64", hint: "Encode an image as a data URL." },
};

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

function extractColors(ctx: CanvasRenderingContext2D, w: number, h: number, count: number) {
  const data = ctx.getImageData(0, 0, w, h).data;
  const buckets = new Map<string, number>();
  for (let i = 0; i < data.length; i += 16) {
    if (data[i + 3] < 128) continue;
    const hex = rgbToHex({
      r: Math.round(data[i] / 16) * 16,
      g: Math.round(data[i + 1] / 16) * 16,
      b: Math.round(data[i + 2] / 16) * 16,
    });
    buckets.set(hex, (buckets.get(hex) ?? 0) + 1);
  }
  return [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, count).map(([hex]) => hex);
}

function ResultsPanel({
  title,
  subtitle,
  actions,
  children,
  empty,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
            Result
          </p>
          <p className="text-sm font-semibold">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="p-4 sm:p-5">
        {empty ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/15 px-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
              <ImageIcon className="h-5 w-5" />
            </div>
            <p className="font-display text-lg font-semibold tracking-tight">Upload to begin</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Drop an image on the left, tweak controls, then process for a crisp animated preview.
            </p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

const CROP_RATIOS = [
  { value: "free", label: "Free", ratio: null as number | null },
  { value: "1:1", label: "1:1", ratio: 1 },
  { value: "4:3", label: "4:3", ratio: 4 / 3 },
  { value: "3:2", label: "3:2", ratio: 3 / 2 },
  { value: "16:9", label: "16:9", ratio: 16 / 9 },
  { value: "9:16", label: "9:16", ratio: 9 / 16 },
] as const;

type CropRatioValue = (typeof CROP_RATIOS)[number]["value"];

type CropRect = { x: number; y: number; w: number; h: number };

function clampCrop(rect: CropRect, natW: number, natH: number): CropRect {
  const w = Math.max(8, Math.min(rect.w, natW));
  const h = Math.max(8, Math.min(rect.h, natH));
  const x = Math.max(0, Math.min(rect.x, natW - w));
  const y = Math.max(0, Math.min(rect.y, natH - h));
  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
}

function centeredCrop(natW: number, natH: number, ratio: number | null): CropRect {
  if (!ratio) {
    const w = Math.round(natW * 0.7);
    const h = Math.round(natH * 0.7);
    return clampCrop({ x: (natW - w) / 2, y: (natH - h) / 2, w, h }, natW, natH);
  }
  let w = natW * 0.8;
  let h = w / ratio;
  if (h > natH * 0.8) {
    h = natH * 0.8;
    w = h * ratio;
  }
  return clampCrop({ x: (natW - w) / 2, y: (natH - h) / 2, w, h }, natW, natH);
}

function ImageCropTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{
    mode: "move" | "nw" | "ne" | "sw" | "se";
    startX: number;
    startY: number;
    origin: CropRect;
  } | null>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [display, setDisplay] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 200, h: 200 });
  const [ratio, setRatio] = useState<CropRatioValue>("free");
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [waveKey, setWaveKey] = useState(0);

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

  const applyRatio = (value: CropRatioValue) => {
    setRatio(value);
    if (!natural.w) return;
    const item = CROP_RATIOS.find((r) => r.value === value);
    setCrop(centeredCrop(natural.w, natural.h, item?.ratio ?? null));
  };

  const onUpload = async (file: File) => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    const url = URL.createObjectURL(file);
    setSourceUrl(url);
    setFileName(file.name);
    setPreview(null);
    try {
      const img = await loadImage(file);
      setNatural({ w: img.width, h: img.height });
      const item = CROP_RATIOS.find((r) => r.value === ratio);
      setCrop(centeredCrop(img.width, img.height, item?.ratio ?? null));
      requestAnimationFrame(() => measureDisplay());
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
    dragRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      origin: { ...crop },
    };

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
        if (drag.mode.includes("e")) {
          next.w = origin.w + dx;
        }
        if (drag.mode.includes("n")) {
          next.y = origin.y + dy;
          next.h = origin.h - dy;
        }
        if (drag.mode.includes("s")) {
          next.h = origin.h + dy;
        }

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
      ctx.drawImage(img, safe.x, safe.y, safe.w, safe.h, 0, 0, safe.w, safe.h);
      await new Promise((r) => setTimeout(r, 350));
      setPreview(canvas.toDataURL("image/png"));
      toast.success("Crop applied");
    } catch {
      toast.error("Crop failed");
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!preview) return;
    const a = document.createElement("a");
    a.href = preview;
    a.download = `crop-${crop.w}x${crop.h}.png`;
    a.click();
  };

  const box = toDisplay(crop);

  return (
    <ToolWorkbench
      title="Crop"
      hint="Drag the frame or use handles, choose a ratio, then apply."
      controls={
        <div className="space-y-4">
          <label
            className={cn(
              "group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-4 py-8 text-center transition",
              fileName
                ? "border-rose-500/35 bg-rose-500/5"
                : "border-border/70 hover:border-rose-500/40 hover:bg-rose-500/[0.03]"
            )}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
              <Upload className="h-5 w-5" />
            </span>
            <span className="space-y-1">
              <span className="block text-sm font-semibold">{fileName ? "Replace image" : "Upload an image"}</span>
              <span className="block text-xs text-muted-foreground">{fileName ?? "PNG, JPG, WebP"}</span>
            </span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => e.target.files?.[0] && void onUpload(e.target.files[0])}
            />
          </label>

          <div className="space-y-1.5">
            <Label>Aspect ratio</Label>
            <div className="flex flex-wrap gap-1.5">
              {CROP_RATIOS.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  size="sm"
                  variant={ratio === item.value ? "default" : "outline"}
                  className="h-8 rounded-full"
                  onClick={() => applyRatio(item.value)}
                  disabled={!natural.w}
                >
                  {item.label}
                </Button>
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
                  />
                </div>
              ))}
            </div>
          )}

          {natural.w > 0 && (
            <div className="rounded-2xl border border-border/50 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              Image {natural.w}×{natural.h} · Selection {crop.w}×{crop.h}px
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" aria-hidden />

          <ActionRow>
            <PrimaryButton onClick={applyCrop} disabled={!sourceUrl || processing} className="min-w-32">
              {processing ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Cropping…
                </>
              ) : (
                <>
                  <Crop className="h-4 w-4" />
                  Apply crop
                </>
              )}
            </PrimaryButton>
            {preview && (
              <Button type="button" variant="outline" className="rounded-full" onClick={download}>
                <Download className="h-4 w-4" />
                Download
              </Button>
            )}
          </ActionRow>
        </div>
      }
      preview={
        <ResultsPanel
          title={
            processing
              ? "Applying crop…"
              : preview
                ? "Cropped result"
                : sourceUrl
                  ? "Adjust the frame"
                  : "Crop studio"
          }
          subtitle={
            preview
              ? `${crop.w}×${crop.h}px`
              : natural.w
                ? `Source ${natural.w}×${natural.h}`
                : undefined
          }
          empty={!sourceUrl && !processing}
          actions={
            preview ? (
              <Button type="button" size="sm" className="h-9 rounded-full" onClick={download}>
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            ) : undefined
          }
        >
          <div className="space-y-4">
            {sourceUrl && (
              <div
                className={cn(
                  "mx-auto w-fit max-w-full rounded-2xl border border-border/50 bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.1),_transparent_55%)] p-3",
                  processing && "blog-title-pulse"
                )}
              >
                <div ref={stageRef} className="relative inline-block max-w-full touch-none select-none">
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
                      className="absolute cursor-move rounded-sm border-2 border-rose-500 shadow-[0_0_0_9999px_rgba(15,15,20,0.45)]"
                      style={{
                        left: box.left,
                        top: box.top,
                        width: Math.max(box.width, 8),
                        height: Math.max(box.height, 8),
                      }}
                      onPointerDown={onPointerDown("move")}
                    >
                      <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-80">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <span key={i} className="border border-white/30" />
                        ))}
                      </div>
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
              <div
                key={waveKey}
                className={cn(
                  "overflow-hidden rounded-2xl border border-border/50 bg-muted/15 p-4",
                  processing ? "blog-title-pulse" : "animate-rise blog-title-card"
                )}
              >
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Output
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Cropped"
                  className="mx-auto max-h-64 rounded-xl object-contain shadow-lg shadow-rose-500/10"
                />
              </div>
            )}
          </div>
        </ResultsPanel>
      }
    />
  );
}

function sanitizeSvgMarkup(raw: string) {
  return raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/href\s*=\s*("|')\s*javascript:[^"']*\1/gi, 'href="#"')
    .replace(/xlink:href\s*=\s*("|')\s*javascript:[^"']*\1/gi, 'xlink:href="#"');
}

function SvgOptimizerTool() {
  const [svgIn, setSvgIn] = useState(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <!-- optimize me -->\n  <circle cx="50" cy="50" r="40" fill="#e11d48" />\n</svg>`
  );
  const [out, setOut] = useState("");
  const [generating, setGenerating] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [waveKey, setWaveKey] = useState(0);

  const optimize = () => {
    if (generating) return;
    setGenerating(true);
    setWaveKey((k) => k + 1);
    window.setTimeout(() => {
      const optimized = minifyCss(sanitizeSvgMarkup(svgIn))
        .replace(/>\s+</g, "><")
        .replace(/<!--[\s\S]*?-->/g, "");
      setOut(optimized);
      setHasResult(true);
      setGenerating(false);
      toast.success("SVG optimized");
    }, 450);
  };

  const saved = hasResult ? Math.max(0, svgIn.length - out.length) : 0;
  const previewSvg = sanitizeSvgMarkup(out || svgIn);

  return (
    <ToolWorkbench
      title={MODE_META["svg-optimizer"].title}
      hint={MODE_META["svg-optimizer"].hint}
      controls={
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>SVG markup</Label>
            <Textarea
              value={svgIn}
              onChange={(e) => setSvgIn(e.target.value)}
              rows={14}
              className="font-mono text-xs leading-relaxed"
            />
          </div>
          <ActionRow>
            <PrimaryButton onClick={optimize} disabled={generating || !svgIn.trim()} className="min-w-32">
              {generating ? "Optimizing…" : "Optimize SVG"}
            </PrimaryButton>
          </ActionRow>
        </div>
      }
      preview={
        <ResultsPanel
          title={generating ? "Optimizing…" : hasResult ? "Optimized SVG" : "Preview"}
          subtitle={hasResult ? `Saved ${saved.toLocaleString()} chars` : undefined}
          empty={!hasResult && !generating}
          actions={hasResult ? <CopyButton value={out} label="Copy SVG" className="h-9 rounded-full" /> : undefined}
        >
          <div
            key={waveKey}
            className={cn(
              "space-y-4",
              generating ? "blog-title-pulse" : "animate-rise blog-title-card"
            )}
          >
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.1),_transparent_55%)] p-6">
              <div
                className="mx-auto flex h-40 max-w-full items-center justify-center [&_svg]:max-h-36 [&_svg]:max-w-full"
                dangerouslySetInnerHTML={{ __html: previewSvg }}
              />
            </div>
            <pre className="max-h-56 overflow-auto rounded-2xl border border-border/50 bg-muted/20 p-4 font-mono text-[11px] leading-relaxed">
              {out}
            </pre>
          </div>
        </ResultsPanel>
      }
    />
  );
}

function RasterImageTool({
  mode,
}: {
  mode: Exclude<ImageSuiteMode, "svg-optimizer" | "image-crop">;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [waveKey, setWaveKey] = useState(0);
  const [quality, setQuality] = useState(0.8);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [blur, setBlur] = useState(4);
  const [rotate, setRotate] = useState(90);
  const [flip, setFlip] = useState<"h" | "v">("h");
  const [colors, setColors] = useState<string[]>([]);
  const [base64, setBase64] = useState("");
  const [meta, setMeta] = useState<{ w: number; h: number; size?: string } | null>(null);

  const metaInfo = MODE_META[mode];
  const showQuality = mode === "image-compressor" || mode === "png-to-jpg" || mode === "webp-converter";
  const showPalette = mode === "dominant-color-extractor" || mode === "color-palette-from-image";

  useEffect(() => {
    return () => {
      if (sourcePreview) URL.revokeObjectURL(sourcePreview);
    };
  }, [sourcePreview]);

  const processFile = async (file: File) => {
    setProcessing(true);
    setWaveKey((k) => k + 1);
    try {
      const img = await loadImage(file);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let w = img.width;
      let h = img.height;

      if (mode === "image-resizer") {
        w = Math.max(1, width);
        h = Math.max(1, height);
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mode === "rotate-image") {
        const rad = (rotate * Math.PI) / 180;
        const cos = Math.abs(Math.cos(rad));
        const sin = Math.abs(Math.sin(rad));
        canvas.width = Math.round(img.width * cos + img.height * sin);
        canvas.height = Math.round(img.width * sin + img.height * cos);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
      } else if (mode === "flip-image") {
        canvas.width = w;
        canvas.height = h;
        ctx.translate(flip === "h" ? w : 0, flip === "v" ? h : 0);
        ctx.scale(flip === "h" ? -1 : 1, flip === "v" ? -1 : 1);
        ctx.drawImage(img, 0, 0, w, h);
      } else if (mode === "blur-image") {
        canvas.width = w;
        canvas.height = h;
        ctx.filter = `blur(${blur}px)`;
        ctx.drawImage(img, 0, 0, w, h);
        ctx.filter = "none";
      } else {
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
      }

      if (showPalette) {
        setColors(extractColors(ctx, canvas.width, canvas.height, mode === "dominant-color-extractor" ? 5 : 8));
      } else {
        setColors([]);
      }

      let mime = "image/png";
      if (mode === "png-to-jpg" || mode === "image-compressor") mime = "image/jpeg";
      if (mode === "webp-converter") mime = "image/webp";
      if (mode === "jpg-to-png") mime = "image/png";

      await new Promise((r) => setTimeout(r, 420));

      const dataUrl = canvas.toDataURL(mime, quality);
      setPreview(dataUrl);
      setMeta({
        w: canvas.width,
        h: canvas.height,
        size: `${Math.round((dataUrl.length * 3) / 4 / 1024)} KB (approx)`,
      });
      if (mode === "image-to-base64") setBase64(dataUrl);
      else setBase64("");
      toast.success("Image processed");
    } catch {
      toast.error("Could not process that image");
    } finally {
      setProcessing(false);
    }
  };

  const onUpload = (file: File) => {
    fileRef.current = file;
    setFileName(file.name);
    if (sourcePreview) URL.revokeObjectURL(sourcePreview);
    setSourcePreview(URL.createObjectURL(file));
    setPreview(null);
    setColors([]);
    setBase64("");
    setMeta(null);
    void processFile(file);
  };

  const reprocess = () => {
    if (!fileRef.current) {
      toast.error("Upload an image first");
      return;
    }
    void processFile(fileRef.current);
  };

  const download = () => {
    if (!preview) return;
    const a = document.createElement("a");
    a.href = preview;
    a.download = `processed-${mode}.${preview.includes("image/webp") ? "webp" : preview.includes("jpeg") ? "jpg" : "png"}`;
    a.click();
  };

  const hasResult = Boolean(preview) || colors.length > 0 || Boolean(base64);

  return (
    <ToolWorkbench
      title={metaInfo.title}
      hint={metaInfo.hint}
      controls={
        <div className="space-y-4">
          <label
            className={cn(
              "group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-4 py-10 text-center transition",
              fileName
                ? "border-rose-500/35 bg-rose-500/5"
                : "border-border/70 hover:border-rose-500/40 hover:bg-rose-500/[0.03]"
            )}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 transition group-hover:scale-105">
              <Upload className="h-5 w-5" />
            </span>
            <span className="space-y-1">
              <span className="block text-sm font-semibold">{fileName ? "Replace image" : "Upload an image"}</span>
              <span className="block text-xs text-muted-foreground">
                {fileName ?? "PNG, JPG, WebP, or GIF"}
              </span>
            </span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
            />
          </label>

          {sourcePreview && (
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-muted/20 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sourcePreview} alt="Original" className="mx-auto max-h-28 rounded-xl object-contain" />
              <p className="mt-1.5 text-center text-[11px] text-muted-foreground">Original</p>
            </div>
          )}

          {showQuality && (
            <div className="space-y-1.5">
              <Label>Quality · {Math.round(quality * 100)}%</Label>
              <Slider min={0.1} max={1} step={0.05} value={[quality]} onValueChange={([n]) => setQuality(n)} />
            </div>
          )}

          {mode === "image-resizer" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Width</Label>
                <Input type="number" min={1} value={width} onChange={(e) => setWidth(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label>Height</Label>
                <Input type="number" min={1} value={height} onChange={(e) => setHeight(Number(e.target.value))} />
              </div>
            </div>
          )}

          {mode === "blur-image" && (
            <div className="space-y-1.5">
              <Label>Blur · {blur}px</Label>
              <Slider min={0} max={20} value={[blur]} onValueChange={([n]) => setBlur(n)} />
            </div>
          )}

          {mode === "rotate-image" && (
            <div className="space-y-1.5">
              <Label>Angle</Label>
              <Select value={String(rotate)} onValueChange={(v) => setRotate(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[90, 180, 270].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}°
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === "flip-image" && (
            <div className="space-y-1.5">
              <Label>Direction</Label>
              <Select value={flip} onValueChange={(v) => setFlip(v as "h" | "v")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h">Horizontal</SelectItem>
                  <SelectItem value="v">Vertical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" aria-hidden />

          <ActionRow>
            <PrimaryButton onClick={reprocess} disabled={!fileRef.current || processing} className="min-w-32">
              {processing ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Processing…
                </>
              ) : (
                "Process again"
              )}
            </PrimaryButton>
            {preview && (
              <Button type="button" variant="outline" className="rounded-full" onClick={download}>
                <Download className="h-4 w-4" />
                Download
              </Button>
            )}
          </ActionRow>
        </div>
      }
      preview={
        <ResultsPanel
          title={processing ? "Processing image…" : hasResult ? "Processed result" : "Live preview"}
          subtitle={meta ? `${meta.w}×${meta.h}${meta.size ? ` · ${meta.size}` : ""}` : fileName ?? undefined}
          empty={!hasResult && !processing}
          actions={
            preview ? (
              <Button type="button" size="sm" className="h-9 rounded-full" onClick={download}>
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            ) : undefined
          }
        >
          <div
            key={waveKey}
            className={cn("space-y-4", processing ? "blog-title-pulse" : "animate-rise blog-title-card")}
          >
            {preview && (
              <div className="overflow-hidden rounded-2xl border border-border/50 bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.12),_transparent_55%)] p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Processed"
                  className="mx-auto max-h-80 rounded-xl object-contain shadow-lg shadow-rose-500/10"
                />
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
                      className="animate-rise overflow-hidden rounded-2xl border border-border/50 bg-muted/20"
                      style={{ animationDelay: `${i * 45}ms` }}
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
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">Base64 data URL</p>
                  <CopyButton value={base64} label="Copy" className="h-8 rounded-full" />
                </div>
                <pre className="max-h-40 overflow-auto rounded-2xl border border-border/50 bg-muted/20 p-3 font-mono text-[10px] leading-relaxed break-all whitespace-pre-wrap">
                  {base64}
                </pre>
              </div>
            )}
          </div>
        </ResultsPanel>
      }
    />
  );
}

export function ImageSuiteTool({ mode }: { mode: ImageSuiteMode }) {
  if (mode === "svg-optimizer") return <SvgOptimizerTool />;
  if (mode === "image-crop") return <ImageCropTool />;
  return <RasterImageTool mode={mode} />;
}
