"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import { listSvgColors, replaceSvgColor } from "@/lib/svg/color-editor";
import { sanitizeSvgMarkup } from "@/lib/image-studio";
import { generateHarmony } from "@/lib/colors/convert";
import "./flagship-tools.css";

const DEMO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Demo mark">
  <rect width="120" height="120" rx="24" fill="#0f172a"/>
  <circle cx="60" cy="60" r="34" fill="#1d4ed8"/>
  <path d="M36 70 L60 38 L84 70 Z" fill="#e11d48"/>
</svg>`;

export function SvgColorEditor() {
  const [source, setSource] = useState(DEMO_SVG);
  const [history, setHistory] = useState<string[]>([DEMO_SVG]);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState("#1d4ed8");
  const [replacement, setReplacement] = useState("#22c55e");

  const safe = useMemo(() => sanitizeSvgMarkup(history[index] ?? source), [history, index, source]);
  const colors = useMemo(() => listSvgColors(safe), [safe]);

  function commit(next: string) {
    const cleaned = sanitizeSvgMarkup(next);
    const stack = [...history.slice(0, index + 1), cleaned];
    setHistory(stack);
    setIndex(stack.length - 1);
    setSource(cleaned);
  }

  function onUpload(file: File | null) {
    if (!file) return;
    if (file.size > 1_500_000) {
      alert("SVG must be under 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => commit(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  function exportPng() {
    const blob = new Blob([safe], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 512, 512);
      canvas.toBlob((png) => {
        if (!png) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(png);
        a.download = "colorbase-svg.png";
        a.click();
      }, "image/png");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  const harmony = useMemo(() => {
    try {
      return generateHarmony(active, "analogous").filter((h) => h !== active).slice(0, 3);
    } catch {
      return [];
    }
  }, [active]);

  return (
    <div className="flagship-tool">
      <div className="flagship-split">
        <div className="flagship-panel space-y-3">
          <h2 className="text-lg font-semibold">SVG source</h2>
          <p className="flagship-muted">
            Scripts and active content are stripped. Original demo mark is permissive for testing.
          </p>
          <div className="flagship-actions">
            <label className="inline-flex cursor-pointer items-center rounded-md border px-3 py-2 text-sm">
              Upload SVG
              <input
                type="file"
                accept=".svg,image/svg+xml"
                className="sr-only"
                onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
              />
            </label>
            <Button variant="outline" onClick={() => commit(DEMO_SVG)}>
              Load demo
            </Button>
            <Button variant="outline" disabled={index <= 0} onClick={() => setIndex((i) => i - 1)}>
              Undo
            </Button>
            <Button
              variant="outline"
              disabled={index >= history.length - 1}
              onClick={() => setIndex((i) => i + 1)}
            >
              Redo
            </Button>
          </div>
          <textarea
            className="flagship-textarea"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            onBlur={() => commit(source)}
            aria-label="SVG markup"
          />
        </div>
        <div className="space-y-3">
          <div className="flagship-panel space-y-3">
            <h3 className="font-semibold">Live preview</h3>
            <div
              className="flagship-preview flex items-center justify-center p-6"
              dangerouslySetInnerHTML={{ __html: safe }}
            />
            <div className="flagship-actions">
              <Button
                variant="outline"
                onClick={() => {
                  const blob = new Blob([safe], { type: "image/svg+xml" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = "colorbase-edited.svg";
                  a.click();
                }}
              >
                Export SVG
              </Button>
              <Button variant="outline" onClick={exportPng}>
                Export PNG
              </Button>
              <CopyButton value={safe} label="Copy SVG" />
            </div>
          </div>
          <div className="flagship-panel space-y-3">
            <h3 className="font-semibold">Colors</h3>
            <div className="flagship-swatches">
              {colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="flagship-swatch text-left"
                  onClick={() => {
                    setActive(c.hex);
                    setReplacement(c.hex);
                  }}
                >
                  <span className="chip" style={{ background: c.hex }} />
                  <span className="meta block">
                    <span className="font-mono text-xs">{c.hex}</span>
                    <span className="text-muted-foreground block text-[11px]">
                      {c.attr} · {c.count}×
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div className="flagship-row">
              <label className="text-sm">
                Replace
                <input
                  type="color"
                  className="ml-2"
                  value={active}
                  onChange={(e) => setActive(e.target.value)}
                />
              </label>
              <label className="text-sm">
                With
                <input
                  type="color"
                  className="ml-2"
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                />
              </label>
              <Button onClick={() => commit(replaceSvgColor(safe, active, replacement))}>
                Apply
              </Button>
            </div>
            {harmony.length ? (
              <div>
                <p className="flagship-muted mb-2">Harmony suggestions from active color</p>
                <div className="flagship-row">
                  {harmony.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      className="h-8 w-8 rounded-full border"
                      style={{ background: hex }}
                      aria-label={`Use ${hex}`}
                      onClick={() => setReplacement(hex)}
                    />
                  ))}
                </div>
              </div>
            ) : null}
            <Link className="text-primary text-sm underline" href="/tools/harmony-studio">
              Open Harmony Studio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
