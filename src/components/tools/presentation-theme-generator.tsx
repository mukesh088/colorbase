"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import { normalizeHex, randomHex } from "@/lib/colors/convert";
import { parseFlexibleColor } from "@/lib/colors/parse";
import { downloadText } from "@/lib/utils";
import {
  PRESENTATION_PRESETS,
  ROLE_LABELS,
  applyCvdToRoles,
  auditPresentationTheme,
  buildPresentationTheme,
  stripHash,
  themeToCssVars,
  themeToTokenJson,
  type AspectRatio,
  type CvdMode,
  type DeckMode,
  type HarmonyKind,
  type PresentationRoles,
} from "@/lib/presentation/theme";
import "./flagship-tools.css";

type SlideId =
  | "title"
  | "agenda"
  | "section"
  | "content"
  | "split"
  | "metrics"
  | "quote"
  | "closing";

const SLIDES: { id: SlideId; label: string }[] = [
  { id: "title", label: "Title" },
  { id: "agenda", label: "Agenda" },
  { id: "section", label: "Section" },
  { id: "content", label: "Content" },
  { id: "split", label: "Two-col" },
  { id: "metrics", label: "Metrics" },
  { id: "quote", label: "Quote" },
  { id: "closing", label: "Closing" },
];

const HARMONIES: { id: HarmonyKind; label: string }[] = [
  { id: "analogous", label: "Analogous" },
  { id: "complementary", label: "Complementary" },
  { id: "triadic", label: "Triadic" },
  { id: "split-complementary", label: "Split comp." },
  { id: "monochromatic", label: "Mono" },
];

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
    <label className="grid min-w-[140px] flex-1 gap-1 text-sm">
      <span>{label}</span>
      <span className="flagship-row">
        <input
          type="color"
          value={normalizeHex(value)}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} picker`}
        />
        <input
          className="flagship-input font-mono uppercase"
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

function SlideStage({
  slide,
  roles,
  title,
  subtitle,
  presenter,
}: {
  slide: SlideId;
  roles: PresentationRoles;
  title: string;
  subtitle: string;
  presenter: string;
}) {
  const shell: CSSProperties = {
    background: roles.surface,
    color: roles.ink,
    borderColor: roles.border,
  };

  if (slide === "title") {
    return (
      <div className="presentation-slide" style={shell}>
        <div className="h-2 w-full" style={{ background: roles.accent }} />
        <div className="flex flex-1 flex-col justify-center gap-3 p-8">
          <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: roles.muted }}>
            {presenter || "ColorBase Studio"}
          </p>
          <h3 className="text-3xl font-semibold leading-tight tracking-tight" style={{ color: roles.ink }}>
            {title || "Untitled deck"}
          </h3>
          <p className="max-w-lg text-sm leading-relaxed" style={{ color: roles.muted }}>
            {subtitle || "Accessible presentation theme preview"}
          </p>
          <div className="mt-4 flex gap-2">
            {roles.charts.slice(0, 4).map((c) => (
              <span key={c} className="h-2 w-10 rounded-full" style={{ background: c }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (slide === "agenda") {
    return (
      <div className="presentation-slide p-8" style={shell}>
        <p className="text-xs uppercase tracking-wide" style={{ color: roles.accent }}>
          Agenda
        </p>
        <h3 className="mt-2 text-2xl font-semibold" style={{ color: roles.ink }}>
          What we will cover
        </h3>
        <ol className="mt-6 space-y-3 text-sm" style={{ color: roles.muted }}>
          {["Brand roles that survive projection", "Readable body ink on every surface", "Chart accents that stay distinct", "Export paths for PPTX + tokens"].map(
            (item, i) => (
              <li key={item} className="flex gap-3">
                <span
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{ background: roles.accent, color: roles.onAccent }}
                >
                  {i + 1}
                </span>
                <span>{item}</span>
              </li>
            )
          )}
        </ol>
      </div>
    );
  }

  if (slide === "section") {
    return (
      <div className="presentation-slide items-center justify-center p-10 text-center" style={{ background: roles.accent, color: roles.onAccent }}>
        <p className="text-xs uppercase tracking-[0.2em] opacity-80">Section</p>
        <h3 className="mt-3 text-3xl font-semibold tracking-tight">Brand system</h3>
        <p className="mx-auto mt-3 max-w-md text-sm opacity-85">
          One accent, supporting hues, and status colors for every slide type.
        </p>
      </div>
    );
  }

  if (slide === "content") {
    return (
      <div className="presentation-slide p-8" style={shell}>
        <h3 className="text-2xl font-semibold" style={{ color: roles.ink }}>
          Decision framework
        </h3>
        <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: roles.muted }}>
          Keep logo color for accents and CTAs. Reserve near-black or near-white ink for titles so body
          copy stays readable under projector washout.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {["Measure contrast first", "Limit chart series to five", "Dark mode is a second theme", "Export tokens with the deck"].map(
            (card, i) => (
              <div
                key={card}
                className="rounded-xl border p-3 text-sm"
                style={{
                  borderColor: roles.border,
                  background: roles.surfaceAlt,
                  color: roles.ink,
                }}
              >
                <span className="mb-2 inline-block h-1.5 w-8 rounded" style={{ background: roles.charts[i % roles.charts.length] }} />
                <p>{card}</p>
              </div>
            )
          )}
        </div>
        <div
          className="mt-6 inline-flex rounded-lg px-4 py-2 text-sm font-medium"
          style={{ background: roles.accent, color: roles.onAccent }}
        >
          Primary CTA
        </div>
      </div>
    );
  }

  if (slide === "split") {
    return (
      <div className="presentation-slide grid sm:grid-cols-2" style={shell}>
        <div className="flex flex-col justify-center gap-3 border-b p-8 sm:border-b-0 sm:border-r" style={{ borderColor: roles.border }}>
          <p className="text-xs uppercase tracking-wide" style={{ color: roles.accent }}>
            Opportunity
          </p>
          <h3 className="text-xl font-semibold" style={{ color: roles.ink }}>
            Where color helps
          </h3>
          <ul className="space-y-2 text-sm" style={{ color: roles.muted }}>
            <li>Hierarchy without extra chrome</li>
            <li>Status without relying on hue alone</li>
            <li>Charts that survive CVD simulation</li>
          </ul>
        </div>
        <div className="flex flex-col justify-center gap-3 p-8" style={{ background: roles.surfaceAlt }}>
          <p className="text-xs uppercase tracking-wide" style={{ color: roles.support }}>
            Risk
          </p>
          <h3 className="text-xl font-semibold" style={{ color: roles.ink }}>
            Where it fails
          </h3>
          <ul className="space-y-2 text-sm" style={{ color: roles.muted }}>
            <li>Logo red as body text</li>
            <li>Low-contrast muted captions</li>
            <li>Eight near-identical series colors</li>
          </ul>
        </div>
      </div>
    );
  }

  if (slide === "metrics") {
    const bars = [62, 84, 48, 71, 56];
    return (
      <div className="presentation-slide p-8" style={shell}>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: roles.accent }}>
              Metrics
            </p>
            <h3 className="mt-1 text-2xl font-semibold" style={{ color: roles.ink }}>
              Quarterly pulse
            </h3>
          </div>
          <div className="flex gap-3 text-xs" style={{ color: roles.muted }}>
            {roles.charts.slice(0, 3).map((c, i) => (
              <span key={c} className="inline-flex items-center gap-1">
                <i className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
                Series {i + 1}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-8 flex h-40 items-end gap-3">
          {bars.map((h, i) => (
            <div key={h} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md"
                style={{ height: `${h}%`, background: roles.charts[i % roles.charts.length], minHeight: 28 }}
              />
              <span className="text-[11px]" style={{ color: roles.muted }}>
                Q{i + 1}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { label: "Win rate", value: "41%", tone: roles.success },
            { label: "At risk", value: "12%", tone: roles.warning },
            { label: "Churn", value: "3.1%", tone: roles.danger },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-xl border p-3" style={{ borderColor: roles.border, background: roles.surfaceAlt }}>
              <p className="text-lg font-semibold" style={{ color: kpi.tone }}>
                {kpi.value}
              </p>
              <p className="text-[11px]" style={{ color: roles.muted }}>
                {kpi.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide === "quote") {
    return (
      <div className="presentation-slide justify-center p-10" style={{ background: roles.surfaceAlt, color: roles.ink }}>
        <div className="h-1 w-16 rounded" style={{ background: roles.accent }} />
        <blockquote className="mt-6 max-w-2xl text-2xl font-medium leading-snug tracking-tight">
          “A deck theme is a contract: titles stay ink, accents stay scarce, charts stay separable.”
        </blockquote>
        <p className="mt-6 text-sm" style={{ color: roles.muted }}>
          — ColorBase presentation guidance
        </p>
      </div>
    );
  }

  return (
    <div className="presentation-slide p-8" style={shell}>
      <div className="flex h-full flex-col justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide" style={{ color: roles.accent }}>
            Next steps
          </p>
          <h3 className="mt-2 text-3xl font-semibold" style={{ color: roles.ink }}>
            Ship the theme
          </h3>
          <p className="mt-3 max-w-md text-sm" style={{ color: roles.muted }}>
            Download PPTX for stakeholders, then hand engineering the CSS variables or JSON tokens.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-lg px-4 py-2 text-sm font-medium" style={{ background: roles.accent, color: roles.onAccent }}>
            Download PPTX
          </span>
          <span className="rounded-lg border px-4 py-2 text-sm" style={{ borderColor: roles.border, color: roles.ink }}>
            Export tokens
          </span>
        </div>
      </div>
    </div>
  );
}

export function PresentationThemeGenerator() {
  const [primary, setPrimary] = useState("#1d4ed8");
  const [secondary, setSecondary] = useState("#0f172a");
  const [mode, setMode] = useState<DeckMode>("light");
  const [harmony, setHarmony] = useState<HarmonyKind>("analogous");
  const [aspect, setAspect] = useState<AspectRatio>("widescreen");
  const [cvd, setCvd] = useState<CvdMode>("none");
  const [slide, setSlide] = useState<SlideId>("title");
  const [title, setTitle] = useState("ColorBase Q4 readout");
  const [subtitle, setSubtitle] = useState("Accessible presentation theme for stakeholders");
  const [presenter, setPresenter] = useState("Design Systems · ColorBase");
  const [busy, setBusy] = useState(false);

  const roles = useMemo(
    () =>
      buildPresentationTheme({
        primary,
        secondary,
        mode,
        harmony,
      }),
    [primary, secondary, mode, harmony]
  );
  const previewRoles = useMemo(() => applyCvdToRoles(roles, cvd), [roles, cvd]);
  const audit = useMemo(() => auditPresentationTheme(roles), [roles]);
  const failing = audit.filter((a) => (a.id === "accent-surface" || a.id === "support-surface" ? !a.aaLarge : !a.aa));
  const tokenJson = useMemo(
    () =>
      themeToTokenJson({
        name: title || "ColorBase Presentation Theme",
        mode,
        harmony,
        aspect,
        title,
        subtitle,
        roles,
        audit,
      }),
    [title, subtitle, mode, harmony, aspect, roles, audit]
  );
  const cssVars = useMemo(() => themeToCssVars(roles), [roles]);
  const csv = useMemo(() => {
    const rows = [
      ["role", "hex"],
      ...Object.entries(ROLE_LABELS).map(([key, label]) => [label, roles[key as keyof typeof ROLE_LABELS]]),
      ...roles.charts.map((c, i) => [`Chart ${i + 1}`, c]),
    ];
    return rows.map((r) => r.join(",")).join("\n");
  }, [roles]);

  function applyPreset(id: string) {
    const preset = PRESENTATION_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setPrimary(preset.primary);
    setSecondary(preset.secondary);
    setHarmony(preset.harmony);
    setMode(preset.mode);
  }

  function suggestFromPrimary() {
    setPrimary(normalizeHex(randomHex()));
  }

  async function exportPptx() {
    setBusy(true);
    try {
      const PptxGenJS = (await import("pptxgenjs")).default;
      const pptx = new PptxGenJS();
      pptx.author = "ColorBase";
      pptx.title = title || "ColorBase Presentation Theme";
      pptx.subject = subtitle;
      if (aspect === "standard") {
        pptx.defineLayout({ name: "STANDARD_4x3", width: 10, height: 7.5 });
        pptx.layout = "STANDARD_4x3";
      } else {
        pptx.defineLayout({ name: "WIDESCREEN_16x9", width: 13.333, height: 7.5 });
        pptx.layout = "WIDESCREEN_16x9";
      }

      const W = aspect === "standard" ? 10 : 13.333;
      const ink = stripHash(roles.ink);
      const muted = stripHash(roles.muted);
      const accent = stripHash(roles.accent);
      const onAccent = stripHash(roles.onAccent);
      const surface = stripHash(roles.surface);
      const surfaceAlt = stripHash(roles.surfaceAlt);
      const support = stripHash(roles.support);
      const border = stripHash(roles.border);

      const titleSlide = pptx.addSlide();
      titleSlide.background = { color: surface };
      titleSlide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: W,
        h: 0.28,
        fill: { color: accent },
      });
      titleSlide.addText(presenter || "ColorBase", {
        x: 0.7,
        y: 2.1,
        w: W - 1.4,
        fontSize: 12,
        color: muted,
      });
      titleSlide.addText(title || "Untitled deck", {
        x: 0.7,
        y: 2.5,
        w: W - 1.4,
        fontSize: 36,
        bold: true,
        color: ink,
      });
      titleSlide.addText(subtitle || "Accessible presentation theme", {
        x: 0.7,
        y: 3.5,
        w: W - 1.4,
        fontSize: 16,
        color: muted,
      });

      const agenda = pptx.addSlide();
      agenda.background = { color: surface };
      agenda.addText("Agenda", { x: 0.7, y: 0.5, w: 8, fontSize: 14, color: accent });
      agenda.addText("What we will cover", { x: 0.7, y: 0.9, w: 10, fontSize: 28, bold: true, color: ink });
      agenda.addText(
        [
          { text: "Brand roles that survive projection", options: { breakLine: true } },
          { text: "Readable body ink on every surface", options: { breakLine: true } },
          { text: "Chart accents that stay distinct", options: { breakLine: true } },
          { text: "Export paths for PPTX + tokens", options: { breakLine: true } },
        ],
        { x: 0.7, y: 1.8, w: 10, fontSize: 16, color: muted, paraSpaceAfter: 10 }
      );

      const section = pptx.addSlide();
      section.background = { color: accent };
      section.addText("Section", {
        x: 0.7,
        y: 2.5,
        w: W - 1.4,
        align: "center",
        fontSize: 12,
        color: onAccent,
      });
      section.addText("Brand system", {
        x: 0.7,
        y: 3.0,
        w: W - 1.4,
        align: "center",
        fontSize: 34,
        bold: true,
        color: onAccent,
      });

      const content = pptx.addSlide();
      content.background = { color: surface };
      content.addText("Decision framework", { x: 0.7, y: 0.5, w: 10, fontSize: 28, bold: true, color: ink });
      content.addText(
        "Keep logo color for accents and CTAs. Reserve near-black or near-white ink for titles so body copy stays readable under projector washout.",
        { x: 0.7, y: 1.2, w: W - 1.4, fontSize: 15, color: muted }
      );
      content.addShape(pptx.ShapeType.roundRect, {
        x: 0.7,
        y: 5.8,
        w: 2.6,
        h: 0.55,
        fill: { color: accent },
      });
      content.addText("Primary CTA", {
        x: 0.7,
        y: 5.9,
        w: 2.6,
        align: "center",
        fontSize: 14,
        color: onAccent,
      });

      const split = pptx.addSlide();
      split.background = { color: surface };
      split.addShape(pptx.ShapeType.rect, {
        x: W / 2,
        y: 0,
        w: W / 2,
        h: 7.5,
        fill: { color: surfaceAlt },
      });
      split.addText("Opportunity", { x: 0.6, y: 1.8, w: W / 2 - 1, fontSize: 12, color: accent });
      split.addText("Where color helps", { x: 0.6, y: 2.2, w: W / 2 - 1, fontSize: 24, bold: true, color: ink });
      split.addText("Hierarchy · Status · CVD-safe charts", {
        x: 0.6,
        y: 3.0,
        w: W / 2 - 1,
        fontSize: 14,
        color: muted,
      });
      split.addText("Risk", { x: W / 2 + 0.6, y: 1.8, w: W / 2 - 1, fontSize: 12, color: support });
      split.addText("Where it fails", { x: W / 2 + 0.6, y: 2.2, w: W / 2 - 1, fontSize: 24, bold: true, color: ink });
      split.addText("Logo as body · Low muted · Too many series", {
        x: W / 2 + 0.6,
        y: 3.0,
        w: W / 2 - 1,
        fontSize: 14,
        color: muted,
      });

      const metrics = pptx.addSlide();
      metrics.background = { color: surface };
      metrics.addText("Quarterly pulse", { x: 0.7, y: 0.45, w: 10, fontSize: 28, bold: true, color: ink });
      const bars = [0.55, 0.82, 0.42, 0.7, 0.58];
      bars.forEach((h, i) => {
        metrics.addShape(pptx.ShapeType.rect, {
          x: 1.1 + i * ((W - 2.2) / 5),
          y: 5.2 - h * 3.2,
          w: (W - 2.8) / 5,
          h: h * 3.2,
          fill: { color: stripHash(roles.charts[i % roles.charts.length]) },
        });
      });

      const quote = pptx.addSlide();
      quote.background = { color: surfaceAlt };
      quote.addShape(pptx.ShapeType.rect, {
        x: 0.7,
        y: 2.1,
        w: 0.9,
        h: 0.08,
        fill: { color: accent },
      });
      quote.addText(
        "A deck theme is a contract: titles stay ink, accents stay scarce, charts stay separable.",
        { x: 0.7, y: 2.5, w: W - 1.4, fontSize: 24, bold: true, color: ink }
      );

      const closing = pptx.addSlide();
      closing.background = { color: surface };
      closing.addText("Ship the theme", { x: 0.7, y: 2.4, w: W - 1.4, fontSize: 34, bold: true, color: ink });
      closing.addText("PPTX for stakeholders · CSS/JSON for engineering", {
        x: 0.7,
        y: 3.3,
        w: W - 1.4,
        fontSize: 16,
        color: muted,
      });
      closing.addShape(pptx.ShapeType.roundRect, {
        x: 0.7,
        y: 4.3,
        w: 2.5,
        h: 0.55,
        fill: { color: accent },
      });
      closing.addText("Download PPTX", {
        x: 0.7,
        y: 4.4,
        w: 2.5,
        align: "center",
        fontSize: 13,
        color: onAccent,
      });

      const legend = pptx.addSlide();
      legend.background = { color: surface };
      legend.addText("Theme roles", { x: 0.7, y: 0.45, w: 10, fontSize: 28, bold: true, color: ink });
      const roleEntries = Object.entries(ROLE_LABELS) as Array<[keyof typeof ROLE_LABELS, string]>;
      roleEntries.forEach(([key, label], i) => {
        const col = i < 6 ? 0 : 1;
        const row = i % 6;
        const x = 0.7 + col * 5.5;
        const y = 1.2 + row * 0.85;
        legend.addShape(pptx.ShapeType.roundRect, {
          x,
          y,
          w: 0.55,
          h: 0.55,
          fill: { color: stripHash(roles[key]) },
          line: { color: border, width: 1 },
        });
        legend.addText(`${label}  ${roles[key]}`, {
          x: x + 0.75,
          y: y + 0.08,
          w: 4.2,
          fontSize: 14,
          color: muted,
        });
      });

      const safeName = (title || "colorbase-presentation-theme")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 48);
      await pptx.writeFile({ fileName: `${safeName || "colorbase-presentation-theme"}.pptx` });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flagship-tool presentation-studio">
      <div className="flagship-panel space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Presentation theme studio</h2>
            <p className="flagship-muted mt-1 max-w-3xl">
              Build a full slide system — roles, contrast audit, CVD preview, and a multi-slide PPTX that
              mirrors the stage. Tokens export for engineering handoff.
            </p>
          </div>
          <div className="flagship-actions">
            <Button variant="outline" onClick={suggestFromPrimary}>
              Random accent
            </Button>
            <Button onClick={exportPptx} disabled={busy}>
              {busy ? "Building PPTX…" : "Download PPTX"}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESENTATION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="rounded-full border px-3 py-1.5 text-left text-xs transition hover:bg-muted"
              onClick={() => applyPreset(preset.id)}
              title={preset.blurb}
            >
              <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: preset.primary }} />
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flagship-split">
        <div className="space-y-3">
          <div className="flagship-panel space-y-4">
            <h3 className="font-semibold">Deck controls</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                Title
                <input className="flagship-input" value={title} onChange={(e) => setTitle(e.target.value)} />
              </label>
              <label className="grid gap-1 text-sm">
                Presenter / team
                <input className="flagship-input" value={presenter} onChange={(e) => setPresenter(e.target.value)} />
              </label>
              <label className="grid gap-1 text-sm sm:col-span-2">
                Subtitle
                <input className="flagship-input" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
              </label>
            </div>

            <div className="flagship-row">
              <HexField label="Primary accent" value={primary} onChange={setPrimary} />
              <HexField label="Secondary / ink" value={secondary} onChange={setSecondary} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                Harmony
                <select
                  className="flagship-select"
                  value={harmony}
                  onChange={(e) => setHarmony(e.target.value as HarmonyKind)}
                >
                  {HARMONIES.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                Aspect
                <select
                  className="flagship-select"
                  value={aspect}
                  onChange={(e) => setAspect(e.target.value as AspectRatio)}
                >
                  <option value="widescreen">16:9 widescreen</option>
                  <option value="standard">4:3 standard</option>
                </select>
              </label>
            </div>

            <div className="flagship-row">
              <Button variant={mode === "light" ? "default" : "outline"} onClick={() => setMode("light")}>
                Light slides
              </Button>
              <Button variant={mode === "dark" ? "default" : "outline"} onClick={() => setMode("dark")}>
                Dark slides
              </Button>
            </div>

            <label className="grid gap-1 text-sm">
              Color vision simulation (preview only)
              <select className="flagship-select" value={cvd} onChange={(e) => setCvd(e.target.value as CvdMode)}>
                <option value="none">None</option>
                <option value="protanopia">Protanopia</option>
                <option value="deuteranopia">Deuteranopia</option>
                <option value="tritanopia">Tritanopia</option>
              </select>
            </label>
          </div>

          <div className="flagship-panel space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold">Contrast audit</h3>
              <span className="text-xs text-muted-foreground">
                {failing.length === 0 ? "All key pairs clear thresholds" : `${failing.length} need attention`}
              </span>
            </div>
            <div className="space-y-2">
              {audit.map((row) => {
                const ok = row.id === "accent-surface" || row.id === "support-surface" ? row.aaLarge : row.aa;
                return (
                  <div
                    key={row.id}
                    className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="inline-flex overflow-hidden rounded border" style={{ borderColor: "var(--border)" }}>
                        <i className="block h-5 w-5" style={{ background: row.fg }} />
                        <i className="block h-5 w-5" style={{ background: row.bg }} />
                      </span>
                      {row.label}
                    </span>
                    <span className={ok ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}>
                      {row.ratio.toFixed(2)}:1 · {row.aaa ? "AAA" : ok ? "AA" : "Fail"}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="flagship-muted text-xs">
              Accent-on-surface uses the 3:1 UI threshold. Body text still needs 4.5:1. CVD simulation does not
              change exported files.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flagship-panel space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {SLIDES.map((s) => (
                <Button
                  key={s.id}
                  size="sm"
                  variant={slide === s.id ? "default" : "outline"}
                  onClick={() => setSlide(s.id)}
                >
                  {s.label}
                </Button>
              ))}
            </div>
            <div
              className={`presentation-stage ${aspect === "standard" ? "is-standard" : "is-wide"}`}
              data-cvd={cvd !== "none" ? cvd : undefined}
            >
              <SlideStage
                slide={slide}
                roles={previewRoles}
                title={title}
                subtitle={subtitle}
                presenter={presenter}
              />
            </div>
            {cvd !== "none" && (
              <p className="flagship-muted text-xs">Previewing {cvd} — exports keep the measured theme colors.</p>
            )}
          </div>

          <div className="flagship-panel space-y-3">
            <h3 className="font-semibold">Theme roles</h3>
            <div className="flagship-swatches">
              {(Object.keys(ROLE_LABELS) as Array<keyof typeof ROLE_LABELS>).map((key) => (
                <div key={key} className="flagship-swatch">
                  <button
                    type="button"
                    className="chip"
                    style={{ background: roles[key] }}
                    onClick={() => {
                      if (key === "accent") setPrimary(roles[key]);
                      if (key === "ink") setSecondary(roles[key]);
                    }}
                    aria-label={`${ROLE_LABELS[key]} ${roles[key]}`}
                  />
                  <div className="meta">
                    <div className="font-medium">{ROLE_LABELS[key]}</div>
                    <div className="flex items-center justify-between gap-2 font-mono uppercase text-muted-foreground">
                      <span>{roles[key]}</span>
                      <CopyButton value={roles[key]} label="Copy" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Chart series</p>
              <div className="flex flex-wrap gap-2">
                {roles.charts.map((c, i) => (
                  <div key={`${c}-${i}`} className="flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs" style={{ borderColor: "var(--border)" }}>
                    <span className="h-5 w-5 rounded" style={{ background: c }} />
                    <span className="font-mono uppercase">{c}</span>
                    <CopyButton value={c} label="Copy" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flagship-panel space-y-3">
        <h3 className="font-semibold">Export</h3>
        <div className="grid gap-3 lg:grid-cols-2">
          <pre className="max-h-56 overflow-auto rounded-lg bg-muted p-3 text-xs">{JSON.stringify(tokenJson, null, 2)}</pre>
          <pre className="max-h-56 overflow-auto rounded-lg bg-muted p-3 text-xs">{cssVars}</pre>
        </div>
        <div className="flagship-actions">
          <Button onClick={exportPptx} disabled={busy}>
            {busy ? "Building PPTX…" : "Download PPTX"}
          </Button>
          <CopyButton value={JSON.stringify(tokenJson, null, 2)} label="Copy JSON" />
          <Button
            variant="outline"
            onClick={() =>
              downloadText(JSON.stringify(tokenJson, null, 2), "presentation-theme.json", "application/json")
            }
          >
            JSON file
          </Button>
          <CopyButton value={cssVars} label="Copy CSS vars" />
          <Button variant="outline" onClick={() => downloadText(cssVars, "presentation-theme.css", "text/css")}>
            CSS file
          </Button>
          <Button variant="outline" onClick={() => downloadText(csv, "presentation-theme.csv", "text/csv")}>
            CSV roles
          </Button>
          <Button asChild variant="outline">
            <Link href="/theme-builder">UI theme builder</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/chart-palette-generator">Chart palette</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contrast-checker">Contrast checker</Link>
          </Button>
        </div>
        <p className="flagship-muted text-xs">
          PPTX uses PptxGenJS shapes and text — not a native PowerPoint .thmx package. Fonts fall back to the
          host app defaults. Process colors locally in the browser.
        </p>
      </div>
    </div>
  );
}
