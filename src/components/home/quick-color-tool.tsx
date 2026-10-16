"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CopyButton } from "@/components/color/copy-button";
import { Input } from "@/components/ui/input";
import { formatRgb, getTextColor, hexToRgb } from "@/lib/colors/convert";
import { colorToolLinks, readHexColor } from "@/lib/colors/tool-links";

const EXAMPLES = ["#3B82F6", "#E11D48", "#16A34A", "#8B5CF6", "#111827"];

export function QuickColorTool() {
  const [input, setInput] = useState("#3B82F6");
  const hex = readHexColor(input);
  const links = colorToolLinks(hex ?? undefined);

  return (
    <section
      aria-label="Quick color picker"
      className="border-border bg-card overflow-hidden rounded-2xl border shadow-[var(--shadow-md)]"
    >
      <div
        className="flex min-h-24 items-center justify-between gap-3 px-5 py-4 sm:min-h-32"
        style={{
          backgroundColor: hex ?? "var(--muted)",
          color: hex ? getTextColor(hex) : "var(--muted-foreground)",
        }}
      >
        <span className="text-lg font-semibold">Your next color</span>
        <span className="font-mono text-sm">{hex?.toUpperCase() ?? "—"}</span>
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        <div>
          <label htmlFor="quick-hex" className="mb-1.5 block text-sm font-medium">
            Enter a HEX color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              aria-label="Choose a color"
              value={hex ?? "#3b82f6"}
              onChange={(event) => setInput(event.target.value.toUpperCase())}
              className="border-border bg-background h-11 w-12 shrink-0 cursor-pointer rounded-lg border p-1"
            />
            <Input
              id="quick-hex"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              aria-invalid={!hex}
              aria-describedby="quick-color-help"
              autoComplete="off"
              spellCheck={false}
              className="h-11 min-w-0 font-mono"
            />
            {hex && (
              <CopyButton
                value={hex.toUpperCase()}
                label="HEX"
                size="default"
                className="min-h-11"
              />
            )}
          </div>
          <p
            id="quick-color-help"
            className={`mt-1.5 text-xs ${hex ? "text-muted-foreground" : "text-destructive"}`}
          >
            {hex
              ? `${formatRgb(hexToRgb(hex))} · Use 3 or 6 HEX digits.`
              : "Enter a valid color, such as #38F or #3B82F6."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1" aria-label="Example colors">
          {EXAMPLES.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Try ${color}`}
              aria-pressed={hex === color.toLowerCase()}
              onClick={() => setInput(color)}
              className="hover:bg-muted focus-visible:ring-ring flex h-11 w-11 items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:outline-none"
            >
              <span
                className="h-7 w-7 rounded-full border border-black/10"
                style={{ backgroundColor: color }}
              />
            </button>
          ))}
          {hex && (
            <CopyButton
              value={formatRgb(hexToRgb(hex))}
              label="RGB"
              size="sm"
              className="ml-auto min-h-11"
            />
          )}
        </div>
        {hex && (
          <nav
            aria-label="Continue with this color"
            className="border-border flex flex-wrap gap-x-4 gap-y-1 border-t pt-2 text-sm font-medium"
          >
            <Link href={`/theme-builder?hex=${hex.slice(1)}`} className="text-primary inline-flex min-h-11 items-center gap-1 hover:underline">Preview in UI <ArrowRight className="h-3.5 w-3.5" /></Link>
            <Link
              href={links.picker}
              className="text-primary inline-flex min-h-11 items-center gap-1 hover:underline"
            >
              Edit color <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={links.contrast}
              className="text-primary inline-flex min-h-11 items-center hover:underline"
            >
              Check contrast
            </Link>
            <Link
              href={links.palette}
              className="text-primary inline-flex min-h-11 items-center hover:underline"
            >
              Build palette
            </Link>
          </nav>
        )}
      </div>
    </section>
  );
}
