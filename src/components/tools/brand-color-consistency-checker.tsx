"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { extractImagePalette } from "@/lib/colors/image-palette";
import { nearestBrandColor } from "@/lib/colors/palette-distance";
import { downloadText } from "@/lib/utils";
import "./flagship-tools.css";

type ReportRow = {
  file: string;
  sample: string;
  nearest: string;
  distance: number;
  status: "match" | "near" | "off";
};

export function BrandColorConsistencyChecker() {
  const [paletteText, setPaletteText] = useState("#e11d48, #0f172a, #f8fafc, #64748b");
  const [tolerance, setTolerance] = useState(36);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [busy, setBusy] = useState(false);

  const palette = paletteText
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => /^#?[0-9a-fA-F]{3,8}$/.test(s))
    .map((s) => (s.startsWith("#") ? s : `#${s}`));

  async function onFiles(files: FileList | null) {
    if (!files?.length || palette.length === 0) return;
    setBusy(true);
    const next: ReportRow[] = [];
    try {
      for (const file of Array.from(files).slice(0, 8)) {
        if (!/^image\//.test(file.type) || file.size > 5_000_000) continue;
        const url = URL.createObjectURL(file);
        try {
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const el = new Image();
            el.onload = () => resolve(el);
            el.onerror = () => reject(new Error("bad image"));
            el.src = url;
          });
          const scale = Math.min(1, 360 / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) continue;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const colors = extractImagePalette(ctx.getImageData(0, 0, canvas.width, canvas.height).data, 8);
          for (const sample of colors) {
            const { hex, distance } = nearestBrandColor(sample, palette);
            const status =
              distance <= tolerance * 0.45 ? "match" : distance <= tolerance ? "near" : "off";
            // Skip very light/gray photo noise as brand "violations"
            if (status === "off" && distance > tolerance * 1.8) {
              /* keep as off */
            }
            next.push({ file: file.name, sample, nearest: hex, distance: Math.round(distance), status });
          }
        } finally {
          URL.revokeObjectURL(url);
        }
      }
      setRows(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flagship-tool">
      <div className="flagship-panel space-y-3">
        <h2 className="text-lg font-semibold">Brand consistency checker</h2>
        <p className="flagship-muted">
          Compares screenshot palettes to an approved list. Anti-aliased edges, shadows, and photos can
          look “off-brand” — treat flags as review suggestions.
        </p>
        <label className="block text-sm">
          Approved palette (comma-separated HEX)
          <input
            className="flagship-input mt-1 font-mono"
            value={paletteText}
            onChange={(e) => setPaletteText(e.target.value)}
          />
        </label>
        <label className="flagship-muted block text-xs">
          Distance tolerance ({tolerance})
          <input
            type="range"
            min={12}
            max={90}
            value={tolerance}
            onChange={(e) => setTolerance(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="inline-flex cursor-pointer items-center rounded-md border px-3 py-2 text-sm">
          Upload screenshots
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>
        {busy ? <p className="flagship-muted">Analyzing…</p> : null}
      </div>

      {rows.length ? (
        <div className="flagship-panel space-y-3">
          <div className="flagship-actions">
            <Button
              variant="outline"
              onClick={() =>
                downloadText(JSON.stringify(rows, null, 2), "brand-audit.json", "application/json")
              }
            >
              Export JSON
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const csv = [
                  "file,sample,nearest,distance,status",
                  ...rows.map((r) => `${r.file},${r.sample},${r.nearest},${r.distance},${r.status}`),
                ].join("\n");
                downloadText(csv, "brand-audit.csv", "text/csv");
              }}
            >
              Export CSV
            </Button>
            <Button asChild variant="outline">
              <Link href="/website-color-extractor">Website extractor</Link>
            </Button>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-muted-foreground">
                  <th className="py-2">File</th>
                  <th>Sample</th>
                  <th>Nearest</th>
                  <th>Δ</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={`${r.file}-${r.sample}-${i}`} className="border-b border-border/50">
                    <td className="py-2 pr-2">{r.file}</td>
                    <td>
                      <span className="mr-2 inline-block h-4 w-4 rounded border" style={{ background: r.sample }} />
                      <span className="font-mono text-xs">{r.sample}</span>
                    </td>
                    <td>
                      <span className="mr-2 inline-block h-4 w-4 rounded border" style={{ background: r.nearest }} />
                      <span className="font-mono text-xs">{r.nearest}</span>
                    </td>
                    <td>{r.distance}</td>
                    <td className={r.status === "off" ? "text-amber-700 dark:text-amber-300" : ""}>
                      {r.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
