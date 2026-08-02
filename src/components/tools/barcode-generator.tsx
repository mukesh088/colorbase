"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eraser,
  Loader2,
  ScanBarcode,
  Sparkles,
  Wand2,
} from "lucide-react";
import JsBarcode from "jsbarcode";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CopyButton } from "@/components/color/copy-button";
import { PrimaryButton } from "@/components/tools/suite/workbench";
import { cn } from "@/lib/utils";

type BarcodeFormat =
  | "CODE128"
  | "CODE39"
  | "EAN13"
  | "EAN8"
  | "UPC"
  | "ITF14"
  | "MSI"
  | "pharmacode"
  | "codabar";

type Settings = {
  value: string;
  format: BarcodeFormat;
  lineColor: string;
  bgColor: string;
  barWidth: number;
  barHeight: number;
  displayValue: boolean;
};

const FORMATS: { id: BarcodeFormat; label: string; hint: string; sample: string }[] = [
  { id: "CODE128", label: "Code 128", hint: "General purpose (letters + numbers)", sample: "COLORBASE-128" },
  { id: "CODE39", label: "Code 39", hint: "Uppercase + digits", sample: "COLORBASE" },
  { id: "EAN13", label: "EAN-13", hint: "12 digits (check digit auto)", sample: "590123412345" },
  { id: "EAN8", label: "EAN-8", hint: "7 digits (check digit auto)", sample: "9638507" },
  { id: "UPC", label: "UPC-A", hint: "11 digits (check digit auto)", sample: "12345678901" },
  { id: "ITF14", label: "ITF-14", hint: "13 digits (check digit auto)", sample: "1234567890123" },
  { id: "MSI", label: "MSI", hint: "Digits only", sample: "1234567" },
  { id: "pharmacode", label: "Pharmacode", hint: "Number 3–131070", sample: "1234" },
  { id: "codabar", label: "Codabar", hint: "Digits + -$:/.+", sample: "A123456A" },
];

const INITIAL: Settings = {
  value: "COLORBASE-128",
  format: "CODE128",
  lineColor: "#0f172a",
  bgColor: "#ffffff",
  barWidth: 2,
  barHeight: 80,
  displayValue: true,
};

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

function svgToPngDataUrl(svgEl: SVGSVGElement, scale = 2): Promise<string> {
  const xml = new XMLSerializer().serializeToString(svgEl);
  const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const w = Math.max(1, svgEl.width.baseVal.value || svgEl.getBBox().width);
      const h = Math.max(1, svgEl.height.baseVal.value || svgEl.getBBox().height);
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas unavailable"));
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to rasterize SVG"));
    };
    img.src = url;
  });
}

function renderBarcodeSvg(settings: Settings): { svg: string; error: string | null } {
  const text = settings.value.trim();
  if (!text) return { svg: "", error: "Enter a value to encode" };

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  try {
    JsBarcode(svg, text, {
      format: settings.format,
      lineColor: settings.lineColor,
      background: settings.bgColor,
      width: settings.barWidth,
      height: settings.barHeight,
      displayValue: settings.displayValue,
      margin: 12,
      fontSize: 16,
      textMargin: 6,
    });
    return { svg: new XMLSerializer().serializeToString(svg), error: null };
  } catch (e) {
    return {
      svg: "",
      error: e instanceof Error ? e.message : `Could not encode as ${settings.format}`,
    };
  }
}

