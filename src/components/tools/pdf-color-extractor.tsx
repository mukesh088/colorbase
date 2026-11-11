"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { extractImagePalette } from "@/lib/colors/image-palette";
import { mergePalettes } from "@/lib/colors/palette-distance";
import { exportPalette } from "@/lib/colors/export";
import { normalizeHex } from "@/lib/colors/convert";
import { parseFlexibleColor } from "@/lib/colors/parse";
import "./flagship-tools.css";

type PageResult = {
  page: number;
  thumbUrl: string;
  sampled: string[];
  explicit: string[];
};

export function PdfColorExtractor() {
  const [pages, setPages] = useState<PageResult[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  async function onFile(file: File | null) {
    if (!file) return;
    if (!consent) {
      setError("Confirm local processing consent before uploading a PDF.");
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Choose a PDF file.");
      return;
    }
    if (file.size > 12_000_000) {
      setError("Keep PDFs under 12 MB for browser rendering.");
      return;
    }
    setBusy(true);
    setError(null);
    setPages([]);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      const data = new Uint8Array(await file.arrayBuffer());
      const doc = await pdfjs.getDocument({ data }).promise;
      const next: PageResult[] = [];
      const maxPages = Math.min(doc.numPages, 12);
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page = await doc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.7 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const sampled = extractImagePalette(ctx.getImageData(0, 0, canvas.width, canvas.height).data, 6);
        const explicit: string[] = [];
        try {
          const ops = await page.getOperatorList();
          // Best-effort scan of string args for color-like tokens
          for (const arg of ops.argsArray) {
            const flat = Array.isArray(arg) ? arg : [arg];
            for (const item of flat) {
              if (typeof item === "string") {
                const hex = parseFlexibleColor(item);
                if (hex) explicit.push(normalizeHex(hex));
              }
            }
          }
        } catch {
          /* optional */
        }
        next.push({
          page: pageNum,
          thumbUrl: canvas.toDataURL("image/jpeg", 0.72),
          sampled,
          explicit: [...new Set(explicit)].slice(0, 8),
        });
      }
      setPages(next);
      setSelected(mergePalettes(next.map((p) => [...p.explicit, ...p.sampled]), 12));
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF processing failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flagship-tool">
      <div className="flagship-panel space-y-3">
        <h2 className="text-lg font-semibold">PDF color extractor</h2>
        <p className="flagship-muted">
          Rendering and sampling stay in your browser. Explicit PDF color operators are best-effort;
          sampled swatches come from rendered pixels.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          I understand this PDF is processed locally and I am allowed to analyze it.
        </label>
        <label className="inline-flex cursor-pointer items-center rounded-md border px-3 py-2 text-sm">
          Upload PDF
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {busy ? <p className="flagship-muted">Rendering pages…</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      {pages.length ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((p) => (
              <div key={p.page} className="flagship-panel space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumbUrl} alt={`Page ${p.page}`} className="w-full rounded border" />
                <p className="text-xs font-semibold">Page {p.page}</p>
                <p className="flagship-muted text-[11px]">Sampled pixels</p>
                <div className="flagship-row">
                  {p.sampled.map((hex) => (
                    <button
                      key={`s-${p.page}-${hex}`}
                      type="button"
                      className="h-7 w-7 rounded border"
                      style={{ background: hex }}
                      onClick={() =>
                        setSelected((prev) =>
                          prev.includes(hex) ? prev.filter((h) => h !== hex) : [...prev, hex]
                        )
                      }
                    />
                  ))}
                </div>
                {p.explicit.length ? (
                  <>
                    <p className="flagship-muted text-[11px]">Explicit-ish tokens</p>
                    <div className="flagship-row">
                      {p.explicit.map((hex) => (
                        <span key={`e-${p.page}-${hex}`} className="h-7 w-7 rounded border" style={{ background: hex }} />
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            ))}
          </div>
          <div className="flagship-panel space-y-3">
            <h3 className="font-semibold">Consolidated palette</h3>
            <div className="flagship-row">
              {selected.map((hex) => (
                <span key={hex} className="font-mono text-xs">
                  <span className="mr-1 inline-block h-5 w-5 rounded border align-middle" style={{ background: hex }} />
                  {hex}
                </span>
              ))}
            </div>
            <div className="flagship-actions">
              <Button
                variant="outline"
                onClick={() =>
                  exportPalette(
                    selected.map((hex, i) => ({ hex, name: `pdf-${i + 1}` })),
                    "css",
                    "pdf-palette"
                  )
                }
              >
                Export CSS
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  exportPalette(
                    selected.map((hex, i) => ({ hex, name: `pdf-${i + 1}` })),
                    "json",
                    "pdf-palette"
                  )
                }
              >
                Export JSON
              </Button>
              <Button asChild variant="outline">
                <Link href="/brand-color-consistency-checker">Brand checker</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
