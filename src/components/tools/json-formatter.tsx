"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeftRight,
  Braces,
  CheckCircle2,
  Eraser,
  Minimize2,
  Sparkles,
  WrapText,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CodeOutput } from "@/components/tools/suite/code-output";
import { PrimaryButton } from "@/components/tools/suite/workbench";
import { cn } from "@/lib/utils";

const SAMPLE_JSON = `{
  "name": "colorBase",
  "version": 1,
  "featured": true,
  "colors": ["#e11d48", "#db2777", "#f43f5e"],
  "tools": {
    "json": "formatter",
    "css": ["backdrop-filter", "box-shadow"]
  },
  "meta": null
}`;

type IndentSize = 2 | 4;

function getErrorPosition(message: string) {
  const m = message.match(/position\s+(\d+)/i);
  return m ? Number(m[1]) : null;
}

function lineColFromPosition(text: string, position: number) {
  const slice = text.slice(0, position);
  const lines = slice.split("\n");
  return { line: lines.length, column: (lines[lines.length - 1]?.length ?? 0) + 1 };
}

export function JsonFormatterTool() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [indent, setIndent] = useState<IndentSize>(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [mode, setMode] = useState<"formatted" | "minified">("formatted");
  const [runId, setRunId] = useState(0);

  const result = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        output: "",
        error: null as string | null,
        meta: null as null | {
          keys: number;
          size: number;
          type: string;
        },
      };
    }
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      const sorted = sortKeys ? sortValue(parsed) : parsed;
      const output =
        mode === "minified" ? JSON.stringify(sorted) : JSON.stringify(sorted, null, indent);
      return {
        output,
        error: null,
        meta: {
          keys: countKeys(sorted),
          size: new Blob([output]).size,
          type: Array.isArray(sorted) ? "array" : sorted === null ? "null" : typeof sorted,
        },
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Invalid JSON";
      const pos = getErrorPosition(message);
      const loc = pos != null ? lineColFromPosition(input, pos) : null;
      return {
        output: "",
        error: loc ? `${message} (line ${loc.line}, col ${loc.column})` : message,
        meta: null,
      };
    }
  }, [input, indent, sortKeys, mode]);

  const formatAction = (nextMode: "formatted" | "minified") => {
    setMode(nextMode);
    setRunId((n) => n + 1);
    if (!input.trim()) {
      toast.error("Paste JSON first");
      return;
    }
    if (result.error) {
      toast.error("Fix JSON errors first");
      return;
    }
    toast.success(nextMode === "minified" ? "Minified" : "Formatted");
  };

  const loadOutputIntoInput = () => {
    if (!result.output) {
      toast.error("No formatted output yet");
      return;
    }
    setInput(result.output);
    setRunId((n) => n + 1);
    toast.success("Moved output to input");
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Toolbar */}
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
        <div className="flex flex-col gap-3 border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                JSON Formatter
              </p>
              <Badge variant="secondary" className="rounded-full">
                <Braces className="mr-1 h-3.5 w-3.5" />
                Local only
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Input on the left, formatted IDE output on the right — like a dual editor.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full"
              onClick={() => {
                setInput(SAMPLE_JSON);
                setMode("formatted");
                setRunId((n) => n + 1);
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Sample
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-full"
              onClick={() => {
                setInput("");
                setRunId((n) => n + 1);
              }}
            >
              <Eraser className="h-3.5 w-3.5" />
              Clear
            </Button>
            <PrimaryButton size="sm" className="h-8" onClick={() => formatAction("formatted")}>
              <WrapText className="h-3.5 w-3.5" />
              Format
            </PrimaryButton>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full"
              onClick={() => formatAction("minified")}
            >
              <Minimize2 className="h-3.5 w-3.5" />
              Minify
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full"
              onClick={loadOutputIntoInput}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Use output
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:px-5">
          {([2, 4] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setIndent(n);
                setMode("formatted");
                setRunId((x) => x + 1);
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                indent === n && mode === "formatted"
                  ? "border-rose-500/50 bg-rose-500 text-white"
                  : "border-border/60 bg-muted/30 hover:bg-muted/60"
              )}
            >
              Indent {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setSortKeys((v) => !v);
              setRunId((x) => x + 1);
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              sortKeys
                ? "border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                : "border-border/60 bg-background hover:bg-muted/50"
            )}
          >
            Sort keys {sortKeys ? "on" : "off"}
          </button>

          <div className="ml-auto min-w-0 flex-1 sm:flex-none">
            <AnimatePresence mode="wait">
              {result.error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs text-destructive"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-2">{result.error}</span>
                </motion.div>
              ) : result.meta ? (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-wrap items-center justify-end gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                    Valid
                  </span>
                  <Badge variant="outline" className="rounded-full font-mono text-[10px]">
                    {result.meta.type}
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-[10px]">
                    {result.meta.keys} keys
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-[10px]">
                    {result.meta.size.toLocaleString()} B
                  </Badge>
                  <Badge variant="secondary" className="rounded-full text-[10px]">
                    {mode === "minified" ? "minified" : `indent ${indent}`}
                  </Badge>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Side-by-side editors */}
      <div className="grid gap-3 lg:grid-cols-2 lg:gap-4 lg:items-stretch">
        <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
          <div className="flex items-center justify-between gap-2 border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-2.5 sm:px-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Input
              </p>
              <p className="text-sm font-semibold">JSON editor</p>
            </div>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {input.length.toLocaleString()} chars
            </span>
          </div>
          <Textarea
            id="json-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder='Paste JSON here… e.g. {"hello":"world"}'
            className="min-h-[28rem] flex-1 resize-none rounded-none border-0 bg-[#0d1117] px-3 py-3 font-mono text-[12px] leading-relaxed text-[#e6edf3] shadow-none focus-visible:ring-0 sm:min-h-[32rem] sm:px-4 sm:text-[13px]"
          />
        </div>

        <div className="min-h-0">
          <CodeOutput
            key={runId}
            value={result.output}
            language="json"
            filename={mode === "minified" ? "output.min.json" : "output.json"}
            title={mode === "minified" ? "Minified JSON" : "Formatted JSON"}
            eyebrow="Output"
            label="JSON"
            rows={22}
            emptyMessage={
              result.error ? "Fix the input to see highlighted output" : "Formatted JSON appears here"
            }
            animate
            fill
          />
        </div>
      </div>
    </div>
  );
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return Object.keys(obj)
      .sort((a, b) => a.localeCompare(b))
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortValue(obj[key]);
        return acc;
      }, {});
  }
  return value;
}

function countKeys(value: unknown): number {
  if (Array.isArray(value)) return value.reduce<number>((n, item) => n + countKeys(item), 0);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return Object.keys(obj).length + Object.values(obj).reduce<number>((n, v) => n + countKeys(v), 0);
  }
  return 0;
}
