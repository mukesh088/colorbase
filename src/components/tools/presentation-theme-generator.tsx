"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import { generateHarmony, getContrastRatio, normalizeHex } from "@/lib/colors/convert";
import { downloadText } from "@/lib/utils";
import "./flagship-tools.css";

export function PresentationThemeGenerator() {
  const [primary, setPrimary] = useState("#e11d48");
  const [secondary, setSecondary] = useState("#0f172a");
  const [dark, setDark] = useState(false);

  const theme = useMemo(() => {
    const surface = dark ? "#0b1020" : "#ffffff";
    const muted = dark ? "#94a3b8" : "#64748b";
    const text = dark ? "#f8fafc" : normalizeHex(secondary);
    const accent = normalizeHex(primary);
    const onAccent = getContrastRatio("#ffffff", accent) >= 4.5 ? "#ffffff" : "#0f172a";
    const support = generateHarmony(accent, "analogous")[2] ?? accent;
    return { surface, muted, text, accent, onAccent, support };
  }, [primary, secondary, dark]);

  async function exportPptx() {
    const PptxGenJS = (await import("pptxgenjs")).default;
    const pptx = new PptxGenJS();
    pptx.author = "ColorBase";
    pptx.title = "ColorBase Presentation Theme";

    const title = pptx.addSlide();
    title.background = { color: theme.surface.replace("#", "") };
    title.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10,
      h: 0.35,
      fill: { color: theme.accent.replace("#", "") },
    });
    title.addText("ColorBase deck", {
      x: 0.6,
      y: 2.2,
      w: 8.5,
      fontSize: 36,
      bold: true,
      color: theme.text.replace("#", ""),
    });
    title.addText("Accessible presentation theme preview", {
      x: 0.6,
      y: 3.1,
      w: 8.5,
      fontSize: 16,
      color: theme.muted.replace("#", ""),
    });

    const content = pptx.addSlide();
    content.background = { color: theme.surface.replace("#", "") };
    content.addText("Agenda", {
      x: 0.6,
      y: 0.5,
      w: 8,
      fontSize: 28,
      bold: true,
      color: theme.text.replace("#", ""),
    });
    content.addText(
      [
        { text: "Brand primary & secondary roles", options: { breakLine: true } },
        { text: "Readable body copy on slides", options: { breakLine: true } },
        { text: "Chart accents that stay distinct", options: { breakLine: true } },
      ],
      { x: 0.6, y: 1.3, w: 8, fontSize: 16, color: theme.muted.replace("#", "") }
    );
    content.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 3.6,
      w: 2.4,
      h: 0.55,
      fill: { color: theme.accent.replace("#", "") },
    });
    content.addText("Primary CTA", {
      x: 0.6,
      y: 3.7,
      w: 2.4,
      align: "center",
      fontSize: 14,
      color: theme.onAccent.replace("#", ""),
    });

    const chart = pptx.addSlide();
    chart.background = { color: theme.surface.replace("#", "") };
    chart.addText("Metrics", {
      x: 0.6,
      y: 0.4,
      w: 8,
      fontSize: 26,
      bold: true,
      color: theme.text.replace("#", ""),
    });
    const bars = [0.55, 0.8, 0.4, 0.7];
    bars.forEach((h, i) => {
      chart.addShape(pptx.ShapeType.rect, {
        x: 1 + i * 1.8,
        y: 4.2 - h * 2.5,
        w: 1.1,
        h: h * 2.5,
        fill: { color: (i % 2 === 0 ? theme.accent : theme.support).replace("#", "") },
      });
    });

    await pptx.writeFile({ fileName: "colorbase-presentation-theme.pptx" });
  }

  const json = {
    name: "ColorBase Presentation Theme",
    mode: dark ? "dark" : "light",
    colors: theme,
  };

  return (
    <div className="flagship-tool">
      <div className="flagship-panel space-y-3">
        <h2 className="text-lg font-semibold">Presentation theme generator</h2>
        <p className="flagship-muted">
          Builds coordinated slide roles and downloads a real PPTX via PptxGenJS. Preview mirrors the
          exported color roles closely.
        </p>
        <div className="flagship-row">
          <label className="text-sm">
            Primary
            <input type="color" className="ml-2" value={primary} onChange={(e) => setPrimary(e.target.value)} />
          </label>
          <label className="text-sm">
            Secondary / ink
            <input
              type="color"
              className="ml-2"
              value={secondary}
              onChange={(e) => setSecondary(e.target.value)}
            />
          </label>
          <Button variant="outline" onClick={() => setDark((d) => !d)}>
            {dark ? "Light slides" : "Dark slides"}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {[
          {
            title: "Title slide",
            body: (
              <>
                <div className="mb-4 h-1.5 w-full rounded" style={{ background: theme.accent }} />
                <p className="text-2xl font-semibold" style={{ color: theme.text }}>
                  ColorBase deck
                </p>
                <p className="mt-2 text-sm" style={{ color: theme.muted }}>
                  Accessible presentation theme preview
                </p>
              </>
            ),
          },
          {
            title: "Content slide",
            body: (
              <>
                <p className="text-xl font-semibold" style={{ color: theme.text }}>
                  Agenda
                </p>
                <ul className="mt-3 space-y-1 text-sm" style={{ color: theme.muted }}>
                  <li>Brand roles</li>
                  <li>Readable body</li>
                  <li>Chart accents</li>
                </ul>
                <div
                  className="mt-4 inline-block rounded-md px-3 py-2 text-sm"
                  style={{ background: theme.accent, color: theme.onAccent }}
                >
                  Primary CTA
                </div>
              </>
            ),
          },
          {
            title: "Chart / table",
            body: (
              <>
                <p className="text-xl font-semibold" style={{ color: theme.text }}>
                  Metrics
                </p>
                <div className="mt-6 flex items-end gap-3">
                  {[55, 80, 40, 70].map((h, i) => (
                    <div
                      key={h}
                      className="w-8 rounded-t"
                      style={{
                        height: `${h}px`,
                        background: i % 2 ? theme.support : theme.accent,
                      }}
                    />
                  ))}
                </div>
                <table className="mt-4 w-full text-left text-xs" style={{ color: theme.muted }}>
                  <tbody>
                    <tr>
                      <td>North</td>
                      <td>42</td>
                    </tr>
                    <tr>
                      <td>South</td>
                      <td>61</td>
                    </tr>
                  </tbody>
                </table>
              </>
            ),
          },
        ].map((slide) => (
          <div key={slide.title} className="flagship-panel" style={{ background: theme.surface }}>
            <p className="mb-3 text-[11px] uppercase tracking-wide text-muted-foreground">{slide.title}</p>
            {slide.body}
          </div>
        ))}
      </div>

      <div className="flagship-panel space-y-3">
        <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">{JSON.stringify(json, null, 2)}</pre>
        <div className="flagship-actions">
          <Button onClick={exportPptx}>Download PPTX</Button>
          <CopyButton value={JSON.stringify(json, null, 2)} label="Copy JSON" />
          <Button
            variant="outline"
            onClick={() => downloadText(JSON.stringify(json, null, 2), "presentation-theme.json", "application/json")}
          >
            JSON file
          </Button>
          <Button asChild variant="outline">
            <Link href="/theme-builder">UI theme builder</Link>
          </Button>
        </div>
        <p className="flagship-muted text-xs">
          Body contrast on surface: {getContrastRatio(theme.text, theme.surface).toFixed(2)}:1 · Button
          label: {getContrastRatio(theme.onAccent, theme.accent).toFixed(2)}:1
        </p>
      </div>
    </div>
  );
}
