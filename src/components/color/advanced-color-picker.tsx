"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Heart, Pipette, Redo2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/color/copy-button";
import {
  formatHsl,
  formatRgb,
  hexToRgb,
  hslToRgb,
  isValidHex,
  normalizeHex,
  rgbToCmyk,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
} from "@/lib/colors/convert";
import { useFavoriteColors, useHistoryState, useRecentColors } from "@/hooks";
import { cn } from "@/lib/utils";

interface AdvancedColorPickerProps {
  initialColor?: string;
  className?: string;
}

export function AdvancedColorPicker({
  initialColor = "#3b82f6",
  className,
}: AdvancedColorPickerProps) {
  const { state: hex, set, undo, redo, canUndo, canRedo } = useHistoryState(
    normalizeHex(initialColor)
  );
  const [hexInput, setHexInput] = useState(hex);
  const satRef = useRef<HTMLDivElement>(null);
  const { add: addRecent, colors: recent } = useRecentColors();
  const { toggle, has } = useFavoriteColors();

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => rgbToHsl(rgb), [rgb]);
  const hsv = useMemo(() => rgbToHsv(rgb), [rgb]);
  const cmyk = useMemo(() => rgbToCmyk(rgb), [rgb]);

  const commit = useCallback(
    (next: string) => {
      const n = normalizeHex(next);
      set(n);
      setHexInput(n);
      addRecent(n);
    },
    [set, addRecent]
  );

  const updateHsl = (partial: Partial<typeof hsl>) => {
    const next = { ...hsl, ...partial };
    commit(rgbToHex(hslToRgb(next)));
  };

  const onSatMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = satRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(e.clientY - rect.top, 0), rect.height);
    updateHsl({
      s: Math.round((x / rect.width) * 100),
      l: Math.round(100 - (y / rect.height) * 100),
    });
  };

  const pickFromScreen = async () => {
    if (!("EyeDropper" in window)) {
      toast.error("EyeDropper API is not supported in this browser");
      return;
    }
    try {
      // @ts-expect-error EyeDropper is not in all TS libs
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      commit(result.sRGBHex);
      toast.success("Color sampled");
    } catch {
      toast.message("Eyedropper cancelled");
    }
  };

  return (
    <div className={cn("grid gap-6 lg:grid-cols-[1.2fr_1fr]", className)}>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Advanced Color Picker</CardTitle>
          <div className="flex gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Undo"
              disabled={!canUndo}
              onClick={undo}
            >
              <Undo2 />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Redo"
              disabled={!canRedo}
              onClick={redo}
            >
              <Redo2 />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={has(hex) ? "Remove favorite" : "Add favorite"}
              onClick={() => toggle(hex)}
            >
              <Heart className={cn(has(hex) && "fill-red-500 text-red-500")} />
            </Button>
            <Button type="button" size="icon" variant="outline" aria-label="Eye dropper" onClick={pickFromScreen}>
              <Pipette />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            ref={satRef}
            role="slider"
            aria-label="Saturation and lightness"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={hsl.s}
            tabIndex={0}
            className="relative h-48 w-full cursor-crosshair rounded-xl border border-border/50"
            style={{
              background: `
                linear-gradient(to top, #000, transparent),
                linear-gradient(to right, #fff, hsl(${hsl.h}, 100%, 50%))
              `,
            }}
            onMouseDown={(e) => {
              onSatMouse(e);
              const move = (ev: MouseEvent) =>
                onSatMouse(ev as unknown as React.MouseEvent<HTMLDivElement>);
              const up = () => {
                window.removeEventListener("mousemove", move);
                window.removeEventListener("mouseup", up);
              };
              window.addEventListener("mousemove", move);
              window.addEventListener("mouseup", up);
            }}
          >
            <div
              className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
              style={{
                left: `${hsl.s}%`,
                top: `${100 - hsl.l}%`,
                backgroundColor: hex,
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hue">Hue ({hsl.h}°)</Label>
            <Slider
              id="hue"
              min={0}
              max={360}
              step={1}
              value={[hsl.h]}
              onValueChange={([h]) => updateHsl({ h })}
              aria-label="Hue"
            />
            <div
              className="h-2 rounded-full"
              style={{
                background:
                  "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
              }}
            />
          </div>

          <div
            className="h-20 rounded-xl border border-border/50"
            style={{ backgroundColor: hex }}
            aria-hidden
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Color Values</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="hex">HEX</Label>
              <div className="flex gap-2">
                <Input
                  id="hex"
                  value={hexInput}
                  onChange={(e) => {
                    setHexInput(e.target.value);
                    if (isValidHex(e.target.value)) commit(e.target.value);
                  }}
                  aria-label="HEX color value"
                />
                <CopyButton value={hex} label="HEX" />
              </div>
            </div>
            {[
              { label: "RGB", value: formatRgb(rgb) },
              { label: "HSL", value: formatHsl(hsl) },
              { label: "HSV", value: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
              {
                label: "CMYK",
                value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
              },
            ].map((row) => (
              <div key={row.label} className="space-y-1.5">
                <Label>{row.label}</Label>
                <div className="flex gap-2">
                  <Input readOnly value={row.value} aria-label={row.label} />
                  <CopyButton value={row.value} label={row.label} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {recent.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {recent.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="h-8 w-8 rounded-lg border border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ backgroundColor: c }}
                    aria-label={`Select ${c}`}
                    onClick={() => commit(c)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
