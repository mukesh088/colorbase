"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Eraser, FileCode2, Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/color/copy-button";
import { PrimaryButton } from "@/components/tools/suite/workbench";
import {
  downloadBlob,
  formatBytes,
  optimizeSvgMarkup,
  sanitizeSvgMarkup,
  savingsPercent,
} from "@/lib/image-studio";

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <!-- optimize me -->
  <circle cx="50" cy="50" r="40" fill="#e11d48" />
</svg>`;

export function ImageStudioSvg() {
  const [svgIn, setSvgIn] = useState(SAMPLE);
  const [out, setOut] = useState("");
  const [generating, setGenerating] = useState(false);
  const [waveKey, setWaveKey] = useState(0);

  const hasResult = Boolean(out);
  const saved = hasResult ? Math.max(0, svgIn.length - out.length) : 0;
  const previewSvg = sanitizeSvgMarkup(out || svgIn);

  const optimize = () => {
    if (!svgIn.trim()) {
      toast.error("Paste SVG markup first");
      return;
    }
    setGenerating(true);
    setWaveKey((k) => k + 1);
    window.setTimeout(() => {
      try {
        const optimized = optimizeSvgMarkup(svgIn);
        if (!optimized.includes("<svg")) {
          toast.error("No <svg> root found");
          setGenerating(false);
          return;
        }
        setOut(optimized);
        toast.success("SVG optimized");
      } catch {
        toast.error("Optimize failed");
      } finally {
        setGenerating(false);
      }
    }, 350);
  };

  useEffect(() => {
    // warm preview on mount
  }, []);

  const download = () => {
    if (!out) return;
    downloadBlob(new Blob([out], { type: "image/svg+xml;charset=utf-8" }), "optimized.svg");
    toast.success("Downloaded");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
        <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Workspace
              </p>
              <h2 className="font-display text-base font-semibold tracking-tight sm:text-lg">SVG Optimizer</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Strip comments, scripts, and whitespace locally.
              </p>
            </div>
            <Badge variant="secondary" className="rounded-full">
              <FileCode2 className="mr-1 h-3.5 w-3.5" />
              Local
            </Badge>
          </div>
        </div>
        <div className="space-y-4 p-3 sm:p-5">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" className="h-8 rounded-full" onClick={() => setSvgIn(SAMPLE)}>
              <Sparkles className="h-3.5 w-3.5" />
              Sample
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 rounded-full"
              onClick={() => {
                setSvgIn("");
                setOut("");
              }}
            >
              <Eraser className="h-3.5 w-3.5" />
              Clear
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="svg-in">SVG markup</Label>
            <Textarea
              id="svg-in"
              value={svgIn}
              onChange={(e) => setSvgIn(e.target.value)}
              rows={14}
              spellCheck={false}
              className="rounded-2xl font-mono text-xs leading-relaxed"
            />
            <p className="text-[11px] text-muted-foreground">{formatBytes(new Blob([svgIn]).size)}</p>
          </div>
          <PrimaryButton className="w-full sm:w-auto" disabled={generating} onClick={optimize}>
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Optimizing…
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Optimize SVG
              </>
            )}
          </PrimaryButton>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
        <AnimatePresence>
          {generating && (
            <motion.div
              key={`svg-${waveKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-sm"
            >
              <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              <p className="text-sm font-medium">Optimizing…</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">Result</p>
          <p className="text-sm font-semibold">
            {hasResult
              ? `Saved ${formatBytes(saved)} · ${savingsPercent(svgIn.length, out.length)}%`
              : "Preview"}
          </p>
        </div>
        <div className="space-y-4 p-3 sm:p-5">
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.1),_transparent_55%)] p-6">
            <div
              className="mx-auto flex h-40 max-w-full items-center justify-center [&_svg]:max-h-36 [&_svg]:max-w-full"
              dangerouslySetInnerHTML={{ __html: previewSvg }}
            />
          </div>
          {hasResult && (
            <>
              <div className="flex flex-wrap gap-2">
                <CopyButton value={out} label="Copy SVG" className="h-9 rounded-full" />
                <Button type="button" variant="outline" className="h-9 rounded-full" onClick={download}>
                  <Download className="h-3.5 w-3.5" />
                  Download .svg
                </Button>
              </div>
              <pre className="max-h-56 overflow-auto rounded-2xl border border-border/50 bg-[#0d1117] p-3 font-mono text-[11px] leading-relaxed text-[#e6edf3]">
                {out}
              </pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
