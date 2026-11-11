"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getContrastRatio, rgbToHex } from "@/lib/colors/convert";
import "./flagship-tools.css";

export function ImageTextContrastTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("Readable headline");
  const [color, setColor] = useState("#ffffff");
  const [x, setX] = useState(40);
  const [y, setY] = useState(80);
  const [size, setSize] = useState(42);
  const [overlay, setOverlay] = useState(0.35);
  const [shadow, setShadow] = useState(true);
  const [ratio, setRatio] = useState<number | null>(null);
  const [bgSample, setBgSample] = useState("#000000");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  function paint() {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    if (overlay > 0) {
      ctx.fillStyle = `rgba(0,0,0,${overlay})`;
      ctx.fillRect(0, Math.max(0, y - size), canvas.width, size * 2.2);
    }
    ctx.font = `700 ${size}px system-ui, sans-serif`;
    if (shadow) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillText(text, x + 2, y + 2);
    }
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);

    const sampleY = Math.min(canvas.height - 2, Math.max(0, y - Math.round(size * 0.6)));
    const sample = ctx.getImageData(Math.min(canvas.width - 8, x), sampleY, 8, 8).data;
    let r = 0,
      g = 0,
      b = 0,
      n = 0;
    for (let i = 0; i < sample.length; i += 4) {
      r += sample[i];
      g += sample[i + 1];
      b += sample[i + 2];
      n++;
    }
    const bg = rgbToHex({ r: r / n, g: g / n, b: b / n });
    setBgSample(bg);
    setRatio(getContrastRatio(color, bg));
  }

  useEffect(() => {
    paint();
  }, [text, color, x, y, size, overlay, shadow, imageUrl]);

  function loadFile(file: File) {
    if (!/^image\/(png|jpeg|webp)$/i.test(file.type) || file.size > 6_000_000) {
      alert("Use PNG/JPEG/WebP under 6 MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      paint();
    };
    img.src = url;
  }

  function exportImage(type: "image/png" | "image/webp") {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `image-text.${type.split("/")[1]}`;
      a.click();
    }, type);
  }

  return (
    <div className="flagship-tool">
      <div className="flagship-panel space-y-3">
        <h2 className="text-lg font-semibold">Image text readability</h2>
        <p className="flagship-muted">
          Samples local pixels under the headline. Complex photos can fool automation — treat scores as
          guidance, then verify visually.
        </p>
        <label className="inline-flex cursor-pointer items-center rounded-md border px-3 py-2 text-sm">
          Upload photo
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
        </label>
      </div>
      <div className="flagship-split">
        <div className="flagship-panel">
          <canvas ref={canvasRef} className="max-h-[420px] w-full rounded-xl border bg-muted" />
        </div>
        <div className="flagship-panel space-y-3">
          <input
            className="flagship-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Headline text"
          />
          <label className="text-sm">
            Text color
            <input type="color" className="ml-2" value={color} onChange={(e) => setColor(e.target.value)} />
          </label>
          <label className="flagship-muted block text-xs">
            X ({x})
            <input type="range" min={10} max={600} value={x} onChange={(e) => setX(Number(e.target.value))} className="w-full" />
          </label>
          <label className="flagship-muted block text-xs">
            Y ({y})
            <input type="range" min={40} max={800} value={y} onChange={(e) => setY(Number(e.target.value))} className="w-full" />
          </label>
          <label className="flagship-muted block text-xs">
            Size ({size})
            <input type="range" min={18} max={96} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full" />
          </label>
          <label className="flagship-muted block text-xs">
            Dark overlay ({overlay.toFixed(2)})
            <input
              type="range"
              min={0}
              max={0.8}
              step={0.01}
              value={overlay}
              onChange={(e) => setOverlay(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} />
            Text shadow
          </label>
          {ratio != null ? (
            <p className={ratio < 3 ? "text-amber-700 dark:text-amber-300" : "flagship-muted"}>
              Local sample {bgSample} → contrast {ratio.toFixed(2)}:1{" "}
              {ratio < 3 ? "(high risk)" : ratio < 4.5 ? "(borderline for small text)" : "(stronger)"}
            </p>
          ) : (
            <p className="flagship-muted">Upload an image to sample contrast.</p>
          )}
          <div className="flagship-actions">
            <Button variant="outline" onClick={() => exportImage("image/png")} disabled={!imageUrl}>
              Export PNG
            </Button>
            <Button variant="outline" onClick={() => exportImage("image/webp")} disabled={!imageUrl}>
              Export WebP
            </Button>
            <Button asChild variant="outline">
              <Link href="/contrast-checker">Contrast checker</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
