"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import {
  Download,
  ImagePlus,
  Pipette,
  Redo2,
  RotateCcw,
  Undo2,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { normalizeHex, rgbToHex } from "@/lib/colors/convert";
import { extractImagePalette } from "@/lib/colors/image-palette";
import {
  DUOTONE_PRESETS,
  RECOLOR_PRESETS,
  applyDuotonePreview,
  applyRecolorPreview,
  cloneImageData,
} from "@/lib/colors/image-recolor";
import { parseFlexibleColor } from "@/lib/colors/parse";
import { cn } from "@/lib/utils";
import "./image-recolor.css";

const MAX_BYTES = 8_000_000;
const MAX_EDGE = 1600;

type Mode = "recolor" | "duotone";

function HexField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <label className="recolor-color-field">
      {label}
      <span className="row">
        <input
          type="color"
          value={normalizeHex(value)}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const parsed = parseFlexibleColor(e.target.value);
            if (parsed) onChange(normalizeHex(parsed));
            else onChange(e.target.value);
          }}
          aria-label={`${label} hex`}
        />
      </span>
    </label>
  );
}

function put(canvas: HTMLCanvasElement | null, image: ImageData | null) {
  if (!canvas || !image) return;
  canvas.width = image.width;
  canvas.height = image.height;
  canvas.getContext("2d")?.putImageData(image, 0, 0);
}

