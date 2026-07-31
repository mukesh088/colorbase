"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolWorkbench, ActionRow, PrimaryButton, OutputBox } from "./workbench";
import { CopyButton } from "@/components/color/copy-button";
import { rgbToHex } from "@/lib/colors/convert";
import { minifyCss } from "./helpers";
import type { ImageSuiteMode } from "@/lib/suite-modes";

export type { ImageSuiteMode };
export { isImageSuite } from "@/lib/suite-modes";

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

export function ImageSuiteTool({ mode }: { mode: ImageSuiteMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [blur, setBlur] = useState(4);
  const [rotate, setRotate] = useState(90);
  const [flip, setFlip] = useState<"h" | "v">("h");
  const [svgIn, setSvgIn] = useState(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <!-- optimize me -->\n  <circle cx="50" cy="50" r="40" fill="#e11d48" />\n</svg>`);
  const [colors, setColors] = useState<string[]>([]);
  const [base64, setBase64] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 200, h: 200 });

  const processFile = async (file: File) => {
    if (mode === "svg-optimizer") return;
    const img = await loadImage(file);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = img.width;
    let h = img.height;

    if (mode === "image-resizer") {
      w = width;
      h = height;
    }

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
    } else if (mode === "image-crop") {
      canvas.width = crop.w;
      canvas.height = crop.h;
      ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
    } else {
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
    }

    if (mode === "dominant-color-extractor" || mode === "color-palette-from-image") {
      setColors(extractColors(ctx, canvas.width, canvas.height, mode === "dominant-color-extractor" ? 5 : 8));
    }

    let mime = "image/png";
    if (mode === "png-to-jpg" || mode === "image-compressor") mime = "image/jpeg";
    if (mode === "webp-converter") mime = "image/webp";
    if (mode === "jpg-to-png") mime = "image/png";

    const dataUrl = canvas.toDataURL(mime, quality);
    setPreview(dataUrl);
    if (mode === "image-to-base64") setBase64(dataUrl);
    toast.success("Image processed");
  };

  const download = () => {
    if (!preview) return;
    const a = document.createElement("a");
    a.href = preview;
    a.download = `processed-${mode}.${preview.includes("image/webp") ? "webp" : preview.includes("jpeg") ? "jpg" : "png"}`;
    a.click();
  };

  if (mode === "svg-optimizer") {
    const out = minifyCss(svgIn).replace(/>\s+</g, "><").replace(/<!--[\s\S]*?-->/g, "");
    return (
      <ToolWorkbench
        controls={<div className="space-y-1.5"><Label>SVG</Label><Textarea value={svgIn} onChange={(e) => setSvgIn(e.target.value)} rows={14} className="font-mono text-xs" /></div>}
        output={<OutputBox value={out} label="Optimized SVG" />}
      />
    );
  }

  return (
    <ToolWorkbench
      controls={
        <div className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center hover:border-rose-500/40">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">Upload an image</span>
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && void processFile(e.target.files[0])} />
          </label>
          {(mode === "image-compressor" || mode === "png-to-jpg" || mode === "webp-converter") && (
            <div className="space-y-1.5"><Label>Quality {Math.round(quality * 100)}%</Label><Slider min={0.1} max={1} step={0.05} value={[quality]} onValueChange={([n]) => setQuality(n)} /></div>
          )}
          {mode === "image-resizer" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Width</Label><Input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} /></div>
              <div className="space-y-1.5"><Label>Height</Label><Input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} /></div>
            </div>
          )}
          {mode === "blur-image" && (
            <div className="space-y-1.5"><Label>Blur {blur}px</Label><Slider min={0} max={20} value={[blur]} onValueChange={([n]) => setBlur(n)} /></div>
          )}
          {mode === "rotate-image" && (
            <div className="space-y-1.5"><Label>Angle</Label>
              <Select value={String(rotate)} onValueChange={(v) => setRotate(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[90, 180, 270].map((n) => <SelectItem key={n} value={String(n)}>{n}°</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {mode === "flip-image" && (
            <div className="space-y-1.5"><Label>Direction</Label>
              <Select value={flip} onValueChange={(v) => setFlip(v as "h" | "v")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="h">Horizontal</SelectItem>
                  <SelectItem value="v">Vertical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {mode === "image-crop" && (
            <div className="grid grid-cols-2 gap-2">
              {(["x", "y", "w", "h"] as const).map((k) => (
                <div key={k} className="space-y-1"><Label>{k.toUpperCase()}</Label>
                  <Input type="number" value={crop[k]} onChange={(e) => setCrop((c) => ({ ...c, [k]: Number(e.target.value) }))} />
                </div>
              ))}
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" aria-hidden />
          {preview && (
            <ActionRow>
              <PrimaryButton onClick={download}>Download</PrimaryButton>
            </ActionRow>
          )}
        </div>
      }
      preview={
        preview ? (
          <div className="rounded-3xl border border-border/50 bg-background/70 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Processed" className="mx-auto max-h-80 rounded-xl object-contain" />
          </div>
        ) : undefined
      }
      output={
        colors.length > 0 ? (
          <div className="rounded-3xl border border-border/50 bg-background/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Palette</p>
              <CopyButton value={colors.join(", ")} label="Copy" />
            </div>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <div key={c} className="w-16">
                  <div className="h-12 rounded-lg border" style={{ backgroundColor: c }} />
                  <p className="mt-1 text-center font-mono text-[10px]">{c}</p>
                </div>
              ))}
            </div>
          </div>
        ) : mode === "image-to-base64" && base64 ? (
          <OutputBox value={base64} label="Base64" rows={8} />
        ) : undefined
      }
    />
  );
}
