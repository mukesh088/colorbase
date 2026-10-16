"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Code2,
  Copy,
  Heart,
  History,
  Palette,
  Pipette,
  Redo2,
  Shuffle,
  SlidersHorizontal,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import {
  checkContrast,
  formatHsl,
  formatRgb,
  generateHarmony,
  hexToRgb,
  mixColors,
  randomHex,
} from "@/lib/colors/convert";
import {
  CHANNELS,
  colorHistory,
  parseWorkbenchColor,
  selectChannels,
  selectionChannels,
  selectHex,
  shortOklch,
  type ChannelMode,
  type ColorSelection,
} from "@/lib/colors/workbench";
import { readableInk } from "@/lib/theme-builder";
import { colorToolLinks, readHexColor } from "@/lib/colors/tool-links";
import { useFavoriteColors, useRecentColors } from "@/hooks";
import { cn } from "@/lib/utils";
import "./color-workbench.css";

const HARMONIES = [
  "analogous",
  "complementary",
  "triadic",
  "tetradic",
  "split-complementary",
  "monochromatic",
] as const;
const PRESETS = [
  "#5368ce",
  "#bd5478",
  "#df8253",
  "#d3aa42",
  "#548473",
  "#528ea4",
  "#8a6bae",
  "#283548",
];
const MODES: ChannelMode[] = ["rgb", "hsl", "hsv", "cmyk"];

function ChannelControl({
  mode,
  channel,
  value,
  max,
  onChange,
  onStart,
  onEnd,
  track,
}: {
  mode: ChannelMode;
  channel: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
  onStart: () => void;
  onEnd: () => void;
  track?: string;
}) {
  const [draft, setDraft] = useState(String(value));
  const [invalid, setInvalid] = useState(false);
  useEffect(() => {
    setDraft(String(value));
    setInvalid(false);
  }, [value]);
  const apply = () => {
    const number = Number(draft);
    if (draft.trim() && Number.isFinite(number) && number >= 0 && number <= max) {
      onChange(Math.round(number));
      setDraft(String(Math.round(number)));
      setInvalid(false);
    } else setInvalid(true);
  };
  const label = `${mode.toUpperCase()} ${channel}`;
  return (
    <div className="cw-channel">
      <div>
        <label htmlFor={`cw-${mode}-${channel.replace(/\W/g, "")}`}>{channel}</label>
        <span>
          <input
            id={`cw-${mode}-${channel.replace(/\W/g, "")}`}
            type="number"
            inputMode="decimal"
            min={0}
            max={max}
            value={draft}
            aria-label={`${label} value`}
            aria-invalid={invalid}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={apply}
            onKeyDown={(event) => {
              if (event.key === "Enter") apply();
              if (event.key === "Escape") {
                setDraft(String(value));
                setInvalid(false);
              }
            }}
          />
          <small>{max === 360 ? "°" : max === 100 ? "%" : "/ 255"}</small>
        </span>
      </div>
      <input
        type="range"
        aria-label={`${label} slider`}
        min={0}
        max={max}
        step={1}
        value={value}
        style={track ? { background: track } : undefined}
        onPointerDown={onStart}
        onPointerUp={onEnd}
        onPointerCancel={onEnd}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {invalid && <p role="alert">Use a value from 0 to {max}.</p>}
    </div>
  );
}

