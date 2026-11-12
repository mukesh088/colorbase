"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeftRight, Download, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import { normalizeHex } from "@/lib/colors/convert";
import { parseFlexibleColor } from "@/lib/colors/parse";
import {
  BLEND_GROUPS,
  BLEND_MODE_META,
  BLEND_MODES,
  BLEND_PRESETS,
  buildBlendCss,
  getBlendMeta,
  sceneBackground,
  type BlendKind,
  type BlendMode,
  type BlendScene,
  type BlendShape,
} from "@/lib/css/blend-modes";
import { cn, downloadText } from "@/lib/utils";
import "./css-blend-mode-generator.css";

function HexField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <label className="blend-color-field">
      {label}
      <span className="row">
        <input
          type="color"
          value={normalizeHex(value)}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const parsed = parseFlexibleColor(e.target.value);
            if (parsed) onChange(normalizeHex(parsed));
            else onChange(e.target.value);
          }}
          aria-label={`${label} hex`}
        />
      </span>
    </label>
  );
}

function layerMask(shape: BlendShape): CSSProperties {
  if (shape === "full") return {};
  if (shape === "split") {
    return {
      clipPath: "polygon(0 0, 62% 0, 38% 100%, 0 100%)",
    };
  }
  if (shape === "diamond") {
    return {
      clipPath: "polygon(50% 8%, 92% 50%, 50% 92%, 8% 50%)",
    };
  }
  // orbits — three soft circles via mask
  return {
    WebkitMaskImage:
      "radial-gradient(circle at 32% 38%, #000 0 28%, transparent 29%), radial-gradient(circle at 68% 42%, #000 0 24%, transparent 25%), radial-gradient(circle at 50% 72%, #000 0 26%, transparent 27%)",
    maskImage:
      "radial-gradient(circle at 32% 38%, #000 0 28%, transparent 29%), radial-gradient(circle at 68% 42%, #000 0 24%, transparent 25%), radial-gradient(circle at 50% 72%, #000 0 26%, transparent 27%)",
  };
}

