"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Download, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import { normalizeHex } from "@/lib/colors/convert";
import { extractImagePalette } from "@/lib/colors/image-palette";
import { nearestBrandColor, rgbDistance } from "@/lib/colors/palette-distance";
import { parseFlexibleColor } from "@/lib/colors/parse";
import { cn, downloadText } from "@/lib/utils";
import "./brand-color-consistency-checker.css";

type Status = "match" | "near" | "off";

type ReportRow = {
  file: string;
  sample: string;
  nearest: string;
  distance: number;
  status: Status;
};

type FilePreview = {
  name: string;
  thumbUrl: string;
  samples: string[];
};

const BRAND_PRESETS = [
  {
    id: "colorbase",
    label: "ColorBase",
    blurb: "Rose · ink · paper · slate",
    colors: ["#e11d48", "#0f172a", "#f8fafc", "#64748b"],
  },
  {
    id: "ocean",
    label: "Ocean SaaS",
    blurb: "Blue product UI",
    colors: ["#1d4ed8", "#0f172a", "#eff6ff", "#64748b", "#22c55e"],
  },
  {
    id: "forest",
    label: "Forest",
    blurb: "Green brand kit",
    colors: ["#15803d", "#14532d", "#f0fdf4", "#334155", "#fbbf24"],
  },
  {
    id: "mono",
    label: "Mono ink",
    blurb: "Neutral system",
    colors: ["#0f172a", "#334155", "#94a3b8", "#f8fafc", "#e11d48"],
  },
] as const;

const MAX_FILES = 10;
const MAX_BYTES = 6_000_000;

function parsePalette(text: string): string[] {
  const parts = text.split(/[\s,;|\n]+/).map((s) => s.trim()).filter(Boolean);
  const out: string[] = [];
  for (const part of parts) {
    const parsed = parseFlexibleColor(part);
    if (!parsed) continue;
    const hex = normalizeHex(parsed);
    if (!out.includes(hex)) out.push(hex);
  }
  return out;
}

function isNearNeutral(hex: string) {
  const h = normalizeHex(hex);
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  return luma > 245 || luma < 14 || spread < 12;
}

function classify(distance: number, tolerance: number): Status {
  if (distance <= tolerance * 0.45) return "match";
  if (distance <= tolerance) return "near";
  return "off";
}

