"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import { exportPalette } from "@/lib/colors/export";
import type { WebsiteColorAnalysis, WebsiteColorRole } from "@/lib/website/extract-colors";
import { formatWebsiteColorStats } from "@/lib/website/extract-colors";
import "./flagship-tools.css";

const ROLES: WebsiteColorRole[] = ["background", "typography", "accent", "border", "button", "other"];

export function WebsiteColorExtractor() {
  const [url, setUrl] = useState("https://example.com");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<WebsiteColorAnalysis | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<WebsiteColorRole | "all">("all");

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/website-colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setAnalysis(data);
      setSelected(data.colors.slice(0, 6).map((c: { hex: string }) => c.hex));
    } catch (e) {
      setAnalysis(null);
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  const visible = useMemo(() => {
    if (!analysis) return [];
    return analysis.colors.filter((c) => roleFilter === "all" || c.role === roleFilter);
  }, [analysis, roleFilter]);

  function toggle(hex: string) {
    setSelected((prev) => (prev.includes(hex) ? prev.filter((h) => h !== hex) : [...prev, hex]));
  }

  return (
    <div className="flagship-tool">
      <div className="flagship-panel space-y-3">
        <h2 className="text-lg font-semibold">Analyze a public website</h2>
        <p className="flagship-muted">
          Fetches public HTML and linked CSS with SSRF protections. Dynamic SPA-only colors and
          screenshots are not guaranteed.
        </p>
        <div className="flagship-row">
          <input
            className="flagship-input max-w-xl flex-1"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            aria-label="Website URL"
          />
          <Button onClick={analyze} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Extract colors
          </Button>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      {analysis ? (
        <div className="flagship-split">
          <div className="flagship-panel space-y-3">
            <div className="flagship-row justify-between">
              <h3 className="font-semibold">Palette ({visible.length})</h3>
              <select
                className="flagship-select w-auto"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as WebsiteColorRole | "all")}
                aria-label="Filter by role"
              >
                <option value="all">All roles</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div className="flagship-swatches">
              {visible.map((color) => {
                const stats = formatWebsiteColorStats(color);
                const active = selected.includes(color.hex);
                return (
                  <div key={color.hex} className="flagship-swatch">
                    <button
                      type="button"
                      className="chip"
                      style={{ background: color.hex }}
                      aria-pressed={active}
                      aria-label={`Select ${color.hex}`}
                      onClick={() => toggle(color.hex)}
                    />
                    <div className="meta">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="font-mono text-[12px]">{color.hex}</strong>
                        <CopyButton value={color.hex} />
                      </div>
                      <p className="text-muted-foreground mt-1 text-[11px]">
                        {color.role} · {color.count}× · {stats.hsl}
                      </p>
                      <input
                        type="color"
                        className="mt-2 h-8 w-full cursor-pointer"
                        value={color.hex}
                        aria-label={`Edit ${color.hex}`}
                        onChange={(e) => {
                          const next = e.target.value;
                          setSelected((prev) => prev.map((h) => (h === color.hex ? next : h)));
                          setAnalysis((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  colors: prev.colors.map((c) =>
                                    c.hex === color.hex ? { ...c, hex: next } : c
                                  ),
                                }
                              : prev
                          );
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flagship-actions">
              <Button
                variant="outline"
                onClick={() =>
                  exportPalette(
                    selected.map((hex, i) => ({ hex, name: `web-${i + 1}` })),
                    "css",
                    "website-palette"
                  )
                }
                disabled={!selected.length}
              >
                Export CSS
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  exportPalette(
                    selected.map((hex, i) => ({ hex, name: `web-${i + 1}` })),
                    "json",
                    "website-palette"
                  )
                }
                disabled={!selected.length}
              >
                Export JSON
              </Button>
              <Button asChild variant="outline">
                <Link href={`/theme-builder?colors=${selected.map((h) => h.slice(1)).join("-")}`}>
                  Open theme builder
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/palette-generator">Palette generator</Link>
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flagship-panel space-y-2">
              <h3 className="font-semibold">Contrast pairs</h3>
              <p className="flagship-muted">Estimated from role heuristics — verify in the contrast checker.</p>
              <ul className="space-y-2 text-sm">
                {analysis.pairs.map((pair) => (
                  <li key={`${pair.fg}-${pair.bg}`} className="flex items-center gap-2">
                    <span className="inline-block h-5 w-5 rounded border" style={{ background: pair.fg }} />
                    <span className="inline-block h-5 w-5 rounded border" style={{ background: pair.bg }} />
                    <span className="font-mono text-xs">
                      {pair.fg} on {pair.bg}
                    </span>
                    <strong>{pair.ratio}:1</strong>
                    <Link
                      className="text-primary text-xs underline"
                      href={`/contrast-checker?fg=${pair.fg.slice(1)}&bg=${pair.bg.slice(1)}`}
                    >
                      Check
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flagship-panel space-y-2">
              <h3 className="font-semibold">Notes</h3>
              <p className="flagship-muted">Analyzed {analysis.analyzedUrl}</p>
              <p className="flagship-muted">Stylesheets fetched: {analysis.stylesheetCount}</p>
              <ul className="flagship-muted list-disc space-y-1 pl-5">
                {analysis.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
              <p className="flagship-muted">
                Screenshot preview is not available from this fetch endpoint. Paste extracted colors into{" "}
                <Link className="text-primary underline" href="/theme-builder">
                  Theme Builder
                </Link>{" "}
                for UI previews.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
