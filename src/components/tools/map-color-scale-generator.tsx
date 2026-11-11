"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import {
  SAMPLE_DISTRICTS,
  buildColorScale,
  classIndex,
  equalBreaks,
  simulateScale,
  type ScaleKind,
} from "@/lib/map/color-scales";
import { downloadText } from "@/lib/utils";
import "./flagship-tools.css";

export function MapColorScaleGenerator() {
  const [kind, setKind] = useState<ScaleKind>("sequential");
  const [classes, setClasses] = useState(5);
  const [cvd, setCvd] = useState<"none" | "protanopia" | "deuteranopia" | "tritanopia">("none");
  const [low, setLow] = useState("#dbeafe");
  const [high, setHigh] = useState("#1e3a8a");

  const scale = useMemo(
    () => buildColorScale(kind, classes, { low, high, mid: "#f8fafc" }),
    [kind, classes, low, high]
  );
  const display = cvd === "none" ? scale : simulateScale(scale, cvd);
  const values = SAMPLE_DISTRICTS.map((d) => d.value);
  const breaks = equalBreaks(values, display.length);

  const legendCss = display
    .map((hex, i) => `  --map-class-${i + 1}: ${hex};`)
    .join("\n");

  const mapboxExpr = JSON.stringify(
    [
      "interpolate",
      ["linear"],
      ["get", "value"],
      ...display.flatMap((hex, i) => [i, hex]),
    ],
    null,
    2
  );

  return (
    <div className="flagship-tool">
      <div className="flagship-panel space-y-3">
        <h2 className="text-lg font-semibold">Map color scales</h2>
        <p className="flagship-muted">
          Choropleth-oriented ramps — distinct from chart categorical tools. Districts below are
          synthetic sample shapes, not real geography.
        </p>
        <div className="flagship-row">
          {(["sequential", "diverging", "categorical"] as ScaleKind[]).map((k) => (
            <Button key={k} variant={kind === k ? "default" : "outline"} onClick={() => setKind(k)}>
              {k}
            </Button>
          ))}
        </div>
        <label className="flagship-muted block text-xs">
          Classes ({classes})
          <input
            type="range"
            min={3}
            max={9}
            value={classes}
            onChange={(e) => setClasses(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <div className="flagship-row">
          <label className="text-sm">
            Low
            <input type="color" className="ml-2" value={low} onChange={(e) => setLow(e.target.value)} />
          </label>
          <label className="text-sm">
            High
            <input type="color" className="ml-2" value={high} onChange={(e) => setHigh(e.target.value)} />
          </label>
          <label className="text-sm">
            CVD preview
            <select
              className="flagship-select ml-2 w-auto"
              value={cvd}
              onChange={(e) => setCvd(e.target.value as typeof cvd)}
            >
              <option value="none">None</option>
              <option value="protanopia">Protanopia</option>
              <option value="deuteranopia">Deuteranopia</option>
              <option value="tritanopia">Tritanopia</option>
            </select>
          </label>
        </div>
      </div>

      <div className="flagship-split">
        <div className="flagship-panel">
          <svg viewBox="0 0 260 210" className="w-full rounded-xl border bg-card" role="img" aria-label="Sample choropleth">
            {SAMPLE_DISTRICTS.map((d) => {
              const idx = Math.min(display.length - 1, classIndex(d.value, breaks));
              return (
                <path key={d.id} d={d.path} fill={display[idx]} stroke="#0f172a33" strokeWidth="1">
                  <title>
                    {d.name}: {d.value}
                  </title>
                </path>
              );
            })}
          </svg>
          <div className="mt-3 flex flex-wrap gap-2">
            {display.map((hex, i) => (
              <div key={hex + i} className="text-center">
                <span className="block h-8 w-12 rounded border" style={{ background: hex }} />
                <span className="font-mono text-[10px]">{hex}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flagship-panel space-y-3">
          <h3 className="font-semibold">Exports</h3>
          <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">{`:root {\n${legendCss}\n}`}</pre>
          <div className="flagship-actions">
            <CopyButton value={`:root {\n${legendCss}\n}`} label="Copy CSS" />
            <Button
              variant="outline"
              onClick={() =>
                downloadText(JSON.stringify({ kind, colors: display, breaks }, null, 2), "map-scale.json", "application/json")
              }
            >
              JSON
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadText(mapboxExpr, "map-style-expression.json", "application/json")}
            >
              Map expression
            </Button>
            <Button asChild variant="outline">
              <Link href="/chart-palette-generator">Chart palettes</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/color-blind-simulator">CVD simulator</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