export function BrandColorConsistencyChecker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [paletteText, setPaletteText] = useState(BRAND_PRESETS[0].colors.join(", "));
  const [presetId, setPresetId] = useState<string>(BRAND_PRESETS[0].id);
  const [tolerance, setTolerance] = useState(36);
  const [ignoreNeutrals, setIgnoreNeutrals] = useState(true);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Status>("all");

  const palette = useMemo(() => parsePalette(paletteText), [paletteText]);

  const scoredRows = useMemo(() => {
    return rows.map((r) => {
      const { hex, distance } = nearestBrandColor(r.sample, palette.length ? palette : ["#000000"]);
      const status = classify(distance, tolerance);
      return { ...r, nearest: hex, distance: Math.round(distance), status };
    });
  }, [rows, palette, tolerance]);

  const visible = useMemo(() => {
    if (filter === "all") return scoredRows;
    return scoredRows.filter((r) => r.status === filter);
  }, [scoredRows, filter]);

  const stats = useMemo(() => {
    const match = scoredRows.filter((r) => r.status === "match").length;
    const near = scoredRows.filter((r) => r.status === "near").length;
    const off = scoredRows.filter((r) => r.status === "off").length;
    const total = scoredRows.length || 1;
    const score = Math.round(((match + near * 0.5) / total) * 100);
    return { match, near, off, total: scoredRows.length, score, files: previews.length };
  }, [scoredRows, previews.length]);

  function applyPreset(id: string) {
    const preset = BRAND_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setPresetId(preset.id);
    setPaletteText(preset.colors.join(", "));
  }

  function removeColor(hex: string) {
    const next = palette.filter((c) => c !== hex);
    setPaletteText(next.join(", "));
    setPresetId("custom");
  }

  function clearResults() {
    setRows([]);
    setPreviews([]);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    if (palette.length === 0) {
      setError("Add at least one approved HEX color first.");
      return;
    }

    setBusy(true);
    setError(null);
    const nextRows: ReportRow[] = [];
    const nextPreviews: FilePreview[] = [];

    try {
      for (const file of Array.from(files).slice(0, MAX_FILES)) {
        if (!/^image\//.test(file.type)) {
          setError("Only image files are supported.");
          continue;
        }
        if (file.size > MAX_BYTES) {
          setError(`Skip ${file.name} — keep each image under 6 MB.`);
          continue;
        }

        const url = URL.createObjectURL(file);
        try {
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const el = new Image();
            el.onload = () => resolve(el);
            el.onerror = () => reject(new Error("Could not decode image"));
            el.src = url;
          });

          const scale = Math.min(1, 480 / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) continue;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const colors = extractImagePalette(
            ctx.getImageData(0, 0, canvas.width, canvas.height).data,
            10
          );

          const samples = colors.filter((hex) => {
            if (!ignoreNeutrals) return true;
            // Keep neutrals if they are part of the approved palette.
            if (palette.some((p) => rgbDistance(p, hex) < 18)) return true;
            return !isNearNeutral(hex);
          });

          nextPreviews.push({
            name: file.name,
            thumbUrl: canvas.toDataURL("image/jpeg", 0.72),
            samples: samples.slice(0, 8),
          });

          for (const sample of samples) {
            const { hex, distance } = nearestBrandColor(sample, palette);
            nextRows.push({
              file: file.name,
              sample,
              nearest: hex,
              distance: Math.round(distance),
              status: classify(distance, tolerance),
            });
          }
        } finally {
          URL.revokeObjectURL(url);
        }
      }

      setPreviews(nextPreviews);
      setRows(nextRows);
      if (!nextRows.length) {
        setError("No usable colors found. Try different screenshots or turn off Ignore neutrals.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Audit failed");
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    const csv = [
      "file,sample,nearest,distance,status",
      ...scoredRows.map(
        (r) => `${JSON.stringify(r.file)},${r.sample},${r.nearest},${r.distance},${r.status}`
      ),
    ].join("\n");
    downloadText(csv, "brand-audit.csv", "text/csv");
  }

  function exportJson() {
    downloadText(
      JSON.stringify(
        {
          palette,
          tolerance,
          ignoreNeutrals,
          score: stats.score,
          summary: { match: stats.match, near: stats.near, off: stats.off },
          rows: scoredRows,
        },
        null,
        2
      ),
      "brand-audit.json",
      "application/json"
    );
  }

  const matchPct = stats.total ? (stats.match / stats.total) * 100 : 0;
  const nearPct = stats.total ? (stats.near / stats.total) * 100 : 0;
  const offPct = stats.total ? (stats.off / stats.total) * 100 : 0;

  return (
    <div className="brand-studio">
      <div className="brand-shell">
        <div className="brand-shell-head">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="brand-kicker">Brand audit studio</p>
              <h2 className="brand-title">Brand color consistency checker</h2>
              <p className="brand-muted mt-1 max-w-2xl">
                Diff marketing screenshots against an approved palette. Flags are review suggestions —
                anti-aliased edges and photo noise can look off-brand even when the UI is correct.
              </p>
            </div>
            {previews.length ? (
              <Button type="button" variant="outline" size="sm" onClick={clearResults} disabled={busy}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        <div className="brand-body">
          <div className="space-y-3">
            <div className="brand-panel space-y-3">
              <p className="brand-section-label">Approved palette</p>
              <div className="brand-presets">
                {BRAND_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={cn("brand-preset", presetId === p.id && "is-on")}
                    onClick={() => applyPreset(p.id)}
                  >
                    <div className="name">{p.label}</div>
                    <div className="blurb">{p.blurb}</div>
                    <div className="swatches">
                      {p.colors.map((c) => (
                        <span key={c} style={{ background: c }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              <textarea
                className="brand-textarea"
                value={paletteText}
                onChange={(e) => {
                  setPaletteText(e.target.value);
                  setPresetId("custom");
                }}
                placeholder="#e11d48, #0f172a, #f8fafc"
                aria-label="Approved palette HEX list"
              />

              {palette.length ? (
                <div className="brand-palette-chips">
                  {palette.map((hex) => (
                    <span key={hex} className="brand-chip">
                      <span className="dot" style={{ background: hex }} />
                      {hex}
                      <button type="button" aria-label={`Remove ${hex}`} onClick={() => removeColor(hex)}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="brand-muted text-xs">Enter at least one valid HEX, RGB, or named color.</p>
              )}
            </div>

            <div className="brand-panel space-y-3">
              <p className="brand-section-label">Audit settings</p>
              <div className="brand-slider">
                <label>
                  <span>Distance tolerance</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{tolerance}</span>
                </label>
                <input
                  type="range"
                  min={12}
                  max={90}
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                />
              </div>
              <p className="brand-muted text-xs">
                Match ≤ {Math.round(tolerance * 0.45)} · Near ≤ {tolerance} · Off above that (sRGB Δ).
              </p>

              <label className="brand-check">
                <input
                  type="checkbox"
                  checked={ignoreNeutrals}
                  onChange={(e) => setIgnoreNeutrals(e.target.checked)}
                />
                Ignore pure white / black / gray noise
              </label>

              <div className="brand-upload">
                <button
                  type="button"
                  className="brand-file-btn"
                  disabled={busy || palette.length === 0}
                  onClick={() => inputRef.current?.click()}
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                  {busy ? "Analyzing…" : "Upload screenshots"}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => onFiles(e.target.files)}
                />
                <span className="brand-muted text-xs">
                  Up to {MAX_FILES} images · 6 MB each · local only
                </span>
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <div className="brand-hint">
                Raise tolerance for photo-heavy creatives. Lower it for UI chrome and solid brand
                fills. Always review “off” flags before filing tickets.
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {scoredRows.length ? (
              <>
                <div className="brand-stats">
                  <div className="brand-stat">
                    <div className="label">Score</div>
                    <div className="value">{stats.score}%</div>
                  </div>
                  <div className="brand-stat">
                    <div className="label">Files</div>
                    <div className="value">{stats.files}</div>
                  </div>
                  <div className="brand-stat is-match">
                    <div className="label">Match</div>
                    <div className="value">{stats.match}</div>
                  </div>
                  <div className="brand-stat is-near">
                    <div className="label">Near</div>
                    <div className="value">{stats.near}</div>
                  </div>
                  <div className="brand-stat is-off">
                    <div className="label">Off-brand</div>
                    <div className="value">{stats.off}</div>
                  </div>
                </div>

                <div className="brand-panel space-y-2">
                  <div className="brand-score-bar" aria-hidden>
                    <span className="match" style={{ width: `${matchPct}%` }} />
                    <span className="near" style={{ width: `${nearPct}%` }} />
                    <span className="off" style={{ width: `${offPct}%` }} />
                  </div>
                  <p className="brand-muted text-xs">
                    Score weights matches fully and near matches at 50%. Off-brand samples need
                    human review.
                  </p>
                </div>

                {previews.length ? (
                  <div>
                    <p className="brand-section-label">Screenshots</p>
                    <div className="brand-file-grid">
                      {previews.map((p) => (
                        <article key={p.name} className="brand-file-card">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.thumbUrl} alt={p.name} />
                          <div className="body">
                            <div className="name" title={p.name}>
                              {p.name}
                            </div>
                            <div className="brand-mini-swatches">
                              {p.samples.map((hex) => (
                                <span key={`${p.name}-${hex}`} style={{ background: hex }} title={hex} />
                              ))}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="brand-panel space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="brand-section-label" style={{ marginBottom: 0 }}>
                        Sample report
                      </p>
                      <p className="brand-muted text-xs mt-1">
                        Showing {visible.length} of {scoredRows.length} samples
                      </p>
                    </div>
                    <div className="brand-actions">
                      <CopyButton
                        value={scoredRows.map((r) => `${r.sample} → ${r.nearest} (${r.status})`).join("\n")}
                        label="Copy"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        CSV
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={exportJson}>
                        JSON
                      </Button>
                    </div>
                  </div>

                  <div className="brand-filters">
                    {(
                      [
                        ["all", "All"],
                        ["match", "Match"],
                        ["near", "Near"],
                        ["off", "Off-brand"],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        className={cn("brand-filter", filter === id && "is-on")}
                        onClick={() => setFilter(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="brand-table-wrap">
                    <table className="brand-table">
                      <thead>
                        <tr>
                          <th>File</th>
                          <th>Sample</th>
                          <th>Nearest brand</th>
                          <th>Δ</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visible.map((r, i) => (
                          <tr key={`${r.file}-${r.sample}-${i}`}>
                            <td className="max-w-[140px] truncate" title={r.file}>
                              {r.file}
                            </td>
                            <td>
                              <span className="brand-swatch-cell">
                                <span className="dot" style={{ background: r.sample }} />
                                {r.sample}
                              </span>
                            </td>
                            <td>
                              <span className="brand-swatch-cell">
                                <span className="dot" style={{ background: r.nearest }} />
                                {r.nearest}
                              </span>
                            </td>
                            <td>
                              <div className="brand-delta">
                                <span className="font-mono text-xs">{r.distance}</span>
                                <div className={cn("bar", `is-${r.status}`)}>
                                  <span style={{ width: `${Math.min(100, (r.distance / 120) * 100)}%` }} />
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={cn("brand-status", r.status)}>{r.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="brand-actions">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/website-color-extractor">Website extractor</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/image-palette-extractor">Image palette</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/pdf-color-extractor">PDF colors</Link>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="brand-empty">
                <p className="font-semibold">Ready to audit</p>
                <p className="brand-muted mt-1 mx-auto max-w-md">
                  Load an approved palette, then upload UI screenshots or marketing stills. Everything
                  stays in your browser.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
