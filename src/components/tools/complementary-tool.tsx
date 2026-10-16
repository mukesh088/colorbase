"use client";

import { useState } from "react";
import { hexToHsl, hslToRgb, rgbToHex, normalizeHex, isValidHex, getContrastRatio } from "@/lib/colors/convert";
import { Copy, Check, Sparkles, RefreshCw, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function getComplementary(hex: string) {
  const norm = normalizeHex(hex);
  const hsl = hexToHsl(norm);
  const compH = (hsl.h + 180) % 360;
  const split1H = (hsl.h + 150) % 360;
  const split2H = (hsl.h + 210) % 360;

  const compHex = rgbToHex(hslToRgb({ h: compH, s: hsl.s, l: hsl.l }));
  const split1Hex = rgbToHex(hslToRgb({ h: split1H, s: hsl.s, l: hsl.l }));
  const split2Hex = rgbToHex(hslToRgb({ h: split2H, s: hsl.s, l: hsl.l }));

  return {
    base: norm,
    complement: compHex,
    split1: split1Hex,
    split2: split2Hex,
  };
}

const PRESET_COLORS = [
  { name: "Royal Blue", hex: "#2563EB" },
  { name: "Sage Green", hex: "#9CAF88" },
  { name: "Terracotta", hex: "#E2725B" },
  { name: "Emerald Green", hex: "#50C878" },
  { name: "Burnt Orange", hex: "#CC5500" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Teal", hex: "#008080" },
  { name: "Lavender", hex: "#E6E6FA" },
];

export function ComplementaryTool() {
  const [inputHex, setInputHex] = useState("#2563EB");
  const [activeHex, setActiveHex] = useState("#2563EB");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const colors = getComplementary(activeHex);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${text} to clipboard`);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleInput = (val: string) => {
    setInputHex(val);
    if (isValidHex(val)) {
      setActiveHex(normalizeHex(val));
    }
  };

  const contrastAgainstWhite = getContrastRatio(colors.complement, "#FFFFFF");
  const contrastBetweenBoth = getContrastRatio(colors.base, colors.complement);

  return (
    <div className="space-y-6">
      {/* Input row */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={activeHex}
            onChange={(e) => {
              setActiveHex(e.target.value);
              setInputHex(e.target.value.toUpperCase());
            }}
            className="h-12 w-12 cursor-pointer rounded-xl border border-border bg-transparent p-1 shadow-xs"
            aria-label="Pick color"
          />
          <div>
            <label htmlFor="hexInput" className="text-xs font-semibold text-muted-foreground">
              Base Color (HEX)
            </label>
            <input
              id="hexInput"
              type="text"
              value={inputHex}
              onChange={(e) => handleInput(e.target.value)}
              className="mt-1 block w-32 rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-sm font-bold uppercase focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="#2563EB"
              maxLength={7}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto">
          <span className="text-xs text-muted-foreground mr-1">Popular:</span>
          {PRESET_COLORS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setActiveHex(p.hex);
                setInputHex(p.hex);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/60 px-2.5 py-1 text-xs hover:border-primary/50 transition-colors"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.hex }} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Complementary Contrast View */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Base */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <div
            className="flex h-44 flex-col justify-end p-5 transition-colors duration-300 sm:h-52"
            style={{ backgroundColor: colors.base }}
          >
            <span className="inline-block rounded-md bg-black/40 px-2 py-0.5 font-mono text-xs font-bold text-white backdrop-blur-xs w-max">
              Base Color: {colors.base.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Original Seed</p>
              <p className="font-mono text-base font-bold">{colors.base.toUpperCase()}</p>
            </div>
            <button
              type="button"
              onClick={() => copy(colors.base.toUpperCase(), "base")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
            >
              {copiedKey === "base" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              Copy HEX
            </button>
          </div>
        </div>

        {/* Complement */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <div
            className="flex h-44 flex-col justify-end p-5 transition-colors duration-300 sm:h-52"
            style={{ backgroundColor: colors.complement }}
          >
            <span className="inline-block rounded-md bg-black/40 px-2 py-0.5 font-mono text-xs font-bold text-white backdrop-blur-xs w-max">
              180° Complement: {colors.complement.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Opposite on Color Wheel</p>
              <p className="font-mono text-base font-bold">{colors.complement.toUpperCase()}</p>
            </div>
            <button
              type="button"
              onClick={() => copy(colors.complement.toUpperCase(), "comp")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
            >
              {copiedKey === "comp" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              Copy HEX
            </button>
          </div>
        </div>
      </div>

      {/* Split Complementary Trio */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
        <h3 className="font-display text-base font-bold">Split-Complementary Palette</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Combines the base color with the two colors adjacent to its complement (+150° and +210°). Delivers strong contrast with softer tension.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="h-20" style={{ backgroundColor: colors.base }} />
            <div className="p-2.5 text-center">
              <span className="text-[11px] text-muted-foreground block">Base (0°)</span>
              <span className="font-mono text-xs font-bold">{colors.base.toUpperCase()}</span>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="h-20" style={{ backgroundColor: colors.split1 }} />
            <div className="p-2.5 text-center">
              <span className="text-[11px] text-muted-foreground block">Split (+150°)</span>
              <span className="font-mono text-xs font-bold">{colors.split1.toUpperCase()}</span>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="h-20" style={{ backgroundColor: colors.split2 }} />
            <div className="p-2.5 text-center">
              <span className="text-[11px] text-muted-foreground block">Split (+210°)</span>
              <span className="font-mono text-xs font-bold">{colors.split2.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() =>
              copy(
                `${colors.base.toUpperCase()}, ${colors.split1.toUpperCase()}, ${colors.split2.toUpperCase()}`,
                "split"
              )
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
          >
            {copiedKey === "split" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            Copy Split Trio
          </button>
        </div>
      </div>

      {/* Real-world UI Preview */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <h3 className="font-display text-base font-bold">Interactive UI Component Preview</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          See how your base and complement look together in real interface components.
        </p>

        <div
          className="mt-4 rounded-xl p-6 transition-colors duration-300"
          style={{ backgroundColor: colors.base }}
        >
          <div className="max-w-md rounded-xl bg-card p-5 shadow-lg border border-border">
            <h4 className="font-display text-base font-bold text-foreground">Card Heading</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Notice how the high-contrast accent button draws the eye immediately against the surface.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-xs font-bold shadow-xs transition-opacity hover:opacity-90"
                style={{ backgroundColor: colors.complement, color: "#FFFFFF" }}
              >
                Complement Accent CTA
              </button>
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground"
              >
                Secondary Action
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