export function CssBlendModeGenerator() {
  const [kind, setKind] = useState<BlendKind>("mix");
  const [mode, setMode] = useState<BlendMode>("multiply");
  const [a, setA] = useState("#e11d48");
  const [b, setB] = useState("#1d4ed8");
  const [opacity, setOpacity] = useState(0.85);
  const [isolate, setIsolate] = useState(true);
  const [scene, setScene] = useState<BlendScene>("mesh");
  const [shape, setShape] = useState<BlendShape>("full");
  const [presetId, setPresetId] = useState("brand-wash");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [showCompare, setShowCompare] = useState(true);
  const [checker, setChecker] = useState(false);

  const meta = getBlendMeta(mode);
  const css = useMemo(
    () => buildBlendCss({ kind, mode, a, b, opacity, isolate, scene }),
    [kind, mode, a, b, opacity, isolate, scene]
  );

  const filteredModes =
    groupFilter === "all"
      ? BLEND_MODE_META
      : BLEND_MODE_META.filter((m) => m.group === groupFilter);

  function applyPreset(id: string) {
    const preset = BLEND_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setPresetId(preset.id);
    setKind(preset.kind);
    setMode(preset.mode);
    setA(preset.a);
    setB(preset.b);
    setOpacity(preset.opacity);
    setScene(preset.scene);
    if (preset.scene === "type") setShape("full");
  }

  function swapColors() {
    setA(b);
    setB(a);
  }

  function downloadCss() {
    downloadText(css, "blend-mode.css", "text/css");
  }

  const baseStyle: CSSProperties =
    scene === "solids"
      ? { background: b }
      : {
          backgroundImage: sceneBackground(scene, b),
          backgroundSize: "cover",
          backgroundPosition: "center",
        };

  const bgBlendStyle: CSSProperties = {
    backgroundImage:
      scene === "solids"
        ? `linear-gradient(${a}, ${a}), linear-gradient(${b}, ${b})`
        : `linear-gradient(${a}, ${a}), ${sceneBackground(scene, b)}`,
    backgroundBlendMode: mode,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div className="blend-studio">
      <div className="blend-shell">
        <div className="blend-shell-head">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="blend-kicker">Blend mode studio</p>
              <h2 className="blend-title">Mix &amp; background blend playground</h2>
              <p className="blend-muted mt-1 max-w-2xl">
                Compare all 16 CSS blend modes on brand colors, mesh scenes, and type knockouts —
                then copy production-ready CSS with isolation baked in.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => applyPreset("brand-wash")}>
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </div>

        <div className="blend-layout">
          <div className="space-y-3">
            <div className="blend-panel space-y-3">
              <p className="blend-section-label">Property</p>
              <div className="blend-seg" role="tablist" aria-label="Blend property">
                <button
                  type="button"
                  className={cn(kind === "mix" && "is-on")}
                  onClick={() => setKind("mix")}
                >
                  mix-blend-mode
                </button>
                <button
                  type="button"
                  className={cn(kind === "background" && "is-on")}
                  onClick={() => setKind("background")}
                >
                  background-blend-mode
                </button>
              </div>

              <p className="blend-section-label">Presets</p>
              <div className="blend-presets">
                {BLEND_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={cn("blend-preset", presetId === p.id && "is-on")}
                    onClick={() => applyPreset(p.id)}
                  >
                    <div className="name">{p.label}</div>
                    <div className="blurb">{p.blurb}</div>
                    <div className="swatches">
                      <span style={{ background: p.a }} />
                      <span style={{ background: p.b }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="blend-panel space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="blend-section-label" style={{ marginBottom: 0 }}>
                  Colors
                </p>
                <Button type="button" variant="ghost" size="sm" onClick={swapColors}>
                  <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />
                  Swap
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <HexField label={kind === "mix" ? "Top layer" : "Layer A"} value={a} onChange={setA} />
                <HexField label={kind === "mix" ? "Base" : "Layer B"} value={b} onChange={setB} />
              </div>

              {kind === "mix" ? (
                <div className="blend-slider">
                  <label>
                    <span>Opacity</span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {opacity.toFixed(2)}
                    </span>
                  </label>
                  <input
                    type="range"
                    min={0.05}
                    max={1}
                    step={0.01}
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                  />
                </div>
              ) : null}

              <p className="blend-section-label">Scene</p>
              <div className="blend-chips">
                {(
                  [
                    ["solids", "Solids"],
                    ["mesh", "Mesh"],
                    ["photo", "Photo-like"],
                    ["stripes", "Stripes"],
                    ["type", "Type stage"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={cn("blend-chip", scene === id && "is-on")}
                    onClick={() => setScene(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {kind === "mix" ? (
                <>
                  <p className="blend-section-label">Layer shape</p>
                  <div className="blend-chips">
                    {(
                      [
                        ["full", "Full"],
                        ["orbits", "Orbits"],
                        ["split", "Split"],
                        ["diamond", "Diamond"],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        className={cn("blend-chip", shape === id && "is-on")}
                        onClick={() => setShape(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}

              <label className="blend-check">
                <input
                  type="checkbox"
                  checked={isolate}
                  onChange={(e) => setIsolate(e.target.checked)}
                />
                Isolate blending group
              </label>
              <label className="blend-check">
                <input
                  type="checkbox"
                  checked={checker}
                  onChange={(e) => setChecker(e.target.checked)}
                />
                Checkerboard behind stage
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="blend-panel space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="blend-section-label" style={{ marginBottom: 0 }}>
                    Live stage
                  </p>
                  <p className="blend-muted text-xs mt-1 font-mono">{mode}</p>
                </div>
                <div className="blend-actions">
                  <CopyButton value={css} label="Copy CSS" />
                  <Button type="button" variant="outline" size="sm" onClick={downloadCss}>
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    .css
                  </Button>
                </div>
              </div>

              <div className={cn("blend-stage-wrap", checker && "is-checker")}>
                <div
                  className="blend-stage"
                  style={{
                    isolation: isolate ? "isolate" : "auto",
                    ...(kind === "background" ? bgBlendStyle : baseStyle),
                  }}
                >
                  {kind === "mix" ? (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: a,
                        mixBlendMode: mode,
                        opacity,
                        ...layerMask(shape),
                      }}
                    />
                  ) : null}
                </div>
                {scene === "type" ? (
                  <div className="blend-type-overlay">
                    <span>
                      Color
                      <br />
                      Base
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="blend-tip">
                <strong>
                  {meta.id} · {BLEND_GROUPS.find((g) => g.id === meta.group)?.label}
                </strong>
                <span className="blend-muted">
                  {meta.blurb} {meta.tip}
                </span>
              </div>

              <pre className="blend-code">{css}</pre>
            </div>

            <div className="blend-panel space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="blend-section-label" style={{ marginBottom: 0 }}>
                  Mode gallery
                </p>
                <div className="blend-chips">
                  <button
                    type="button"
                    className={cn("blend-chip", groupFilter === "all" && "is-on")}
                    onClick={() => setGroupFilter("all")}
                  >
                    All
                  </button>
                  {BLEND_GROUPS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className={cn("blend-chip", groupFilter === g.id && "is-on")}
                      onClick={() => setGroupFilter(g.id)}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="blend-mode-grid">
                {filteredModes.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={cn("blend-mode-card", mode === m.id && "is-on")}
                    onClick={() => setMode(m.id)}
                    title={m.blurb}
                  >
                    <span
                      className="swatch"
                      style={{
                        backgroundImage: `linear-gradient(${a},${a}), linear-gradient(${b},${b})`,
                        backgroundBlendMode: m.id,
                      }}
                    />
                    <span className="meta">
                      <span className="id block">{m.id}</span>
                      <span className="group">{m.group}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="blend-panel space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="blend-section-label" style={{ marginBottom: 0 }}>
                    Compare all modes
                  </p>
                  <p className="blend-muted text-xs mt-1">
                    Same colors, every mode — click to select.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCompare((v) => !v)}
                >
                  <Layers className="mr-1.5 h-3.5 w-3.5" />
                  {showCompare ? "Hide" : "Show"}
                </Button>
              </div>

              {showCompare ? (
                <div className="blend-compare">
                  {BLEND_MODES.map((m) => (
                    <button
                      key={`cmp-${m}`}
                      type="button"
                      className="blend-compare-item"
                      onClick={() => setMode(m)}
                      aria-label={m}
                    >
                      <div
                        className="tile"
                        style={{
                          backgroundImage: `linear-gradient(${a},${a}), linear-gradient(${b},${b})`,
                          backgroundBlendMode: m,
                        }}
                      />
                      <div className="label">{m}</div>
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="blend-actions">
                <Button asChild variant="outline" size="sm">
                  <Link href="/animated-gradient-generator">Mesh gradients</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/css-filter-generator">CSS filters</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/gradient-generator">Gradients</Link>
                </Button>
              </div>
              <p className="blend-muted text-xs">
                Hue / saturation / color / luminosity can differ slightly across engines. Preview
                uses your current browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
