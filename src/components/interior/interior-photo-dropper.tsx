"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pipette } from "lucide-react";
import { rgbToHex } from "@/lib/colors/convert";

function mapCoverClick(
  event: React.MouseEvent<HTMLImageElement>,
  img: HTMLImageElement
) {
  const rect = img.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  if (rect.width <= 0 || rect.height <= 0 || !img.naturalWidth) return null;
  const scale = Math.max(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
  const offsetX = (img.naturalWidth * scale - rect.width) / 2;
  const offsetY = (img.naturalHeight * scale - rect.height) / 2;
  const srcX = Math.floor((x + offsetX) / scale);
  const srcY = Math.floor((y + offsetY) / scale);
  if (srcX < 0 || srcY < 0 || srcX >= img.naturalWidth || srcY >= img.naturalHeight) return null;
  return { srcX, srcY, clientX: event.clientX, clientY: event.clientY };
}

function samplePixel(img: HTMLImageElement, x: number, y: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, x, y, 1, 1, 0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  if (a < 250) return null;
  return rgbToHex({ r, g, b });
}

export function InteriorPhotoDropper({
  src,
  alt,
  enabled,
  onPick,
}: {
  src: string;
  alt: string;
  enabled: boolean;
  onPick: (hex: string) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [hover, setHover] = useState<{ hex: string; x: number; y: number } | null>(null);

  const readPixel = useCallback((event: React.MouseEvent<HTMLImageElement>) => {
    const img = imgRef.current;
    if (!img) return null;
    const mapped = mapCoverClick(event, img);
    if (!mapped) return null;
    const hex = samplePixel(img, mapped.srcX, mapped.srcY);
    if (!hex) return null;
    return { hex, x: event.clientX, y: event.clientY };
  }, []);

  useEffect(() => {
    setHover(null);
  }, [src, enabled]);

  return (
    <div className="relative mt-4 overflow-hidden rounded-2xl border border-border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        className={`max-h-80 w-full object-cover ${enabled ? "cursor-crosshair" : ""}`}
        onClick={(event) => {
          if (!enabled) return;
          const sample = readPixel(event);
          if (sample) onPick(sample.hex);
        }}
        onMouseMove={(event) => {
          if (!enabled) return;
          const sample = readPixel(event);
          setHover(sample);
        }}
        onMouseLeave={() => setHover(null)}
      />
      {enabled ? (
        <p className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-xs font-medium shadow-sm">
          <Pipette className="h-3.5 w-3.5" />
          Click the photo to sample HEX
        </p>
      ) : null}
      {enabled && hover ? (
        <div
          className="pointer-events-none fixed z-50 flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1 text-xs shadow-md"
          style={{ left: hover.x + 16, top: hover.y + 16 }}
        >
          <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: hover.hex }} />
          <span className="font-mono">{hover.hex.toUpperCase()}</span>
        </div>
      ) : null}
    </div>
  );
}
