"use client";

import { useState, useRef, useEffect, ChangeEvent, MouseEvent } from "react";
import {
  Upload,
  Download,
  RefreshCw,
  Eye,
  Check,
  ShieldCheck,
  Sparkles,
  Pipette,
  Eraser,
  Paintbrush,
  Palette,
  Sliders,
  Image as ImageIcon,
  Layers,
  Undo2,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react";
import { toast } from "sonner";

type BgType = "white" | "transparent" | "color" | "gradient" | "custom-image";

interface GradientPreset {
  id: string;
  name: string;
  css: string;
  colors: [string, string];
}

const GRADIENT_PRESETS: GradientPreset[] = [
  { id: "clean-studio", name: "Studio Minimal", css: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", colors: ["#f5f7fa", "#c3cfe2"] },
  { id: "soft-sunset", name: "Soft Sunset", css: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%)", colors: ["#ff9a9e", "#fecfef"] },
  { id: "ocean-breeze", name: "Ocean Breeze", css: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", colors: ["#4facfe", "#00f2fe"] },
  { id: "violet-glow", name: "Violet Glow", css: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", colors: ["#667eea", "#764ba2"] },
  { id: "dark-slate", name: "Executive Dark", css: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", colors: ["#1e293b", "#0f172a"] },
  { id: "emerald-mint", name: "Fresh Mint", css: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", colors: ["#a8edea", "#fed6e3"] },
];

const COLOR_PRESETS = [
  { name: "Pure White", hex: "#FFFFFF" },
  { name: "Studio Grey", hex: "#F3F4F6" },
  { name: "Warm Cream", hex: "#FAF8F5" },
  { name: "Soft Sage", hex: "#E3EAD9" },
  { name: "Blush Pink", hex: "#FCE7F3" },
  { name: "Sky Blue", hex: "#E0F2FE" },
  { name: "Royal Blue", hex: "#2563EB" },
  { name: "Charcoal", hex: "#1E293B" },
  { name: "Pure Black", hex: "#000000" },
];

export function WhiteBackgroundTool() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [bgType, setBgType] = useState<BgType>("white");
  const [solidColor, setSolidColor] = useState<string>("#FFFFFF");
  const [selectedGradient, setSelectedGradient] = useState<GradientPreset>(GRADIENT_PRESETS[0]);
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);

  // Background removal algorithm controls
  const [tolerance, setTolerance] = useState<number>(32);
  const [feather, setFeather] = useState<number>(2);
  const [activeTool, setActiveTool] = useState<"pointer" | "eyedropper" | "eraser" | "restore">("pointer");
  const [brushSize, setBrushSize] = useState<number>(30);
  const [viewMode, setViewMode] = useState<"result" | "original">("result");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // References
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const customBgImgRef = useRef<HTMLImageElement | null>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskDataRef = useRef<Uint8Array | null>(null); // 255 = keep, 0 = remove
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isMouseDownRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);
  const blurOutRef = useRef<Uint8Array | null>(null);
  const blurTempRef = useRef<Float32Array | null>(null);

  // Keyed background colors (seeded from corners)
  const keyedColorsRef = useRef<{ r: number; g: number; b: number }[]>([]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (originalUrl?.startsWith("blob:")) URL.revokeObjectURL(originalUrl);
      if (customBgUrl?.startsWith("blob:")) URL.revokeObjectURL(customBgUrl);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [originalUrl, customBgUrl]);

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
      originalImgRef.current = img;
      setImageSize({ width: img.width, height: img.height });
      initMask(img);
    };
    img.src = objectUrl;
  };

  const handleCustomBgUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (customBgUrl?.startsWith("blob:")) URL.revokeObjectURL(customBgUrl);
    const objectUrl = URL.createObjectURL(file);
    setCustomBgUrl(objectUrl);
    const bgImg = new Image();
    bgImg.onload = () => {
      customBgImgRef.current = bgImg;
      setBgType("custom-image");
      scheduleRender();
    };
    bgImg.src = objectUrl;
  };

  // Initialize mask & detect background colors from corners
  const initMask = (img: HTMLImageElement) => {
    setIsProcessing(true);
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    sourceCanvasRef.current = canvas;

    const imgData = ctx.getImageData(0, 0, img.width, img.height);
    const data = imgData.data;
    const totalPixels = img.width * img.height;
    const mask = new Uint8Array(totalPixels);

    // Sample corners to find background colors
    const corners = [
      0, // top-left
      (img.width - 1) * 4, // top-right
      ((img.height - 1) * img.width) * 4, // bottom-left
      (totalPixels - 1) * 4, // bottom-right
      Math.floor(img.width / 2) * 4, // top-middle
    ];

    const keyed: { r: number; g: number; b: number }[] = [];
    for (const c of corners) {
      const a = data[c + 3];
      if (a > 20) {
        keyed.push({ r: data[c], g: data[c + 1], b: data[c + 2] });
      }
    }

    if (keyed.length === 0) {
      keyed.push({ r: 255, g: 255, b: 255 });
    }

    keyedColorsRef.current = keyed;
    maskDataRef.current = mask;

    computeMask(data, mask, img.width, img.height, tolerance, keyed);
    scheduleRender();
    setIsProcessing(false);
  };

  // Compute alpha mask with Euclidean color distance
  const computeMask = (
    data: Uint8ClampedArray,
    mask: Uint8Array,
    w: number,
    h: number,
    tol: number,
    targetColors: { r: number; g: number; b: number }[]
  ) => {
    const tolSq = Math.round((tol * 2.5) ** 2);

    for (let i = 0; i < mask.length; i++) {
      const idx = i * 4;
      const alpha = data[idx + 3];

      if (alpha < 15) {
        mask[i] = 0;
        continue;
      }

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      let isBg = false;
      for (let j = 0; j < targetColors.length; j++) {
        const t = targetColors[j];
        const dr = r - t.r;
        const dg = g - t.g;
        const db = b - t.b;
        const distSq = dr * dr + dg * dg + db * db;
        if (distSq <= tolSq) {
          isBg = true;
          break;
        }
      }

      mask[i] = isBg ? 0 : 255;
    }
  };

  // Scheduled render using requestAnimationFrame
  const scheduleRender = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      renderComposite();
    });
  };

  // Re-compute mask when tolerance changes
  useEffect(() => {
    if (!sourceCanvasRef.current || !maskDataRef.current || !originalImgRef.current) return;
    const ctx = sourceCanvasRef.current.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const { width, height } = originalImgRef.current;
    const imgData = ctx.getImageData(0, 0, width, height);
    computeMask(imgData.data, maskDataRef.current, width, height, tolerance, keyedColorsRef.current);
    scheduleRender();
  }, [tolerance]);

  // Re-render composite when background styling or feathering changes
  useEffect(() => {
    scheduleRender();
  }, [bgType, solidColor, selectedGradient, feather, viewMode]);

  // High-performance canvas compositor using destination-over
  const renderComposite = () => {
    const canvas = displayCanvasRef.current;
    const img = originalImgRef.current;
    const mask = maskDataRef.current;
    const sourceCanvas = sourceCanvasRef.current;

    if (!canvas || !img || !mask || !sourceCanvas) return;

    if (canvas.width !== img.width || canvas.height !== img.height) {
      canvas.width = img.width;
      canvas.height = img.height;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (viewMode === "original") {
      ctx.drawImage(img, 0, 0);
      return;
    }

    // 1. Draw Cutout Subject
    const srcCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
    if (!srcCtx) return;

    const imgData = srcCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    let effectiveMask = mask;
    if (feather > 0) {
      effectiveMask = blurMask(mask, canvas.width, canvas.height, feather);
    }

    for (let i = 0; i < effectiveMask.length; i++) {
      const mVal = effectiveMask[i];
      const idx = i * 4;
      data[idx + 3] = (data[idx + 3] * mVal) >> 8;
    }

    ctx.putImageData(imgData, 0, 0);

    // 2. Hardware-accelerated background composite behind cutout subject
    if (bgType !== "transparent") {
      ctx.globalCompositeOperation = "destination-over";

      if (bgType === "white") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (bgType === "color") {
        ctx.fillStyle = solidColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (bgType === "gradient") {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, selectedGradient.colors[0]);
        grad.addColorStop(1, selectedGradient.colors[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (bgType === "custom-image" && customBgImgRef.current) {
        ctx.drawImage(customBgImgRef.current, 0, 0, canvas.width, canvas.height);
      }

      ctx.globalCompositeOperation = "source-over"; // Reset composite mode
    }
  };

  // Reusable buffer box blur
  const blurMask = (src: Uint8Array, w: number, h: number, radius: number): Uint8Array => {
    const len = src.length;
    if (!blurOutRef.current || blurOutRef.current.length !== len) {
      blurOutRef.current = new Uint8Array(len);
      blurTempRef.current = new Float32Array(len);
    }
    const out = blurOutRef.current;
    const temp = blurTempRef.current!;

    // Horizontal pass
    for (let y = 0; y < h; y++) {
      const row = y * w;
      for (let x = 0; x < w; x++) {
        let sum = 0;
        let count = 0;
        for (let k = -radius; k <= radius; k++) {
          const nx = x + k;
          if (nx >= 0 && nx < w) {
            sum += src[row + nx];
            count++;
          }
        }
        temp[row + x] = sum / count;
      }
    }

    // Vertical pass
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        let sum = 0;
        let count = 0;
        for (let k = -radius; k <= radius; k++) {
          const ny = y + k;
          if (ny >= 0 && ny < h) {
            sum += temp[ny * w + x];
            count++;
          }
        }
        out[y * w + x] = Math.round(sum / count);
      }
    }

    return out;
  };

  // Canvas interaction (Eyedropper, Eraser, Restore brush)
  const handleCanvasMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    isMouseDownRef.current = true;
    handleCanvasAction(e);
  };

  const handleCanvasMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isMouseDownRef.current) return;
    if (activeTool === "eraser" || activeTool === "restore") {
      handleCanvasAction(e);
    }
  };

  const handleCanvasMouseUp = () => {
    isMouseDownRef.current = false;
  };

  const handleCanvasAction = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = displayCanvasRef.current;
    const sourceCanvas = sourceCanvasRef.current;
    const mask = maskDataRef.current;
    if (!canvas || !sourceCanvas || !mask || !originalImgRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;

    if (activeTool === "eyedropper") {
      // Sample clicked color and add to keyed background colors
      const ctx = sourceCanvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const newKey = { r: pixel[0], g: pixel[1], b: pixel[2] };
      keyedColorsRef.current.push(newKey);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      computeMask(imgData.data, mask, canvas.width, canvas.height, tolerance, keyedColorsRef.current);
      renderComposite();
      toast.success("Background color keyed out!");
    } else if (activeTool === "eraser" || activeTool === "restore") {
      // Paint mask with brush
      const r = Math.round(brushSize * (canvas.width / 600));
      const targetVal = activeTool === "eraser" ? 0 : 255;
      const w = canvas.width;
      const h = canvas.height;

      for (let dy = -r; dy <= r; dy++) {
        const py = y + dy;
        if (py < 0 || py >= h) continue;
        for (let dx = -r; dx <= r; dx++) {
          const px = x + dx;
          if (px < 0 || px >= w) continue;
          if (dx * dx + dy * dy <= r * r) {
            mask[py * w + px] = targetVal;
          }
        }
      }
      renderComposite();
    }
  };

  // Downloads
  const downloadImage = (format: "png" | "jpg") => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    if (format === "png" && bgType === "transparent") {
      link.download = "colorbase-removed-bg-cutout.png";
      link.href = canvas.toDataURL("image/png");
    } else {
      link.download = `colorbase-${bgType}-background.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.95);
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded ${format.toUpperCase()} photo!`);
  };

  return (
    <div className="space-y-6">
      {/* Upload Screen */}
      {!originalUrl ? (
        <div className="relative rounded-3xl border-2 border-dashed border-border bg-card/60 p-10 text-center transition-all hover:border-primary/50 sm:p-14">
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileUpload}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            aria-label="Upload photo"
          />
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner">
            <Upload className="h-10 w-10" />
          </div>
          <h3 className="mt-5 font-display text-xl font-bold sm:text-2xl">
            Upload Image to Remove or Change Background
          </h3>
          <p className="mt-2 max-w-lg mx-auto text-xs text-muted-foreground sm:text-sm">
            PNG, JPG, or WEBP up to 20MB. Automatically isolates subjects, removes cluttered backgrounds, and replaces them with pure white, transparent PNG, solid colors, or stylish gradients.
          </p>
          <div className="mt-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md hover:opacity-95 transition-opacity">
              <Upload className="h-4 w-4" />
              Choose Photo from Device
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === "result" ? "original" : "result")}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === "original"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                <Eye className="h-4 w-4" />
                {viewMode === "original" ? "Showing Original" : "Compare Original"}
              </button>

              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-1.5 text-xs font-semibold hover:bg-muted transition-colors">
                <RefreshCw className="h-3.5 w-3.5" />
                Upload New Image
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
                {imageSize.width} × {imageSize.height} px
              </span>
            </div>

            {/* Quick Export Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setBgType("transparent");
                  setTimeout(() => downloadImage("png"), 100);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold hover:bg-muted transition-colors"
                title="Download transparent cutout PNG"
              >
                <Download className="h-3.5 w-3.5" />
                Transparent PNG
              </button>

              <button
                type="button"
                onClick={() => {
                  setBgType("white");
                  setTimeout(() => downloadImage("jpg"), 100);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
                title="Download pure white background JPG"
              >
                <Download className="h-3.5 w-3.5" />
                White BG (JPG)
              </button>

              {bgType !== "white" && bgType !== "transparent" && (
                <button
                  type="button"
                  onClick={() => downloadImage("jpg")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
                  title="Download image with custom background"
                >
                  <Download className="h-3.5 w-3.5" />
                  Save Backdrop
                </button>
              )}
            </div>
          </div>

          {/* Background Replacement Bar */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <h4 className="font-display text-sm font-bold">Replace Background Style</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setBgType("white")}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                    bgType === "white"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Pure White (#FFFFFF)
                </button>
                <button
                  type="button"
                  onClick={() => setBgType("transparent")}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                    bgType === "transparent"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Transparent Cutout
                </button>
                <button
                  type="button"
                  onClick={() => setBgType("color")}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                    bgType === "color"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Solid Color
                </button>
                <button
                  type="button"
                  onClick={() => setBgType("gradient")}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                    bgType === "gradient"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Studio Gradient
                </button>
                <button
                  type="button"
                  onClick={() => setBgType("custom-image")}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                    bgType === "custom-image"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Custom Photo Backdrop
                </button>
              </div>
            </div>

            {/* Sub-selector depending on bgType */}
            {bgType === "color" && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <input
                  type="color"
                  value={solidColor}
                  onChange={(e) => setSolidColor(e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
                  aria-label="Pick custom solid background"
                />
                <span className="text-xs text-muted-foreground mr-1">Presets:</span>
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setSolidColor(p.hex)}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs hover:border-primary/50 transition-colors"
                  >
                    <span className="h-3 w-3 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: p.hex }} />
                    {p.name}
                  </button>
                ))}
              </div>
            )}

            {bgType === "gradient" && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 pt-1">
                {GRADIENT_PRESETS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGradient(g)}
                    className={`flex items-center gap-2 rounded-xl border p-2 text-left transition-all ${
                      selectedGradient.id === g.id
                        ? "border-primary bg-primary/5 shadow-xs"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="h-6 w-6 shrink-0 rounded-lg shadow-2xs border border-black/10" style={{ background: g.css }} />
                    <span className="truncate text-xs font-semibold">{g.name}</span>
                  </button>
                ))}
              </div>
            )}

            {bgType === "custom-image" && (
              <div className="flex items-center gap-3 pt-1">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-2 text-xs font-semibold hover:border-primary">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  {customBgUrl ? "Change Custom Backdrop Photo" : "Upload Custom Backdrop Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomBgUpload}
                    className="hidden"
                  />
                </label>
                {customBgUrl && (
                  <span className="text-xs text-muted-foreground">Custom backdrop active</span>
                )}
              </div>
            )}
          </div>

          {/* AI Cutout Tuning & Manual Touch-up Tools */}
          <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 sm:p-5">
            {/* Tolerance & Feather */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-primary" />
                    Background Removal Sensitivity
                  </span>
                  <span className="font-mono text-primary font-bold">{tolerance}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Higher sensitivity erases subtle background shadows. Lower sensitivity protects light subject details.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span>Edge Feathering / Softness</span>
                  <span className="font-mono text-primary font-bold">{feather} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={feather}
                  onChange={(e) => setFeather(Number(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Smooths jagged cutouts with anti-aliased edge blending.
                </p>
              </div>
            </div>

            {/* Manual Tools (Eyedropper, Eraser, Restore) */}
            <div className="rounded-xl border border-border/80 bg-background/50 p-4 space-y-3">
              <span className="text-xs font-bold text-foreground">Interactive Touch-up Tools</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTool("pointer")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    activeTool === "pointer"
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "border border-border hover:bg-muted"
                  }`}
                >
                  Pan / Pointer
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTool("eyedropper")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    activeTool === "eyedropper"
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "border border-border hover:bg-muted"
                  }`}
                  title="Click anywhere on the photo to key out that background color"
                >
                  <Pipette className="h-3.5 w-3.5" />
                  Click to Remove Color
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTool("eraser")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    activeTool === "eraser"
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "border border-border hover:bg-muted"
                  }`}
                >
                  <Eraser className="h-3.5 w-3.5" />
                  Erase
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTool("restore")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    activeTool === "restore"
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "border border-border hover:bg-muted"
                  }`}
                >
                  <Paintbrush className="h-3.5 w-3.5" />
                  Restore
                </button>
              </div>

              {(activeTool === "eraser" || activeTool === "restore") && (
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                    <span>Brush Size</span>
                    <span>{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="mt-1 w-full accent-primary"
                  />
                </div>
              )}

              {activeTool === "eyedropper" && (
                <p className="text-[11px] text-primary font-medium">
                  🎯 Click on any stubborn background area on the preview canvas to instantly key it out!
                </p>
              )}
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div
            className={`relative overflow-hidden rounded-3xl border border-border p-4 sm:p-8 flex items-center justify-center min-h-[420px] transition-colors ${
              bgType === "transparent"
                ? "bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] dark:bg-[linear-gradient(45deg,#1f2937_25%,transparent_25%),linear-gradient(-45deg,#1f2937_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1f2937_75%),linear-gradient(-45deg,transparent_75%,#1f2937_75%)]"
                : "bg-neutral-100 dark:bg-neutral-900"
            }`}
          >
            <canvas
              ref={displayCanvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              className={`max-h-[550px] max-w-full rounded-2xl object-contain shadow-xl transition-all ${
                activeTool === "eyedropper"
                  ? "cursor-crosshair"
                  : activeTool === "eraser" || activeTool === "restore"
                  ? "cursor-cell"
                  : "cursor-default"
              }`}
            />
          </div>
        </div>
      )}

      {/* Privacy Callout */}
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div>
          <strong className="text-foreground">100% In-Browser Privacy:</strong> Your photos are cut out and processed locally on your device via HTML5 Canvas. No photographs, portraits, or e-commerce catalog items are ever sent to external cloud servers.
        </div>
      </div>
    </div>
  );
}