export function BarcodeGeneratorTool() {
  const reactId = useId().replace(/:/g, "");
  const previewRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<Settings>(INITIAL);
  const [applied, setApplied] = useState<Settings | null>(null);
  const [svgMarkup, setSvgMarkup] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [waveKey, setWaveKey] = useState(0);

  const activeFormat = FORMATS.find((f) => f.id === draft.format)!;
  const ready = Boolean(svgMarkup) && !error && !generating;

  const generate = useCallback(async (settings: Settings = draft) => {
    if (!settings.value.trim()) {
      toast.error("Enter a value first");
      setError("Enter a value to encode");
      return;
    }
    setGenerating(true);
    setError(null);
    setWaveKey((k) => k + 1);

    // Short delay so the loading animation is visible
    await new Promise((r) => window.setTimeout(r, 450));

    const result = renderBarcodeSvg(settings);
    if (result.error) {
      setError(result.error);
      setApplied(settings);
      setGenerating(false);
      toast.error("Could not generate barcode");
      return;
    }

    setSvgMarkup(result.svg);
    setApplied(settings);
    setError(null);
    setGenerating(false);
    toast.success("Barcode generated");
  }, [draft]);

  // Initial sample on mount
  useEffect(() => {
    void generate(INITIAL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadSvg = () => {
    if (!svgMarkup) {
      toast.error("Generate a barcode first");
      return;
    }
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    downloadDataUrl(url, `barcode-${(applied?.format ?? "code").toLowerCase()}.svg`);
    URL.revokeObjectURL(url);
    toast.success("SVG downloaded");
  };

  const downloadPng = async () => {
    const host = previewRef.current;
    const svg = host?.querySelector("svg");
    if (!svg || !ready) {
      toast.error("Generate a barcode first");
      return;
    }
    try {
      const png = await svgToPngDataUrl(svg, 3);
      downloadDataUrl(png, `barcode-${(applied?.format ?? "code").toLowerCase()}.png`);
      toast.success("PNG downloaded");
    } catch {
      toast.error("PNG export failed");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
          <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Workspace
                </p>
                <h2 className="font-display text-base font-semibold tracking-tight sm:text-lg">
                  Barcode Generator
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Edit settings, then press Generate — preview stays stable while you type.
                </p>
              </div>
              <Badge variant="secondary" className="rounded-full">
                <ScanBarcode className="mr-1 h-3.5 w-3.5" />
                Local only
              </Badge>
            </div>
          </div>

          <div className="space-y-4 p-3 sm:p-5">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-full"
                onClick={() =>
                  setDraft((d) => ({ ...d, value: FORMATS.find((f) => f.id === d.format)!.sample }))
                }
              >
                <Sparkles className="h-3.5 w-3.5" />
                Sample
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-full"
                onClick={() => setDraft((d) => ({ ...d, value: "" }))}
              >
                <Eraser className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="barcode-value">Value</Label>
              <Input
                id="barcode-value"
                value={draft.value}
                onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void generate();
                  }
                }}
                spellCheck={false}
                placeholder={activeFormat.sample}
                className="h-11 rounded-xl font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground">{activeFormat.hint}</p>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <div className="flex flex-wrap gap-2">
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, format: f.id, value: f.sample }))}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      draft.format === f.id
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30 hover:bg-muted/60"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Bar color</Label>
                <Input
                  type="color"
                  value={draft.lineColor}
                  onChange={(e) => setDraft((d) => ({ ...d, lineColor: e.target.value }))}
                  className="h-10 w-full p-1"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Background</Label>
                <Input
                  type="color"
                  value={draft.bgColor}
                  onChange={(e) => setDraft((d) => ({ ...d, bgColor: e.target.value }))}
                  className="h-10 w-full p-1"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Bar width · {draft.barWidth}px</Label>
              <Slider
                min={1}
                max={4}
                step={0.5}
                value={[draft.barWidth]}
                onValueChange={([n]) => setDraft((d) => ({ ...d, barWidth: n }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Bar height · {draft.barHeight}px</Label>
              <Slider
                min={40}
                max={160}
                step={4}
                value={[draft.barHeight]}
                onValueChange={([n]) => setDraft((d) => ({ ...d, barHeight: n }))}
              />
            </div>

            <button
              type="button"
              onClick={() => setDraft((d) => ({ ...d, displayValue: !d.displayValue }))}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                draft.displayValue
                  ? "border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                  : "border-border/60 bg-background hover:bg-muted/50"
              )}
            >
              Human-readable text {draft.displayValue ? "on" : "off"}
            </button>

            <PrimaryButton
              className="w-full sm:w-auto"
              disabled={generating}
              onClick={() => void generate()}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generate barcode
                </>
              )}
            </PrimaryButton>
          </div>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Preview
                </p>
                <p className="text-sm font-semibold">
                  {generating ? "Generating…" : "Barcode output"}
                </p>
              </div>
              {applied && (
                <Badge variant="outline" className="rounded-full font-mono">
                  {applied.format}
                </Badge>
              )}
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              <div
                className="relative flex min-h-[12rem] items-center justify-center overflow-auto rounded-2xl border border-border/40 p-6"
                style={{ background: applied?.bgColor ?? draft.bgColor }}
              >
                <AnimatePresence>
                  {generating && (
                    <motion.div
                      key={`load-${waveKey}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-sm"
                    >
                      <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                      <p className="text-sm font-medium text-foreground">Generating barcode…</p>
                      <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500"
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && !generating ? (
                  <div className="flex max-w-sm gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="font-semibold">Cannot render</p>
                      <p className="mt-0.5 text-destructive/90">{error}</p>
                    </div>
                  </div>
                ) : svgMarkup ? (
                  <motion.div
                    key={`svg-${waveKey}`}
                    ref={previewRef}
                    initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                    animate={{ opacity: generating ? 0.35 : 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.35 }}
                    className="max-w-full"
                    // Keep previous SVG visible under the loader (no white flash)
                    dangerouslySetInnerHTML={{ __html: svgMarkup }}
                  />
                ) : (
                  !generating && (
                    <p className="text-sm text-muted-foreground">Press Generate to create a barcode</p>
                  )
                )}
              </div>

              {!error && ready && applied && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-emerald-800 dark:text-emerald-200">Ready to download</span>
                  <span className="font-mono text-xs text-muted-foreground">{applied.value.trim()}</span>
                </motion.div>
              )}

              <div className="flex flex-wrap gap-2">
                <PrimaryButton size="sm" className="h-9" onClick={downloadPng} disabled={!ready}>
                  <Download className="h-3.5 w-3.5" />
                  Download PNG
                </PrimaryButton>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-full"
                  onClick={downloadSvg}
                  disabled={!ready}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download SVG
                </Button>
                <CopyButton
                  value={(applied?.value ?? draft.value).trim()}
                  label="Value"
                  className="h-9 rounded-full"
                />
              </div>
              <svg id={`barcode-${reactId}`} className="hidden" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
