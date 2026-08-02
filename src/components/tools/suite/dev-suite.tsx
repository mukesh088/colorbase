"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToolWorkbench, OutputBox } from "./workbench";
import { simpleBeautify } from "./helpers";
import type { DevSuiteMode } from "@/lib/suite-modes";

export type { DevSuiteMode };
export { isDevSuite } from "@/lib/suite-modes";

export function DevSuiteTool({ mode }: { mode: DevSuiteMode }) {
  const [input, setInput] = useState('{\n  "name": "colorBase",\n  "colors": ["#e11d48", "#db2777"]\n}');
  const [inputB, setInputB] = useState('{\n  "name": "colorBase",\n  "colors": ["#e11d48"]\n}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    try {
      switch (mode) {
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
        case "html-formatter":
          setOutput(simpleBeautify(input.replace(/>\s*</g, ">\n<"), "<", ">").replace(/\n>/g, ">"));
          break;
        case "css-formatter":
          setOutput(simpleBeautify(input));
          break;
        case "js-formatter":
          setOutput(simpleBeautify(input));
          break;
        default:
          setOutput(input);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid input");
      setOutput("");
    }
  }, [mode, input, inputB]);

  return (
    <ToolWorkbench
      controls={
        <div className="space-y-4">
          {mode === "json-compare" ? (
            <>
              <div className="space-y-1.5"><Label>JSON A</Label><Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={8} className="font-mono text-xs" /></div>
              <div className="space-y-1.5"><Label>JSON B</Label><Textarea value={inputB} onChange={(e) => setInputB(e.target.value)} rows={8} className="font-mono text-xs" /></div>
            </>
          ) : (
            <div className="space-y-1.5">
              <Label>Input</Label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={12}
                className="font-mono text-xs"
              />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      }
      output={
        <OutputBox
          value={output}
          rows={14}
          language={devOutputLanguage(mode)}
          filename={devOutputFilename(mode)}
        />
      }
    />
  );
}

function devOutputLanguage(mode: DevSuiteMode) {
  if (mode.includes("json")) return "json" as const;
  if (mode.includes("css")) return "css" as const;
  if (mode.includes("js")) return "js" as const;
  if (mode.includes("html") || mode.includes("xml")) return "html" as const;
  if (mode.includes("sql")) return "sql" as const;
  if (mode.includes("yaml")) return "yaml" as const;
  return "plain" as const;
}

function devOutputFilename(mode: DevSuiteMode) {
  if (mode.includes("json")) return "output.json";
  if (mode.includes("css")) return "output.css";
  if (mode.includes("js")) return "output.js";
  if (mode.includes("html")) return "output.html";
  if (mode.includes("xml")) return "output.xml";
  if (mode.includes("sql")) return "output.sql";
  if (mode.includes("yaml")) return "output.yaml";
  return "output.txt";
}