export function ImageRecolorStudio() {
  const inputRef = useRef<HTMLInputElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("recolor");
  const [sourceHex, setSourceHex] = useState("#3b82f6");
  const [targetHex, setTargetHex] = useState("#e11d48");
  const [tolerance, setTolerance] = useState(48);
  const [strength, setStrength] = useState(1);
  const [preserveLuminance, setPreserveLuminance] = useState(true);
  const [matchRgb, setMatchRgb] = useState(true);
  const [shadow, setShadow] = useState("#0f172a");
  const [highlight, setHighlight] = useState("#f8fafc");
  const [duotoneContrast, setDuotoneContrast] = useState(8);
  const [compare, setCompare] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pickMode, setPickMode] = useState(false);
  const [presetId, setPresetId] = useState<string | null>("rose-brand");
  const [palette, setPalette] = useState<string[]>([]);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [index, setIndex] = useState(-1);
  const [preview, setPreview] = useState<ImageData | null>(null);

  const hasImage = index >= 0 && !!history[index];
  const base = hasImage ? history[index]! : null;

  const rebuildPreview = useCallback(() => {
    if (!base) {
      setPreview(null);
      return;
    }
    if (mode === "duotone") {
      setPreview(
        applyDuotonePreview(base, shadow, highlight, {
          strength,
          contrast: duotoneContrast,
        })
      );
      return;
    }
    setPreview(
      applyRecolorPreview(base, {
        sourceHex,
        targetHex,
        tolerance,
        preserveLuminance,
        strength,
        matchRgb,
      })
    );
  }, [
    base,
    mode,
    shadow,
    highlight,
    strength,
    duotoneContrast,
    sourceHex,
    targetHex,
    tolerance,
    preserveLuminance,
    matchRgb,
  ]);

  useEffect(() => {
    rebuildPreview();
  }, [rebuildPreview]);

  useEffect(() => {
    put(originalCanvasRef.current, base);
  }, [base]);

  useEffect(() => {
    put(previewCanvasRef.current, preview ?? base);
  }, [preview, base]);

  const dims = useMemo(() => {
    const img = preview ?? base;
    if (!img) return null;
    return { w: img.width, h: img.height };
  }, [preview, base]);

  function clearObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  async function loadFile(file: File) {
    setError(null);
    if (!/^image\/(png|jpeg|jpg|webp)$/i.test(file.type)) {
      setError("Use PNG, JPEG, or WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Keep files under 8 MB for browser processing.");
      return;
    }

    setBusy(true);
    clearObjectUrl();
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setFileName(file.name);

    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("Could not decode this image."));
        el.src = url;
      });

      const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Canvas unavailable in this browser.");
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h);
      const original = cloneImageData(data);
      setHistory([original]);
      setIndex(0);
      setCompare(50);

      const colors = extractImagePalette(data.data, 8);
      setPalette(colors);
      if (colors[0]) setSourceHex(colors[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load image");
      setHistory([]);
      setIndex(-1);
      setPreview(null);
    } finally {
      setBusy(false);
    }
  }

  function applyCommit() {
    if (!preview) return;
    const next = cloneImageData(preview);
    const stack = [...history.slice(0, index + 1), next].slice(-24);
    setHistory(stack);
    setIndex(stack.length - 1);
  }

  function resetOriginal() {
    if (!history[0]) return;
    setIndex(0);
    setHistory([history[0]]);
  }

  function exportImage(type: "image/png" | "image/jpeg" | "image/webp") {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        const href = URL.createObjectURL(blob);
        a.href = href;
        a.download = `colorbase-recolor.${type.split("/")[1]}`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(href), 1500);
      },
      type,
      0.92
    );
  }

  function sampleFromEvent(e: MouseEvent<HTMLCanvasElement>) {
    const img = base;
    if (!img) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.min(
      img.width - 1,
      Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * img.width))
    );
    const y = Math.min(
      img.height - 1,
      Math.max(0, Math.floor(((e.clientY - rect.top) / rect.height) * img.height))
    );
    const i = (y * img.width + x) * 4;
    const hex = rgbToHex({
      r: img.data[i]!,
      g: img.data[i + 1]!,
      b: img.data[i + 2]!,
    });
    setSourceHex(hex);
    setMode("recolor");
    setPickMode(false);
    setPresetId(null);
  }

  useEffect(() => () => clearObjectUrl(), []);

  return (
    <div className="recolor-studio">
      <div className="recolor-shell">
        <div className="recolor-shell-head">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="recolor-kicker">Pixel studio</p>
              <h2 className="recolor-title">Image recolor &amp; duotone</h2>
              <p className="recolor-muted mt-1 max-w-2xl">
                Rewrite image pixels in your browser — selective hue replacement or full duotone
                washes, with live before/after, undo, and PNG/JPEG/WebP export.
              </p>
            </div>
            <div className="recolor-actions">
              <button
                type="button"
                className="recolor-file-btn"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4" />
                {busy ? "Loading…" : "Upload image"}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
              />
            </div>
          </div>
        </div>

        <div className="recolor-layout">
          <div className="space-y-3">
            <div className="recolor-panel space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="recolor-section-label" style={{ marginBottom: 0 }}>
                    Stage
                  </p>
                  <p className="recolor-muted text-xs mt-1">
                    {fileName
                      ? `${fileName}${dims ? ` · ${dims.w}×${dims.h}` : ""}`
                      : `PNG / JPEG / WebP · max 8 MB · edge ≤ ${MAX_EDGE}px`}
                  </p>
                </div>
                <div className="recolor-actions">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index <= 0}
                    onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  >
                    <Undo2 className="mr-1.5 h-3.5 w-3.5" />
                    Undo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index < 0 || index >= history.length - 1}
                    onClick={() => setIndex((i) => Math.min(history.length - 1, i + 1))}
                  >
                    <Redo2 className="mr-1.5 h-3.5 w-3.5" />
                    Redo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!hasImage}
                    onClick={resetOriginal}
                  >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    Reset
                  </Button>
                </div>
              </div>

              <div className="recolor-stage">
                {hasImage ? (
                  <div className="recolor-stage-inner">
                    <div className="recolor-badges">
                      <span>Before</span>
                      <span>After</span>
                    </div>
                    {/* Preview (after) underneath */}
                    <canvas
                      ref={previewCanvasRef}
                      onClick={(e) => {
                        if (pickMode) sampleFromEvent(e);
                      }}
                      aria-label="Recolored preview"
                      style={{ cursor: pickMode ? "crosshair" : "default" }}
                    />
                    {/* Original (before) clipped on top */}
                    <canvas
                      ref={originalCanvasRef}
                      className="overlay-canvas"
                      style={{ clipPath: `inset(0 ${100 - compare}% 0 0)` }}
                      aria-hidden
                    />
                    <div className="recolor-split-line" style={{ left: `${compare}%` }} />
                  </div>
                ) : (
                  <div className="recolor-empty">
                    Upload a photo or UI screenshot to start recoloring pixels.
                  </div>
                )}
              </div>

              {hasImage ? (
                <div className="recolor-slider">
                  <label>
                    <span>Before / after</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{compare}%</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={compare}
                    onChange={(e) => setCompare(Number(e.target.value))}
                  />
                </div>
              ) : null}

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
          </div>

          <div className="space-y-3">
            <div className="recolor-panel space-y-3">
              <p className="recolor-section-label">Mode</p>
              <div className="recolor-seg" role="tablist" aria-label="Recolor mode">
                <button
                  type="button"
                  className={cn(mode === "recolor" && "is-on")}
                  onClick={() => setMode("recolor")}
                >
                  Selective recolor
                </button>
                <button
                  type="button"
                  className={cn(mode === "duotone" && "is-on")}
                  onClick={() => setMode("duotone")}
                >
                  Duotone
                </button>
              </div>

              {mode === "recolor" ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <HexField label="Source" value={sourceHex} onChange={(h) => { setSourceHex(h); setPresetId(null); }} />
                    <HexField label="Target" value={targetHex} onChange={(h) => { setTargetHex(h); setPresetId(null); }} />
                  </div>

                  <Button
                    type="button"
                    variant={pickMode ? "default" : "outline"}
                    size="sm"
                    disabled={!hasImage}
                    onClick={() => setPickMode((v) => !v)}
                  >
                    <Pipette className="mr-1.5 h-3.5 w-3.5" />
                    {pickMode ? "Click image…" : "Eyedrop source"}
                  </Button>

                  {palette.length ? (
                    <div>
                      <p className="recolor-section-label">Image palette</p>
                      <div className="recolor-swatches">
                        {palette.map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            className={cn(normalizeHex(sourceHex) === hex && "is-on")}
                            style={{ background: hex }}
                            title={hex}
                            aria-label={`Use source ${hex}`}
                            onClick={() => {
                              setSourceHex(hex);
                              setPresetId(null);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="recolor-slider">
                    <label>
                      <span>Tolerance</span>
                      <span className="font-mono text-[11px] text-muted-foreground">{tolerance}</span>
                    </label>
                    <input
                      type="range"
                      min={8}
                      max={120}
                      value={tolerance}
                      onChange={(e) => setTolerance(Number(e.target.value))}
                    />
                  </div>

                  <div className="recolor-slider">
                    <label>
                      <span>Strength</span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {strength.toFixed(2)}
                      </span>
                    </label>
                    <input
                      type="range"
                      min={0.05}
                      max={1}
                      step={0.01}
                      value={strength}
                      onChange={(e) => setStrength(Number(e.target.value))}
                    />
                  </div>

                  <label className="recolor-check">
                    <input
                      type="checkbox"
                      checked={preserveLuminance}
                      onChange={(e) => setPreserveLuminance(e.target.checked)}
                    />
                    Preserve shadows / highlights
                  </label>
                  <label className="recolor-check">
                    <input
                      type="checkbox"
                      checked={matchRgb}
                      onChange={(e) => setMatchRgb(e.target.checked)}
                    />
                    Also match flat RGB fills
                  </label>

                  <p className="recolor-section-label">Presets</p>
                  <div className="recolor-presets">
                    {RECOLOR_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={cn("recolor-preset", presetId === p.id && "is-on")}
                        onClick={() => {
                          setPresetId(p.id);
                          setSourceHex(p.source);
                          setTargetHex(p.target);
                          setTolerance(p.tolerance);
                          setMode("recolor");
                        }}
                      >
                        <div className="name">{p.label}</div>
                        <div className="swatches">
                          <span style={{ background: p.source }} />
                          <span style={{ background: p.target }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <HexField label="Shadow" value={shadow} onChange={(h) => { setShadow(h); setPresetId(null); }} />
                    <HexField label="Highlight" value={highlight} onChange={(h) => { setHighlight(h); setPresetId(null); }} />
                  </div>

                  <div className="recolor-slider">
                    <label>
                      <span>Strength</span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {strength.toFixed(2)}
                      </span>
                    </label>
                    <input
                      type="range"
                      min={0.05}
                      max={1}
                      step={0.01}
                      value={strength}
                      onChange={(e) => setStrength(Number(e.target.value))}
                    />
                  </div>

                  <div className="recolor-slider">
                    <label>
                      <span>Contrast</span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {duotoneContrast}
                      </span>
                    </label>
                    <input
                      type="range"
                      min={-40}
                      max={40}
                      value={duotoneContrast}
                      onChange={(e) => setDuotoneContrast(Number(e.target.value))}
                    />
                  </div>

                  <p className="recolor-section-label">Duotone presets</p>
                  <div className="recolor-presets">
                    {DUOTONE_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={cn("recolor-preset", presetId === p.id && "is-on")}
                        onClick={() => {
                          setPresetId(p.id);
                          setShadow(p.shadow);
                          setHighlight(p.highlight);
                          setMode("duotone");
                        }}
                      >
                        <div className="name">{p.label}</div>
                        <div className="swatches">
                          <span style={{ background: p.shadow }} />
                          <span style={{ background: p.highlight }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="recolor-actions">
                <Button type="button" disabled={!preview} onClick={applyCommit}>
                  <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                  Apply
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!hasImage}
                  onClick={() => exportImage("image/png")}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  PNG
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!hasImage}
                  onClick={() => exportImage("image/jpeg")}
                >
                  JPEG
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!hasImage}
                  onClick={() => exportImage("image/webp")}
                >
                  WebP
                </Button>
              </div>

              <div className="recolor-hint">
                Live preview updates as you move sliders. Click <strong>Apply</strong> to commit into
                the undo stack. Click the image (or Eyedrop) to set the source color from a pixel.
              </div>

              <div className="recolor-actions">
                <Button asChild variant="outline" size="sm">
                  <Link href="/image-palette-extractor">Palette extractor</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/svg-color-editor">SVG recolor</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
