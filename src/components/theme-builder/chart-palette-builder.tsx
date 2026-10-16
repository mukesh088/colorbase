"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Copy,
  Download,
  Eye,
  LineChart,
  Palette,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chartJsConfig, chartPalette, type ChartPaletteKind } from "@/lib/colors/chart-palettes";
import { getContrastRatio, simulateColorBlind } from "@/lib/colors/convert";
import { readHexColor } from "@/lib/colors/tool-links";
import { downloadText, readableInk } from "@/lib/theme-builder";
import "./theme-builder.css";

const KINDS: { id: ChartPaletteKind; label: string; detail: string }[] = [
  {
    id: "categorical",
    label: "Categorical",
    detail:
      "Distinct colors for groups without an order, such as product categories or traffic sources.",
  },
  {
    id: "sequential",
    label: "Sequential",
    detail:
      "A light-to-dark scale for ordered values, such as activity, temperature, or sales volume.",
  },
  {
    id: "diverging",
    label: "Diverging",
    detail:
      "Two color directions around a neutral midpoint, such as differences from a target or positive and negative change.",
  },
];
const VISION = [
  { id: "original", label: "Original colors" },
  { id: "protanopia", label: "Protanopia simulation" },
  { id: "deuteranopia", label: "Deuteranopia simulation" },
  { id: "tritanopia", label: "Tritanopia simulation" },
  { id: "achromatopsia", label: "Grayscale simulation" },
];

