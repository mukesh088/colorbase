"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import { cn, downloadText } from "@/lib/utils";
import {
  MAP_SCALE_PRESETS,
  SAMPLE_DISTRICTS,
  buildColorScale,
  classBreaks,
  classIndex,
  legendRanges,
  scaleToCssVars,
  scaleToCsv,
  scaleToMapboxExpression,
  simulateScale,
  type BreakMethod,
  type CvdMode,
  type ScaleKind,
} from "@/lib/map/color-scales";
import "./map-color-scale-generator.css";

const KIND_HELP: Record<ScaleKind, string> = {
  sequential: "Use for ordered values (counts, rates, density) that go from low → high.",
  diverging: "Use when values move both ways from a meaningful midpoint (gain/loss, vs average).",
  categorical: "Use for named regions or unordered groups — not continuous magnitudes.",
};

export function MapColorScaleGenerator() {
  const [kind, setKind] = useState<ScaleKind>("sequential");
  const [classes, setClasses] = useState(5);
  const [cvd, setCvd] = useState<CvdMode>("none");
  const [method, setMethod] = useState<BreakMethod>("equal");
  const [low, setLow] = useState("#dbeafe");
  const [mid, setMid] = useState("#f8fafc");
  const [high, setHigh] = useState("#1e3a8a");
  const [seed, setSeed] = useState<string[] | undefined>(undefined);
  const [presetId, setPresetId] = useState("blues");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [darkMap, setDarkMap] = useState(false);
  const [exportTab, setExportTab] = useState<"css" | "json" | "mapbox" | "csv">("css");

  const scale = useMemo(
    () => buildColorScale(kind, classes, { low, mid, high, seed }),
    [kind, classes, low, mid, high, seed]
  );
  const display = cvd === "none" ? scale : simulateScale(scale, cvd);
  const values = SAMPLE_DISTRICTS.map((d) => d.value);
  const breaks = classBreaks(values, display.length, method);
  const ranges = legendRanges(breaks, values);

  const css = scaleToCssVars(display);
  const mapboxExpr = JSON.stringify(scaleToMapboxExpression(display), null, 2);
  const json = JSON.stringify(
    {
      kind,
      method,
      classes: display.length,
      colors: display,
      breaks,
      ranges,
      cvdPreview: cvd,
      note: "CVD preview does not change exported colors unless you copy while simulating.",
    },
    null,
    2
  );
  const csv = scaleToCsv(display, ranges);

  const exportValue =
    exportTab === "css" ? css : exportTab === "json" ? json : exportTab === "mapbox" ? mapboxExpr : csv;

  function applyPreset(id: string) {
    const preset = MAP_SCALE_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setPresetId(preset.id);
    setKind(preset.kind);
    setLow(preset.low);
    setHigh(preset.high);
    setMid(preset.mid ?? "#f8fafc");
    setSeed(preset.seed);
  }

  function downloadCurrent() {
    const ext = exportTab === "css" ? "css" : exportTab === "csv" ? "csv" : "json";
    const type =
      exportTab === "css" ? "text/css" : exportTab === "csv" ? "text/csv" : "application/json";
    downloadText(exportValue, `map-color-scale.${ext}`, type);
  }

  return (
    <div className="map-studio">
      <div className="map-shell">
        <div className="map-shell-head">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="map-kicker">Choropleth studio</p>
              <h2 className="map-title">Map color scale generator</h2>
              <p className="map-muted mt-1 max-w-2xl">
                Build sequential, diverging, or categorical map ramps with class breaks, CVD preview, and
                export-ready CSS / JSON / Mapbox expressions.
              </p>
            </div>
            <div className="map-actions">
              <Button variant="outline" className="rounded-full" onClick={() => setDarkMap((v) => !v)}>
                {darkMap ? "Light map" : "Dark map"}
              </Button>
              <Button className="rounded-full" onClick={downloadCurrent}>
                <Download className="mr-1.5 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>

        <div className="map-layout">
          <aside className="space-y-4">
            <div className="map-panel space-y-4">
              <div>
                <p className="map-section-label">Scale type</p>
                <div className="map-seg" role="tablist" aria-label="Scale kind">
                  {(["sequential", "diverging", "categorical"] as ScaleKind[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      className={cn(kind === k && "is-active")}
                      onClick={() => {
                        setKind(k);
                        setPresetId("");
                        if (k === "categorical") setSeed(undefined);
                      }}
                    >
                      {k}
                    </button>
                  ))}
                </div>
                <p className="map-hint mt-3">
                  <Info className="mr-1 inline h-3.5 w-3.5" />
                  {KIND_HELP[kind]}
                </p>
              </div>

              <div>
                <p className="map-section-label">Presets</p>
                <div className="map-chip-scroll">
                  {MAP_SCALE_PRESETS.filter((p) => p.kind === kind).map((preset) => {
                    const preview = buildColorScale(preset.kind, 5, {
                      low: preset.low,
                      mid: preset.mid,
                      high: preset.high,
                      seed: preset.seed,
                    });
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        className={cn("map-preset", presetId === preset.id && "is-active")}
                        onClick={() => applyPreset(preset.id)}
                      >
                        <div className="ramp" aria-hidden>
                          {preview.map((hex, i) => (
                            <span key={`${preset.id}-${i}`} style={{ background: hex }} />
                          ))}
                        </div>
                        <div className="name">{preset.label}</div>
                        <div className="blurb">{preset.blurb}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="map-field">
                <span className="map-section-label mb-0">
                  Classes · {classes}
                </span>
                <input
                  type="range"
                  min={3}
                  max={9}
                  value={classes}
                  onChange={(e) => setClasses(Number(e.target.value))}
                  aria-label="Number of classes"
                />
              </div>

              {kind !== "categorical" && (
                <div className="map-color-row">
                  <label>
                    Low
                    <input
                      type="color"
                      value={low}
                      onChange={(e) => {
                        setLow(e.target.value);
                        setPresetId("");
                      }}
                    />
                  </label>
                  {kind === "diverging" && (
                    <label>
                      Mid
                      <input
                        type="color"
                        value={mid}
                        onChange={(e) => {
                          setMid(e.target.value);
                          setPresetId("");
                        }}
                      />
                    </label>
                  )}
                  <label>
                    High
                    <input
                      type="color"
                      value={high}
                      onChange={(e) => {
                        setHigh(e.target.value);
                        setPresetId("");
                      }}
                    />
                  </label>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="map-field">
                  <span className="map-section-label mb-0">Class breaks</span>
                  <select
                    className="map-select"
                    value={method}
                    onChange={(e) => setMethod(e.target.value as BreakMethod)}
                    disabled={kind === "categorical"}
                  >
                    <option value="equal">Equal interval</option>
                    <option value="quantile">Quantile</option>
                  </select>
                </label>
                <label className="map-field">
                  <span className="map-section-label mb-0">CVD preview</span>
                  <select
                    className="map-select"
                    value={cvd}
                    onChange={(e) => setCvd(e.target.value as CvdMode)}
                  >
                    <option value="none">None</option>
                    <option value="protanopia">Protanopia</option>
                    <option value="deuteranopia">Deuteranopia</option>
                    <option value="tritanopia">Tritanopia</option>
                  </select>
                </label>
              </div>
              {cvd !== "none" && (
                <p className="map-muted text-xs">
                  Simulation is preview-only. Downloads keep the measured palette unless you intentionally copy the
                  simulated swatches from the stage.
                </p>
              )}
            </div>
          </aside>

          <div className="space-y-4">
            <div className={cn("map-stage", darkMap && "is-dark")}>
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="map-section-label mb-1">Sample choropleth</p>
                  <p className="map-muted text-xs">Synthetic districts for preview — not real geography.</p>
                </div>
                {hoverId && (
                  <p className="text-xs font-medium" style={{ color: darkMap ? "#e2e8f0" : "#0f172a" }}>
                    {SAMPLE_DISTRICTS.find((d) => d.id === hoverId)?.name}:{" "}
                    {SAMPLE_DISTRICTS.find((d) => d.id === hoverId)?.value}
                  </p>
                )}
              </div>
              <svg viewBox="0 0 260 220" role="img" aria-label="Sample choropleth map">
                {SAMPLE_DISTRICTS.map((d) => {
                  const idx =
                    kind === "categorical"
                      ? SAMPLE_DISTRICTS.findIndex((x) => x.id === d.id) % display.length
                      : Math.min(display.length - 1, classIndex(d.value, breaks));
                  const active = hoverId === d.id;
                  return (
                    <path
                      key={d.id}
                      d={d.path}
                      fill={display[idx]}
                      stroke={darkMap ? "#94a3b866" : "#0f172a33"}
                      strokeWidth={active ? 2.2 : 1}
                      onMouseEnter={() => setHoverId(d.id)}
                      onMouseLeave={() => setHoverId(null)}
                      style={{ cursor: "pointer" }}
                      aria-label={`${d.name}: ${d.value}`}
                    />
                  );
                })}
              </svg>

              <div className="mt-4 space-y-2">
                <div className="map-legend-bar" aria-hidden>
                  {display.map((hex, i) => (
                    <span key={`${hex}-${i}`} style={{ background: hex }} />
                  ))}
                </div>
                <div className="flex justify-between text-[11px]" style={{ color: darkMap ? "#94a3b8" : "#64748b" }}>
                  <span>{kind === "categorical" ? "Class 1" : ranges[0]?.from}</span>
                  <span>{kind === "categorical" ? `Class ${display.length}` : ranges[ranges.length - 1]?.to}</span>
                </div>
              </div>
            </div>

            <div className="map-panel">
              <p className="map-section-label">Legend classes</p>
              <div className="map-swatches">
                {display.map((hex, i) => (
                  <div key={`${hex}-${i}`} className="map-swatch">
                    <div className="chip" style={{ background: hex }} />
                    <div className="meta">
                      <div className="font-medium">
                        {kind === "categorical"
                          ? `Class ${i + 1}`
                          : `${ranges[i]?.from ?? "—"} – ${ranges[i]?.to ?? "—"}`}
                      </div>
                      <div className="hex">{hex}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="map-panel">
                <p className="map-section-label">District values</p>
                <table className="map-table">
                  <thead>
                    <tr>
                      <th>District</th>
                      <th>Value</th>
                      <th>Class</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_DISTRICTS.map((d, di) => {
                      const idx =
                        kind === "categorical"
                          ? di % display.length
                          : Math.min(display.length - 1, classIndex(d.value, breaks));
                      return (
                        <tr key={d.id}>
                          <td>
                            <span className="map-dot" style={{ background: display[idx] }} />
                            {d.name}
                          </td>
                          <td>{d.value}</td>
                          <td>{idx + 1}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="map-panel space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="map-section-label mb-0">Export</p>
                  <div className="map-seg">
                    {(
                      [
                        ["css", "CSS"],
                        ["json", "JSON"],
                        ["mapbox", "Mapbox"],
                        ["csv", "CSV"],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        className={cn(exportTab === id && "is-active")}
                        onClick={() => setExportTab(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <pre className="map-code">{exportValue}</pre>
                <div className="map-actions">
                  <CopyButton value={exportValue} label="Copy" />
                  <Button variant="outline" className="rounded-full" onClick={downloadCurrent}>
                    Download file
                  </Button>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/chart-palette-generator">Chart palettes</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/color-blind-simulator">CVD simulator</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
