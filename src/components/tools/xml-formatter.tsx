"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  Code2,
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
import { formatXml } from "@/lib/xml";
import { cn } from "@/lib/utils";

const SAMPLE_COMPACT = `<?xml version="1.0" encoding="UTF-8"?><catalog><book id="b1" available="true"><title>Color Theory</title><author>Ada Rose</author><tags><tag>design</tag><tag>css</tag></tags></book><book id="b2"><title>XML Essentials</title><author>Sam Markup</author></book></catalog>`;

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="b1" available="true">
    <title>Color Theory</title>
    <author>Ada Rose</author>
  </book>
</catalog>
`;

type IndentSize = 2 | 4;
type Mode = "formatted" | "minified";

export function XmlFormatterTool() {
  const [input, setInput] = useState(SAMPLE_COMPACT);
  const [indent, setIndent] = useState<IndentSize>(2);
  const [mode, setMode] = useState<Mode>("formatted");
  const [runId, setRunId] = useState(0);

  const result = useMemo(
    () => formatXml(input, indent, mode),
    [input, indent, mode]
  );

  const formatAction = (nextMode: Mode) => {
    setMode(nextMode);
    setRunId((n) => n + 1);
    if (!input.trim()) {
      toast.error("Paste XML first");
      return;
    }
    // Recompute for toast using next mode quickly
    const check = formatXml(input, indent, nextMode);
    if (check.error) {
      toast.error("Fix XML errors first");
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
                XML Formatter
              </p>
              <Badge variant="secondary" className="rounded-full">
                <Code2 className="mr-1 h-3.5 w-3.5" />
                Local only
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Beautify, minify, and validate XML with side-by-side IDE output and animated results.
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
                setInput(SAMPLE_XML);
                setMode("formatted");
                setRunId((n) => n + 1);
              }}
            >
              Pretty sample
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
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Indent
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
                    Valid XML
                  </span>
                  <Badge variant="outline" className="rounded-full font-mono text-[10px]">
                    &lt;{result.meta.root}&gt;
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-[10px]">
                    {result.meta.elements} elements
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-[10px]">
                    {result.meta.attributes} attrs
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
                Input XML
              </p>
              <p className="text-sm font-semibold">Editor</p>
            </div>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {input.length.toLocaleString()} chars
            </span>
          </div>
          <Textarea
            id="xml-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder='Paste XML here… e.g. <root><item /></root>'
            className="min-h-[28rem] flex-1 resize-none rounded-none border-0 bg-[#0d1117] px-3 py-3 font-mono text-[12px] leading-relaxed text-[#e6edf3] shadow-none focus-visible:ring-0 sm:min-h-[32rem] sm:px-4 sm:text-[13px]"
          />
        </div>

        <div className="min-h-0">
          <CodeOutput
            key={runId}
            value={result.output}
            language="xml"
            filename={mode === "minified" ? "output.min.xml" : "output.xml"}
            title={mode === "minified" ? "Minified XML" : "Formatted XML"}
            eyebrow="Output"
            label="XML"
            rows={22}
            emptyMessage={
              result.error ? "Fix the input to see highlighted output" : "Formatted XML appears here"
            }
            animate
            fill
          />
        </div>
      </div>
    </div>
  );
}
