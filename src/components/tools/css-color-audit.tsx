"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import { applyTokenMapToCss, auditCssColors } from "@/lib/css/audit-colors";
import { downloadText } from "@/lib/utils";
import "./flagship-tools.css";

const SAMPLE = `:root {
  --unused-example: #111827;
}
.card {
  background: #f8fafc;
  color: #0f172a;
  border: 1px solid #64748b;
}
.button {
  background: #1d4ed8;
  color: #ffffff;
}
.title {
  color: #0f172a;
}
.link {
  color: #1e40af;
}
`;

export function CssColorAuditTool() {
  const [css, setCss] = useState(SAMPLE);

  const { result, error } = useMemo(() => {
    try {
      return { result: auditCssColors(css), error: null as string | null };
    } catch (e) {
      return {
        result: null,
        error: e instanceof Error ? e.message : "Parse failed",
      };
    }
  }, [css]);

  function onUpload(file: File | null) {
    if (!file) return;
    if (file.size > 1_000_000) {
      alert("CSS file must be under 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCss(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  const preview = result ? applyTokenMapToCss(css, result.tokenJson) : "";

  return (
    <div className="flagship-tool">
      <div className="flagship-split">
        <div className="flagship-panel space-y-3">
          <h2 className="text-lg font-semibold">Paste or upload CSS</h2>
          <p className="flagship-muted">
            Parsed with PostCSS. Never executes code. Standalone CSS cannot prove unused variables
            or real rendered contrast.
          </p>
          <div className="flagship-actions">
            <label className="inline-flex cursor-pointer items-center rounded-md border px-3 py-2 text-sm">
              Upload .css
              <input
                type="file"
                accept=".css,text/css"
                className="sr-only"
                onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
              />
            </label>
            <Button variant="outline" onClick={() => setCss(SAMPLE)}>
              Load sample
            </Button>
          </div>
          <textarea
            className="flagship-textarea min-h-[280px]"
            value={css}
            onChange={(e) => setCss(e.target.value)}
            aria-label="CSS source"
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <div className="space-y-3">
          {result ? (
            <>
              <div className="flagship-panel space-y-2">
                <h3 className="font-semibold">Color inventory ({result.colors.length})</h3>
                <div className="flagship-swatches">
                  {result.colors.map((c) => (
                    <div key={c.hex} className="flagship-swatch">
                      <span className="chip block" style={{ background: c.hex, height: 48 }} />
                      <div className="meta">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs">{c.hex}</span>
                          <CopyButton value={c.hex} size="icon" />
                        </div>
                        <p className="text-muted-foreground text-[11px]">{c.count}× · {c.raw}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flagship-panel space-y-2">
                <h3 className="font-semibold">Duplicates & near-duplicates</h3>
                <ul className="space-y-1 text-sm">
                  {result.duplicates.slice(0, 8).map((d) => (
                    <li key={d.hex}>
                      <span className="font-mono">{d.hex}</span> used {d.count}×
                    </li>
                  ))}
                  {result.similar.map((s) => (
                    <li key={`${s.a}-${s.b}`} className="text-muted-foreground">
                      Similar: {s.a} ≈ {s.b} (Δ {s.delta}) — review before merging
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flagship-panel space-y-2">
                <h3 className="font-semibold">Suggested tokens</h3>
                <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">{result.tokenCss}</pre>
                <div className="flagship-actions">
                  <CopyButton value={result.tokenCss} label="Copy tokens CSS" />
                  <Button
                    variant="outline"
                    onClick={() =>
                      downloadText(
                        JSON.stringify(result.tokenJson, null, 2),
                        "color-tokens.json",
                        "application/json"
                      )
                    }
                  >
                    Export JSON
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => downloadText(preview, "tokenized.css", "text/css")}
                  >
                    Export refactored CSS
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/theme-builder">Theme builder</Link>
                  </Button>
                </div>
              </div>

              <div className="flagship-panel space-y-2">
                <h3 className="font-semibold">Replacement preview</h3>
                <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs">{preview}</pre>
                <ul className="flagship-muted list-disc space-y-1 pl-5">
                  {result.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
