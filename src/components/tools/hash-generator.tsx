"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Copy,
  Eraser,
  FileUp,
  Hash,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PrimaryButton } from "@/components/tools/suite/workbench";
import { md5, md5Bytes } from "@/components/tools/suite/helpers";
import { cn } from "@/lib/utils";

export type HashFocus = "all" | "sha256" | "md5";

type Algo = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

const ALL_ALGOS: Algo[] = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"];

const SAMPLE = "Hello, colorBase! Hash me.";

function focusAlgos(focus: HashFocus): Algo[] {
  if (focus === "sha256") return ["SHA-256"];
  if (focus === "md5") return ["MD5"];
  return ALL_ALGOS;
}

async function hashPayload(algo: Algo, bytes: Uint8Array): Promise<string> {
  if (algo === "MD5") return md5Bytes(bytes);
  const copy = new Uint8Array(bytes);
  const digest = await crypto.subtle.digest(algo, copy);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function titleFor(focus: HashFocus) {
  if (focus === "sha256") return "SHA-256 Generator";
  if (focus === "md5") return "MD5 Generator";
  return "Hash Generator";
}

export function HashGeneratorTool({ focus = "all" }: { focus?: HashFocus }) {
  const defaultAlgos = useMemo(() => focusAlgos(focus), [focus]);
  const [text, setText] = useState(SAMPLE);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [source, setSource] = useState<"text" | "file">("text");
  const [selected, setSelected] = useState<Algo[]>(defaultAlgos);
  const [uppercase, setUppercase] = useState(false);
  const [compare, setCompare] = useState("");
  const [results, setResults] = useState<Partial<Record<Algo, string>>>({});
  const [generating, setGenerating] = useState(false);
  const [waveKey, setWaveKey] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setSelected(focusAlgos(focus));
  }, [focus]);

  const payloadLabel =
    source === "file" && fileName
      ? fileName
      : `${text.length.toLocaleString()} chars`;

  const generate = useCallback(async () => {
    if (selected.length === 0) {
      toast.error("Select at least one algorithm");
      return;
    }
    if (source === "text" && !text) {
      toast.error("Enter text to hash");
      return;
    }
    if (source === "file" && !fileBytes) {
      toast.error("Choose a file to hash");
      return;
    }

    setGenerating(true);
    setWaveKey((k) => k + 1);
    await new Promise((r) => window.setTimeout(r, 350));

    try {
      const bytes =
        source === "file" && fileBytes
          ? new Uint8Array(fileBytes)
          : new TextEncoder().encode(text);
      const next: Partial<Record<Algo, string>> = {};
      for (const algo of selected) {
        // Text MD5 uses UTF-8 via md5(); file/binary MD5 uses raw bytes
        if (algo === "MD5" && source === "text") {
          next[algo] = md5(text);
        } else {
          next[algo] = await hashPayload(algo, bytes);
        }
      }
      setResults(next);
      toast.success("Hashes generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Hashing failed");
    } finally {
      setGenerating(false);
    }
  }, [selected, source, text, fileBytes]);

  useEffect(() => {
    void generate();
    // initial sample only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const display = (hex: string) => (uppercase ? hex.toUpperCase() : hex.toLowerCase());

  const copyHash = async (algo: Algo, hex: string) => {
    try {
      await navigator.clipboard.writeText(display(hex));
      setCopied(algo);
      toast.success(`${algo} copied`);
      window.setTimeout(() => setCopied(null), 1200);
    } catch {
      toast.error("Copy failed");
    }
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const buf = await file.arrayBuffer();
    setFileBytes(buf);
    setFileName(file.name);
    setSource("file");
    toast.success(`Loaded ${file.name}`);
  };

  const compareNeedle = compare.trim().toLowerCase().replace(/\s+/g, "");

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
          <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  Workspace
                </p>
                <h2 className="font-display text-base font-semibold tracking-tight sm:text-lg">
                  {titleFor(focus)}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Hash text or files locally with MD5 and SHA family digests.
                </p>
              </div>
              <Badge variant="secondary" className="rounded-full">
                <Hash className="mr-1 h-3.5 w-3.5" />
                Local only
              </Badge>
            </div>
          </div>

          <div className="space-y-4 p-3 sm:p-5">
            {focus === "all" && (
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/sha256-generator"
                  className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
                >
                  SHA-256 only
                </Link>
                <Link
                  href="/md5-generator"
                  className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
                >
                  MD5 only
                </Link>
              </div>
            )}
            {focus !== "all" && (
              <Link
                href="/hash-generator"
                className="inline-flex rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                All algorithms
              </Link>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSource("text")}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  source === "text"
                    ? "border-rose-500/50 bg-rose-500 text-white"
                    : "border-border/60 bg-muted/30 hover:bg-muted/60"
                )}
              >
                Text
              </button>
              <button
                type="button"
                onClick={() => setSource("file")}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  source === "file"
                    ? "border-rose-500/50 bg-rose-500 text-white"
                    : "border-border/60 bg-muted/30 hover:bg-muted/60"
                )}
              >
                File
              </button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-full"
                onClick={() => {
                  setSource("text");
                  setText(SAMPLE);
                  setFileBytes(null);
                  setFileName(null);
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
                  setText("");
                  setFileBytes(null);
                  setFileName(null);
                  setResults({});
                }}
              >
                <Eraser className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>

            {source === "text" ? (
              <div className="space-y-1.5">
                <Label htmlFor="hash-input">Input text</Label>
                <Textarea
                  id="hash-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                  spellCheck={false}
                  placeholder="Type or paste text to hash…"
                  className="rounded-2xl border-border/50 bg-[#0d1117] font-mono text-[12px] text-[#e6edf3] sm:text-[13px]"
                />
                <p className="text-[11px] text-muted-foreground">{payloadLabel}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="hash-file">Input file</Label>
                <label
                  htmlFor="hash-file"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 bg-muted/20 px-4 py-10 text-center transition-colors hover:bg-muted/40"
                >
                  <FileUp className="h-6 w-6 text-rose-500" />
                  <span className="text-sm font-medium">
                    {fileName ? fileName : "Drop or choose a file"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Hashed in your browser — never uploaded
                  </span>
                  <Input
                    id="hash-file"
                    type="file"
                    className="hidden"
                    onChange={(e) => void onFile(e.target.files?.[0])}
                  />
                </label>
              </div>
            )}

            <div className="space-y-2">
              <Label>Algorithms</Label>
              <div className="flex flex-wrap gap-2">
                {(focus === "all" ? ALL_ALGOS : defaultAlgos).map((algo) => {
                  const on = selected.includes(algo);
                  return (
                    <button
                      key={algo}
                      type="button"
                      onClick={() => {
                        if (focus !== "all") return;
                        setSelected((prev) =>
                          on ? prev.filter((a) => a !== algo) : [...prev, algo]
                        );
                      }}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        on
                          ? "border-rose-500/50 bg-rose-500 text-white"
                          : "border-border/60 bg-muted/30 hover:bg-muted/60",
                        focus !== "all" && "cursor-default"
                      )}
                    >
                      {algo}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setUppercase((v) => !v)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  uppercase
                    ? "border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                    : "border-border/60 bg-background hover:bg-muted/50"
                )}
              >
                UPPERCASE hex {uppercase ? "on" : "off"}
              </button>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hash-compare">Compare hash (optional)</Label>
              <Input
                id="hash-compare"
                value={compare}
                onChange={(e) => setCompare(e.target.value)}
                spellCheck={false}
                placeholder="Paste an expected hex digest to verify"
                className="h-10 rounded-xl font-mono text-xs"
              />
            </div>

            <PrimaryButton
              className="w-full sm:w-auto"
              disabled={generating}
              onClick={() => void generate()}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generate hash
                </>
              )}
            </PrimaryButton>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
          <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
              Results
            </p>
            <p className="text-sm font-semibold">
              {generating ? "Generating…" : "Digest output"}
            </p>
          </div>

          <div className="relative space-y-3 p-3 sm:p-5">
            <AnimatePresence>
              {generating && (
                <motion.div
                  key={`load-${waveKey}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/70 backdrop-blur-sm"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                  <p className="text-sm font-medium">Computing digests…</p>
                  <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {Object.keys(results).length === 0 && !generating ? (
              <div className="rounded-2xl border border-dashed border-border/60 px-4 py-12 text-center text-sm text-muted-foreground">
                Press Generate hash to see digests
              </div>
            ) : (
              (Object.entries(results) as [Algo, string][]).map(([algo, hex], i) => {
                const match =
                  compareNeedle.length > 0 &&
                  display(hex).toLowerCase() === compareNeedle;
                const mismatch =
                  compareNeedle.length > 0 &&
                  display(hex).toLowerCase() !== compareNeedle;
                return (
                  <motion.div
                    key={`${algo}-${waveKey}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: generating ? 0.4 : 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className={cn(
                      "overflow-hidden rounded-2xl border bg-[#0d1117] shadow-sm",
                      match && "border-emerald-500/50 ring-1 ring-emerald-500/30",
                      mismatch && "border-border/50",
                      !compareNeedle && "border-[#30363d]"
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#30363d] bg-[#161b22] px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#e6edf3]">{algo}</span>
                        {match && (
                          <Badge className="rounded-full border-transparent bg-emerald-500/20 text-emerald-300">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Match
                          </Badge>
                        )}
                        {mismatch && (
                          <Badge variant="outline" className="rounded-full text-[10px] text-[#8b949e]">
                            No match
                          </Badge>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-full text-[#e6edf3] hover:bg-white/10"
                        onClick={() => void copyHash(algo, hex)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copied === algo ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <pre className="overflow-x-auto p-3 font-mono text-[12px] leading-relaxed text-[#7ee787] sm:text-[13px]">
                      {display(hex)}
                    </pre>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
