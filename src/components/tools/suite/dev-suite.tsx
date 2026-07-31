"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ToolWorkbench, OutputBox, ActionRow, PrimaryButton } from "./workbench";
import { md5, sha256, simpleBeautify, uuidv4 } from "./helpers";
import { CopyButton } from "@/components/color/copy-button";
import type { DevSuiteMode } from "@/lib/suite-modes";

export type { DevSuiteMode };
export { isDevSuite } from "@/lib/suite-modes";

function formatSql(sql: string) {
  return sql
    .replace(/\s+/g, " ")
    .replace(/\b(select|from|where|and|or|join|left|right|inner|outer|on|group by|order by|limit|insert|into|values|update|set|delete)\b/gi, (m) => `\n${m.toUpperCase()}`)
    .trim();
}

function code128Bars(text: string) {
  // Simplified visual barcode pattern (not scanner-accurate Code128)
  const bits: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    for (let b = 0; b < 8; b++) bits.push((c >> b) & 1);
  }
  return bits;
}

export function DevSuiteTool({ mode }: { mode: DevSuiteMode }) {
  const [input, setInput] = useState('{\n  "name": "colorBase",\n  "colors": ["#e11d48", "#db2777"]\n}');
  const [inputB, setInputB] = useState('{\n  "name": "colorBase",\n  "colors": ["#e11d48"]\n}');
  const [output, setOutput] = useState("");
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    const run = async () => {
      try {
        switch (mode) {
          case "json-formatter":
          case "json-viewer": {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, 2));
            break;
          }
          case "json-validator": {
            JSON.parse(input);
            setOutput("Valid JSON ✓");
            break;
          }
          case "json-compare": {
            const a = JSON.stringify(JSON.parse(input), null, 2).split("\n");
            const b = JSON.stringify(JSON.parse(inputB), null, 2).split("\n");
            const max = Math.max(a.length, b.length);
            const diff: string[] = [];
            for (let i = 0; i < max; i++) {
              if (a[i] !== b[i]) diff.push(`L${i + 1}:\n- ${a[i] ?? ""}\n+ ${b[i] ?? ""}`);
            }
            setOutput(diff.length ? diff.join("\n\n") : "No differences");
            break;
          }
          case "xml-formatter":
          case "html-formatter":
            setOutput(simpleBeautify(input.replace(/>\s*</g, ">\n<"), "<", ">").replace(/\n>/g, ">"));
            break;
          case "css-formatter":
            setOutput(simpleBeautify(input));
            break;
          case "js-formatter":
            setOutput(simpleBeautify(input));
            break;
          case "sql-formatter":
            setOutput(formatSql(input));
            break;
          case "yaml-formatter":
            setOutput(input.replace(/\t/g, "  ").replace(/ +\n/g, "\n").trim());
            break;
          case "base64-encode":
            setOutput(btoa(unescape(encodeURIComponent(input))));
            break;
          case "base64-decode":
            setOutput(decodeURIComponent(escape(atob(input.trim()))));
            break;
          case "url-encoder":
            setOutput(encodeURIComponent(input));
            break;
          case "url-decoder":
            setOutput(decodeURIComponent(input));
            break;
          case "jwt-decoder": {
            const parts = input.trim().split(".");
            if (parts.length < 2) throw new Error("Invalid JWT");
            const decode = (p: string) => JSON.stringify(JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/"))), null, 2);
            setOutput(`Header:\n${decode(parts[0])}\n\nPayload:\n${decode(parts[1])}`);
            break;
          }
          case "uuid-generator":
          case "guid-generator":
            setOutput(Array.from({ length: 5 }, () => (mode === "guid-generator" ? `{${uuidv4().toUpperCase()}}` : uuidv4())).join("\n"));
            break;
          case "hash-generator": {
            const s = await sha256(input);
            setOutput(`SHA-256:\n${s}\n\nMD5:\n${md5(input)}`);
            break;
          }
          case "sha256-generator":
            setOutput(await sha256(input));
            break;
          case "md5-generator":
            setOutput(md5(input));
            break;
          case "qr-code-generator": {
            const dataUrl = await QRCode.toDataURL(input || "https://example.com", { margin: 1, width: 280 });
            setQr(dataUrl);
            setOutput(input);
            break;
          }
          case "barcode-generator":
            setOutput(input.trim() || "123456789012");
            break;
          default:
            setOutput(input);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Invalid input");
        setOutput("");
      }
    };
    void run();
  }, [mode, input, inputB]);

  const bars = useMemo(() => code128Bars(output || "0"), [output]);

  return (
    <ToolWorkbench
      controls={
        <div className="space-y-4">
          {mode === "json-compare" ? (
            <>
              <div className="space-y-1.5"><Label>JSON A</Label><Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={8} className="font-mono text-xs" /></div>
              <div className="space-y-1.5"><Label>JSON B</Label><Textarea value={inputB} onChange={(e) => setInputB(e.target.value)} rows={8} className="font-mono text-xs" /></div>
            </>
          ) : ["uuid-generator", "guid-generator"].includes(mode) ? (
            <ActionRow>
              <PrimaryButton onClick={() => setInput(String(Date.now()))}>Generate new</PrimaryButton>
            </ActionRow>
          ) : (
            <div className="space-y-1.5">
              <Label>Input</Label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={12}
                className="font-mono text-xs"
                placeholder={mode === "jwt-decoder" ? "Paste JWT…" : undefined}
              />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      }
      preview={
        mode === "qr-code-generator" && qr ? (
          <div className="rounded-3xl border border-border/50 bg-background/70 p-5 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="QR code" className="mx-auto rounded-xl" />
            <div className="mt-3 flex justify-center gap-2">
              <a href={qr} download="qr-code.png" className="text-sm text-rose-600 underline">Download PNG</a>
              <CopyButton value={input} label="Text" />
            </div>
          </div>
        ) : mode === "barcode-generator" ? (
          <div className="rounded-3xl border border-border/50 bg-white p-5 dark:bg-zinc-900">
            <svg viewBox={`0 0 ${bars.length * 2} 60`} className="h-24 w-full">
              {bars.map((bit, i) =>
                bit ? <rect key={i} x={i * 2} y={0} width={2} height={50} fill="currentColor" /> : null
              )}
            </svg>
            <p className="mt-2 text-center font-mono text-sm">{output}</p>
          </div>
        ) : undefined
      }
      output={mode === "qr-code-generator" ? undefined : <OutputBox value={output} rows={14} />}
    />
  );
}
