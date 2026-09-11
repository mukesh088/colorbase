"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  Download,
  Lock,
  LockOpen,
  Plus,
  Share2,
  Shuffle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportPalette } from "@/lib/colors/export";
import { generateHarmony, getTextColor, normalizeHex, randomHex } from "@/lib/colors/convert";
import { saveGeneratedPalette } from "@/lib/palettes/db";
import { downloadPalettePng } from "@/lib/palettes/download";
import { paletteIdFromColors } from "@/lib/palettes/likes";
import type { ExportFormat } from "@/types/color";

const DEFAULT_COLORS = ["#FF595E", "#8AC926", "#1982C4", "#6A4C93"];
const MIN_COLORS = 2;
const MAX_COLORS = 10;

type Swatch = { hex: string; locked: boolean };

function parseColorsParam(raw: string | null): string[] | null {
  if (!raw) return null;
  const parts = raw
    .split("-")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => normalizeHex(p.startsWith("#") ? p : `#${p}`));
  if (parts.length < MIN_COLORS || parts.length > MAX_COLORS) return null;
  return parts;
}

export function PaletteGeneratorTool({ randomOnly = false }: { randomOnly?: boolean }) {
  const [swatches, setSwatches] = useState<Swatch[]>(() =>
    DEFAULT_COLORS.map((hex) => ({ hex, locked: false }))
  );
  const [harmony, setHarmony] = useState("analogous");
  const swatchesRef = useRef(swatches);
  swatchesRef.current = swatches;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = parseColorsParam(params.get("colors"));
    if (fromUrl) {
      setSwatches(fromUrl.map((hex) => ({ hex, locked: false })));
    }
  }, []);

  const hexes = useMemo(() => swatches.map((s) => s.hex), [swatches]);
  const id = paletteIdFromColors(hexes);

  const syncUrl = useCallback((next: Swatch[]) => {
    const qs = paletteIdFromColors(next.map((s) => s.hex));
    const url = `${window.location.pathname}?colors=${qs}`;
    window.history.replaceState(null, "", url);
  }, []);

  const commit = useCallback(
    (next: Swatch[], persist = false) => {
      setSwatches(next);
      syncUrl(next);
      if (persist) {
        void saveGeneratedPalette(next.map((s) => s.hex)).catch(() => undefined);
      }
    },
    [syncUrl]
  );

  const generate = useCallback(() => {
    const current = swatchesRef.current;
    const next = current.map((s) => (s.locked ? s : { ...s, hex: randomHex().toUpperCase() }));
    if (!randomOnly) {
      const unlocked = next.filter((s) => !s.locked);
      if (unlocked.length === next.length) {
        const base = randomHex();
        const scheme = generateHarmony(base, harmony);
        const filled = next.map((s, i) => ({
          ...s,
          hex: (scheme[i % scheme.length] ?? randomHex()).toUpperCase(),
        }));
        commit(filled, true);
        return;
      }
    }
    commit(next, true);
  }, [commit, harmony, randomOnly]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [generate]);

  const addColor = () => {
    if (swatches.length >= MAX_COLORS) {
      toast.error(`You can add up to ${MAX_COLORS} colors`);
      return;
    }
    commit([...swatches, { hex: randomHex().toUpperCase(), locked: false }], true);
  };

  const removeColor = (index: number) => {
    if (swatches.length <= MIN_COLORS) {
      toast.error("Keep at least two colors");
      return;
    }
    commit(swatches.filter((_, i) => i !== index), true);
  };

  const updateHex = (index: number, hex: string) => {
    const next = swatches.map((s, i) => (i === index ? { ...s, hex: normalizeHex(hex).toUpperCase() } : s));
    commit(next);
  };

  const toggleLock = (index: number) => {
    commit(swatches.map((s, i) => (i === index ? { ...s, locked: !s.locked } : s)));
  };

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}?colors=${id}`;
    await navigator.clipboard.writeText(url);
    toast.success("Share link copied");
  };

  const downloadImage = () => {
    downloadPalettePng("colorBase palette", hexes);
    toast.success("PNG downloaded");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={generate}>
          <Shuffle />
          Generate
        </Button>
        {!randomOnly && (
          <Select
            value={harmony}
            onValueChange={(v) => {
              setHarmony(v);
              const base = swatches[0]?.hex ?? randomHex();
              const scheme = generateHarmony(normalizeHex(base), v);
              commit(
                swatches.map((s, i) =>
                  s.locked ? s : { ...s, hex: (scheme[i % scheme.length] ?? randomHex()).toUpperCase() }
                ),
                true
              );
            }}
          >
            <SelectTrigger className="w-44" aria-label="Harmony">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="analogous">Analogous</SelectItem>
              <SelectItem value="complementary">Complementary</SelectItem>
              <SelectItem value="triadic">Triadic</SelectItem>
              <SelectItem value="tetradic">Tetradic</SelectItem>
              <SelectItem value="split-complementary">Split complementary</SelectItem>
              <SelectItem value="monochromatic">Monochromatic</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Button type="button" variant="outline" onClick={addColor} disabled={swatches.length >= MAX_COLORS}>
          <Plus />
          Add color
        </Button>
        <Button type="button" variant="outline" onClick={downloadImage}>
          <Download />
          Download
        </Button>
        <Select
          onValueChange={(format) => {
            exportPalette(
              hexes.map((hex) => ({ hex })),
              format as ExportFormat,
              "palette"
            );
            toast.success(`Downloaded ${format.toUpperCase()}`);
          }}
        >
          <SelectTrigger className="w-36" aria-label="Export format">
            <SelectValue placeholder="Export" />
          </SelectTrigger>
          <SelectContent>
            {["json", "css", "scss", "tailwind", "svg"].map((f) => (
              <SelectItem key={f} value={f}>
                {f.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" onClick={share}>
          <Share2 />
          Share
        </Button>
        <p className="text-xs text-muted-foreground">Press spacebar to generate. Locked colors stay put.</p>
      </div>

      <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-y border-border/40">
        <div className="flex min-h-[min(72dvh,720px)] w-full">
          {swatches.map((swatch, index) => (
            <ColorColumn
              key={index}
              swatch={swatch}
              canDelete={swatches.length > MIN_COLORS}
              onChange={(hex) => updateHex(index, hex)}
              onLock={() => toggleLock(index)}
              onDelete={() => removeColor(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ColorColumn({
  swatch,
  canDelete,
  onChange,
  onLock,
  onDelete,
}: {
  swatch: Swatch;
  canDelete: boolean;
  onChange: (hex: string) => void;
  onLock: () => void;
  onDelete: () => void;
}) {
  const ink = getTextColor(swatch.hex);
  const [draft, setDraft] = useState(swatch.hex.replace("#", ""));

  useEffect(() => {
    setDraft(swatch.hex.replace("#", ""));
  }, [swatch.hex]);

  const copyHex = async () => {
    await navigator.clipboard.writeText(swatch.hex);
    toast.success(`${swatch.hex} copied`);
  };

  return (
    <div
      className="group relative flex min-w-0 flex-1 flex-col justify-end px-2 pb-6 pt-10 text-center sm:px-3 sm:pb-8"
      style={{ backgroundColor: swatch.hex, color: ink }}
    >
      <label className="absolute inset-0 cursor-pointer">
        <span className="sr-only">Pick {swatch.hex}</span>
        <input
          type="color"
          value={swatch.hex}
          onChange={(e) => onChange(e.target.value)}
          className="h-full w-full cursor-pointer opacity-0"
        />
      </label>

      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="flex items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            aria-label={swatch.locked ? "Unlock color" : "Lock color"}
            onClick={onLock}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/15 backdrop-blur-sm hover:bg-black/25"
          >
            {swatch.locked ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
          </button>
          <button
            type="button"
            aria-label={`Copy ${swatch.hex}`}
            onClick={copyHex}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/15 backdrop-blur-sm hover:bg-black/25"
          >
            <Copy className="h-4 w-4" />
          </button>
          {canDelete && (
            <button
              type="button"
              aria-label="Remove color"
              onClick={onDelete}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/15 backdrop-blur-sm hover:bg-black/25"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <input
          value={draft}
          onChange={(e) => {
            const next = e.target.value.replace("#", "").replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
            setDraft(next);
            if (next.length === 6) onChange(`#${next}`);
          }}
          aria-label="Hex color"
          className="w-[7.5rem] bg-transparent text-center font-mono text-lg font-semibold uppercase tracking-[0.14em] outline-none sm:text-xl"
        />
      </div>
    </div>
  );
}
