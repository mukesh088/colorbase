"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Download, FileText, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import { exportPalette } from "@/lib/colors/export";
import { normalizeHex } from "@/lib/colors/convert";
import {
  extractColorsFromOperatorList,
  mergePdfPalettes,
  samplePdfPalette,
} from "@/lib/pdf/extract-colors";
import { cn } from "@/lib/utils";
import "./pdf-color-extractor.css";

type PageResult = {
  page: number;
  thumbUrl: string;
  accents: string[];
  neutrals: string[];
  operators: string[];
  all: string[];
};

const MAX_PAGES = 24;
const MAX_BYTES = 16_000_000;
const RENDER_SCALE = 1.25;

export function PdfColorExtractor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pages, setPages] = useState<PageResult[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);

  const stats = useMemo(() => {
    const operatorHits = pages.reduce((n, p) => n + p.operators.length, 0);
    const accentHits = pages.reduce((n, p) => n + p.accents.length, 0);
    return {
      pages: pages.length,
      total: pageCount,
      colors: selected.length,
      operators: operatorHits,
      accents: accentHits,
    };
  }, [pages, pageCount, selected.length]);

  const paletteCss = useMemo(
    () =>
      selected
        .map((hex, i) => `  --pdf-${i + 1}: ${normalizeHex(hex)};`)
        .join("\n"),
    [selected]
  );

  function toggleColor(hex: string) {
    const n = normalizeHex(hex);
    setSelected((prev) =>
      prev.includes(n) ? prev.filter((h) => h !== n) : [...prev, n]
    );
  }

  function clearAll() {
    setPages([]);
    setSelected([]);
    setError(null);
    setStatus(null);
    setProgress(0);
    setFileName(null);
    setPageCount(0);
    if (inputRef.current) inputRef.current.value = "";
  }

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
    if (file.size > MAX_BYTES) {
      setError("Keep PDFs under 16 MB for browser rendering.");
      return;
    }

    setBusy(true);
    setError(null);
    setPages([]);
    setSelected([]);
    setProgress(0);
    setFileName(file.name);
    setStatus("Loading PDF…");

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      const data = new Uint8Array(await file.arrayBuffer());
      const doc = await pdfjs.getDocument({ data }).promise;
      setPageCount(doc.numPages);

      const next: PageResult[] = [];
      const maxPages = Math.min(doc.numPages, MAX_PAGES);

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        setStatus(`Rendering page ${pageNum} of ${maxPages}…`);
        setProgress(Math.round(((pageNum - 1) / maxPages) * 100));

        const page = await doc.getPage(pageNum);
        const viewport = page.getViewport({ scale: RENDER_SCALE });
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) continue;

        await page.render({ canvasContext: ctx, viewport }).promise;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const sampled = samplePdfPalette(imageData.data, {
          count: 14,
          bucket: 12,
          minDistance: 24,
        });

        let operators: string[] = [];
        try {
          const ops = await page.getOperatorList();
          operators = extractColorsFromOperatorList(ops.fnArray, ops.argsArray, 48);
        } catch {
          /* optional path */
        }

        const all = mergePdfPalettes([[...operators, ...sampled.accents, ...sampled.neutrals]], 28, 18);

        next.push({
          page: pageNum,
          thumbUrl: canvas.toDataURL("image/jpeg", 0.78),
          accents: sampled.accents.slice(0, 12),
          neutrals: sampled.neutrals.slice(0, 6),
          operators: operators.slice(0, 16),
          all,
        });

        setProgress(Math.round((pageNum / maxPages) * 100));
      }

      setPages(next);
      const consolidated = mergePdfPalettes(
        next.map((p) => [...p.operators, ...p.accents, ...p.neutrals]),
        36,
        20
      );
      setSelected(consolidated);
      setStatus(
        doc.numPages > maxPages
          ? `Done — analyzed first ${maxPages} of ${doc.numPages} pages.`
          : `Done — ${next.length} page${next.length === 1 ? "" : "s"} analyzed.`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF processing failed");
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  function exportAs(format: "css" | "json" | "tailwind") {
    exportPalette(
      selected.map((hex, i) => ({ hex, name: `pdf-${i + 1}` })),
      format,
      "pdf-palette"
    );
  }

  return (
    <div className="pdf-studio">
      <div className="pdf-shell">
        <div className="pdf-shell-head">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="pdf-kicker">PDF palette studio</p>
              <h2 className="pdf-title">Extract every brand color from a PDF</h2>
              <p className="pdf-muted mt-1 max-w-2xl">
                Renders pages in your browser, reads DeviceRGB / Gray / CMYK paint operators, and
                samples dense pixel accents — then merges a design-ready palette you can export.
              </p>
            </div>
            {fileName ? (
              <Button type="button" variant="outline" size="sm" onClick={clearAll} disabled={busy}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        <div className="pdf-body">
          <div className="pdf-panel space-y-3">
            <p className="pdf-section-label">Source</p>
            <label className="flex items-start gap-2 text-sm leading-snug">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                disabled={busy}
              />
              <span>
                I understand this PDF is processed locally in my browser and I am allowed to analyze
                it. Nothing is uploaded to a server.
              </span>
            </label>

            <div className="pdf-upload">
              <button
                type="button"
                className="pdf-file-btn"
                aria-disabled={!consent || busy}
                disabled={!consent || busy}
                onClick={() => inputRef.current?.click()}
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {busy ? "Extracting…" : "Upload PDF"}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
              {fileName ? (
                <span className="pdf-muted text-sm">
                  {fileName}
                  {pageCount ? ` · ${pageCount} page${pageCount === 1 ? "" : "s"}` : ""}
                </span>
              ) : (
                <span className="pdf-muted text-sm">Up to {MAX_PAGES} pages · max 16 MB</span>
              )}
            </div>

            {busy || progress > 0 ? (
              <div className="space-y-1.5">
                <div className="pdf-progress" aria-hidden>
                  <span style={{ width: `${busy ? Math.max(progress, 4) : progress}%` }} />
                </div>
                {status ? <p className="pdf-muted text-xs">{status}</p> : null}
              </div>
            ) : status ? (
              <p className="pdf-muted text-xs">{status}</p>
            ) : null}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="pdf-hint">
              Solid fills and vector brand colors come from PDF operators. Photos and gradients are
              recovered from rendered pixels. Exact HEX from print RIP / ICC soft-proofs may still
              differ slightly.
            </div>
          </div>

          {pages.length ? (
            <>
              <div className="pdf-stats">
                <div className="pdf-stat">
                  <div className="label">Pages</div>
                  <div className="value">
                    {stats.pages}
                    {stats.total > stats.pages ? ` / ${stats.total}` : ""}
                  </div>
                </div>
                <div className="pdf-stat">
                  <div className="label">Palette</div>
                  <div className="value">{stats.colors}</div>
                </div>
                <div className="pdf-stat">
                  <div className="label">Operator hits</div>
                  <div className="value">{stats.operators}</div>
                </div>
                <div className="pdf-stat">
                  <div className="label">Accent samples</div>
                  <div className="value">{stats.accents}</div>
                </div>
              </div>

              <div className="pdf-panel space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="pdf-section-label" style={{ marginBottom: 0 }}>
                      Consolidated palette
                    </p>
                    <p className="pdf-muted text-xs mt-1">
                      Click a swatch to include or exclude it from export.
                    </p>
                  </div>
                  <div className="pdf-actions">
                    <CopyButton value={selected.join("\n")} label="Copy HEX" />
                    <Button type="button" variant="outline" size="sm" onClick={() => exportAs("css")}>
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      CSS
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => exportAs("json")}>
                      JSON
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => exportAs("tailwind")}
                    >
                      Tailwind
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/brand-color-consistency-checker">Brand checker</Link>
                    </Button>
                  </div>
                </div>

                <div className="pdf-palette">
                  {selected.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      className="pdf-palette-item"
                      onClick={() => toggleColor(hex)}
                      title="Toggle in palette"
                    >
                      <div className="chip" style={{ background: hex }} />
                      <div className="meta">
                        <div className="hex">{hex}</div>
                        <div className="pdf-muted">Selected</div>
                      </div>
                    </button>
                  ))}
                </div>

                {paletteCss ? (
                  <pre className="overflow-x-auto rounded-xl border bg-muted/40 p-3 text-[11px] leading-relaxed font-mono">
                    {`:root {\n${paletteCss}\n}`}
                  </pre>
                ) : null}
              </div>

              <div>
                <p className="pdf-section-label">Page breakdown</p>
                <div className="pdf-grid">
                  {pages.map((p) => (
                    <article key={p.page} className="pdf-page-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.thumbUrl} alt={`PDF page ${p.page}`} />
                      <div className="pdf-page-body">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">Page {p.page}</p>
                          <span className="pdf-muted text-[11px]">{p.all.length} colors</span>
                        </div>

                        {p.operators.length ? (
                          <div>
                            <p className="pdf-muted text-[11px] mb-1">Paint operators</p>
                            <div className="pdf-swatch-row">
                              {p.operators.map((hex) => (
                                <button
                                  key={`op-${p.page}-${hex}`}
                                  type="button"
                                  className={cn(
                                    "pdf-swatch",
                                    selected.includes(normalizeHex(hex)) && "is-selected"
                                  )}
                                  style={{ background: hex }}
                                  title={hex}
                                  onClick={() => toggleColor(hex)}
                                />
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <div>
                          <p className="pdf-muted text-[11px] mb-1">Pixel accents</p>
                          <div className="pdf-swatch-row">
                            {p.accents.map((hex) => (
                              <button
                                key={`a-${p.page}-${hex}`}
                                type="button"
                                className={cn(
                                  "pdf-swatch",
                                  selected.includes(normalizeHex(hex)) && "is-selected"
                                )}
                                style={{ background: hex }}
                                title={hex}
                                onClick={() => toggleColor(hex)}
                              />
                            ))}
                          </div>
                        </div>

                        {p.neutrals.length ? (
                          <div>
                            <p className="pdf-muted text-[11px] mb-1">Paper / neutrals</p>
                            <div className="pdf-swatch-row">
                              {p.neutrals.map((hex) => (
                                <button
                                  key={`n-${p.page}-${hex}`}
                                  type="button"
                                  className={cn(
                                    "pdf-swatch",
                                    selected.includes(normalizeHex(hex)) && "is-selected"
                                  )}
                                  style={{ background: hex }}
                                  title={hex}
                                  onClick={() => toggleColor(hex)}
                                />
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
