import { rgbToHex } from "@/lib/colors/convert";

export const IMAGE_STUDIO_MODES = [
  "image-compressor",
  "image-resizer",
  "png-to-jpg",
  "jpg-to-png",
  "webp-converter",
  "svg-optimizer",
  "blur-image",
  "image-crop",
  "rotate-image",
  "flip-image",
  "dominant-color-extractor",
  "color-palette-from-image",
  "image-to-base64",
] as const;

export type ImageStudioMode = (typeof IMAGE_STUDIO_MODES)[number];

export function isImageStudio(slug: string): slug is ImageStudioMode {
  return (IMAGE_STUDIO_MODES as readonly string[]).includes(slug);
}

export type OutputMime = "image/jpeg" | "image/png" | "image/webp";

export type CropRect = { x: number; y: number; w: number; h: number };

export const CROP_RATIOS = [
  { value: "free", label: "Free", ratio: null as number | null },
  { value: "1:1", label: "1:1", ratio: 1 },
  { value: "4:3", label: "4:3", ratio: 4 / 3 },
  { value: "3:2", label: "3:2", ratio: 3 / 2 },
  { value: "16:9", label: "16:9", ratio: 16 / 9 },
  { value: "9:16", label: "9:16", ratio: 9 / 16 },
  { value: "circle", label: "Circle", ratio: 1 },
] as const;

export type CropRatioValue = (typeof CROP_RATIOS)[number]["value"];

export const RESIZE_PRESETS = [
  { id: "custom", label: "Custom", w: 0, h: 0 },
  { id: "hd", label: "1280×720", w: 1280, h: 720 },
  { id: "fhd", label: "1920×1080", w: 1920, h: 1080 },
  { id: "square", label: "1080×1080", w: 1080, h: 1080 },
  { id: "story", label: "1080×1920", w: 1080, h: 1920 },
  { id: "og", label: "1200×630", w: 1200, h: 630 },
  { id: "thumb", label: "400×400", w: 400, h: 400 },
] as const;

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function extForMime(mime: OutputMime) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return "png";
}

export function defaultMimeForMode(mode: ImageStudioMode): OutputMime {
  if (mode === "png-to-jpg" || mode === "image-compressor") return "image/jpeg";
  if (mode === "webp-converter") return "image/webp";
  return "image/png";
}

export function modeTitle(mode: ImageStudioMode) {
  const map: Record<ImageStudioMode, string> = {
    "image-compressor": "Image Compressor",
    "image-resizer": "Image Resizer",
    "png-to-jpg": "PNG to JPG",
    "jpg-to-png": "JPG to PNG",
    "webp-converter": "WebP Converter",
    "svg-optimizer": "SVG Optimizer",
    "blur-image": "Image Adjustments",
    "image-crop": "Image Crop",
    "rotate-image": "Rotate Image",
    "flip-image": "Flip Image",
    "dominant-color-extractor": "Dominant Colors",
    "color-palette-from-image": "Palette from Image",
    "image-to-base64": "Image to Base64",
  };
  return map[mode];
}

export function modeHint(mode: ImageStudioMode) {
  const map: Record<ImageStudioMode, string> = {
    "image-compressor": "Shrink file size with quality and format controls — entirely in your browser.",
    "image-resizer": "Scale with locked aspect ratio, fit/fill modes, and social presets.",
    "png-to-jpg": "Convert PNG to JPEG with background fill and quality control.",
    "jpg-to-png": "Convert JPEG to lossless PNG for sharper edges and transparency workflows.",
    "webp-converter": "Export modern WebP for faster pages with tunable quality.",
    "svg-optimizer": "Minify SVG markup, preview safely, and download the optimized file.",
    "blur-image": "Blur, brightness, contrast, saturate, and grayscale — preview then apply.",
    "image-crop": "Drag the frame, lock ratios or circle mask, then download the crop.",
    "rotate-image": "Rotate by free angle or snap to 90° / 180° / 270°.",
    "flip-image": "Mirror horizontally or vertically in one click.",
    "dominant-color-extractor": "Extract the strongest colors from any photo.",
    "color-palette-from-image": "Build a shareable palette from image colors.",
    "image-to-base64": "Encode images as data URLs with CSS/HTML snippets.",
  };
  return map[mode];
}

export function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    img.src = url;
  });
}

export function loadImageFromUrl(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = url;
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement, mime: OutputMime, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Export failed"));
        else resolve(blob);
      },
      mime,
      quality
    );
  });
}

export function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Read failed"));
    reader.readAsDataURL(blob);
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export function extractColors(ctx: CanvasRenderingContext2D, w: number, h: number, count: number) {
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
  return [...buckets.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([hex]) => hex);
}

export function clampCrop(rect: CropRect, natW: number, natH: number): CropRect {
  const w = Math.max(8, Math.min(rect.w, natW));
  const h = Math.max(8, Math.min(rect.h, natH));
  const x = Math.max(0, Math.min(rect.x, natW - w));
  const y = Math.max(0, Math.min(rect.y, natH - h));
  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
}

export function centeredCrop(natW: number, natH: number, ratio: number | null): CropRect {
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

export function buildFilterCss(opts: {
  blur: number;
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
}) {
  return [
    opts.blur > 0 ? `blur(${opts.blur}px)` : "",
    `brightness(${opts.brightness}%)`,
    `contrast(${opts.contrast}%)`,
    `saturate(${opts.saturate}%)`,
    opts.grayscale > 0 ? `grayscale(${opts.grayscale}%)` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function fitContain(srcW: number, srcH: number, boxW: number, boxH: number) {
  const scale = Math.min(boxW / srcW, boxH / srcH);
  return { w: Math.max(1, Math.round(srcW * scale)), h: Math.max(1, Math.round(srcH * scale)) };
}

export function fitCover(srcW: number, srcH: number, boxW: number, boxH: number) {
  const scale = Math.max(boxW / srcW, boxH / srcH);
  const w = Math.round(srcW * scale);
  const h = Math.round(srcH * scale);
  return {
    w,
    h,
    sx: Math.max(0, Math.round((w - boxW) / 2 / scale)),
    sy: Math.max(0, Math.round((h - boxH) / 2 / scale)),
    sw: Math.round(boxW / scale),
    sh: Math.round(boxH / scale),
  };
}

export function sanitizeSvgMarkup(raw: string) {
  return raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/href\s*=\s*("|')\s*javascript:[^"']*\1/gi, 'href="#"')
    .replace(/xlink:href\s*=\s*("|')\s*javascript:[^"']*\1/gi, 'xlink:href="#"');
}

export function optimizeSvgMarkup(raw: string) {
  return sanitizeSvgMarkup(raw)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>~+])\s*/g, "$1")
    .trim();
}

/** Tiny rose gradient sample for demos */
export async function createSampleImageFile() {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const grad = ctx.createLinearGradient(0, 0, 640, 400);
  grad.addColorStop(0, "#e11d48");
  grad.addColorStop(0.5, "#db2777");
  grad.addColorStop(1, "#fce7f3");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 400);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "bold 42px system-ui,sans-serif";
  ctx.fillText("colorBase", 48, 210);
  ctx.font = "20px system-ui,sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText("Sample image", 52, 248);
  const blob = await canvasToBlob(canvas, "image/png", 0.92);
  return new File([blob], "colorbase-sample.png", { type: "image/png" });
}

export function savingsPercent(before: number, after: number) {
  if (before <= 0) return 0;
  return Math.round(((before - after) / before) * 100);
}
