"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Check,
  ClipboardPaste,
  Code2,
  Copy,
  Download,
  Eye,
  FileCode2,
  ImageIcon,
  RotateCcw,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { downloadBlob, formatBytes, savingsPercent, sanitizeSvgMarkup } from "@/lib/image-studio";
import {
  DEMO_SVG,
  SVG_PLUGIN_GROUPS,
  SVG_PLUGINS,
  defaultSvgPlugins,
  gzipSize,
  optimizeSvg,
  svgByteSize,
  type SvgOptimizeSettings,
  type SvgPluginId,
} from "@/lib/svg-optimize";

type PreviewMode = "image" | "markup";

export function ImageStudioSvg() {
  const [source, setSource] = useState(DEMO_SVG);
  const [fileName, setFileName] = useState("demo.svg");
  const [plugins, setPlugins] = useState(defaultSvgPlugins);
  const [floatPrecision, setFloatPrecision] = useState(3);
  const [multipass, setMultipass] = useState(true);
  const [pretty, setPretty] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [compareGzip, setCompareGzip] = useState(true);
  const [preview, setPreview] = useState<PreviewMode>("image");
  const [gzipOrig, setGzipOrig] = useState(0);
  const [gzipOut, setGzipOut] = useState(0);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const settings: SvgOptimizeSettings = useMemo(
    () => ({ plugins, floatPrecision, multipass, pretty }),
    [plugins, floatPrecision, multipass, pretty]
  );

  const result = useMemo(() => optimizeSvg(source, settings), [source, settings]);
  const output = result.data || source;
  const originalBytes = svgByteSize(source);
  const outputBytes = svgByteSize(output);
  const previewMarkup = sanitizeSvgMarkup(showOriginal ? source : output);

  useEffect(() => {
    let live = true;
    Promise.all([gzipSize(source), gzipSize(output)]).then(([a, b]) => {
      if (!live) return;
      setGzipOrig(a);
      setGzipOut(b);
    });
    return () => {
      live = false;
    };
  }, [source, output]);

  const openFile = async (file?: File | null) => {
    if (!file) return;
    const text = await file.text();
    if (!text.includes("<svg")) {
      toast.error("That file does not look like an SVG");
      return;
    }
    setSource(text);
    setFileName(file.name.replace(/\.[^.]+$/, "") + ".svg");
    setShowOriginal(false);
    toast.success("SVG loaded");
  };

  const pasteMarkup = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.includes("<svg")) {
        toast.error("Clipboard does not contain SVG markup");
        return;
      }
      setSource(text);
      setFileName("pasted.svg");
      setShowOriginal(false);
      toast.success("Pasted SVG");
    } catch {
      toast.error("Clipboard access denied — paste into Markup instead");
      setPreview("markup");
      setShowOriginal(true);
    }
  };

  const copyOut = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Optimized SVG copied");
    window.setTimeout(() => setCopied(false), 1600);
  };

  const download = () => {
    downloadBlob(
      new Blob([output], { type: "image/svg+xml;charset=utf-8" }),
      fileName.replace(/\.svg$/i, "") + ".min.svg"
    );
    toast.success("Downloaded optimized SVG");
  };

  const resetPlugins = () => {
    setPlugins(defaultSvgPlugins());
    setFloatPrecision(3);
    setMultipass(true);
    setPretty(false);
  };

  const togglePlugin = useCallback((id: SvgPluginId) => {
    setPlugins((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const before = compareGzip ? gzipOrig || originalBytes : originalBytes;
  const after = compareGzip ? gzipOut || outputBytes : outputBytes;
  const savedPct = savingsPercent(before, after);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-background shadow-sm sm:rounded-3xl",
        dragOver && "ring-2 ring-rose-500/60"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = [...e.dataTransfer.files].find(
          (f) => f.type.includes("svg") || f.name.toLowerCase().endsWith(".svg")
        );
        void openFile(file ?? e.dataTransfer.files[0]);
      }}
    >
      {dragOver && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-background/80 text-sm font-medium">
          Drop SVG to optimize
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white shadow-md shadow-rose-500/25">
            <FileCode2 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
              SVG studio
            </p>
            <h2 className="truncate font-display text-lg font-semibold tracking-tight">{fileName}</h2>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-border/60 bg-background px-3 text-sm font-medium hover:border-rose-400/50">
            <Upload className="h-4 w-4" />
            Open SVG
            <input
              type="file"
              accept=".svg,image/svg+xml"
              className="sr-only"
              onChange={(e) => {
                void openFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          <Button type="button" size="sm" variant="outline" className="h-9 rounded-full" onClick={() => void pasteMarkup()}>
            <ClipboardPaste className="h-4 w-4" />
            Paste
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9 rounded-full"
            onClick={() => {
              setSource(DEMO_SVG);
              setFileName("demo.svg");
              setShowOriginal(false);
            }}
          >
            <Sparkles className="h-4 w-4" />
            Demo
          </Button>
          <Button type="button" size="sm" className="h-9 rounded-full" onClick={download}>
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button type="button" size="sm" variant="secondary" className="h-9 rounded-full" onClick={() => void copyOut()}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      <div className="grid gap-px bg-border/50 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="bg-background">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Stat
                label={compareGzip ? "Original gz" : "Original"}
                value={formatBytes(before)}
              />
              <span className="text-muted-foreground">→</span>
              <Stat
                label={compareGzip ? "Optimized gz" : "Optimized"}
                value={formatBytes(after)}
                accent
              />
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  savedPct > 0
                    ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {savedPct > 0 ? `−${savedPct}%` : savedPct < 0 ? `+${Math.abs(savedPct)}%` : "No change"}
              </span>
              <span className="hidden text-[11px] text-muted-foreground sm:inline">
                {formatBytes(originalBytes)} → {formatBytes(outputBytes)} raw
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-border/60 p-0.5">
              <ModeBtn
                active={preview === "image"}
                onClick={() => setPreview("image")}
                icon={<ImageIcon className="h-3.5 w-3.5" />}
                label="Image"
              />
              <ModeBtn
                active={preview === "markup"}
                onClick={() => setPreview("markup")}
                icon={<Code2 className="h-3.5 w-3.5" />}
                label="Markup"
              />
            </div>
          </div>

          {result.error && (
            <p className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-800 dark:text-amber-200">
              {result.error}
            </p>
          )}

          {preview === "image" ? (
            <div className="relative min-h-[min(70vh,640px)] bg-[linear-gradient(45deg,#ece8ea_25%,transparent_25%),linear-gradient(-45deg,#ece8ea_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ece8ea_75%),linear-gradient(-45deg,transparent_75%,#ece8ea_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0] dark:bg-[linear-gradient(45deg,#1a1216_25%,transparent_25%),linear-gradient(-45deg,#1a1216_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1a1216_75%),linear-gradient(-45deg,transparent_75%,#1a1216_75%)]">
              {showOriginal && (
                <span className="absolute left-4 top-4 z-10 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                  Original
                </span>
              )}
              <div
                className="flex min-h-[min(70vh,640px)] items-center justify-center p-8 [&_svg]:max-h-[min(58vh,520px)] [&_svg]:max-w-full"
                dangerouslySetInnerHTML={{ __html: previewMarkup }}
              />
              <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[11px] text-muted-foreground">
                Drop an SVG anywhere · processed only in your browser
              </p>
            </div>
          ) : (
            <Textarea
              value={showOriginal ? source : output}
              onChange={(e) => {
                if (showOriginal) setSource(e.target.value);
              }}
              readOnly={!showOriginal}
              spellCheck={false}
              className="min-h-[min(70vh,640px)] resize-y rounded-none border-0 bg-[#0d1117] font-mono text-[12px] leading-relaxed text-[#e6edf3] focus-visible:ring-0"
            />
          )}
        </div>

        <aside className="bg-background lg:sticky lg:top-0 lg:self-start">
          <div className="border-b border-border/40 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Global settings
              </p>
              <button
                type="button"
                onClick={resetPlugins}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>
            <div className="mt-3 space-y-2.5">
              <SwitchRow
                label="Show original"
                checked={showOriginal}
                onChange={setShowOriginal}
                icon={<Eye className="h-3.5 w-3.5" />}
              />
              <SwitchRow label="Compare gzipped" checked={compareGzip} onChange={setCompareGzip} />
              <SwitchRow label="Prettify markup" checked={pretty} onChange={setPretty} />
              <SwitchRow label="Multipass" checked={multipass} onChange={setMultipass} />
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <Label className="text-xs font-medium">Number precision</Label>
                  <span className="font-mono text-muted-foreground">{floatPrecision}</span>
                </div>
                <Slider
                  min={0}
                  max={8}
                  step={1}
                  value={[floatPrecision]}
                  onValueChange={(v) => setFloatPrecision(v[0] ?? 3)}
                />
              </div>
            </div>
          </div>

          <div className="max-h-[min(70vh,640px)] space-y-4 overflow-y-auto px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Features</p>
            {SVG_PLUGIN_GROUPS.map((group) => (
              <div key={group}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-600/80 dark:text-rose-400/80">
                  {group}
                </p>
                <div className="space-y-0.5">
                  {SVG_PLUGINS.filter((p) => p.group === group).map((plugin) => (
                    <label
                      key={plugin.id}
                      className="flex cursor-pointer items-start gap-2 rounded-lg px-1 py-1.5 text-[13px] hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        checked={plugins[plugin.id]}
                        onChange={() => togglePlugin(plugin.id)}
                        className="mt-0.5 h-4 w-4 rounded border-border accent-rose-600"
                      />
                      <span className="leading-snug text-foreground/90">{plugin.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-mono font-semibold", accent && "text-rose-600 dark:text-rose-400")}>{value}</span>
    </span>
  );
}

function ModeBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function SwitchRow({
  label,
  checked,
  onChange,
  icon,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: ReactNode;
}) {
  return (
    <div className="flex cursor-pointer items-center justify-between gap-3 text-sm" onClick={() => onChange(!checked)}>
      <span className="inline-flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-rose-600" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
            checked ? "left-4" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}
