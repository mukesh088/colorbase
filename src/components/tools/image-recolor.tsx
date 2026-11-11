"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { duotoneImageData, RECOLOR_PRESETS, recolorImageData } from "@/lib/colors/image-recolor";
import { imageFilePalette } from "@/lib/colors/image-palette";
import "./flagship-tools.css";

const MAX_BYTES = 4_000_000;
const MAX_EDGE = 1600;

export function ImageRecolorStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [sourceHex, setSourceHex] = useState("#3b82f6");
  const [targetHex, setTargetHex] = useState("#e11d48");
  const [tolerance, setTolerance] = useState(42);
  const [preserveLuminance, setPreserveLuminance] = useState(true);
  const [mode, setMode] = useState<"recolor" | "duotone">("recolor");
  const [shadow, setShadow] = useState("#0f172a");
  const [highlight, setHighlight] = useState("#f8fafc");
  const [compare, setCompare] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [index, setIndex] = useState(-1);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([]);

  function draw(image: ImageData) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext("2d")?.putImageData(image, 0, 0);
  }

  function commit(image: ImageData) {
    const clone = new ImageData(new Uint8ClampedArray(image.data), image.width, image.height);
    const stack = [...history.slice(0, index + 1), clone];
    setHistory(stack);
    setIndex(stack.length - 1);
    draw(clone);
  }

  async function loadFile(file: File) {
    setError(null);
    if (!/^image\/(png|jpeg|jpg|webp)$/i.test(file.type)) {
      setError("Use PNG, JPEG, or WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File must be under 4 MB for browser processing.");
      return;
    }
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    setFileName(file.name);
    const img = new Image();
    img.onload = async () => {
      const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h);
      setHistory([data]);
      setIndex(0);
      draw(data);
      try {
        const colors = await imageFilePalette(file);
        setPalette(colors.slice(0, 6));
        if (colors[0]) setSourceHex(colors[0]);
      } catch {
        setPalette([]);
      }
    };
    img.src = url;
  }

  function applyRecolor() {
    if (index < 0 || !history[index]) return;
    const base = new ImageData(
      new Uint8ClampedArray(history[index].data),
      history[index].width,
      history[index].height
    );
    if (mode === "duotone") duotoneImageData(base, shadow, highlight);
    else
      recolorImageData(base, {
        sourceHex,
        targetHex,
        tolerance,
        preserveLuminance,
      });
    commit(base);
  }

  function exportImage(type: "image/png" | "image/jpeg" | "image/webp") {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `colorbase-recolor.${type.split("/")[1]}`;
        a.click();
      },
      type,
      0.92
    );
  }

  useEffect(() => {
    if (index >= 0 && history[index]) draw(history[index]);
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flagship-tool">
      <div className="flagship-panel space-y-3">
        <h2 className="text-lg font-semibold">Image recolor & duotone</h2>
        <p className="flagship-muted">
          Processing stays in your browser. Max 4 MB · longest edge scaled to {MAX_EDGE}px. This
          changes pixels — it is not the palette extractor.
        </p>
        <div className="flagship-actions">
          <label className="inline-flex cursor-pointer items-center rounded-md border px-3 py-2 text-sm">
            Upload image
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
            />
          </label>
          <Button
            variant="outline"
            disabled={index <= 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          >
            Undo
          </Button>
          <Button
            variant="outline"
            disabled={index >= history.length - 1}
            onClick={() => setIndex((i) => Math.min(history.length - 1, i + 1))}
          >
            Redo
          </Button>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {fileName ? <p className="flagship-muted">Loaded: {fileName}</p> : null}
      </div>

      <div className="flagship-split">
        <div className="flagship-panel space-y-3">
          <div className="relative overflow-hidden rounded-xl border">
            {originalUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={originalUrl}
                alt="Original"
                className="absolute inset-0 h-full w-full object-contain"
                style={{ clipPath: `inset(0 ${100 - compare}% 0 0)` }}
              />
            ) : null}
            <canvas ref={canvasRef} className="relative mx-auto max-h-[420px] w-full bg-muted" />
          </div>
          <label className="flagship-muted block text-xs">
            Before / after slider
            <input
              type="range"
              min={0}
              max={100}
              value={compare}
              onChange={(e) => setCompare(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </label>
        </div>

        <div className="flagship-panel space-y-3">
          <div className="flagship-row">
            <Button
              variant={mode === "recolor" ? "default" : "outline"}
              onClick={() => setMode("recolor")}
            >
              Selective recolor
            </Button>
            <Button
              variant={mode === "duotone" ? "default" : "outline"}
              onClick={() => setMode("duotone")}
            >
              Duotone
            </Button>
          </div>

          {mode === "recolor" ? (
            <>
              <div className="flagship-row">
                <label className="text-sm">
                  Source
                  <input
                    type="color"
                    className="ml-2"
                    value={sourceHex}
                    onChange={(e) => setSourceHex(e.target.value)}
                  />
                </label>
                <label className="text-sm">
                  Target
                  <input
                    type="color"
                    className="ml-2"
                    value={targetHex}
                    onChange={(e) => setTargetHex(e.target.value)}
                  />
                </label>
              </div>
              <label className="flagship-muted block text-xs">
                Tolerance ({tolerance})
                <input
                  type="range"
                  min={8}
                  max={120}
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="mt-1 w-full"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={preserveLuminance}
                  onChange={(e) => setPreserveLuminance(e.target.checked)}
                />
                Preserve shadows / highlights (luminance)
              </label>
              {palette.length ? (
                <div className="flagship-row">
                  {palette.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      className="h-8 w-8 rounded-full border"
                      style={{ background: hex }}
                      aria-label={`Source ${hex}`}
                      onClick={() => setSourceHex(hex)}
                    />
                  ))}
                </div>
              ) : null}
              <div className="flagship-row">
                {RECOLOR_PRESETS.map((p) => (
                  <Button
                    key={p.id}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSourceHex(p.source);
                      setTargetHex(p.target);
                      setTolerance(p.tolerance);
                    }}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <div className="flagship-row">
              <label className="text-sm">
                Shadow
                <input type="color" className="ml-2" value={shadow} onChange={(e) => setShadow(e.target.value)} />
              </label>
              <label className="text-sm">
                Highlight
                <input
                  type="color"
                  className="ml-2"
                  value={highlight}
                  onChange={(e) => setHighlight(e.target.value)}
                />
              </label>
            </div>
          )}

          <div className="flagship-actions">
            <Button onClick={applyRecolor} disabled={index < 0}>
              Apply
            </Button>
            <Button variant="outline" onClick={() => exportImage("image/png")} disabled={index < 0}>
              PNG
            </Button>
            <Button variant="outline" onClick={() => exportImage("image/jpeg")} disabled={index < 0}>
              JPEG
            </Button>
            <Button variant="outline" onClick={() => exportImage("image/webp")} disabled={index < 0}>
              WebP
            </Button>
          </div>
          <p className="flagship-muted">
            Need only a palette? Use the{" "}
            <Link className="text-primary underline" href="/image-palette-extractor">
              image palette extractor
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
