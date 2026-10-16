"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Upload, Download, RefreshCw, Eye, Sparkles, ShieldCheck, Sliders, Palette } from "lucide-react";
import { hexToRgb, rgbToHex } from "@/lib/colors/convert";
import { toast } from "sonner";

interface TintPreset {
  id: string;
  name: string;
  shadowHex: string;
  highlightHex: string;
  desc: string;
}

const PRESET_TINTS: TintPreset[] = [
  {
    id: "sepia",
    name: "Classic Sepia Archive",
    shadowHex: "#3E2723",
    highlightHex: "#F5EBE1",
    desc: "19th-century albumen print warmth for vintage portraits.",
  },
  {
    id: "cyanotype",
    name: "Prussian Cyanotype",
    shadowHex: "#0D223A",
    highlightHex: "#E0F2FE",
    desc: "Historic 1840s blueprint photographic tone.",
  },
  {
    id: "cyberpunk",
    name: "Cyber Neon Duotone",
    shadowHex: "#2E0854",
    highlightHex: "#FF007F",
    desc: "Deep ultraviolet shadows with electric magenta highlights.",
  },
  {
    id: "golden-hour",
    name: "Golden Hour Glow",
    shadowHex: "#451A03",
    highlightHex: "#FEF08A",
    desc: "Warm late-afternoon sunlight wash across landscapes.",
  },
  {
    id: "emerald-forest",
    name: "Botanical Emerald",
    shadowHex: "#064E3B",
    highlightHex: "#D1FAE5",
    desc: "Deep lush forest shadows with fresh mint highlights.",
  },
  {
    id: "monochrome",
    name: "Silver Halide B&W",
    shadowHex: "#0F172A",
    highlightHex: "#F8FAFC",
    desc: "High-contrast gallery fine-art black & white.",
  },
];

export function ColorizePhotoTool() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>("sepia");
  const [intensity, setIntensity] = useState<number>(85);
  const [viewMode, setViewMode] = useState<"after" | "before">("after");
  const [shadowColor, setShadowColor] = useState<string>("#3E2723");
  const [highlightColor, setHighlightColor] = useState<string>("#F5EBE1");

  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (originalUrl?.startsWith("blob:")) URL.revokeObjectURL(originalUrl);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [originalUrl]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size exceeds 20MB limit.");
      return;
    }

    if (originalUrl?.startsWith("blob:")) URL.revokeObjectURL(originalUrl);
    const objectUrl = URL.createObjectURL(file);
    setOriginalUrl(objectUrl);

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      applyColorization(img, shadowColor, highlightColor, intensity);
    };
    img.src = objectUrl;
  };

  const applyColorization = (
    img: HTMLImageElement,
    shadowHex: string,
    highlightHex: string,
    strength: number
  ) => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    if (canvas.width !== img.width || canvas.height !== img.height) {
      canvas.width = img.width;
      canvas.height = img.height;
    }
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const sRgb = hexToRgb(shadowHex);
    const hRgb = hexToRgb(highlightHex);
    const factor = strength / 100;
    const invFactor = 1 - factor;

    for (let i = 0; i < data.length; i += 4) {
      // Calculate grayscale perceptual luminance
      const lum = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
      const t = lum / 255;

      // Duotone interpolation between shadow and highlight colors
      const targetR = sRgb.r + (hRgb.r - sRgb.r) * t;
      const targetG = sRgb.g + (hRgb.g - sRgb.g) * t;
      const targetB = sRgb.b + (hRgb.b - sRgb.b) * t;

      data[i] = data[i] * invFactor + targetR * factor;
      data[i + 1] = data[i + 1] * invFactor + targetG * factor;
      data[i + 2] = data[i + 2] * invFactor + targetB * factor;
    }

    ctx.putImageData(imgData, 0, 0);
    setProcessedUrl(canvas.toDataURL("image/jpeg", 0.92));
  };

  const selectPreset = (p: TintPreset) => {
    setSelectedPreset(p.id);
    setShadowColor(p.shadowHex);
    setHighlightColor(p.highlightHex);
    if (imageRef.current) {
      applyColorization(imageRef.current, p.shadowHex, p.highlightHex, intensity);
    }
  };

  const updateIntensity = (val: number) => {
    setIntensity(val);
    if (imageRef.current) {
      applyColorization(imageRef.current, shadowColor, highlightColor, val);
    }
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = `colorbase-${selectedPreset}-photo.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Downloaded colorized photo!");
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!originalUrl ? (
        <div className="relative rounded-3xl border-2 border-dashed border-border bg-card/60 p-10 text-center transition-colors hover:border-primary/50 sm:p-14">
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileUpload}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            aria-label="Upload photo to colorize"
          />
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Palette className="h-8 w-8" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold sm:text-xl">
            Upload Photo to Colorize &amp; Tint
          </h3>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            PNG, JPG, or WEBP up to 15MB. Colorize grayscale photos with historic sepia, cyanotype, or modern neon duotone washes.
          </p>
          <div className="mt-6 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs">
              Select Photo from Device
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === "after" ? "before" : "after")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted"
              >
                <Eye className="h-4 w-4" />
                {viewMode === "after" ? "Show Original Photo" : "Show Colorized Result"}
              </button>

              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                <RefreshCw className="h-3.5 w-3.5" />
                Upload Different Photo
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90"
            >
              <Download className="h-4 w-4" />
              Download Colorized JPG
            </button>
          </div>

          {/* Preset Palettes */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm font-bold">Choose Color Wash Preset</h4>
              <span className="text-xs text-muted-foreground font-mono">{intensity}% strength</span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PRESET_TINTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectPreset(p)}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                    selectedPreset === p.id
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-black/10">
                    <div className="w-1/2 h-full" style={{ backgroundColor: p.shadowHex }} />
                    <div className="w-1/2 h-full" style={{ backgroundColor: p.highlightHex }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-display text-xs font-bold text-foreground">
                      {p.name}
                    </span>
                    <span className="block text-[11px] text-muted-foreground leading-tight mt-0.5">
                      {p.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Slider */}
            <div className="mt-6 border-t border-border/60 pt-4">
              <div className="flex justify-between text-xs font-semibold">
                <span>Colorize Intensity</span>
                <span className="text-primary font-mono">{intensity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={intensity}
                onChange={(e) => updateIntensity(Number(e.target.value))}
                className="mt-2 w-full accent-primary"
              />
            </div>
          </div>

          {/* Viewport */}
          <div className="overflow-hidden rounded-3xl border border-border bg-neutral-100 dark:bg-neutral-900 p-4 sm:p-8 flex items-center justify-center min-h-[380px]">
            {viewMode === "after" && processedUrl ? (
              <img
                src={processedUrl}
                alt="Colorized photo preview"
                className="max-h-[500px] max-w-full rounded-xl object-contain shadow-md"
              />
            ) : originalUrl ? (
              <img
                src={originalUrl}
                alt="Original uploaded photo"
                className="max-h-[500px] max-w-full rounded-xl object-contain shadow-md"
              />
            ) : null}
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div>
          <strong className="text-foreground">Private In-Browser Processing:</strong> All color calculations and duotone pixel operations are executed on your device using client-side HTML5 canvas. No photographs are ever uploaded or retained on any server.
        </div>
      </div>
    </div>
  );
}
