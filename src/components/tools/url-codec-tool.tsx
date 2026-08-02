"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  Eraser,
  Link2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CodeOutput } from "@/components/tools/suite/code-output";
import { PrimaryButton } from "@/components/tools/suite/workbench";
import { cn } from "@/lib/utils";

export type UrlCodecMode = "encode" | "decode";
type EncodeStyle = "component" | "uri";

const SAMPLE_PLAIN =
  "https://colorbase.in/search?q=rose pink & tools=css#palette";
const SAMPLE_ENCODED =
  "https%3A%2F%2Fcolorbase.in%2Fsearch%3Fq%3Drose%20pink%20%26%20tools%3Dcss%23palette";

function encodeUrl(text: string, style: EncodeStyle) {
  if (!text) return "";
  return style === "uri" ? encodeURI(text) : encodeURIComponent(text);
}

function decodeUrl(text: string, plusAsSpace: boolean) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Paste a percent-encoded string to decode.");
  const prepared = plusAsSpace ? trimmed.replace(/\+/g, " ") : trimmed;
  try {
    return decodeURIComponent(prepared);
  } catch {
    throw new Error("Invalid percent-encoding. Check % sequences (e.g. %20, %2F).");
  }
}

export function UrlCodecTool({ mode }: { mode: UrlCodecMode }) {
  const isEncode = mode === "encode";
  const [input, setInput] = useState(isEncode ? SAMPLE_PLAIN : SAMPLE_ENCODED);
  const [encodeStyle, setEncodeStyle] = useState<EncodeStyle>("component");
  const [plusAsSpace, setPlusAsSpace] = useState(true);
  const [runId, setRunId] = useState(0);

  const result = useMemo(() => {
    if (!input.trim()) {
      return { output: "", error: null as string | null };
    }
    try {
      const output = isEncode
        ? encodeUrl(input, encodeStyle)
        : decodeUrl(input, plusAsSpace);
      return { output, error: null };
    } catch (e) {
      return {
        output: "",
        error: e instanceof Error ? e.message : "Conversion failed",
      };
    }
  }, [input, isEncode, encodeStyle, plusAsSpace]);

  const runAction = () => {
    setRunId((n) => n + 1);
    if (!input.trim()) {
      toast.error(isEncode ? "Enter text or a URL to encode" : "Paste an encoded URL");
      return;
    }
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(isEncode ? "Encoded" : "Decoded");
  };

  const useOutput = () => {
    if (!result.output) {
      toast.error("No output yet");
      return;
    }
    setInput(result.output);
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
                URL {isEncode ? "Encoder" : "Decoder"}
              </p>
              <Badge variant="secondary" className="rounded-full">
                <Link2 className="mr-1 h-3.5 w-3.5" />
                Local only
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isEncode
                ? "Percent-encode URLs, query values, and text — component or full-URI style."
                : "Decode percent-encoded URLs and form values with clear validation."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-full border border-border/60 p-0.5">
              <Link
                href="/url-encoder"
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  isEncode ? "bg-rose-500 text-white" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Encode
              </Link>
              <Link
                href="/url-decoder"
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  !isEncode ? "bg-rose-500 text-white" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Decode
              </Link>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full"
              onClick={() => {
                setInput(isEncode ? SAMPLE_PLAIN : SAMPLE_ENCODED);
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
            <PrimaryButton size="sm" className="h-8" onClick={runAction}>
              <Wand2 className="h-3.5 w-3.5" />
              {isEncode ? "Encode" : "Decode"}
            </PrimaryButton>
            <Button type="button" variant="outline" size="sm" className="h-8 rounded-full" onClick={useOutput}>
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Use output
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:px-5">
          {isEncode ? (
            <>
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Style
              </span>
              {(
                [
                  { id: "component" as const, label: "encodeURIComponent" },
                  { id: "uri" as const, label: "encodeURI" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setEncodeStyle(opt.id);
                    setRunId((n) => n + 1);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    encodeStyle === opt.id
                      ? "border-rose-500/50 bg-rose-500 text-white"
                      : "border-border/60 bg-muted/30 hover:bg-muted/60"
                  )}
                >
                  {opt.label}
                </button>
              ))}
              <span className="text-[11px] text-muted-foreground">
                {encodeStyle === "component"
                  ? "Encodes :, /, ?, #, & — best for query values"
                  : "Keeps URL structure characters — best for whole URLs"}
              </span>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setPlusAsSpace((v) => !v);
                setRunId((n) => n + 1);
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                plusAsSpace
                  ? "border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                  : "border-border/60 bg-background hover:bg-muted/50"
              )}
            >
              Treat + as space {plusAsSpace ? "on" : "off"}
            </button>
          )}

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
              ) : result.output ? (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-wrap items-center justify-end gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                    {isEncode ? "Encoded" : "Decoded"}
                  </span>
                  <Badge variant="outline" className="rounded-full text-[10px]">
                    {input.length.toLocaleString()} in
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-[10px]">
                    {result.output.length.toLocaleString()} out
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
                Input
              </p>
              <p className="text-sm font-semibold">
                {isEncode ? "Plain URL / text" : "Percent-encoded string"}
              </p>
            </div>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {input.length.toLocaleString()} chars
            </span>
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder={
              isEncode ? "Paste a URL or text to encode…" : "Paste a percent-encoded string…"
            }
            className="min-h-[28rem] flex-1 resize-none rounded-none border-0 bg-[#0d1117] px-3 py-3 font-mono text-[12px] leading-relaxed text-[#e6edf3] shadow-none focus-visible:ring-0 sm:min-h-[32rem] sm:px-4 sm:text-[13px]"
          />
        </div>

        <div className="min-h-0">
          <CodeOutput
            key={runId}
            value={result.output}
            language="plain"
            filename={isEncode ? "encoded-url.txt" : "decoded-url.txt"}
            title={isEncode ? "Encoded output" : "Decoded output"}
            eyebrow="Output"
            label={isEncode ? "Encoded" : "Decoded"}
            rows={22}
            emptyMessage={
              result.error
                ? "Fix the input to see output"
                : isEncode
                  ? "Percent-encoded result appears here"
                  : "Decoded text appears here"
            }
            animate
            fill
          />
        </div>
      </div>
    </div>
  );
}
