"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportPalette } from "@/lib/colors/export";
import { getTextColor } from "@/lib/colors/convert";
import { downloadBlob } from "@/lib/utils";
import type { ExportFormat } from "@/types/color";

const FORMATS: { value: ExportFormat | "png"; label: string }[] = [
  { value: "png", label: "PNG image" },
  { value: "svg", label: "SVG" },
  { value: "css", label: "CSS variables" },
  { value: "json", label: "JSON" },
  { value: "tailwind", label: "Tailwind" },
  { value: "scss", label: "SCSS" },
  { value: "ase", label: "JSON swatches" },
];

export function BrandPaletteDownload({
  name,
  colors,
}: {
  name: string;
  colors: string[];
}) {
  const fileName = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-palette`;

  const download = (format: string) => {
    if (format === "png") {
      downloadPalettePng(name, colors, fileName);
      toast.success("Palette PNG downloaded");
      return;
    }
    exportPalette(
      colors.map((hex) => ({ hex })),
      format as ExportFormat,
      fileName
    );
    toast.success(`Downloaded ${format.toUpperCase()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" onClick={() => download("png")}>
        <Download />
        Download palette
      </Button>
      <Select onValueChange={download}>
        <SelectTrigger className="w-44 rounded-lg" aria-label="Download palette format">
          <SelectValue placeholder="More formats" />
        </SelectTrigger>
        <SelectContent>
          {FORMATS.map((f) => (
            <SelectItem key={f.value} value={f.value}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function downloadPalettePng(name: string, colors: string[], fileName: string) {
  const swatch = 160;
  const header = 72;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(720, colors.length * swatch);
  canvas.height = header + 220;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#111111";
  ctx.font = "600 28px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(`${name} brand palette`, 24, 46);

  colors.forEach((hex, i) => {
    const x = i * swatch;
    ctx.fillStyle = hex;
    ctx.fillRect(x, header, swatch, 160);
    ctx.fillStyle = getTextColor(hex);
    ctx.font = "600 16px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText(hex.toUpperCase(), x + swatch / 2, header + 148);
  });

  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, `${fileName}.png`);
  }, "image/png");
}
