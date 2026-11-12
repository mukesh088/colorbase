"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { ArrowLeftRight, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import { getContrastRatio, normalizeHex } from "@/lib/colors/convert";
import { parseFlexibleColor } from "@/lib/colors/parse";
import { cn } from "@/lib/utils";
import "./qr-code-color-designer.css";

type EcLevel = "L" | "M" | "Q" | "H";

const PAYLOAD_PRESETS = [
  { id: "site", label: "Website", value: "https://colorbase.in" },
  { id: "email", label: "Email", value: "mailto:hello@colorbase.in" },
  { id: "wifi", label: "Wi‑Fi", value: "WIFI:T:WPA;S:ColorBase-Guest;P:changeme;;" },
  { id: "text", label: "Plain text", value: "Scan me — ColorBase QR studio" },
];

const COLOR_PRESETS = [
  { id: "ink", label: "Ink on white", fg: "#0f172a", bg: "#ffffff", blurb: "Safest default" },
  { id: "rose", label: "Brand rose", fg: "#be123c", bg: "#fff1f2", blurb: "On-brand, still dark" },
  { id: "navy", label: "Navy card", fg: "#1e3a8a", bg: "#eff6ff", blurb: "Corporate blue" },
  { id: "forest", label: "Forest", fg: "#14532d", bg: "#f0fdf4", blurb: "Green product" },
  { id: "slate", label: "Slate soft", fg: "#334155", bg: "#f8fafc", blurb: "Quiet UI" },
  { id: "invert", label: "Light on dark", fg: "#f8fafc", bg: "#0f172a", blurb: "Dark mode print" },
];

function HexColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <label className="qr-color-field">
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

