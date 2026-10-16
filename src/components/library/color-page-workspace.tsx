"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Heart, LayoutDashboard, Palette, Pipette } from "lucide-react";
import { useFavoriteColors } from "@/hooks";
import { CopyButton } from "@/components/color/copy-button";
import { checkContrast, hexToRgb, getContrastRatio } from "@/lib/colors/convert";
import { colorToolLinks, readHexColor } from "@/lib/colors/tool-links";
import { readableInk } from "@/lib/theme-builder";

export function ColorPageOverview({
  name,
  hex,
  family,
  sources = [],
  hsl,
  headingLevel = 1,
}: {
  name: string;
  hex: string;
  family?: string;
  sources?: string[];
  hsl: string;
  headingLevel?: 1 | 2;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(hex);
  const [error, setError] = useState(false);
  const { has, toggle, hydrated } = useFavoriteColors();
  const rgb = hexToRgb(hex);
  const links = colorToolLinks(hex);
  const ink = readableInk(hex);
  const Title = headingLevel === 2 ? "h2" : "h1";
  function openColor(event: FormEvent) {
    event.preventDefault();
    const color = readHexColor(draft);
    setError(!color);
    if (color) router.push(`/color/${color.slice(1)}`);
  }
  return (
    <>
      <div className="cd-topline">
        <span className="cd-eyebrow">COLOR EXPLORER</span>
        <form onSubmit={openColor} className="cd-open-color" noValidate>
          <label htmlFor="cd-hex">Explore another color</label>
          <div>
            <input
              id="cd-hex"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              aria-invalid={error}
              aria-describedby={error ? "cd-hex-error" : undefined}
            />
            <button type="submit" aria-label="Open HEX color">
              <ArrowRight size={16} />
            </button>
          </div>
          {error && (
            <p role="alert" id="cd-hex-error">
              Enter a 3- or 6-digit HEX, like #FFD700.
            </p>
          )}
        </form>
      </div>
      <section className="cd-overview" aria-label={`${name} color overview`}>
        <div className="cd-swatch" style={{ background: hex, color: ink }}>
          <span>THE ORIGINAL SWATCH</span>
          <strong>{hex.toUpperCase()}</strong>
          <div>
            <span>100% opacity · sRGB</span>
            <CopyButton value={hex} label="HEX" className="cd-swatch-copy" />
          </div>
        </div>
        <div className="cd-intro">
          <div className="cd-title-row">
            <div>
              <p className="cd-eyebrow">YOUR NEXT GREAT ACCENT</p>
              <Title>{name}</Title>
            </div>
            <button
              type="button"
              className="cd-save"
              aria-label={has(hex) ? "Remove color from favorites" : "Save color to favorites"}
              aria-pressed={has(hex)}
              disabled={!hydrated}
              onClick={() => toggle(hex)}
            >
              <Heart size={18} fill={has(hex) ? "currentColor" : "none"} />
              <span>{has(hex) ? "Saved" : "Save"}</span>
            </button>
          </div>
          <p className="cd-description">
            Explore the codes, find a readable pairing, and see how this color feels in a real
            design.
          </p>
          <div className="cd-meta">
            {family && (
              <Link href={`/colors/family/${family}`}>
                {family} family <ArrowRight size={12} />
              </Link>
            )}
            <span>{sources.length ? sources.join(" · ") : "Calculated from HEX"}</span>
          </div>
          <div className="cd-key-codes">
            {[
              ["HEX", hex.toUpperCase()],
              ["RGB", `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`],
              ["HSL", hsl],
            ].map(([label, value]) => (
              <div key={label}>
                <div>
                  <span>{label}</span>
                  <code>{value}</code>
                </div>
                <CopyButton value={value} label={`${label} code`} size="icon" variant="ghost" />
              </div>
            ))}
          </div>
          <nav className="cd-primary-actions" aria-label="Use this color">
            <Link href={`/theme-builder?hex=${hex.slice(1)}`}>
              <LayoutDashboard size={16} /> Preview a UI theme
            </Link>
            <Link href={links.picker}>
              <Pipette size={16} /> Edit color
            </Link>
            <Link href={links.palette}>
              <Palette size={16} /> Build palette
            </Link>
          </nav>
        </div>
      </section>
      <nav className="cd-section-nav" aria-label="Color page sections">
        {[
          ["preview", "Preview & contrast"],
          ["codes", "Color codes"],
          ["scales", "Shades & tints"],
          ["harmonies", "Color harmonies"],
          ["tokens", "Nearest tokens"],
          ["export", "Export"],
          ["usage", "Usage notes"],
        ].map(([id, label]) => (
          <a key={id} href={`#color-${id}`}>
            {label}
          </a>
        ))}
      </nav>
    </>
  );
}

export function ColorPagePreview({ hex }: { hex: string }) {
  const [role, setRole] = useState<"text" | "fill">("text");
  const [other, setOther] = useState("#ffffff");
  const [draft, setDraft] = useState(other);
  const [error, setError] = useState(false);
  const [text, setText] = useState("A little color. A whole lot of possibility.");
  const [size, setSize] = useState(24);
  const fg = role === "text" ? hex : other;
  const bg = role === "text" ? other : hex;
  const result = checkContrast(fg, bg);
  const checker = `/contrast-checker?fg=${fg.slice(1)}&bg=${bg.slice(1)}`;
  function pair(value: string) {
    setOther(value);
    setDraft(value);
    setError(false);
  }
  function apply(event: FormEvent) {
    event.preventDefault();
    const value = readHexColor(draft);
    setError(!value);
    if (value) pair(value);
  }
  return (
    <section id="color-preview" className="cd-preview-section" aria-labelledby="cd-preview-heading">
      <div className="cd-heading">
        <div>
          <p className="cd-eyebrow">PUT IT INTO PRACTICE</p>
          <h2 id="cd-preview-heading">A color is only half the story.</h2>
          <p>Try it with another color before you commit.</p>
        </div>
        <Link href={checker}>
          Open full contrast checker <ArrowRight size={15} />
        </Link>
      </div>
      <div className="cd-preview-grid">
        <div className="cd-preview-main">
          <div className="cd-preview-toolbar">
            <div className="cd-segmented" role="group" aria-label="Selected color role">
              <button type="button" aria-pressed={role === "text"} onClick={() => setRole("text")}>
                Use as text
              </button>
              <button type="button" aria-pressed={role === "fill"} onClick={() => setRole("fill")}>
                Use as background
              </button>
            </div>
            <span>LIVE PREVIEW</span>
          </div>
          <div className="cd-live-sample" style={{ background: bg, color: fg }}>
            <span>MAKE ROOM FOR SOMETHING GOOD</span>
            <p style={{ fontSize: size }}>{text || "Your preview text"}</p>
            <span>
              Selected {role === "text" ? "text" : "background"}: {hex.toUpperCase()}
            </span>
          </div>
          <div className="cd-preview-inputs">
            <label>
              Preview text
              <input value={text} onChange={(e) => setText(e.target.value)} maxLength={160} />
            </label>
            <label>
              Text size <output>{size}px</output>
              <input
                type="range"
                min={14}
                max={48}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              />
            </label>
          </div>
        </div>
        <div className="cd-contrast-panel">
          <form onSubmit={apply} noValidate>
            <label htmlFor="cd-pair">{role === "text" ? "Background color" : "Text color"}</label>
            <div className="cd-pair-input">
              <input
                type="color"
                value={other}
                aria-label="Choose paired color"
                onChange={(e) => pair(e.target.value)}
              />
              <input
                id="cd-pair"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                aria-invalid={error}
                aria-describedby={error ? "cd-pair-error" : undefined}
              />
              <button type="submit">Apply</button>
            </div>
            {error && (
              <p id="cd-pair-error" role="alert">
                Use a valid 3- or 6-digit HEX.
              </p>
            )}
          </form>
          <div className="cd-pair-presets">
            <button type="button" onClick={() => pair("#ffffff")}>
              White
            </button>
            <button type="button" onClick={() => pair("#000000")}>
              Black
            </button>
            <button type="button" onClick={() => pair(readableInk(hex))}>
              Best black/white pair
            </button>
          </div>
          <div className="cd-ratio" aria-live="polite">
            <span>CONTRAST RATIO</span>
            <strong>
              {result.ratio.toFixed(2)}
              <small>:1</small>
            </strong>
          </div>
          <dl className="cd-checks">
            {[
              ["AA · normal text", result.normalAA],
              ["AA · large text", result.largeAA],
              ["AAA · normal text", result.normalAAA],
            ].map(([label, passes]) => (
              <div key={String(label)}>
                <dt>{label}</dt>
                <dd data-pass={passes}>{passes ? "Pass" : "Fail"}</dd>
              </div>
            ))}
          </dl>
          <p className="cd-contrast-note">
            Normal text: AA 4.5:1, AAA 7:1. Large text: AA 3:1 (24px regular or about 19px bold).
          </p>
          <CopyButton
            value={`color: ${fg};\nbackground-color: ${bg};`}
            label="pair CSS"
            className="cd-pair-copy"
          />
        </div>
      </div>
      <div className="cd-pair-summary">
        {["#ffffff", "#000000"].map((color) => (
          <div key={color}>
            <span style={{ background: color }} />
            <span>Against {color === "#ffffff" ? "white" : "black"}</span>
            <strong>{getContrastRatio(hex, color).toFixed(2)}:1</strong>
          </div>
        ))}
        <p>
          Results use the exact pair, at full opacity.{" "}
          <a
            href="https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html"
            target="_blank"
            rel="noreferrer"
          >
            WCAG contrast guidance ↗
          </a>
        </p>
      </div>
    </section>
  );
}
