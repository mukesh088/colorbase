"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Download,
  Heart,
  ImagePlus,
  Loader2,
  Palette,
  Pipette,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import { extractImagePalette } from "@/lib/colors/image-palette";
import {
  formatRgb,
  formatHsl,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  getContrastRatio,
} from "@/lib/colors/convert";
import { readableInk } from "@/lib/theme-builder";
import { useFavoriteColors } from "@/hooks";
import { downloadText } from "@/lib/utils";
import { colorToolLinks } from "@/lib/colors/tool-links";
import "./image-workbench.css";

export function ImageColorTools({ mode }: { mode: "picker" | "palette" }) {
  const [view, setView] = useState(mode);
  const [state, setState] = useState<"empty" | "loading" | "ready">("empty");
  const [error, setError] = useState("");
  const [imageName, setImageName] = useState("");
  const [palette, setPalette] = useState<string[]>([]);
  const [paletteCount, setPaletteCount] = useState(6);
  const [zoom, setZoom] = useState(1);
  const [samples, setSamples] = useState<{ hex: string; x: number; y: number }[]>([]);
  const { has, toggle, hydrated } = useFavoriteColors();
  const [picked, setPicked] = useState<string | null>(null);
  const [source, setSource] = useState("Palette color");
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });
  const canvas = useRef<HTMLCanvasElement>(null);
  const original = useRef<HTMLImageElement | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const loadVersion = useRef(0);
  const pixels = useRef<Uint8ClampedArray | null>(null);
  const sampleCanvas = useRef<HTMLCanvasElement | null>(null);
  const loupe = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    setView(mode);
  }, [mode]);
  useEffect(
    () => () => {
      loadVersion.current++;
      original.current = null;
      pixels.current = null;
      sampleCanvas.current = null;
    },
    []
  );

  const sample = (x: number, y: number) => {
    if (!original.current) return;
    const image = original.current;
    const px = Math.max(0, Math.min(image.naturalWidth - 1, Math.round(x)));
    const py = Math.max(0, Math.min(image.naturalHeight - 1, Math.round(y)));
    const point = (sampleCanvas.current ??= document.createElement("canvas"));
    if (point.width !== 1 || point.height !== 1) point.width = point.height = 1;
    const ctx = point.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.clearRect(0, 0, 1, 1);
    ctx.drawImage(image, px, py, 1, 1, 0, 0, 1, 1);
    const [r, g, b, alpha] = ctx.getImageData(0, 0, 1, 1).data;
    setCursor({ x: px, y: py });
    if (alpha < 255) {
      setError(
        "This pixel is transparent or translucent. Choose an opaque area for an exact HEX color."
      );
      return;
    }
    const hex = rgbToHex({ r, g, b });
    setPicked(hex);
    setSamples((previous) =>
      [{ hex, x: px, y: py }, ...previous.filter((item) => item.hex !== hex)].slice(0, 12)
    );
    setSource(`Pixel ${px}, ${py}`);
    setError("");
  };

  useEffect(() => {
    if (state !== "ready" || !original.current || !loupe.current) return;
    const ctx = loupe.current.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 110, 110);
    ctx.drawImage(original.current, cursor.x - 5, cursor.y - 5, 11, 11, 0, 0, 110, 110);
  }, [cursor, state]);

  const clear = () => {
    loadVersion.current++;
    original.current = null;
    pixels.current = null;
    setState("empty");
    setPalette([]);
    setPicked(null);
    setSamples([]);
    setImageName("");
    setError("");
    setZoom(1);
  };
  const changeCount = (count: number) => {
    setPaletteCount(count);
    if (pixels.current) setPalette(extractImagePalette(pixels.current, count));
  };

  const load = async (file?: File) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|avif)$/.test(file.type) || file.size > 20 * 1024 * 1024) {
      setError("Choose a PNG, JPG, WebP, or AVIF image smaller than 20 MB.");
      return;
    }
    const version = ++loadVersion.current;
    setState("loading");
    setError("");
    const url = URL.createObjectURL(file);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new window.Image();
        element.onload = () => resolve(element);
        element.onerror = () =>
          reject(new Error("This image could not be opened. Try another file."));
        element.src = url;
      });
      if (version !== loadVersion.current) return;
      if (image.naturalWidth * image.naturalHeight > 40_000_000)
        throw new Error("Choose an image with fewer than 40 million pixels.");
      const target = canvas.current;
      const ctx = target?.getContext("2d", { willReadFrequently: true });
      if (!target || !ctx) throw new Error("Image processing is unavailable in this browser.");
      const scale = Math.min(1, 640 / Math.max(image.naturalWidth, image.naturalHeight));
      target.width = Math.max(1, Math.round(image.naturalWidth * scale));
      target.height = Math.max(1, Math.round(image.naturalHeight * scale));
      ctx.drawImage(image, 0, 0, target.width, target.height);
      const data = ctx.getImageData(0, 0, target.width, target.height).data;
      const colors = extractImagePalette(data, paletteCount);
      pixels.current = data;
      original.current = image;
      setDimensions({ width: image.naturalWidth, height: image.naturalHeight });
      setCursor({ x: Math.floor(image.naturalWidth / 2), y: Math.floor(image.naturalHeight / 2) });
      setPalette(colors);
      setSamples([]);
      setZoom(1);
      setPicked(colors[0] ?? null);
      setSource("Palette color");
      setImageName(file.name);
      setState("ready");
      if (!colors.length)
        setError("No opaque palette colors were found. You can try another image.");
      toast.success("Image ready. Choose a pixel or explore its palette.");
    } catch (reason) {
      if (version === loadVersion.current) {
        setError(reason instanceof Error ? reason.message : "Could not process this image.");
        setState(original.current ? "ready" : "empty");
      }
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  return (
    <section
      className="image-workbench"
      aria-label="Image color workspace"
      onPaste={(event) => {
        const file = event.clipboardData.files[0];
        if (file) {
          event.preventDefault();
          void load(file);
        }
      }}
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes("Files")) event.preventDefault();
      }}
      onDrop={(event) => {
        const file = event.dataTransfer.files[0];
        if (file) {
          event.preventDefault();
          void load(file);
        }
      }}
    >
      <header className="iw-toolbar">
        <div>
          <button aria-pressed={view === "picker"} onClick={() => setView("picker")}>
            <Pipette size={14} />
            Pixel picker
          </button>
          <button aria-pressed={view === "palette"} onClick={() => setView("palette")}>
            <Palette size={14} />
            Image palette
          </button>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInput.current?.click()}
          disabled={state === "loading"}
        >
          {state === "loading" ? <Loader2 className="animate-spin" /> : <Upload />}
          {state === "ready" ? "Replace image" : "Choose image"}
        </Button>
        <input
          ref={fileInput}
          type="file"
          className="sr-only"
          aria-label="Upload image"
          accept="image/png,image/jpeg,image/webp,image/avif"
          onChange={(event) => {
            void load(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </header>
      <div className="iw-layout">
        <div className="iw-image-area">
          {state === "ready" && (
            <div className="iw-view-controls">
              <div role="group" aria-label="Image zoom">
                {[1, 2, 4].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={zoom === value}
                    onClick={() => setZoom(value)}
                  >
                    {value === 1 ? "Fit" : `${value * 100}%`}
                  </button>
                ))}
              </div>
              <button type="button" onClick={clear}>
                <Trash2 size={13} />
                Clear image
              </button>
            </div>
          )}
          <div className="iw-viewport">
            <div
              className={
                state === "ready" ? "iw-canvas-container" : "iw-canvas-container iw-canvas-hidden"
              }
              style={
                zoom > 1
                  ? { width: (canvas.current?.width ?? 640) * zoom, maxWidth: "none" }
                  : undefined
              }
            >
              <canvas
                ref={canvas}
                tabIndex={view === "picker" ? 0 : -1}
                role="img"
                aria-label="Uploaded image. Click to sample an original pixel. Arrow keys move the sample; Shift moves ten pixels."
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  sample(
                    ((event.clientX - rect.left) / rect.width) * dimensions.width,
                    ((event.clientY - rect.top) / rect.height) * dimensions.height
                  );
                }}
                onKeyDown={(event) => {
                  if (!event.key.startsWith("Arrow")) return;
                  event.preventDefault();
                  const step = event.shiftKey ? 10 : 1;
                  sample(
                    cursor.x +
                      (event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0),
                    cursor.y +
                      (event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0)
                  );
                }}
              />
              {view === "picker" && source.startsWith("Pixel") && (
                <span
                  className="iw-pixel-marker"
                  style={{
                    left: `${((cursor.x + 0.5) / dimensions.width) * 100}%`,
                    top: `${((cursor.y + 0.5) / dimensions.height) * 100}%`,
                  }}
                />
              )}
            </div>
          </div>
          {state !== "ready" && (
            <button
              className="iw-dropzone"
              onClick={() => fileInput.current?.click()}
              disabled={state === "loading"}
            >
              {state === "loading" ? (
                <Loader2 size={30} className="animate-spin" />
              ) : (
                <ImagePlus size={30} />
              )}
              <strong>
                {state === "loading" ? "Finding your colors…" : "Every image has a palette."}
              </strong>
              <span>Drop an image, paste it here, or choose a file.</span>
              <small>PNG, JPG, WebP, AVIF · up to 20 MB</small>
              <i>Your image is processed in this browser.</i>
            </button>
          )}
          {state === "ready" && (
            <div className="iw-image-caption">
              <span>{imageName}</span>
              <span>
                {dimensions.width} × {dimensions.height} ·{" "}
                {view === "picker"
                  ? "Click or use arrow keys to sample"
                  : "Choose a palette color to explore"}
              </span>
            </div>
          )}
        </div>
        <aside className="iw-inspector">
          <p className="iw-eyebrow">
            {view === "picker" ? "THE DETAILS IN A SINGLE PIXEL" : "A PALETTE WORTH EXPLORING"}
          </p>
          <h2>{view === "picker" ? "A closer look at color." : "From image to inspiration."}</h2>
          {picked ? (
            <>
              <div className="iw-picked" style={{ background: picked, color: readableInk(picked) }}>
                <span>{source}</span>
                <strong>{picked.toUpperCase()}</strong>
                <span>{formatRgb(hexToRgb(picked))}</span>
              </div>
              <div className="iw-copy-actions">
                <CopyButton value={picked.toUpperCase()} label="HEX" />
                <CopyButton value={formatRgb(hexToRgb(picked))} label="RGB" />
                <CopyButton value={formatHsl(rgbToHsl(hexToRgb(picked)))} label="HSL" />
                <button
                  type="button"
                  className="iw-save"
                  disabled={!hydrated}
                  aria-pressed={has(picked)}
                  onClick={() => toggle(picked)}
                >
                  <Heart size={14} fill={has(picked) ? "currentColor" : "none"} />
                  {has(picked) ? "Saved" : "Save"}
                </button>
              </div>
              {state === "ready" && (
                <div className="iw-loupe">
                  <div>
                    <canvas
                      ref={loupe}
                      width={110}
                      height={110}
                      aria-label="Magnified original image pixels"
                    />
                    <span />
                  </div>
                  <p>
                    Pixel magnifier
                    <br />
                    <strong>
                      {cursor.x}, {cursor.y}
                    </strong>
                    <br />
                    Arrow keys move 1px.
                    <br />
                    Hold Shift for 10px.
                  </p>
                </div>
              )}
              <div className="iw-readability">
                <span>Text on this color</span>
                <strong>
                  {readableInk(picked) === "#000000" ? "Use black" : "Use white"} ·{" "}
                  {getContrastRatio(readableInk(picked), picked).toFixed(2)}:1
                </strong>
                <Link
                  href={`/contrast-checker?fg=${readableInk(picked).slice(1)}&bg=${picked.slice(1)}`}
                >
                  Check the pair <ArrowRight size={12} />
                </Link>
              </div>
              <p className="iw-note">
                Pixel samples use the original decoded image. Palette swatches are approximate
                dominant colors.
              </p>
              <Link className="iw-continue" href={`/color-picker?hex=${picked.slice(1)}`}>
                Refine this color <ArrowRight size={13} />
              </Link>
              <Link className="iw-continue" href={`/theme-builder?hex=${picked.slice(1)}`}>
                Build a theme from this color <ArrowRight size={13} />
              </Link>
            </>
          ) : (
            <div className="iw-empty-inspector">
              <Pipette size={24} />
              <p>Your selected color will appear here.</p>
              <span>Start with an image, then explore the details.</span>
            </div>
          )}
        </aside>
      </div>
      {error && (
        <p role="alert" className="iw-error">
          {error}
        </p>
      )}
      {samples.length > 0 && (
        <section className="iw-samples" aria-label="Sampled image colors">
          <div>
            <h2>Your sampled colors</h2>
            <span>Up to 12 recent samples · this image</span>
          </div>
          <div>
            {samples.map((item) => (
              <button
                type="button"
                key={item.hex}
                aria-label={`Restore sample ${item.hex}`}
                onClick={() => sample(item.x, item.y)}
              >
                <span style={{ background: item.hex }} />
                <code>{item.hex.toUpperCase()}</code>
              </button>
            ))}
          </div>
        </section>
      )}
      <section className="iw-palette">
        <div>
          <div>
            <p className="iw-eyebrow">THE BIGGER PICTURE</p>
            <h2>Colors, together.</h2>
          </div>
          <label className="iw-count">
            Palette size
            <select
              aria-label="Image palette size"
              value={paletteCount}
              disabled={state === "loading"}
              onChange={(e) => changeCount(Number(e.target.value))}
            >
              {[3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                <option key={count} value={count}>
                  {count} colors
                </option>
              ))}
            </select>
          </label>
          {palette.length > 0 && (
            <Link
              href={`/theme-builder?colors=${palette
                .slice(0, 3)
                .map((hex) => hex.slice(1))
                .join("-")}`}
            >
              Build a UI theme <ArrowRight size={13} />
            </Link>
          )}
        </div>
        {palette.length > 0 ? (
          <div className="iw-palette-swatches">
            {palette.map((hex) => (
              <button
                key={hex}
                aria-label={`Explore image color ${hex}`}
                onClick={() => {
                  setPicked(hex);
                  setSource("Palette color");
                  setError("");
                }}
              >
                <span style={{ background: hex }} />
                <code>{hex.toUpperCase()}</code>
              </button>
            ))}
          </div>
        ) : (
          <p className="iw-note">
            Dominant colors from your image will appear here, ready to use in a palette or UI theme.
          </p>
        )}
        {palette.length > 0 && (
          <div className="iw-export-actions">
            <CopyButton value={palette.join("\n")} label="palette HEX" />
            <button
              type="button"
              onClick={() =>
                downloadText(
                  JSON.stringify({ name: "Image palette", colors: palette }, null, 2),
                  "image-palette.json",
                  "application/json"
                )
              }
            >
              <Download size={14} />
              JSON
            </button>
            <button
              type="button"
              onClick={() =>
                downloadText(
                  `:root {\n${palette.map((hex, i) => `  --image-color-${i + 1}: ${hex};`).join("\n")}\n}`,
                  "image-palette.css",
                  "text/css"
                )
              }
            >
              <Download size={14} />
              CSS
            </button>
            {palette.length > 1 && (
              <Link href={colorToolLinks(palette[0], palette).palette}>
                Edit palette <ArrowRight size={13} />
              </Link>
            )}
            <p>
              {palette.length} distinct colors found. Some images have fewer colors than the
              requested size.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}
