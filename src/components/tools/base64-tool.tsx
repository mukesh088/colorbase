"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeftRight,
  Binary,
  CheckCircle2,
  Eraser,
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

export type Base64Mode = "encode" | "decode";

const SAMPLE_PLAIN = "Hello, colorBase! 🎨\nBase64 keeps UTF-8 safe.";
const SAMPLE_B64 = "SGVsbG8sIGNvbG9yQmFzZSEg8J+OjwpCYXNlNjQga2VlcHMgVVRGLTggc2FmZS4=";

function encodeBase64(text: string, urlSafe: boolean) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  let encoded = btoa(binary);
  if (urlSafe) {
    encoded = encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }
  return encoded;
}

function decodeBase64(text: string, urlSafe: boolean) {
  let normalized = text.trim().replace(/\s+/g, "");
  if (!normalized) throw new Error("Paste a Base64 string to decode.");
  if (urlSafe) {
    normalized = normalized.replace(/-/g, "+").replace(/_/g, "/");
  }
  const pad = (4 - (normalized.length % 4)) % 4;
  normalized += "=".repeat(pad);
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
    throw new Error("Invalid Base64 characters. Enable URL-safe if your string uses - or _.");
  }
  let binary: string;
  try {
    binary = atob(normalized);
  } catch {
    throw new Error("Could not decode Base64. Check padding and alphabet.");
  }
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    // Fallback for non-UTF-8 binary-ish payloads
    return binary;
  }
}

export function Base64Tool({ mode }: { mode: Base64Mode }) {
  const isEncode = mode === "encode";
  const [input, setInput] = useState(isEncode ? SAMPLE_PLAIN : SAMPLE_B64);
  const [urlSafe, setUrlSafe] = useState(false);
  const [runId, setRunId] = useState(0);

  const result = useMemo(() => {
    if (!input.trim()) {
      return { output: "", error: null as string | null, bytes: 0 };
    }
    try {
      const output = isEncode ? encodeBase64(input, urlSafe) : decodeBase64(input, urlSafe);
      const bytes = isEncode
        ? new TextEncoder().encode(input).length
        : Math.floor((input.trim().replace(/\s+/g, "").replace(/=+$/g, "").length * 3) / 4);
      return { output, error: null, bytes };
    } catch (e) {
      return {
        output: "",
        error: e instanceof Error ? e.message : "Conversion failed",
        bytes: 0,
      };
    }
  }, [input, isEncode, urlSafe]);

  const runAction = () => {
    setRunId((n) => n + 1);
    if (!input.trim()) {
      toast.error(isEncode ? "Enter text to encode" : "Paste Base64 to decode");
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

  const loadSample = () => {
    setInput(isEncode ? SAMPLE_PLAIN : SAMPLE_B64);
    setRunId((n) => n + 1);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
        <div className="flex flex-col gap-3 border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Base64 {isEncode ? "Encode" : "Decode"}
              </p>
              <Badge variant="secondary" className="rounded-full">
                <Binary className="mr-1 h-3.5 w-3.5" />
                Local only
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isEncode
                ? "Convert plain text to Base64 with UTF-8 safety and optional URL-safe alphabet."
                : "Decode Base64 back to text — supports standard and URL-safe strings."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-full border border-border/60 p-0.5">
              <Link
                href="/base64-encode"
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  isEncode ? "bg-rose-500 text-white" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Encode
              </Link>
              <Link
                href="/base64-decode"
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  !isEncode ? "bg-rose-500 text-white" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Decode
              </Link>
            </div>
            <Button type="button" variant="outline" size="sm" className="h-8 rounded-full" onClick={loadSample}>
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
          <button
            type="button"
            onClick={() => {
              setUrlSafe((v) => !v);
              setRunId((n) => n + 1);
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              urlSafe
                ? "border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                : "border-border/60 bg-background hover:bg-muted/50"
            )}
          >
            URL-safe {urlSafe ? "on" : "off"}
          </button>
          <span className="text-[11px] text-muted-foreground">
            {urlSafe ? "Uses - and _ (RFC 4648 §5)" : "Standard + / alphabet"}
          </span>

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
                  <Badge variant="outline" className="rounded-full text-[10px]">
                    ~{result.bytes.toLocaleString()} bytes
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
              <p className="text-sm font-semibold">{isEncode ? "Plain text" : "Base64 string"}</p>
            </div>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {input.length.toLocaleString()} chars
            </span>
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder={isEncode ? "Type or paste text to encode…" : "Paste Base64 to decode…"}
            className="min-h-[28rem] flex-1 resize-none rounded-none border-0 bg-[#0d1117] px-3 py-3 font-mono text-[12px] leading-relaxed text-[#e6edf3] shadow-none focus-visible:ring-0 sm:min-h-[32rem] sm:px-4 sm:text-[13px]"
          />
        </div>

        <div className="min-h-0">
          <CodeOutput
            key={runId}
            value={result.output}
            language="plain"
            filename={isEncode ? "encoded.txt" : "decoded.txt"}
            title={isEncode ? "Base64 output" : "Decoded text"}
            eyebrow="Output"
            label={isEncode ? "Base64" : "Text"}
            rows={22}
            emptyMessage={
              result.error
                ? "Fix the input to see output"
                : isEncode
                  ? "Encoded Base64 appears here"
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
