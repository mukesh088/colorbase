"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { extractImagePalette } from "@/lib/colors/image-palette";
import { mergePalettes } from "@/lib/colors/palette-distance";
import { exportPalette } from "@/lib/colors/export";
import "./flagship-tools.css";

type FramePalette = { time: number; colors: string[] };

export function VideoColorExtractor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [intervalSec, setIntervalSec] = useState(1);
  const [frames, setFrames] = useState<FramePalette[]>([]);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const cancelRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  function onFile(file: File | null) {
    setError(null);
    setFrames([]);
    if (!file) return;
    if (!/^video\/(mp4|webm)$/i.test(file.type) && !/\.(mp4|webm)$/i.test(file.name)) {
      setError("Use MP4 or WebM.");
      return;
    }
    if (file.size > 40_000_000) {
      setError("Keep videos under 40 MB for in-browser sampling.");
      return;
    }
    if (url) URL.revokeObjectURL(url);
    setUrl(URL.createObjectURL(file));
  }

  async function sample() {
    const video = videoRef.current;
    if (!video || !url) return;
    cancelRef.current = false;
    setRunning(true);
    setFrames([]);
    setProgress(0);
    try {
      await video.play().catch(() => undefined);
      video.pause();
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      if (!duration) throw new Error("Could not read duration. Codec may be unsupported.");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Canvas unavailable");
      const times: number[] = [];
      for (let t = 0; t < duration; t += intervalSec) times.push(t);
      times.push(Math.max(0, duration - 0.05));
      const collected: FramePalette[] = [];
      for (let i = 0; i < times.length; i++) {
        if (cancelRef.current) break;
        const t = times[i];
        await new Promise<void>((resolve, reject) => {
          const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked);
            resolve();
          };
          video.addEventListener("seeked", onSeeked);
          video.onerror = () => reject(new Error("Seek failed"));
          video.currentTime = t;
        });
        const scale = Math.min(1, 480 / Math.max(video.videoWidth, video.videoHeight || 1));
        canvas.width = Math.max(1, Math.round((video.videoWidth || 320) * scale));
        canvas.height = Math.max(1, Math.round((video.videoHeight || 180) * scale));
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const colors = extractImagePalette(ctx.getImageData(0, 0, canvas.width, canvas.height).data, 5);
        collected.push({ time: Number(t.toFixed(2)), colors });
        setProgress(Math.round(((i + 1) / times.length) * 100));
        setFrames([...collected]);
      }
      const combined = mergePalettes(collected.map((f) => f.colors), 10);
      setSelected(combined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sampling failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flagship-tool">
      <div className="flagship-panel space-y-3">
        <h2 className="text-lg font-semibold">Video color palette extractor</h2>
        <p className="flagship-muted">
          Samples frames locally in your browser. Large files and uncommon codecs may fail — keep
          sources under 40 MB when possible.
        </p>
        <div className="flagship-actions">
          <label className="inline-flex cursor-pointer items-center rounded-md border px-3 py-2 text-sm">
            Upload MP4/WebM
            <input
              type="file"
              accept="video/mp4,video/webm"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <label className="text-sm">
            Interval (s)
            <input
              type="number"
              min={0.5}
              max={10}
              step={0.5}
              className="flagship-input ml-2 w-24"
              value={intervalSec}
              onChange={(e) => setIntervalSec(Number(e.target.value) || 1)}
            />
          </label>
          <Button onClick={sample} disabled={!url || running}>
            Sample frames
          </Button>
          <Button variant="outline" disabled={!running} onClick={() => { cancelRef.current = true; }}>
            Cancel
          </Button>
        </div>
        {running ? <p className="flagship-muted">Progress {progress}%</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {url ? <video ref={videoRef} src={url} controls className="max-h-64 w-full rounded-xl border" /> : null}
      </div>

      {frames.length ? (
        <div className="flagship-panel space-y-3">
          <h3 className="font-semibold">Timeline palettes</h3>
          <div className="space-y-3">
            {frames.map((f) => (
              <div key={f.time} className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="text-xs font-mono text-primary underline"
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime = f.time;
                  }}
                >
                  {f.time}s
                </button>
                {f.colors.map((hex) => (
                  <button
                    key={`${f.time}-${hex}`}
                    type="button"
                    className="h-8 w-8 rounded border"
                    style={{ background: hex }}
                    aria-label={hex}
                    onClick={() =>
                      setSelected((prev) =>
                        prev.includes(hex) ? prev.filter((h) => h !== hex) : [...prev, hex]
                      )
                    }
                  />
                ))}
              </div>
            ))}
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold">Combined selection</h4>
            <div className="flagship-row">
              {selected.map((hex) => (
                <span key={hex} className="inline-flex items-center gap-1 text-xs">
                  <span className="h-6 w-6 rounded border" style={{ background: hex }} />
                  {hex}
                </span>
              ))}
            </div>
            <div className="flagship-actions mt-3">
              <Button
                variant="outline"
                onClick={() =>
                  exportPalette(
                    selected.map((hex, i) => ({ hex, name: `video-${i + 1}` })),
                    "css",
                    "video-palette"
                  )
                }
              >
                CSS
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  exportPalette(
                    selected.map((hex, i) => ({ hex, name: `video-${i + 1}` })),
                    "json",
                    "video-palette"
                  )
                }
              >
                JSON
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  exportPalette(
                    selected.map((hex, i) => ({ hex, name: `video-${i + 1}` })),
                    "png",
                    "video-palette"
                  )
                }
              >
                PNG sheet
              </Button>
              <Button asChild variant="outline">
                <Link href="/theme-builder">Theme builder</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
