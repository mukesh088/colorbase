"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import { getContrastRatio, normalizeHex } from "@/lib/colors/convert";
import { parseFlexibleColor } from "@/lib/colors/parse";
import "./flagship-tools.css";

const SAMPLE = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;font-family:Arial,sans-serif">
  <tr><td align="center" style="padding:24px">
    <table width="560" style="background:#ffffff;border-radius:12px;padding:24px">
      <tr><td style="color:#0f172a;font-size:22px;font-weight:700">ColorBase launch</td></tr>
      <tr><td style="color:#64748b;font-size:14px;padding-top:12px;line-height:1.5">Ship accessible palettes with contrast checks built in.</td></tr>
      <tr><td style="padding-top:20px">
        <a href="https://colorbase.in" style="background:#e11d48;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block">Open studio</a>
      </td></tr>
    </table>
  </td></tr>
</table>`;

function invertForDark(hex: string) {
  // Crude email-client-ish inversion for light surfaces
  const n = normalizeHex(hex).slice(1);
  const r = 255 - parseInt(n.slice(0, 2), 16);
  const g = 255 - parseInt(n.slice(2, 4), 16);
  const b = 255 - parseInt(n.slice(4, 6), 16);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function EmailDarkModeTester() {
  const [html, setHtml] = useState(SAMPLE);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

  const safe = useMemo(
    () =>
      DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ["script", "iframe", "object", "embed"],
        FORBID_ATTR: ["onerror", "onload"],
      }),
    [html]
  );

  const colors = useMemo(() => {
    const found = new Set<string>();
    for (const m of html.matchAll(/#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b|rgba?\([^)]+\)/g)) {
      const hex = parseFlexibleColor(m[0]);
      if (hex) found.add(normalizeHex(hex));
    }
    return [...found];
  }, [html]);

  const pairs = useMemo(() => {
    const lightBg = colors.find((c) => c === "#ffffff" || c === "#f8fafc") ?? "#ffffff";
    const darkText = colors.find((c) => c === "#0f172a" || c === "#111827") ?? "#0f172a";
    const btn = colors.find((c) => c === "#e11d48" || c === "#1d4ed8") ?? colors[0] ?? "#e11d48";
    return [
      { label: "Body on light", fg: darkText, bg: lightBg },
      { label: "Button label", fg: "#ffffff", bg: btn },
      {
        label: "Simulated dark body",
        fg: invertForDark(darkText),
        bg: invertForDark(lightBg),
      },
    ].map((p) => ({ ...p, ratio: getContrastRatio(p.fg, p.bg) }));
  }, [colors]);

  const suggestions = pairs
    .filter((p) => p.ratio < 4.5)
    .map(
      (p) =>
        `/* ${p.label} is ${p.ratio.toFixed(2)}:1 — try darker text or lighter surface */\n[data-ogsc] .text { color: #f8fafc !important; }\n[data-ogsb] .surface { background: #0f172a !important; }`
    );

  return (
    <div className="flagship-tool">
      <div className="flagship-panel space-y-3">
        <h2 className="text-lg font-semibold">Safe HTML email preview</h2>
        <p className="flagship-muted">
          Markup is sanitized. Dark mode is a <strong>simulation</strong> — Gmail, Outlook, and Apple
          Mail each invert or rewrite styles differently.
        </p>
        <textarea
          className="flagship-textarea min-h-[180px]"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          aria-label="Email HTML"
        />
        <div className="flagship-row">
          <Button variant={viewport === "desktop" ? "default" : "outline"} onClick={() => setViewport("desktop")}>
            Desktop width
          </Button>
          <Button variant={viewport === "mobile" ? "default" : "outline"} onClick={() => setViewport("mobile")}>
            Mobile width
          </Button>
        </div>
      </div>

      <div className="flagship-split">
        <div className="flagship-panel space-y-2">
          <h3 className="font-semibold">Light preview</h3>
          <div
            className="overflow-auto rounded-xl border bg-zinc-100 p-3"
            style={{ maxWidth: viewport === "mobile" ? 390 : "100%" }}
            dangerouslySetInnerHTML={{ __html: safe }}
          />
        </div>
        <div className="flagship-panel space-y-2">
          <h3 className="font-semibold">Simulated dark</h3>
          <div
            className="overflow-auto rounded-xl border p-3"
            style={{
              maxWidth: viewport === "mobile" ? 390 : "100%",
              background: "#0b1020",
              filter: "invert(1) hue-rotate(180deg)",
            }}
            dangerouslySetInnerHTML={{ __html: safe }}
          />
          <p className="flagship-muted text-xs">
            CSS filter simulation approximates client inversion — not a pixel-perfect Outlook render.
          </p>
        </div>
      </div>

      <div className="flagship-panel space-y-3">
        <h3 className="font-semibold">Contrast highlights</h3>
        <ul className="space-y-2 text-sm">
          {pairs.map((p) => (
            <li key={p.label} className="flex flex-wrap items-center gap-2">
              <span className="inline-block h-4 w-4 rounded border" style={{ background: p.fg }} />
              <span className="inline-block h-4 w-4 rounded border" style={{ background: p.bg }} />
              <span>{p.label}</span>
              <strong className={p.ratio < 4.5 ? "text-amber-700 dark:text-amber-300" : ""}>
                {p.ratio.toFixed(2)}:1
              </strong>
              <Link
                className="text-primary text-xs underline"
                href={`/contrast-checker?fg=${p.fg.slice(1)}&bg=${p.bg.slice(1)}`}
              >
                Open checker
              </Link>
            </li>
          ))}
        </ul>
        {suggestions.length ? (
          <>
            <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">{suggestions.join("\n\n")}</pre>
            <CopyButton value={suggestions.join("\n\n")} label="Copy suggested CSS" />
          </>
        ) : (
          <p className="flagship-muted">No sub-4.5:1 pairs in the heuristic sample.</p>
        )}
      </div>
    </div>
  );
}
