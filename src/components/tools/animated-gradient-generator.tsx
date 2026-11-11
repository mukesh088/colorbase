"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import {
  MESH_PRESETS,
  meshAnimationCss,
  meshBackgroundCss,
  type MeshPoint,
} from "@/lib/css/animated-gradient";
import { downloadText } from "@/lib/utils";
import "./flagship-tools.css";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function AnimatedGradientGenerator() {
  const [points, setPoints] = useState<MeshPoint[]>(
    MESH_PRESETS[0].points.map((p) => ({ ...p, id: uid() }))
  );
  const [speed, setSpeed] = useState(40);
  const [blur, setBlur] = useState(18);
  const [dark, setDark] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  const config = useMemo(
    () => ({
      points,
      speed,
      blur,
      dark,
      reducedMotion: reducedMotion || !playing,
    }),
    [points, speed, blur, dark, reducedMotion, playing]
  );

  const cssText = useMemo(() => meshAnimationCss(config), [config]);
  const liveStyle = useMemo(() => meshBackgroundCss(config), [config]);

  function exportPng() {
    const node = previewRef.current;
    if (!node) return;
    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 540;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = dark ? "#0b1020" : "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const p of points) {
      const x = (p.x / 100) * canvas.width;
      const y = (p.y / 100) * canvas.height;
      const r = (p.radius / 100) * Math.min(canvas.width, canvas.height);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, p.color);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "mesh-gradient.png";
      a.click();
    });
  }

  function exportSvg() {
    const stops = points
      .map(
        (p, i) =>
          `<radialGradient id="g${i}" cx="${p.x}%" cy="${p.y}%" r="${p.radius}%"><stop offset="0%" stop-color="${p.color}"/><stop offset="100%" stop-color="${p.color}" stop-opacity="0"/></radialGradient>`
      )
      .join("");
    const rects = points.map((_, i) => `<rect width="100%" height="100%" fill="url(#g${i})"/>`).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540"><rect width="100%" height="100%" fill="${dark ? "#0b1020" : "#f8fafc"}"/><defs>${stops}</defs>${rects}</svg>`;
    downloadText(svg, "mesh-gradient.svg", "image/svg+xml");
  }

  async function exportWebm() {
    const node = previewRef.current;
    if (!node) return;
    try {
      // Capture a short canvas approximation — MediaRecorder on DOM needs experimental captureStream.
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 360;
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "mesh-gradient.webm";
        a.click();
      };
      recorder.start();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      let frame = 0;
      const id = window.setInterval(() => {
        ctx.fillStyle = dark ? "#0b1020" : "#f8fafc";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (const p of points) {
          const drift = Math.sin((frame + p.x) / 18) * 12;
          const x = ((p.x + drift) / 100) * canvas.width;
          const y = ((p.y + drift * 0.4) / 100) * canvas.height;
          const r = (p.radius / 100) * 280;
          const g = ctx.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, p.color);
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        frame += 1;
        if (frame > 60) {
          clearInterval(id);
          recorder.stop();
        }
      }, 1000 / 30);
    } catch {
      alert("WebM export is not supported in this browser. Use PNG/SVG/CSS instead.");
    }
  }

  return (
    <div className="flagship-tool">
      <div className="flagship-panel space-y-3">
        <h2 className="text-lg font-semibold">Animated mesh gradient</h2>
        <p className="flagship-muted">
          Soft multi-stop radial layers with optional drift animation. Distinct from linear/radial/conic
          CSS generators. Prefer reduced motion when the OS asks for it.
        </p>
        <div
          ref={previewRef}
          className="flagship-preview relative min-h-[260px]"
          style={{
            ...liveStyle,
            animation: config.reducedMotion
              ? undefined
              : `mesh-drift ${Math.max(8, Math.round(48 - speed * 0.35))}s ease-in-out infinite alternate`,
            backgroundSize: config.reducedMotion ? "100% 100%" : "140% 140%",
          }}
        >
          <style>{`@keyframes mesh-drift { from { background-position: 0% 20%; } to { background-position: 80% 40%; } }`}</style>
          {points.map((p) => (
            <button
              key={p.id}
              type="button"
              className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
              style={{ left: `${p.x}%`, top: `${p.y}%`, background: p.color }}
              aria-label={`Color point ${p.color}`}
              onMouseDown={(e) => {
                const parent = previewRef.current;
                if (!parent) return;
                const move = (ev: MouseEvent) => {
                  const rect = parent.getBoundingClientRect();
                  const x = Math.min(100, Math.max(0, ((ev.clientX - rect.left) / rect.width) * 100));
                  const y = Math.min(100, Math.max(0, ((ev.clientY - rect.top) / rect.height) * 100));
                  setPoints((prev) => prev.map((pt) => (pt.id === p.id ? { ...pt, x, y } : pt)));
                };
                const up = () => {
                  window.removeEventListener("mousemove", move);
                  window.removeEventListener("mouseup", up);
                };
                window.addEventListener("mousemove", move);
                window.addEventListener("mouseup", up);
                e.preventDefault();
              }}
            />
          ))}
        </div>
      </div>

      <div className="flagship-split">
        <div className="flagship-panel space-y-3">
          <h3 className="font-semibold">Controls</h3>
          <div className="flagship-row">
            {MESH_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                size="sm"
                variant="outline"
                onClick={() => setPoints(preset.points.map((p) => ({ ...p, id: uid() })))}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <label className="flagship-muted block text-xs">
            Animation speed ({speed})
            <input
              type="range"
              min={1}
              max={100}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </label>
          <label className="flagship-muted block text-xs">
            Blur ({blur}px)
            <input
              type="range"
              min={0}
              max={40}
              value={blur}
              onChange={(e) => setBlur(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </label>
          <div className="flagship-row">
            <Button variant="outline" onClick={() => setPlaying((p) => !p)}>
              {playing ? "Pause" : "Play"}
            </Button>
            <Button variant="outline" onClick={() => setDark((d) => !d)}>
              {dark ? "Light preview" : "Dark preview"}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setPoints((prev) => [
                  ...prev,
                  { id: uid(), x: 50, y: 50, color: "#f472b6", radius: 40 },
                ])
              }
            >
              Add point
            </Button>
          </div>
          <div className="space-y-2">
            {points.map((p) => (
              <div key={p.id} className="flagship-row">
                <input
                  type="color"
                  value={p.color}
                  onChange={(e) =>
                    setPoints((prev) =>
                      prev.map((pt) => (pt.id === p.id ? { ...pt, color: e.target.value } : pt))
                    )
                  }
                  aria-label="Point color"
                />
                <label className="text-xs">
                  Spread
                  <input
                    type="range"
                    min={20}
                    max={70}
                    value={p.radius}
                    onChange={(e) =>
                      setPoints((prev) =>
                        prev.map((pt) =>
                          pt.id === p.id ? { ...pt, radius: Number(e.target.value) } : pt
                        )
                      )
                    }
                  />
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={points.length <= 2}
                  onClick={() => setPoints((prev) => prev.filter((pt) => pt.id !== p.id))}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div className="flagship-panel space-y-3">
          <h3 className="font-semibold">Export</h3>
          <pre className="max-h-56 overflow-auto rounded-lg bg-muted p-3 text-xs">{cssText}</pre>
          <div className="flagship-actions">
            <CopyButton value={cssText} label="Copy CSS" />
            <Button variant="outline" onClick={() => downloadText(cssText, "mesh-gradient.css", "text/css")}>
              CSS file
            </Button>
            <Button variant="outline" onClick={exportPng}>
              PNG
            </Button>
            <Button variant="outline" onClick={exportSvg}>
              SVG
            </Button>
            <Button variant="outline" onClick={exportWebm}>
              WebM
            </Button>
          </div>
          <p className="flagship-muted">
            WebM support varies by browser. For classic gradients see{" "}
            <Link className="text-primary underline" href="/gradient-generator">
              gradient generator
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