export function ChartPaletteBuilder() {
  const [seed, setSeed] = useState("#635bff");
  const [draft, setDraft] = useState(seed);
  const [kind, setKind] = useState<ChartPaletteKind>("categorical");
  const [count, setCount] = useState(5);
  const [vision, setVision] = useState("original");
  const [chart, setChart] = useState<"bar" | "line">("bar");
  const [patterns, setPatterns] = useState(true);
  const [format, setFormat] = useState("chartjs");
  const [background, setBackground] = useState<"light" | "dark">("light");
  const [shareLink, setShareLink] = useState("");
  const id = useId().replace(/:/g, "");
  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const hex = readHexColor(params.get("seed"));
      if (hex) {
        setSeed(hex);
        setDraft(hex);
      }
      const type = params.get("kind");
      if (KINDS.some((item) => item.id === type)) setKind(type as ChartPaletteKind);
      const size = Number(params.get("count"));
      if (Number.isInteger(size) && size >= 3 && size <= 9) setCount(size);
    };
    restore();
    window.addEventListener("hashchange", restore);
    return () => window.removeEventListener("hashchange", restore);
  }, []);
  const colors = useMemo(() => chartPalette(seed, kind, count), [seed, kind, count]);
  const shown =
    vision === "original" ? colors : colors.map((color) => simulateColorBlind(color, vision));
  const canvas = background === "light" ? "#ffffff" : "#171923";
  const ink = background === "light" ? "#475569" : "#cbd5e1";
  const config = chartJsConfig(colors, chart);
  const code =
    format === "chartjs"
      ? `// Chart.js v4. Use with an installed Chart.js instance.\n// These are the original palette colors, not the simulation.\nconst config = ${JSON.stringify(config, null, 2)};\n\n// new Chart(document.getElementById('chart'), config);\n`
      : format === "css"
        ? `:root {\n${colors.map((color, i) => `  --chart-${i + 1}: ${color};`).join("\n")}\n}`
        : JSON.stringify({ kind, colors }, null, 2);
  const commitSeed = () => {
    const hex = readHexColor(draft);
    if (hex) {
      setSeed(hex);
      setDraft(hex);
    } else toast.error("Enter a 3 or 6 digit HEX color.");
  };
  const share = async () => {
    const url = `${window.location.origin}/chart-palette-generator#${new URLSearchParams({ seed: seed.slice(1), kind, count: String(count) })}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Chart palette link copied");
    } catch {
      setShareLink(url);
    }
  };
  return (
    <div className="theme-builder-page">
      <div className="tb-intro">
        <div>
          <p className="tb-kicker">
            <span /> COLOR FOR A CLEARER STORY
          </p>
          <h1>Make your data make sense.</h1>
          <p>Build a chart palette. See the differences. Export colors with purpose.</p>
        </div>
        <Link href="/theme-builder" className="tb-text-link">
          Build a matching interface <ArrowRight size={14} />
        </Link>
      </div>
      <section className="tb-workbench" aria-label="Chart palette editor">
        <div className="tb-toolbar">
          <div className="tb-project-title">
            <span className="tb-project-icon">
              <BarChart3 size={17} />
            </span>
            <h2 className="text-sm font-semibold">Chart palette studio</h2>
          </div>
          <Button variant="outline" size="sm" onClick={share}>
            <Share2 />
            Share palette
          </Button>
        </div>
        {shareLink && (
          <div className="p-4">
            <Input
              readOnly
              aria-label="Chart palette share link"
              value={shareLink}
              onFocus={(event) => event.target.select()}
            />
          </div>
        )}
        <div className="tb-chart-layout">
          <aside className="tb-controls">
            <div className="tb-control-section">
              <div className="tb-section-title">
                <h2>Palette purpose</h2>
                <span>01</span>
              </div>
              <div className="tb-chart-kinds">
                {KINDS.map((item) => (
                  <button
                    key={item.id}
                    aria-pressed={kind === item.id}
                    onClick={() => setKind(item.id)}
                  >
                    <Palette size={14} />
                    {item.label}
                    {kind === item.id && <Check size={13} />}
                  </button>
                ))}
              </div>
              <p className="tb-caption mt-3">{KINDS.find((item) => item.id === kind)?.detail}</p>
            </div>
            <div className="tb-control-section">
              <div className="tb-section-title">
                <h2>Color direction</h2>
                <span>02</span>
              </div>
              <label htmlFor="chart-seed" className="tb-input-label mt-4">
                Starting color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  aria-label="Pick chart seed color"
                  value={seed}
                  className="h-10 w-10 shrink-0 rounded-md"
                  onChange={(event) => {
                    setSeed(event.target.value);
                    setDraft(event.target.value);
                  }}
                />
                <Input
                  id="chart-seed"
                  value={draft}
                  maxLength={7}
                  onChange={(event) => setDraft(event.target.value)}
                  onBlur={commitSeed}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") commitSeed();
                  }}
                />
              </div>
              <label htmlFor="chart-count" className="tb-input-label mt-6 flex justify-between">
                Colors <span>{count}</span>
              </label>
              <input
                id="chart-count"
                type="range"
                min={3}
                max={9}
                value={count}
                className="w-full accent-[#635bff]"
                onChange={(event) => setCount(Number(event.target.value))}
              />
              <p className="tb-caption mt-2">3–9 colors. Use labels as well as color.</p>
            </div>
            <div className="tb-control-section">
              <div className="tb-section-title">
                <h2>Inspect your palette</h2>
                <Eye size={14} />
              </div>
              <label htmlFor="chart-vision" className="tb-input-label mt-4">
                Vision preview
              </label>
              <select
                id="chart-vision"
                className="tb-select"
                value={vision}
                onChange={(event) => setVision(event.target.value)}
              >
                {VISION.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <label className="mt-4 flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={patterns}
                  onChange={(event) => setPatterns(event.target.checked)}
                />
                {chart === "bar" ? "Show bar patterns" : "Show line markers and dashes"}
              </label>
              <p className="tb-caption mt-3">
                Simulation is approximate. It does not certify that all series are distinguishable.
              </p>
            </div>
          </aside>
          <div className="tb-stage">
            <div className="tb-stage-toolbar">
              <div className="tb-view-tabs">
                {[
                  { type: "bar", icon: BarChart3 },
                  { type: "line", icon: LineChart },
                ].map(({ type, icon: Icon }) => (
                  <button
                    key={type}
                    aria-pressed={chart === type}
                    onClick={() => setChart(type as typeof chart)}
                  >
                    <Icon size={14} />
                    {type === "bar" ? "Bars" : "Lines"}
                  </button>
                ))}
              </div>
              <div className="tb-segmented" aria-label="Chart canvas mode">
                {(["light", "dark"] as const).map((mode) => (
                  <button
                    key={mode}
                    aria-pressed={background === mode}
                    onClick={() => setBackground(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            <div className="tb-chart-canvas" style={{ background: canvas, color: ink }}>
              <div className="tb-chart-title">
                <div>
                  <p className="tb-kicker" style={{ color: ink }}>
                    SAMPLE DATA
                  </p>
                  <h3>
                    {kind === "categorical"
                      ? "A clearer view of every category."
                      : kind === "sequential"
                        ? "A scale that shows the progression."
                        : "Two directions. One point of reference."}
                  </h3>
                </div>
                <span>{VISION.find((item) => item.id === vision)?.label}</span>
              </div>
              <svg
                viewBox="0 0 640 275"
                role="img"
                aria-label={`${kind} ${chart} chart with ${colors.length} labeled series`}
                className="tb-chart-svg"
              >
                <defs>
                  {shown.map((color, i) => (
                    <pattern
                      key={i}
                      id={`${id}-pattern-${i}`}
                      width={7 + i}
                      height={7 + i}
                      patternUnits="userSpaceOnUse"
                      patternTransform={`rotate(${i % 2 ? 45 : -45})`}
                    >
                      <rect width="100%" height="100%" fill={color} />
                      <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2={7 + i}
                        stroke={readableInk(color)}
                        strokeOpacity=".35"
                        strokeWidth={(i % 3) + 1}
                      />
                    </pattern>
                  ))}
                </defs>
                {[50, 100, 150, 200, 250].map((y, i) => (
                  <g key={y}>
                    <line
                      x1="35"
                      x2="625"
                      y1={y}
                      y2={y}
                      stroke={ink}
                      strokeOpacity=".12"
                      strokeDasharray="3 4"
                    />
                    <text x="25" y={y + 4} textAnchor="end" fill={ink} fontSize="9">
                      {100 - i * 25}
                    </text>
                  </g>
                ))}
                {shown.map((color, index) => {
                  if (chart === "bar") {
                    const width = 520 / shown.length;
                    const height = [128, 178, 113, 155, 96, 165, 140, 185, 120][index];
                    return (
                      <g key={index}>
                        <rect
                          x={55 + index * width}
                          y={250 - height}
                          width={width * 0.64}
                          height={height}
                          fill={patterns ? `url(#${id}-pattern-${index})` : color}
                          rx="4"
                        />
                        <text
                          x={55 + index * width + width * 0.32}
                          y="270"
                          textAnchor="middle"
                          fontSize="9"
                          fill={ink}
                        >
                          {index + 1}
                        </text>
                        <text
                          x={55 + index * width + width * 0.32}
                          y={240 - height}
                          textAnchor="middle"
                          fontSize="9"
                          fill={ink}
                        >
                          {Math.round(height / 2)}
                        </text>
                      </g>
                    );
                  }
                  const points = [0, 1, 2, 3, 4, 5].map((month) => ({
                    x: 50 + month * 112,
                    y: 230 - ((month * 23 + index * 31 + (month % 2) * 17) % 175),
                  }));
                  return (
                    <g key={index}>
                      <polyline
                        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                        stroke={color}
                        fill="none"
                        strokeWidth="2.8"
                        strokeDasharray={patterns ? ["", "7 4", "2 4"][index % 3] : undefined}
                      />
                      {patterns &&
                        points.map((point, j) =>
                          index % 3 === 1 ? (
                            <rect
                              key={j}
                              x={point.x - 4}
                              y={point.y - 4}
                              width="8"
                              height="8"
                              fill={color}
                              stroke={canvas}
                              strokeWidth="1"
                            />
                          ) : index % 3 === 2 ? (
                            <polygon
                              key={j}
                              points={`${point.x},${point.y - 5} ${point.x + 5},${point.y + 4} ${point.x - 5},${point.y + 4}`}
                              fill={color}
                              stroke={canvas}
                              strokeWidth="1"
                            />
                          ) : (
                            <circle
                              key={j}
                              cx={point.x}
                              cy={point.y}
                              r="4"
                              fill={color}
                              stroke={canvas}
                              strokeWidth="1"
                            />
                          )
                        )}
                      <text x="625" y={points[5].y + 3} fill={ink} fontSize="9">
                        {index + 1}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="tb-chart-legend">
                {shown.map((color, index) => (
                  <span key={index}>
                    <i style={{ background: color }} />
                    {kind === "categorical" ? "Series" : "Level"} {index + 1}
                  </span>
                ))}
              </div>
            </div>
            <div className="tb-chart-swatches">
              {colors.map((color, index) => (
                <button
                  key={`${index}-${color}`}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(color);
                      toast.success(`${color} copied`);
                    } catch {
                      toast.error("Could not copy color");
                    }
                  }}
                  aria-label={`Copy chart color ${index + 1}: ${color}`}
                >
                  <span style={{ background: shown[index] }}>{index + 1}</span>
                  <strong>{color}</strong>
                  <small>{getContrastRatio(color, canvas).toFixed(2)}:1 vs canvas</small>
                </button>
              ))}
            </div>
            <p className="tb-caption px-6 pb-5">
              Swatch codes and exports retain the original colors. Ratios compare the original
              swatches against the selected canvas; they do not measure separation between series.
            </p>
            <div className="tb-chart-export">
              <div className="tb-section-title">
                <h2>Make it part of your project</h2>
                <select
                  className="tb-select"
                  style={{ width: "auto" }}
                  aria-label="Chart export format"
                  value={format}
                  onChange={(event) => setFormat(event.target.value)}
                >
                  <option value="chartjs">Chart.js v4 config</option>
                  <option value="css">CSS variables</option>
                  <option value="json">JSON palette</option>
                </select>
              </div>
              <p className="tb-caption mb-4">
                Bar patterns are a preview aid. The Chart.js bar export uses solid colors; add
                patterns or direct labels in your app. Line exports include markers and dashes.
              </p>
              <div className="tb-code-toolbar">
                <span>{format === "chartjs" ? "chart-config.js" : `chart-palette.${format}`}</span>
                <div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(code);
                        toast.success("Chart code copied");
                      } catch {
                        toast.error("Download the file instead");
                      }
                    }}
                  >
                    <Copy />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      downloadText(
                        code,
                        format === "chartjs" ? "chart-config.js" : `chart-palette.${format}`
                      )
                    }
                  >
                    <Download />
                    Download
                  </Button>
                </div>
              </div>
              <pre className="tb-code" tabIndex={0} aria-label="Chart palette export">
                <code>{code}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>
      <section className="tb-how">
        <div>
          <span className="tb-kicker">CHOOSE THE SCALE THAT MATCHES THE QUESTION</span>
          <h2>Color should explain the data.</h2>
        </div>
        <div>
          {KINDS.map((item) => (
            <article key={item.id}>
              <BarChart3 size={20} />
              <h3>{item.label} palettes</h3>
              <p>
                {item.detail} Use this sample to explore the scale; adapt it to your actual data and
                chart background.
              </p>
            </article>
          ))}
        </div>
      </section>
      <div className="tb-bottom-links">
        <Link
          href={`/theme-builder?colors=${colors
            .slice(0, 3)
            .map((hex) => hex.slice(1))
            .join("-")}`}
        >
          Use this palette in a UI theme <ArrowRight size={14} />
        </Link>
        <Link href="/contrast-checker">
          Test a specific foreground/background pair <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
