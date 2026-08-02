"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Copy,
  Eraser,
  Fingerprint,
  Loader2,
  ShieldAlert,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CodeOutput } from "@/components/tools/suite/code-output";
import { PrimaryButton } from "@/components/tools/suite/workbench";
import { uuidv4 } from "@/components/tools/suite/helpers";
import { cn } from "@/lib/utils";

export type UuidGuidFocus = "uuid" | "guid";

type IdFormat = "standard" | "uppercase" | "braces" | "no-hyphens" | "urn";
type ExportStyle = "lines" | "comma" | "json";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NIL = "00000000-0000-0000-0000-000000000000";
const PREVIEW_SAMPLE = "550e8400-e29b-41d4-a716-446655440000";

function formatId(raw: string, format: IdFormat): string {
  const lower = raw.toLowerCase();
  switch (format) {
    case "uppercase":
      return lower.toUpperCase();
    case "braces":
      return `{${lower.toUpperCase()}}`;
    case "no-hyphens":
      return lower.replace(/-/g, "");
    case "urn":
      return `urn:uuid:${lower}`;
    default:
      return lower;
  }
}

function normalizeForValidate(input: string): string {
  let s = input.trim();
  if (s.toLowerCase().startsWith("urn:uuid:")) s = s.slice(9);
  if (s.startsWith("{") && s.endsWith("}")) s = s.slice(1, -1);
  s = s.replace(/-/g, "");
  if (s.length !== 32 || !/^[0-9a-f]+$/i.test(s)) return "";
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`.toLowerCase();
}

function parseUuidMeta(normalized: string) {
  if (!normalized || !UUID_RE.test(normalized)) return null;
  const version = parseInt(normalized[14], 16);
  const variantNibble = parseInt(normalized[19], 16);
  let variant = "Unknown";
  if ((variantNibble & 0x8) === 0) variant = "NCS (reserved)";
  else if ((variantNibble & 0xc) === 0x8) variant = "RFC 4122";
  else if ((variantNibble & 0xe) === 0xc) variant = "Microsoft";
  else variant = "Future";
  return { version, variant, nil: normalized === NIL };
}

function defaultsFor(focus: UuidGuidFocus): { format: IdFormat; count: number } {
  if (focus === "guid") return { format: "braces", count: 5 };
  return { format: "standard", count: 5 };
}

function titleFor(focus: UuidGuidFocus) {
  return focus === "guid" ? "GUID Generator" : "UUID Generator";
}

export function UuidGuidGeneratorTool({ focus = "uuid" }: { focus?: UuidGuidFocus }) {
  const initial = useMemo(() => defaultsFor(focus), [focus]);
  const [count, setCount] = useState(initial.count);
  const [format, setFormat] = useState<IdFormat>(initial.format);
  const [exportStyle, setExportStyle] = useState<ExportStyle>("lines");
  const [ids, setIds] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [waveKey, setWaveKey] = useState(0);
  const [copiedOne, setCopiedOne] = useState<string | null>(null);
  const [validateInput, setValidateInput] = useState("");

  useEffect(() => {
    const d = defaultsFor(focus);
    setFormat(d.format);
    setCount(d.count);
  }, [focus]);

  useEffect(() => {
    setIds((prev) =>
      prev.map((id) => {
        const n = normalizeForValidate(id);
        return n ? formatId(n, format) : id;
      })
    );
  }, [format]);

  const outputText = useMemo(() => {
    if (ids.length === 0) return "";
    if (exportStyle === "comma") return ids.join(", ");
    if (exportStyle === "json") return JSON.stringify(ids, null, 2);
    return ids.join("\n");
  }, [ids, exportStyle]);

  const filename = focus === "guid" ? "guids.txt" : "uuids.txt";

  const generate = useCallback(async () => {
    const n = Math.min(500, Math.max(1, Math.floor(count) || 1));
    if (n !== count) setCount(n);

    setGenerating(true);
    setWaveKey((k) => k + 1);
    await new Promise((r) => window.setTimeout(r, 280));

    const next = Array.from({ length: n }, () => formatId(uuidv4(), format));
    setIds(next);
    setGenerating(false);
    toast.success(`Generated ${n} ${focus === "guid" ? "GUID" : "UUID"}${n === 1 ? "" : "s"}`);
  }, [count, format, focus]);

  useEffect(() => {
    void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyOne = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedOne(id);
      toast.success("Copied");
      window.setTimeout(() => setCopiedOne(null), 1200);
    } catch {
      toast.error("Copy failed");
    }
  };

  const normalized = normalizeForValidate(validateInput);
  const meta = normalized ? parseUuidMeta(normalized) : null;
  const validateEmpty = !validateInput.trim();

  const formats: { id: IdFormat; label: string }[] = [
    { id: "standard", label: "Lowercase" },
    { id: "uppercase", label: "UPPERCASE" },
    { id: "braces", label: "{Braces}" },
    { id: "no-hyphens", label: "No hyphens" },
    { id: "urn", label: "URN" },
  ];

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
                  Cryptographically random RFC 4122 version 4 identifiers — generated locally.
                </p>
              </div>
              <Badge variant="secondary" className="rounded-full">
                <Fingerprint className="mr-1 h-3.5 w-3.5" />
                v4
              </Badge>
            </div>
          </div>

          <div className="space-y-4 p-3 sm:p-5">
            <div className="flex flex-wrap gap-2">
              {focus === "uuid" ? (
                <Link
                  href="/guid-generator"
                  className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
                >
                  Windows / .NET GUID style
                </Link>
              ) : (
                <Link
                  href="/uuid-generator"
                  className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
                >
                  Standard UUID style
                </Link>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-full"
                onClick={() => {
                  setIds([formatId(NIL, format)]);
                  toast.success("Nil UUID set");
                }}
              >
                Nil UUID
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-full"
                onClick={() => setIds([])}
              >
                <Eraser className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="id-count">How many</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="id-count"
                  type="number"
                  min={1}
                  max={500}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="h-10 w-28 rounded-xl"
                />
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={Math.min(100, Math.max(1, count))}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="h-2 flex-1 cursor-pointer accent-rose-500"
                />
                <span className="text-xs text-muted-foreground">max 500</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <div className="flex flex-wrap gap-2">
                {formats.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      format === f.id
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30 hover:bg-muted/60"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <p className="font-mono text-[11px] text-muted-foreground">
                Preview: {formatId(PREVIEW_SAMPLE, format)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Export as</Label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["lines", "One per line"],
                    ["comma", "Comma list"],
                    ["json", "JSON array"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setExportStyle(id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      exportStyle === id
                        ? "border-rose-500/50 bg-rose-500 text-white"
                        : "border-border/60 bg-muted/30 hover:bg-muted/60"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
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
                  Generate {focus === "guid" ? "GUIDs" : "UUIDs"}
                </>
              )}
            </PrimaryButton>

            <div className="space-y-2 rounded-2xl border border-border/50 bg-muted/20 p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="uuid-validate" className="text-sm font-semibold">
                  Validate
                </Label>
                {!validateEmpty && meta && (
                  <Badge className="rounded-full border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Valid
                  </Badge>
                )}
                {!validateEmpty && !meta && (
                  <Badge variant="outline" className="rounded-full text-destructive">
                    <ShieldAlert className="mr-1 h-3 w-3" />
                    Invalid
                  </Badge>
                )}
              </div>
              <Input
                id="uuid-validate"
                value={validateInput}
                onChange={(e) => setValidateInput(e.target.value)}
                spellCheck={false}
                placeholder="Paste a UUID / GUID to inspect…"
                className="h-10 rounded-xl font-mono text-xs"
              />
              {meta && (
                <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-3">
                  <p>
                    Version: <span className="font-medium text-foreground">{meta.version}</span>
                  </p>
                  <p>
                    Variant: <span className="font-medium text-foreground">{meta.variant}</span>
                  </p>
                  <p>
                    Nil: <span className="font-medium text-foreground">{meta.nil ? "yes" : "no"}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative space-y-3">
          <AnimatePresence>
            {generating && (
              <motion.div
                key={`load-${waveKey}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/70 backdrop-blur-sm sm:rounded-3xl"
              >
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                <p className="text-sm font-medium">Generating identifiers…</p>
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

          <CodeOutput
            value={outputText}
            filename={exportStyle === "json" ? filename.replace(".txt", ".json") : filename}
            language={exportStyle === "json" ? "json" : "plain"}
            title={focus === "guid" ? "GUID list" : "UUID list"}
            eyebrow="Results"
            rows={14}
            fill
            emptyMessage="Press Generate to create identifiers"
            onClear={() => setIds([])}
          />

          {ids.length > 0 && ids.length <= 20 && exportStyle === "lines" && (
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/70 sm:rounded-3xl">
              <div className="border-b border-border/40 px-3 py-2.5 sm:px-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Quick copy
                </p>
              </div>
              <ul className="divide-y divide-border/40">
                {ids.map((id, i) => (
                  <li
                    key={`${id}-${i}`}
                    className="flex items-center justify-between gap-2 px-3 py-2 sm:px-4"
                  >
                    <code className="truncate font-mono text-[11px] sm:text-xs">{id}</code>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 shrink-0 rounded-full"
                      onClick={() => void copyOne(id)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copiedOne === id ? "Copied" : "Copy"}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
