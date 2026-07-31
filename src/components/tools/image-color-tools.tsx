"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorSwatch } from "@/components/color/color-swatch";
import { rgbToHex } from "@/lib/colors/convert";
import { toast } from "sonner";

function extractPalette(imageData: ImageData, count = 6): string[] {
  const buckets = new Map<string, number>();
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 128) continue;
    const key = rgbToHex({
      r: Math.round(r / 24) * 24,
      g: Math.round(g / 24) * 24,
      b: Math.round(b / 24) * 24,
    });
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([hex]) => hex);
}

export function ImageColorTools({ mode }: { mode: "picker" | "palette" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [picked, setPicked] = useState("#0ea5e9");
  const [palette, setPalette] = useState<string[]>([]);
  const [hasImage, setHasImage] = useState(false);

  const loadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const max = 640;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setHasImage(true);
      if (mode === "palette") {
        setPalette(extractPalette(ctx.getImageData(0, 0, canvas.width, canvas.height)));
      }
      URL.revokeObjectURL(url);
      toast.success("Image loaded");
    };
    img.src = url;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{mode === "picker" ? "Image Color Picker" : "Palette Extractor"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-10 text-center">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Upload an image (PNG, JPG, WEBP)</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) loadFile(file);
              }}
            />
            <Button type="button" variant="outline" asChild>
              <span>Choose file</span>
            </Button>
          </label>
          <canvas
            ref={canvasRef}
            className={`max-w-full rounded-xl border border-border/50 ${hasImage ? "cursor-crosshair" : "hidden"}`}
            onClick={(e) => {
              if (mode !== "picker") return;
              const canvas = canvasRef.current;
              if (!canvas) return;
              const rect = canvas.getBoundingClientRect();
              const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
              const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
              const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
              setPicked(rgbToHex({ r, g, b }));
            }}
            aria-label="Uploaded image canvas"
          />
        </CardContent>
      </Card>
      {mode === "picker" && hasImage && (
        <ColorSwatch hex={picked} name="Picked color" size="lg" className="max-w-xs" />
      )}
      {palette.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {palette.map((hex) => (
            <ColorSwatch key={hex} hex={hex} size="lg" />
          ))}
        </div>
      )}
    </div>
  );
}
