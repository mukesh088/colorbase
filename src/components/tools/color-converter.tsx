"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/color/copy-button";
import {
  cmykToRgb,
  formatHsl,
  formatRgb,
  hexToRgb,
  hslToRgb,
  hsvToRgb,
  isValidHex,
  normalizeHex,
  rgbToCmyk,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
} from "@/lib/colors/convert";

type Mode = "hex-rgb" | "rgb-hex" | "hex-hsl" | "hsl-hex" | "hsv" | "cmyk";

export function ColorConverter({ mode }: { mode: Mode }) {
  const [hex, setHex] = useState("#3b82f6");
  const [r, setR] = useState(59);
  const [g, setG] = useState(130);
  const [b, setB] = useState(246);
  const [h, setH] = useState(217);
  const [s, setS] = useState(91);
  const [l, setL] = useState(60);
  const [v, setV] = useState(96);
  const [c, setC] = useState(76);
  const [m, setM] = useState(47);
  const [y, setY] = useState(0);
  const [k, setK] = useState(4);

  const syncFromHex = (value: string) => {
    if (!isValidHex(value)) return;
    const n = normalizeHex(value);
    setHex(n);
    const rgb = hexToRgb(n);
    setR(rgb.r);
    setG(rgb.g);
    setB(rgb.b);
    const hsl = rgbToHsl(rgb);
    setH(hsl.h);
    setS(hsl.s);
    setL(hsl.l);
    const hsv = rgbToHsv(rgb);
    setV(hsv.v);
    const cmyk = rgbToCmyk(rgb);
    setC(cmyk.c);
    setM(cmyk.m);
    setY(cmyk.y);
    setK(cmyk.k);
  };

  const syncFromRgb = (nr: number, ng: number, nb: number) => {
    setR(nr);
    setG(ng);
    setB(nb);
    const nhex = rgbToHex({ r: nr, g: ng, b: nb });
    setHex(nhex);
    const hsl = rgbToHsl({ r: nr, g: ng, b: nb });
    setH(hsl.h);
    setS(hsl.s);
    setL(hsl.l);
    setV(rgbToHsv({ r: nr, g: ng, b: nb }).v);
    const cmyk = rgbToCmyk({ r: nr, g: ng, b: nb });
    setC(cmyk.c);
    setM(cmyk.m);
    setY(cmyk.y);
    setK(cmyk.k);
  };

  const preview = useMemo(() => hex, [hex]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Convert</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(mode === "hex-rgb" || mode === "hex-hsl") && (
            <div className="space-y-1.5">
              <Label htmlFor="hex">HEX</Label>
              <div className="flex gap-2">
                <Input
                  id="hex"
                  value={hex}
                  onChange={(e) => {
                    setHex(e.target.value);
                    syncFromHex(e.target.value);
                  }}
                />
                <CopyButton value={normalizeHex(hex)} label="HEX" />
              </div>
            </div>
          )}

          {(mode === "rgb-hex" || mode.includes("rgb")) && (
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "R", value: r, set: (n: number) => syncFromRgb(n, g, b) },
                { label: "G", value: g, set: (n: number) => syncFromRgb(r, n, b) },
                { label: "B", value: b, set: (n: number) => syncFromRgb(r, g, n) },
              ].map((ch) => (
                <div key={ch.label} className="space-y-1.5">
                  <Label>{ch.label}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    value={ch.value}
                    onChange={(e) => ch.set(Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
          )}

          {(mode === "hsl-hex" || mode === "hex-hsl") && (
            <div className="space-y-3">
              {[
                { label: "Hue", value: h, max: 360, set: (n: number) => {
                  setH(n);
                  syncFromRgb(...Object.values(hslToRgb({ h: n, s, l })) as [number, number, number]);
                }},
                { label: "Saturation", value: s, max: 100, set: (n: number) => {
                  setS(n);
                  syncFromRgb(...Object.values(hslToRgb({ h, s: n, l })) as [number, number, number]);
                }},
                { label: "Lightness", value: l, max: 100, set: (n: number) => {
                  setL(n);
                  syncFromRgb(...Object.values(hslToRgb({ h, s, l: n })) as [number, number, number]);
                }},
              ].map((row) => (
                <div key={row.label} className="space-y-1.5">
                  <Label>{row.label}: {row.value}{row.label === "Hue" ? "°" : "%"}</Label>
                  <Slider
                    min={0}
                    max={row.max}
                    value={[row.value]}
                    onValueChange={([n]) => row.set(n)}
                  />
                </div>
              ))}
            </div>
          )}

          {mode === "hsv" && (
            <div className="space-y-3">
              {[
                { label: "Hue", value: h, max: 360, apply: (n: number) => {
                  setH(n);
                  syncFromRgb(...Object.values(hsvToRgb({ h: n, s, v })) as [number, number, number]);
                }},
                { label: "Saturation", value: s, max: 100, apply: (n: number) => {
                  setS(n);
                  syncFromRgb(...Object.values(hsvToRgb({ h, s: n, v })) as [number, number, number]);
                }},
                { label: "Value", value: v, max: 100, apply: (n: number) => {
                  setV(n);
                  syncFromRgb(...Object.values(hsvToRgb({ h, s, v: n })) as [number, number, number]);
                }},
              ].map((row) => (
                <div key={row.label} className="space-y-1.5">
                  <Label>{row.label}: {row.value}</Label>
                  <Slider min={0} max={row.max} value={[row.value]} onValueChange={([n]) => row.apply(n)} />
                </div>
              ))}
            </div>
          )}

          {mode === "cmyk" && (
            <div className="space-y-3">
              {[
                { label: "C", value: c, set: setC },
                { label: "M", value: m, set: setM },
                { label: "Y", value: y, set: setY },
                { label: "K", value: k, set: setK },
              ].map((row) => (
                <div key={row.label} className="space-y-1.5">
                  <Label>{row.label}: {row.value}%</Label>
                  <Slider
                    min={0}
                    max={100}
                    value={[row.value]}
                    onValueChange={([n]) => {
                      row.set(n);
                      const rgb = cmykToRgb({
                        c: row.label === "C" ? n : c,
                        m: row.label === "M" ? n : m,
                        y: row.label === "Y" ? n : y,
                        k: row.label === "K" ? n : k,
                      });
                      syncFromRgb(rgb.r, rgb.g, rgb.b);
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {mode === "rgb-hex" && (
            <div className="space-y-1.5">
              <Label>HEX Result</Label>
              <div className="flex gap-2">
                <Input readOnly value={hex} />
                <CopyButton value={hex} label="HEX" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview & Formats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="h-32 rounded-xl border border-border/50"
            style={{ backgroundColor: preview }}
            role="img"
            aria-label={`Color preview ${preview}`}
          />
          {[
            { label: "HEX", value: hex },
            { label: "RGB", value: formatRgb({ r, g, b }) },
            { label: "HSL", value: formatHsl({ h, s, l }) },
            { label: "HSV", value: `hsv(${h}, ${s}%, ${v}%)` },
            { label: "CMYK", value: `cmyk(${c}%, ${m}%, ${y}%, ${k}%)` },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-2">
              <Input readOnly value={row.value} aria-label={row.label} />
              <CopyButton value={row.value} label={row.label} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
