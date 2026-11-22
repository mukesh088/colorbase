"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { simulateColorBlind, simulateColorBlindRgb, normalizeHex, isValidHex } from "@/lib/colors/convert";

const TYPES = [
  { id: "protanopia", label: "Protan (red-weak)" },
  { id: "deuteranopia", label: "Deutan (green-weak)" },
  { id: "tritanopia", label: "Tritan (blue-weak)" },
  { id: "achromatopsia", label: "Achromat (no color)" },
] as const;

type Mode = "colors" | "image" | "website";
const MAX_IMAGE_SIDE = 640;

function parseHexList(text: string) {
  return [...new Set((text.match(/#?[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) ?? []).filter(isValidHex).map((h) => normalizeHex(h)))].slice(0, 16);
}

function SwatchRow({ colors, type, severity }: { colors: string[]; type?: string; severity: number }) {
  return (
    <div className="flex h-12 overflow-hidden rounded-lg border border-border">
      {colors.map((hex, i) => {
        const shown = type ? simulateColorBlind(hex, type, severity) : hex;
        return <span key={`${hex}-${i}`} className="flex-1" style={{ background: shown }} title={shown.toUpperCase()} />;
      })}
    </div>
  );
}

export function ColorBlindSimulator() {
  const [mode, setMode] = useState<Mode>("colors");
  const [severity, setSeverity] = useState(100);
  const [paletteText, setPaletteText] = useState("#ef4444 #22c55e #3b82f6 #eab308 #a855f7");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [simulatedImages, setSimulatedImages] = useState<Record<string, string>>({});
  const [siteUrl, setSiteUrl] = useState("");
  const [siteColors, setSiteColors] = useState<string[]>([]);
  const [siteStatus, setSiteStatus] = useState<string | null>(null);
  const sourceCanvas = useRef<HTMLCanvasElement | null>(null);

  const palette = useMemo(() => parseHexList(paletteText), [paletteText]);
  const k = severity / 100;

  const renderImage = useCallback(() => {
    const canvas = sourceCanvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const original = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const out: Record<string, string> = {};
    const work = document.createElement("canvas");
    work.width = canvas.width;
    work.height = canvas.height;
    const wctx = work.getContext("2d");
    if (!wctx) return;
    for (const { id } of TYPES) {
      const data = new ImageData(new Uint8ClampedArray(original.data), original.width, original.height);
      const px = data.data;
      for (let i = 0; i < px.length; i += 4) {
        const [r, g, b] = simulateColorBlindRgb(px[i], px[i + 1], px[i + 2], id, k);
        px[i] = r;
        px[i + 1] = g;
        px[i + 2] = b;
      }
      wctx.putImageData(data, 0, 0);
      out[id] = work.toDataURL("image/png");
    }
    setSimulatedImages(out);
  }, [k]);

  useEffect(() => {
    if (imageUrl) renderImage();
  }, [imageUrl, renderImage]);

  const onFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(img.width, img.height));
      const canvas = sourceCanvas.current ?? document.createElement("canvas");
      sourceCanvas.current = canvas;
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      setImageUrl(canvas.toDataURL("image/png"));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const analyzeSite = async () => {
    setSiteStatus("Reading the page's CSS…");
    setSiteColors([]);
    try {
      const res = await fetch("/api/website-colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: siteUrl }),
      });
      const json = (await res.json()) as { colors?: { hex: string }[]; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Could not analyze that URL.");
      const colors = [...new Set((json.colors ?? []).map((c) => normalizeHex(c.hex)))].slice(0, 12);
      setSiteColors(colors);
      setSiteStatus(colors.length ? null : "No colors found in that page's HTML and CSS.");
    } catch (error) {
      setSiteStatus(error instanceof Error ? error.message : "Could not analyze that URL.");
    }
  };

  const colorsForMode = mode === "website" ? siteColors : palette;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Simulator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="What to simulate">
            {(
              [
                ["colors", "Colors"],
                ["image", "Image"],
                ["website", "Website URL"],
              ] as const
            ).map(([id, label]) => (
              <Button key={id} type="button" role="tab" aria-selected={mode === id} variant={mode === id ? "default" : "outline"} size="sm" onClick={() => setMode(id)}>
                {label}
              </Button>
            ))}
          </div>

          {mode === "colors" && (
            <div className="space-y-1.5">
              <Label htmlFor="cvd-colors">HEX colors (up to 16)</Label>
              <Input id="cvd-colors" value={paletteText} onChange={(e) => setPaletteText(e.target.value)} placeholder="#ef4444 #22c55e #3b82f6" />
            </div>
          )}
          {mode === "image" && (
            <div className="space-y-1.5">
              <Label htmlFor="cvd-image">Image (stays in your browser)</Label>
              <Input id="cvd-image" type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
            </div>
          )}
          {mode === "website" && (
            <div className="space-y-1.5">
              <Label htmlFor="cvd-url">Public website URL</Label>
              <div className="flex gap-2">
                <Input id="cvd-url" type="url" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://example.com" />
                <Button type="button" onClick={analyzeSite} disabled={!siteUrl}>
                  Analyze
                </Button>
              </div>
              {siteStatus && <p className="text-muted-foreground text-sm">{siteStatus}</p>}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="cvd-severity">Severity: {severity}%</Label>
            <input id="cvd-severity" type="range" min={0} max={100} step={5} value={severity} onChange={(e) => setSeverity(Number(e.target.value))} className="w-full accent-rose-600" />
            <p className="text-muted-foreground text-xs">100% simulates a missing cone type (-opia); lower values approximate weaker anomalous vision (-anomaly).</p>
          </div>
        </CardContent>
      </Card>

      {mode !== "image" && colorsForMode.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-sm font-medium">Normal vision</p>
            <SwatchRow colors={colorsForMode} severity={k} />
          </div>
          {TYPES.map((t) => (
            <div key={t.id}>
              <p className="mb-1.5 text-sm font-medium">{t.label}</p>
              <SwatchRow colors={colorsForMode} type={t.id} severity={k} />
            </div>
          ))}
        </div>
      )}

      {mode === "image" && imageUrl && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Original upload" className="w-full rounded-lg border border-border" />
            <figcaption className="mt-1 text-sm font-medium">Normal vision</figcaption>
          </figure>
          {TYPES.map((t) =>
            simulatedImages[t.id] ? (
              <figure key={t.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={simulatedImages[t.id]} alt={`${t.label} simulation`} className="w-full rounded-lg border border-border" />
                <figcaption className="mt-1 text-sm font-medium">{t.label}</figcaption>
              </figure>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