export function ColorWorkbench({
  initialColor = "#5368ce",
  initialMode = "hsv",
  variant = "picker",
  className,
  swapHref,
  swapLabel,
}: {
  initialColor?: string;
  initialMode?: ChannelMode;
  variant?: "picker" | "converter";
  className?: string;
  swapHref?: string;
  swapLabel?: string;
}) {
  const initial = selectHex(initialColor) ?? selectHex("#5368ce")!;
  const [history, dispatch] = useReducer(colorHistory, { past: [], present: initial, future: [] });
  const selection = history.present;
  const hex = selection.hex;
  const rgb = hexToRgb(hex);
  const [mode, setMode] = useState(initialMode);
  const [draft, setDraft] = useState(hex);
  const [invalid, setInvalid] = useState(false);
  const [harmony, setHarmony] = useState<(typeof HARMONIES)[number]>("analogous");
  const [collection, setCollection] = useState<"recent" | "saved">("recent");
  const [eyeDropperAvailable, setEyeDropperAvailable] = useState(false);
  const { colors: recent, add: remember } = useRecentColors();
  const {
    colors: favorites,
    has: isFavorite,
    toggle: toggleFavorite,
    hydrated: favoritesReady,
  } = useFavoriteColors();
  const rememberRef = useRef(remember);
  rememberRef.current = remember;
  const current = useRef(selection);
  current.current = selection;
  const gesture = useRef<ColorSelection | null>(null);
  const plane = useRef<HTMLDivElement>(null);
  const links = colorToolLinks(hex);

  useEffect(() => {
    const query = readHexColor(new URLSearchParams(window.location.search).get("hex"));
    if (query) dispatch({ type: "set", selection: selectHex(query)! });
    setEyeDropperAvailable("EyeDropper" in window);
  }, []);
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);
  useEffect(() => {
    setDraft(hex);
    setInvalid(false);
  }, [hex]);

  const applySelection = useCallback((next: ColorSelection) => {
    if (JSON.stringify(next) === JSON.stringify(current.current)) return;
    current.current = next;
    dispatch({ type: gesture.current ? "preview" : "set", selection: next });
    if (!gesture.current) rememberRef.current(next.hex);
  }, []);
  const applyHex = useCallback(
    (input: string) => {
      const next = selectHex(input, current.current);
      if (next) applySelection(next);
    },
    [applySelection]
  );
  const begin = () => {
    if (!gesture.current) gesture.current = current.current;
  };
  const finish = useCallback(() => {
    const before = gesture.current;
    if (!before) return;
    gesture.current = null;
    dispatch({ type: "finish", before });
    if (before.hex !== current.current.hex) rememberRef.current(current.current.hex);
  }, []);
  useEffect(() => {
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    window.addEventListener("blur", finish);
    return () => {
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      window.removeEventListener("blur", finish);
    };
  }, [finish]);
  const editChannel = (key: string, value: number) => {
    const next = selectChannels(current.current, mode, {
      ...selectionChannels(current.current, mode),
      [key]: value,
    });
    if (next) applySelection(next);
  };
  const editHsv = (patch: Partial<ColorSelection["hsv"]>) => {
    const next = selectChannels(current.current, "hsv", { ...current.current.hsv, ...patch });
    if (next) applySelection(next);
  };
  const fromPlane = (clientX: number, clientY: number) => {
    const rect = plane.current?.getBoundingClientRect();
    if (!rect?.width || !rect.height) return;
    editHsv({
      s: Math.round(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * 100),
      v: Math.round((1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))) * 100),
    });
  };
  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Clipboard is unavailable. Select the code to copy it.");
    }
  };
  const sample = async () => {
    const EyeDropper = (
      window as Window & { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }
    ).EyeDropper;
    if (!EyeDropper) return;
    try {
      const result = await new EyeDropper().open();
      applyHex(result.sRGBHex);
      toast.success("Screen color sampled");
    } catch {
      /* The native sampler was dismissed. */
    }
  };
  const applyDraft = () => {
    const next = parseWorkbenchColor(draft, current.current);
    if (next) {
      applySelection(next);
      setDraft(next.hex);
      setInvalid(false);
    } else setInvalid(true);
  };
  const harmonyColors = useMemo(() => generateHarmony(hex, harmony), [hex, harmony]);
  const tints = useMemo(
    () => Array.from({ length: 7 }, (_, i) => mixColors(hex, "#ffffff", (i + 1) / 8)).reverse(),
    [hex]
  );
  const shades = useMemo(
    () => Array.from({ length: 7 }, (_, i) => mixColors(hex, "#000000", (i + 1) / 8)),
    [hex]
  );
  const values = [
    { label: "HEX", value: hex.toUpperCase() },
    { label: "RGB", value: formatRgb(rgb) },
    { label: "HSL", value: formatHsl(selection.hsl) },
    { label: "OKLCH", value: shortOklch(hex) },
  ];
  const allValues = [
    ...values,
    { label: "HSV", value: `hsv(${selection.hsv.h}, ${selection.hsv.s}%, ${selection.hsv.v}%)` },
    {
      label: "CMYK",
      value: `cmyk(${selection.cmyk.c}%, ${selection.cmyk.m}%, ${selection.cmyk.y}%, ${selection.cmyk.k}%)`,
    },
  ];
  const css = `:root {\n  --color-brand: ${hex};\n  --color-brand-rgb: ${rgb.r} ${rgb.g} ${rgb.b};\n}\n\n.brand-button {\n  background: var(--color-brand);\n  color: ${readableInk(hex)};\n}`;
  const channelValues = selectionChannels(selection, mode);
  const collectionColors = (collection === "recent" ? recent : favorites)
    .filter((color) => readHexColor(color))
    .slice(0, 16);
  const track = (key: string) =>
    key === "h"
      ? "linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)"
      : mode === "rgb"
        ? `linear-gradient(90deg,rgb(${key === "r" ? 0 : rgb.r},${key === "g" ? 0 : rgb.g},${key === "b" ? 0 : rgb.b}),rgb(${key === "r" ? 255 : rgb.r},${key === "g" ? 255 : rgb.g},${key === "b" ? 255 : rgb.b}))`
        : undefined;

  return (
    <div className={cn("color-workbench", variant === "converter" && "cw-converter", className)}>
      <div className="cw-valuebar" aria-label="Current color codes">
        {values.map(({ label, value }) => (
          <div key={label}>
            <span className="cw-value-dot" style={{ background: hex }} />
            <div>
              <span>{label}</span>
              <code>{value}</code>
            </div>
            <CopyButton value={value} label={`${label} value`} size="icon" variant="ghost" />
          </div>
        ))}
      </div>
      <section
        className="cw-main"
        aria-label={
          variant === "picker" ? "Color selection workspace" : "Color conversion workspace"
        }
      >
        <div className="cw-editor">
          <div className="cw-panel-heading">
            <span>
              <SlidersHorizontal size={14} />
              {variant === "picker" ? "Find your color" : "Fine-tune your values"}
            </span>
            <div>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Undo color change"
                disabled={!history.past.length}
                onClick={() => dispatch({ type: "undo" })}
              >
                <Undo2 />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Redo color change"
                disabled={!history.future.length}
                onClick={() => dispatch({ type: "redo" })}
              >
                <Redo2 />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Random color"
                onClick={() => applyHex(randomHex())}
              >
                <Shuffle />
              </Button>
            </div>
          </div>
          <div className="cw-editor-body">
            {variant === "picker" && (
              <>
                <div
                  ref={plane}
                  className="cw-plane"
                  role="slider"
                  aria-label="Saturation and brightness"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={selection.hsv.s}
                  aria-valuetext={`${selection.hsv.s}% saturation, ${selection.hsv.v}% brightness. Arrow keys adjust both axes.`}
                  tabIndex={0}
                  style={{
                    background: `linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl(${selection.hsv.h},100%,50%))`,
                  }}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.currentTarget.focus();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    begin();
                    fromPlane(event.clientX, event.clientY);
                  }}
                  onPointerMove={(event) => {
                    if (event.currentTarget.hasPointerCapture(event.pointerId))
                      fromPlane(event.clientX, event.clientY);
                  }}
                  onPointerUp={finish}
                  onPointerCancel={finish}
                  onKeyDown={(event) => {
                    if (!event.key.startsWith("Arrow")) return;
                    event.preventDefault();
                    const step = event.shiftKey ? 5 : 1;
                    const { s, v } = current.current.hsv;
                    if (event.key === "ArrowLeft") editHsv({ s: Math.max(0, s - step) });
                    if (event.key === "ArrowRight") editHsv({ s: Math.min(100, s + step) });
                    if (event.key === "ArrowDown") editHsv({ v: Math.max(0, v - step) });
                    if (event.key === "ArrowUp") editHsv({ v: Math.min(100, v + step) });
                  }}
                >
                  <span
                    style={{
                      left: `${selection.hsv.s}%`,
                      top: `${100 - selection.hsv.v}%`,
                      background: hex,
                    }}
                  />
                </div>
                <label className="cw-hue-label">
                  Hue <span>{selection.hsv.h}°</span>
                  <input
                    type="range"
                    aria-label="Picker hue"
                    min={0}
                    max={360}
                    value={selection.hsv.h}
                    onPointerDown={begin}
                    onPointerUp={finish}
                    onPointerCancel={finish}
                    onChange={(event) => editHsv({ h: Number(event.target.value) })}
                  />
                </label>
              </>
            )}
            <div className="cw-color-entry">
              <label htmlFor="cw-color-input">
                Paste a color value <span>HEX · RGB · HSL</span>
              </label>
              <div>
                <label className="cw-native-input">
                  <input
                    type="color"
                    value={hex}
                    aria-label="Native color picker"
                    onChange={(event) => applyHex(event.target.value)}
                  />
                </label>
                <input
                  id="cw-color-input"
                  value={draft}
                  aria-invalid={invalid}
                  aria-describedby={invalid ? "cw-color-error" : undefined}
                  onChange={(event) => setDraft(event.target.value)}
                  onBlur={applyDraft}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") applyDraft();
                    if (event.key === "Escape") {
                      setDraft(hex);
                      setInvalid(false);
                    }
                  }}
                  spellCheck={false}
                />
                <button onClick={applyDraft} aria-label="Apply color value">
                  <ArrowRight size={16} />
                </button>
                <button
                  aria-label="Sample screen color"
                  title={
                    eyeDropperAvailable
                      ? "Sample a color from your screen"
                      : "Screen sampling is unavailable in this browser"
                  }
                  disabled={!eyeDropperAvailable}
                  onClick={sample}
                >
                  <Pipette size={16} />
                </button>
              </div>
              {invalid && (
                <p id="cw-color-error" role="alert">
                  Use 3 or 6 HEX digits, rgb(255, 128, 0), or hsl(30, 100%, 50%). Alpha colors are
                  not supported here.
                </p>
              )}
            </div>
            <div className="cw-mode-tabs" aria-label="Color channel model">
              {MODES.map((value) => (
                <button key={value} aria-pressed={mode === value} onClick={() => setMode(value)}>
                  {value.toUpperCase()}
                </button>
              ))}
              {swapHref && (
                <Link href={`${swapHref}?hex=${hex.slice(1)}`}>{swapLabel ?? "Reverse"} ↗</Link>
              )}
            </div>
            <div className="cw-channels">
              {CHANNELS[mode].map(({ key, label, max }) => (
                <ChannelControl
                  key={`${mode}-${key}`}
                  mode={mode}
                  channel={label}
                  value={channelValues[key]}
                  max={max}
                  track={track(key)}
                  onStart={begin}
                  onEnd={finish}
                  onChange={(value) => editChannel(key, value)}
                />
              ))}
            </div>
            {mode === "cmyk" && (
              <p className="cw-note">
                CMYK values are an approximate sRGB conversion. Print results depend on the printer,
                paper, and color profile.
              </p>
            )}
          </div>
        </div>
        <aside className="cw-result">
          <div className="cw-color-preview" style={{ background: hex, color: readableInk(hex) }}>
            <div>
              <span>YOUR SELECTED COLOR</span>
              <button
                aria-label={
                  isFavorite(hex) ? "Remove color from favorites" : "Save color to favorites"
                }
                aria-pressed={isFavorite(hex)}
                disabled={!favoritesReady}
                onClick={() => {
                  toggleFavorite(hex);
                  toast.success(
                    isFavorite(hex) ? "Removed from favorite colors" : "Color saved to favorites"
                  );
                }}
              >
                {isFavorite(hex) ? <Heart size={17} fill="currentColor" /> : <Heart size={17} />}
              </button>
            </div>
            <strong>{hex.toUpperCase()}</strong>
            <p>
              A little color.
              <br />A whole lot of possibility.
            </p>
            <span className="cw-srgb-label">
              OPAQUE sRGB · {rgb.r} / {rgb.g} / {rgb.b}
            </span>
          </div>
          <div className="cw-code-list">
            <div className="cw-small-heading">
              <h2>Every format. One color.</h2>
              <button
                onClick={() =>
                  void copy(
                    allValues.map(({ label, value }) => `${label}: ${value}`).join("\n"),
                    "Color values"
                  )
                }
              >
                <Copy size={12} />
                Copy all
              </button>
            </div>
            {allValues.map(({ label, value }) => (
              <div className="cw-code-row" key={label}>
                <span>{label}</span>
                <code>{value}</code>
                <CopyButton value={value} label={label} size="icon" variant="ghost" />
              </div>
            ))}
            <p className="cw-note">
              HEX, RGB, HSL, and OKLCH are CSS-ready. HSV and CMYK are reference values.
            </p>
          </div>
          <div className="cw-next-actions">
            <Link href={`/theme-builder?hex=${hex.slice(1)}`}>
              <Palette size={14} />
              Build a UI theme <ArrowRight size={13} />
            </Link>
            <Link href={links.palette}>
              Explore this palette <ArrowRight size={13} />
            </Link>
          </div>
        </aside>
      </section>
      <div className="cw-preset-row">
        <span>A FEW GOOD STARTING POINTS</span>
        <div>
          {PRESETS.map((color) => (
            <button
              key={color}
              style={{ background: color }}
              aria-label={`Select preset ${color}`}
              onClick={() => applyHex(color)}
            />
          ))}
        </div>
        <Link href="/color-names">
          Browse named colors <ArrowRight size={12} />
        </Link>
      </div>
      <div className="cw-details-grid">
        <section className="cw-detail-card">
          <div className="cw-small-heading">
            <div>
              <span className="cw-eyebrow">IN CONTEXT</span>
              <h2>Does your text stand out?</h2>
            </div>
            <Link href={links.contrast}>Open checker ↗</Link>
          </div>
          <div className="cw-contrast-grid">
            {[
              { background: "#ffffff", label: "On white" },
              { background: "#000000", label: "On black" },
            ].map(({ background, label }) => {
              const result = checkContrast(hex, background);
              return (
                <div key={label}>
                  <div style={{ color: hex, background }}>
                    Aa<span>Every detail matters.</span>
                  </div>
                  <section>
                    <span>{label}</span>
                    <strong>{result.ratio.toFixed(2)}:1</strong>
                    <p>
                      {result.normalAA ? <Check size={11} /> : null}AA normal text:{" "}
                      {result.normalAA ? "Pass" : "Fail"}
                    </p>
                    <p>
                      AA large: {result.largeAA ? "Pass" : "Fail"} · AAA normal:{" "}
                      {result.normalAAA ? "Pass" : "Fail"}
                    </p>
                  </section>
                </div>
              );
            })}
          </div>
          <p className="cw-note">
            Normal text AA needs 4.5:1; large text AA needs 3:1. Results apply to the displayed
            pairs.
          </p>
        </section>
        <section className="cw-detail-card">
          <div className="cw-small-heading">
            <div>
              <span className="cw-eyebrow">READY FOR YOUR PROJECT</span>
              <h2>Small snippet. Useful start.</h2>
            </div>
            <Code2 size={17} />
          </div>
          <pre className="cw-css" tabIndex={0} aria-label="Color CSS snippet">
            <code>{css}</code>
          </pre>
          <Button size="sm" variant="outline" onClick={() => void copy(css, "CSS snippet")}>
            <Copy />
            Copy CSS snippet
          </Button>
        </section>
      </div>
      <section className="cw-variations cw-detail-card">
        <div className="cw-small-heading">
          <div>
            <span className="cw-eyebrow">EXPLORE THE RANGE</span>
            <h2>A color has more to say.</h2>
          </div>
          <span>Choose any swatch to continue exploring.</span>
        </div>
        {[
          { label: "Tints", detail: "A little more white", colors: tints },
          { label: "Shades", detail: "A little more black", colors: shades },
        ].map((row) => (
          <div className="cw-scale-row" key={row.label}>
            <div>
              <strong>{row.label}</strong>
              <span>{row.detail}</span>
            </div>
            <div className="cw-scale">
              {row.colors.map((color, i) => (
                <button
                  key={i}
                  style={{ background: color, color: readableInk(color) }}
                  aria-label={`Select ${row.label.toLowerCase()} ${i + 1}: ${color}`}
                  onClick={() => applyHex(color)}
                >
                  <span>{color.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="cw-harmony-heading">
          <div>
            <h3>Colors that work together.</h3>
            <p>Start with a relationship on the color wheel.</p>
          </div>
          <select
            aria-label="Color harmony"
            value={harmony}
            onChange={(event) => setHarmony(event.target.value as typeof harmony)}
          >
            {HARMONIES.map((value) => (
              <option key={value} value={value}>
                {value.replace("-", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="cw-harmony-swatches">
          {harmonyColors.map((color, i) => (
            <button
              key={i}
              onClick={() => applyHex(color)}
              aria-label={`Select harmony color ${color}`}
            >
              <span style={{ background: color }} />
              <code>{color.toUpperCase()}</code>
            </button>
          ))}
        </div>
        <Link
          className="cw-harmony-link"
          href={`/palette-generator?colors=${harmonyColors.map((color) => color.slice(1)).join("-")}`}
        >
          Continue in Palette Studio <ArrowRight size={13} />
        </Link>
      </section>
      <section className="cw-detail-card cw-collection">
        <div className="cw-small-heading">
          <div className="cw-collection-tabs">
            <button aria-pressed={collection === "recent"} onClick={() => setCollection("recent")}>
              <History size={13} />
              Recent colors
            </button>
            <button aria-pressed={collection === "saved"} onClick={() => setCollection("saved")}>
              <Heart size={13} />
              Favorites
            </button>
          </div>
          <span>Your existing color collection.</span>
        </div>
        {collectionColors.length ? (
          <div className="cw-collection-swatches">
            {collectionColors.map((color) => (
              <button
                key={color.toLowerCase()}
                onClick={() => applyHex(color)}
                aria-label={`Apply ${collection} color ${color}`}
              >
                <span style={{ background: color }} />
                <code>{color.toUpperCase()}</code>
              </button>
            ))}
          </div>
        ) : (
          <p className="cw-note">
            {collection === "recent"
              ? "Your color explorations will appear here."
              : "Use the heart on your selected color to keep a favorite."}
          </p>
        )}
      </section>
    </div>
  );
}