export function QrCodeColorDesigner() {
  const [text, setText] = useState("https://colorbase.in");
  const [fg, setFg] = useState("#0f172a");
  const [bg, setBg] = useState("#ffffff");
  const [ec, setEc] = useState<EcLevel>("M");
  const [quiet, setQuiet] = useState(2);
  const [size, setSize] = useState(320);
  const [presetId, setPresetId] = useState("ink");
  const [stageDark, setStageDark] = useState(false);
  const [dataUrl, setDataUrl] = useState("");
  const [svg, setSvg] = useState("");
  const [decoded, setDecoded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const ratio = getContrastRatio(fg, bg);
  const risky = ratio < 3;
  const marginal = ratio >= 3 && ratio < 4.5;
  const decodeOk = Boolean(decoded && decoded.trim() && text.trim() && decoded.includes(text.trim().slice(0, 24)));

  const health = useMemo(() => {
    if (error) return { label: "Error", tone: "is-bad" as const };
    if (!text.trim()) return { label: "Empty", tone: "is-warn" as const };
    if (risky) return { label: "Low contrast", tone: "is-bad" as const };
    if (!decoded) return { label: "Decode failed", tone: "is-bad" as const };
    if (marginal) return { label: "OK · watch print", tone: "is-warn" as const };
    return { label: "Scan-ready", tone: "is-ok" as const };
  }, [error, text, risky, decoded, marginal]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setBusy(true);
        setError(null);
        const payload = text.trim() || " ";
        const url = await QRCode.toDataURL(payload, {
          errorCorrectionLevel: ec,
          margin: quiet,
          color: { dark: normalizeHex(fg), light: normalizeHex(bg) },
          width: size,
        });
        const markup = await QRCode.toString(payload, {
          type: "svg",
          errorCorrectionLevel: ec,
          margin: quiet,
          color: { dark: normalizeHex(fg), light: normalizeHex(bg) },
        });
        if (cancelled) return;
        setDataUrl(url);
        setSvg(markup);

        const jsQR = (await import("jsqr")).default;
        const img = new Image();
        img.onload = () => {
          if (cancelled) return;
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(img, 0, 0);
          const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(image.data, image.width, image.height);
          setDecoded(code?.data ?? null);
          setBusy(false);
        };
        img.onerror = () => {
          if (!cancelled) {
            setDecoded(null);
            setBusy(false);
          }
        };
        img.src = url;
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "QR generation failed");
          setDecoded(null);
          setBusy(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [text, fg, bg, ec, quiet, size]);

  function applyColorPreset(id: string) {
    const preset = COLOR_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setPresetId(preset.id);
    setFg(preset.fg);
    setBg(preset.bg);
  }

  function swapColors() {
    setFg(bg);
    setBg(fg);
    setPresetId("");
  }

  function downloadPng() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "colorbase-qr.png";
    a.click();
  }

  function downloadSvg() {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "colorbase-qr.svg";
    a.click();
  }

  return (
    <div className="qr-studio">
      <div className="qr-shell">
        <div className="qr-shell-head">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="qr-kicker">Brand QR studio</p>
              <h2 className="qr-title">Color QR code designer</h2>
              <p className="qr-muted mt-1 max-w-2xl">
                Design scannable branded QR codes with contrast checks, error correction, quiet zone control, and
                in-browser decode validation.
              </p>
            </div>
            <div className="qr-actions">
              <Button variant="outline" className="rounded-full" onClick={() => setStageDark((v) => !v)}>
                {stageDark ? "Light stage" : "Dark stage"}
              </Button>
              <Button className="rounded-full" onClick={downloadPng} disabled={!dataUrl}>
                <Download className="mr-1.5 h-4 w-4" />
                PNG
              </Button>
            </div>
          </div>
        </div>

        <div className="qr-layout">
          <aside className="space-y-4">
            <div className="qr-panel space-y-4">
              <div>
                <p className="qr-section-label">Payload</p>
                <div className="qr-chip-scroll mb-3">
                  {PAYLOAD_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={cn("qr-chip", text === preset.value && "is-active")}
                      onClick={() => setText(preset.value)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <textarea
                  className="qr-textarea"
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 1200))}
                  aria-label="QR payload"
                  placeholder="https://… or any text"
                />
                <p className="qr-muted mt-2 text-xs">{text.length}/1200 characters</p>
              </div>

              <div>
                <p className="qr-section-label">Color presets</p>
                <div className="qr-chip-scroll">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={cn("qr-preset", presetId === preset.id && "is-active")}
                      onClick={() => applyColorPreset(preset.id)}
                    >
                      <div className="pair" aria-hidden>
                        <i style={{ background: preset.fg }} />
                        <i style={{ background: preset.bg }} />
                      </div>
                      <div className="name">{preset.label}</div>
                      <div className="meta">{preset.blurb}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="qr-color-grid">
                <HexColorField
                  label="Modules (dark)"
                  value={fg}
                  onChange={(hex) => {
                    setFg(hex);
                    setPresetId("");
                  }}
                />
                <HexColorField
                  label="Background (light)"
                  value={bg}
                  onChange={(hex) => {
                    setBg(hex);
                    setPresetId("");
                  }}
                />
              </div>

              <div className="qr-actions">
                <Button variant="outline" size="sm" className="rounded-full" onClick={swapColors}>
                  <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />
                  Swap colors
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => applyColorPreset("ink")}
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Reset safe
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="qr-field">
                  <span className="qr-section-label mb-0">Error correction</span>
                  <select className="qr-select" value={ec} onChange={(e) => setEc(e.target.value as EcLevel)}>
                    <option value="L">L · ~7% recovery</option>
                    <option value="M">M · ~15% recovery</option>
                    <option value="Q">Q · ~25% recovery</option>
                    <option value="H">H · ~30% recovery</option>
                  </select>
                </label>
                <label className="qr-field">
                  <span className="qr-section-label mb-0">Export size · {size}px</span>
                  <input
                    type="range"
                    min={180}
                    max={720}
                    step={20}
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                  />
                </label>
              </div>

              <label className="qr-field qr-range-wrap">
                <span className="qr-section-label mb-0">Quiet zone · {quiet} modules</span>
                <input
                  type="range"
                  min={0}
                  max={8}
                  value={quiet}
                  onChange={(e) => setQuiet(Number(e.target.value))}
                />
                <span className="qr-muted text-xs">Keep at least 2 for reliable phone cameras.</span>
              </label>

              {risky ? (
                <p className="qr-hint">
                  Contrast {ratio.toFixed(2)}:1 is below the common 3:1 scanability rule of thumb. Prefer darker
                  modules on a lighter field.
                </p>
              ) : null}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
          </aside>

          <div className="space-y-4">
            <div className={cn("qr-stage", stageDark && "is-dark")}>
              {dataUrl ? (
                <div className="qr-frame" style={{ background: bg }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={dataUrl} alt="Generated QR code preview" />
                </div>
              ) : (
                <p className="qr-muted">Generating preview…</p>
              )}
            </div>

            <div className="qr-status">
              <div className={cn("qr-stat", health.tone)}>
                <p className="label">Health</p>
                <p className="value">{busy ? "Checking…" : health.label}</p>
              </div>
              <div className={cn("qr-stat", risky ? "is-bad" : marginal ? "is-warn" : "is-ok")}>
                <p className="label">Contrast</p>
                <p className="value">{ratio.toFixed(2)}:1</p>
              </div>
              <div className={cn("qr-stat", decoded ? "is-ok" : "is-bad")}>
                <p className="label">Decoder</p>
                <p className="value">{decoded ? "Passed" : "Failed"}</p>
              </div>
              <div className="qr-stat">
                <p className="label">ECC / margin</p>
                <p className="value">
                  {ec} · {quiet}
                </p>
              </div>
            </div>

            <div className="qr-panel space-y-3">
              <p className="qr-section-label mb-0">Validation & export</p>
              <p className="qr-muted text-sm">
                {decoded
                  ? `In-browser decode: “${decoded.slice(0, 96)}${decoded.length > 96 ? "…" : ""}”`
                  : "Could not decode this render in-browser. Raise contrast, ECC, or quiet zone."}
                {decodeOk ? " · Payload matches." : decoded ? " · Decoded text differs from input." : ""}
              </p>
              <div className="qr-actions">
                <Button className="rounded-full" onClick={downloadPng} disabled={!dataUrl}>
                  Download PNG
                </Button>
                <Button variant="outline" className="rounded-full" onClick={downloadSvg} disabled={!svg}>
                  Download SVG
                </Button>
                <CopyButton value={svg} label="Copy SVG" />
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/contrast-checker">Contrast checker</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/brand-color-consistency-checker">Brand check</Link>
                </Button>
              </div>
              <p className="qr-muted text-xs">
                A machine decode here does not guarantee every phone camera or print stock. Test on a device before
                shipping packaging or slides.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
