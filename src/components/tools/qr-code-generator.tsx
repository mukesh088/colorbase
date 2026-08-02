"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eraser,
  Loader2,
  QrCode,
  Sparkles,
  Wand2,
} from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/color/copy-button";
import { PrimaryButton } from "@/components/tools/suite/workbench";
import { cn } from "@/lib/utils";

const SAMPLE = "https://colorbase.in";

type Ecl = "L" | "M" | "Q" | "H";

type Settings = {
  text: string;
  size: number;
  margin: number;
  ecl: Ecl;
  dark: string;
  light: string;
};

const INITIAL: Settings = {
  text: SAMPLE,
  size: 280,
  margin: 2,
  ecl: "M",
  dark: "#0f172a",
  light: "#ffffff",
};

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

function downloadText(text: string, filename: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  URL.revokeObjectURL(url);
}

export function QrCodeGeneratorTool() {
  const [draft, setDraft] = useState<Settings>(INITIAL);
  const [applied, setApplied] = useState<Settings | null>(null);
  const [pngUrl, setPngUrl] = useState("");
  const [svgMarkup, setSvgMarkup] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [waveKey, setWaveKey] = useState(0);

  const ready = Boolean(pngUrl) && !error && !generating;

  const generate = useCallback(async (settings: Settings = draft) => {
    const value = settings.text.trim();
    if (!value) {
      toast.error("Enter text or a URL first");
      setError("Enter text or a URL");
      return;
    }

    setGenerating(true);
    setError(null);
    setWaveKey((k) => k + 1);

    await new Promise((r) => window.setTimeout(r, 450));

    try {
      const opts = {
        errorCorrectionLevel: settings.ecl,
        margin: settings.margin,
        width: settings.size,
        color: { dark: settings.dark, light: settings.light },
      } as const;
      const [png, svg] = await Promise.all([
        QRCode.toDataURL(value, opts),
        QRCode.toString(value, { ...opts, type: "svg" }),
      ]);
      setPngUrl(png);
      setSvgMarkup(svg);
      setApplied(settings);
      setError(null);
      toast.success("QR code generated");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate QR code");
      setApplied(settings);
      toast.error("Could not generate QR code");
    } finally {
      setGenerating(false);
    }
  }, [draft]);

  useEffect(() => {
    void generate(INITIAL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadPng = () => {
    if (!pngUrl) {
      toast.error("Generate a QR code first");
      return;
    }
    downloadDataUrl(pngUrl, "qr-code.png");
    toast.success("PNG downloaded");
  };

  const downloadSvg = () => {
    if (!svgMarkup) {
      toast.error("Generate a QR code first");
      return;
    }
    downloadText(svgMarkup, "qr-code.svg", "image/svg+xml;charset=utf-8");
    toast.success("SVG downloaded");
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
                  QR Code Generator
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Edit text and options, then press Generate — preview won&apos;t flash while typing.
                </p>
              </div>
              <Badge variant="secondary" className="rounded-full">
                <QrCode className="mr-1 h-3.5 w-3.5" />
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
                onClick={() => setDraft((d) => ({ ...d, text: SAMPLE }))}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Sample URL
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-full"
                onClick={() => setDraft((d) => ({ ...d, text: "" }))}
              >
                <Eraser className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="qr-text">Text / URL</Label>
              <Textarea
                id="qr-text"
                value={draft.text}
                onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
                rows={4}
                spellCheck={false}
                placeholder="https://example.com or any text"
                className="rounded-2xl font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                {draft.text.length.toLocaleString()} characters
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Error correction</Label>
              <div className="flex flex-wrap gap-2">
                {(["L", "M", "Q", "H"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, ecl: level }))}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      draft.ecl === level
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30 hover:bg-muted/60"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Foreground</Label>
                <Input
                  type="color"
                  value={draft.dark}
                  onChange={(e) => setDraft((d) => ({ ...d, dark: e.target.value }))}
                  className="h-10 w-full p-1"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Background</Label>
                <Input
                  type="color"
                  value={draft.light}
                  onChange={(e) => setDraft((d) => ({ ...d, light: e.target.value }))}
                  className="h-10 w-full p-1"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Size · {draft.size}px</Label>
              <Slider
                min={128}
                max={512}
                step={8}
                value={[draft.size]}
                onValueChange={([n]) => setDraft((d) => ({ ...d, size: n }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Margin · {draft.margin}</Label>
              <Slider
                min={0}
                max={8}
                step={1}
                value={[draft.margin]}
                onValueChange={([n]) => setDraft((d) => ({ ...d, margin: n }))}
              />
            </div>

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
                  Generate QR code
                </>
              )}
            </PrimaryButton>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
          <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
              Preview
            </p>
            <p className="text-sm font-semibold">{generating ? "Generating…" : "QR output"}</p>
          </div>

          <div className="space-y-4 p-4 sm:p-5">
            <div
              className="relative flex min-h-[16rem] items-center justify-center rounded-2xl border border-border/40 p-6"
              style={{ background: applied?.light ?? draft.light }}
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
                    <p className="text-sm font-medium">Generating QR code…</p>
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
                    <p className="font-semibold">Cannot generate</p>
                    <p className="mt-0.5 text-destructive/90">{error}</p>
                  </div>
                </div>
              ) : pngUrl ? (
                <motion.img
                  key={`qr-${waveKey}`}
                  src={pngUrl}
                  alt="Generated QR code"
                  width={applied?.size ?? draft.size}
                  height={applied?.size ?? draft.size}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: generating ? 0.35 : 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className="max-h-72 max-w-full rounded-lg shadow-sm"
                />
              ) : (
                !generating && (
                  <p className="text-sm text-muted-foreground">Press Generate to create a QR code</p>
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
                <span className="font-semibold text-emerald-800 dark:text-emerald-200">
                  Ready to download
                </span>
                <Badge variant="outline" className="rounded-full">
                  {applied.size}×{applied.size}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  ECL {applied.ecl}
                </Badge>
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
                value={(applied?.text ?? draft.text).trim()}
                label="Text"
                className="h-9 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
