"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  Eraser,
  FileCode2,
  Minimize2,
  Sparkles,
  WrapText,
} from "lucide-react";
import { dump, load, YAMLException } from "js-yaml";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CodeOutput } from "@/components/tools/suite/code-output";
import { PrimaryButton } from "@/components/tools/suite/workbench";
import { cn } from "@/lib/utils";

/** Compact flow-style sample inspired by onlineyamltools prettify examples */
const SAMPLE_COMPACT = `[{name: 'unshielded twisted pair', speeds: [10mbps, 100mbps]}, {name: 'shielded twisted pair', speeds: [10mbps, 100mbps, 1gbps]}, {name: 'fiber optics', speeds: [100mbps, 1gbps, 10gbps]}]`;

const SAMPLE_YAML = `name: colorBase
version: 1
featured: true
colors:
  - "#e11d48"
  - "#db2777"
  - "#f43f5e"
tools:
  json: formatter
  css:
    - backdrop-filter
    - box-shadow
meta: null
`;

type IndentSize = 2 | 4;
type Mode = "formatted" | "minified";

function formatYamlError(err: unknown): string {
  if (err instanceof YAMLException) {
    const line = (err.mark?.line ?? 0) + 1;
    const col = (err.mark?.column ?? 0) + 1;
    return `${err.reason || err.message} (line ${line}, col ${col})`;
  }
  if (err instanceof Error) return err.message;
  return "Invalid YAML";
}

function countKeys(value: unknown): number {
  if (Array.isArray(value)) return value.reduce<number>((n, item) => n + countKeys(item), 0);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return Object.keys(obj).length + Object.values(obj).reduce<number>((n, v) => n + countKeys(v), 0);
  }
  return 0;
}

export function YamlFormatterTool() {
  const [input, setInput] = useState(SAMPLE_COMPACT);
  const [indent, setIndent] = useState<IndentSize>(2);
  const [mode, setMode] = useState<Mode>("formatted");
  const [runId, setRunId] = useState(0);

  const result = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        output: "",
        error: null as string | null,
        meta: null as null | { keys: number; size: number; type: string },
      };
    }
    try {
      const parsed = load(trimmed);
      const output =
        mode === "minified"
          ? dump(parsed, {
              flowLevel: 0,
              lineWidth: -1,
              noRefs: true,
              quoteStyle: "single",
            }).trim()
          : dump(parsed, {
              indent,
              lineWidth: 120,
              noRefs: true,
              quoteStyle: "double",
              forceQuotes: false,
            }).replace(/\n$/, "");

      return {
        output,
        error: null,
        meta: {
          keys: countKeys(parsed),
          size: new Blob([output]).size,
          type: Array.isArray(parsed) ? "array" : parsed === null ? "null" : typeof parsed,
        },
      };
    } catch (e) {
      return {
        output: "",
        error: formatYamlError(e),
        meta: null,
      };
    }
  }, [input, indent, mode]);

  const formatAction = (nextMode: Mode) => {
    setMode(nextMode);
    setRunId((n) => n + 1);
    if (!input.trim()) {
      toast.error("Paste YAML first");
      return;
    }
    if (result.error) {
      toast.error("Fix YAML errors first");
      return;
    }
    toast.success(nextMode === "minified" ? "Minified" : "Prettified");
  };

  const loadOutputIntoInput = () => {
    if (!result.output) {
      toast.error("No prettified output yet");
      return;
    }
    setInput(result.output);
    setMode("formatted");
    setRunId((n) => n + 1);
    toast.success("Moved output to input");
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
        <div className="flex flex-col gap-3 border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                YAML Prettifier
              </p>
              <Badge variant="secondary" className="rounded-full">
                <FileCode2 className="mr-1 h-3.5 w-3.5" />
                Local only
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Enter YAML on the left — get beautified output on the right, instantly in your browser.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full"
              onClick={() => {
                setInput(SAMPLE_COMPACT);
                setMode("formatted");
                setRunId((n) => n + 1);
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Compact sample
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full"
              onClick={() => {
                setInput(SAMPLE_YAML);
                setMode("formatted");
                setRunId((n) => n + 1);
              }}
            >
              Block sample
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
              Prettify
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
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Spacing
          </span>
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
              {n} spaces
            </button>
          ))}

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
                    Valid YAML
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
                    {mode === "minified" ? "minified" : `${indent}-space indent`}
                  </Badge>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2 lg:items-stretch lg:gap-4">
        <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
          <div className="flex items-center justify-between gap-2 border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-2.5 sm:px-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Input YAML
              </p>
              <p className="text-sm font-semibold">Editor</p>
            </div>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {input.length.toLocaleString()} chars
            </span>
          </div>
          <Textarea
            id="yaml-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Paste YAML here…"
            className="min-h-[28rem] flex-1 resize-none rounded-none border-0 bg-[#0d1117] px-3 py-3 font-mono text-[12px] leading-relaxed text-[#e6edf3] shadow-none focus-visible:ring-0 sm:min-h-[32rem] sm:px-4 sm:text-[13px]"
          />
        </div>

        <div className="min-h-0">
          <CodeOutput
            key={runId}
            value={result.output}
            language="yaml"
            filename={mode === "minified" ? "output.min.yaml" : "output.yaml"}
            title={mode === "minified" ? "Minified YAML" : "Output YAML (Prettified)"}
            eyebrow="Output"
            label="YAML"
            rows={22}
            emptyMessage={
              result.error ? "Fix the input to see highlighted output" : "Prettified YAML appears here"
            }
            animate
            fill
          />
        </div>
      </div>
    </div>
  );
}
