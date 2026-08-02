"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Eraser } from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/color/copy-button";
import { Button } from "@/components/ui/button";
import {
  highlightCode,
  inferLanguage,
  tokenClassName,
  type CodeLanguage,
} from "@/lib/syntax-highlight";
import { cn } from "@/lib/utils";

export function CodeOutput({
  value,
  label = "Copy",
  filename = "output.txt",
  language,
  title = "Output",
  eyebrow = "Result",
  rows = 12,
  onClear,
  emptyMessage = "Output will appear here",
  className,
  animate = true,
  fill = false,
}: {
  value: string;
  label?: string;
  filename?: string;
  language?: CodeLanguage | "auto";
  title?: string;
  eyebrow?: string;
  rows?: number;
  onClear?: () => void;
  emptyMessage?: string;
  className?: string;
  animate?: boolean;
  /** Stretch to fill a side-by-side editor column */
  fill?: boolean;
}) {
  const [flash, setFlash] = useState(false);
  const lang: CodeLanguage =
    language && language !== "auto" ? language : inferLanguage(filename, "plain");

  const tokens = useMemo(() => highlightCode(value, lang), [value, lang]);
  const lineCount = value ? value.split("\n").length : 0;
  const minHeight = Math.max(8, Math.min(rows, 28)) * 1.35;

  useEffect(() => {
    if (!value || !animate) return;
    setFlash(true);
    const id = window.setTimeout(() => setFlash(false), 700);
    return () => window.clearTimeout(id);
  }, [value, animate]);

  const download = () => {
    if (!value) {
      toast.error("Nothing to download");
      return;
    }
    const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded");
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[#30363d] bg-[#0d1117] shadow-lg shadow-black/20 sm:rounded-3xl",
        fill && "flex h-full min-h-[28rem] flex-col sm:min-h-[32rem]",
        flash && "ring-2 ring-rose-500/40",
        className
      )}
    >
      <div className="flex flex-col gap-2 border-b border-[#30363d] bg-[#161b22] px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f472b6]">
              {eyebrow}
            </p>
            <p className="truncate text-sm font-semibold text-[#e6edf3]">
              {title}
              <span className="ml-2 font-mono text-[11px] font-normal text-[#8b949e]">
                {lang}
                {filename ? ` | ${filename}` : ""}
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {onClear && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 rounded-full text-[#e6edf3] hover:bg-white/10 hover:text-white"
              onClick={onClear}
            >
              <Eraser className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-full border-[#30363d] bg-transparent text-[#e6edf3] hover:bg-white/10 hover:text-white"
            onClick={download}
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
          <CopyButton
            value={value}
            label={label}
            className="h-9 rounded-full border-[#30363d] bg-transparent text-[#e6edf3] hover:bg-white/10 hover:text-white"
          />
        </div>
      </div>

      <div className={cn("relative", fill && "min-h-0 flex-1")}>
        <AnimatePresence mode="wait">
          <motion.div
            key={animate ? `${lang}:${value.slice(0, 80)}:${value.length}` : "static"}
            initial={animate ? { opacity: 0, y: 10, filter: "blur(6px)" } : false}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={animate ? { opacity: 0, y: -6, filter: "blur(4px)" } : undefined}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className={cn("relative", fill && "flex h-full flex-col")}
          >
            {flash && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent"
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
              />
            )}
            <div
              className={cn("overflow-auto", fill && "min-h-0 flex-1")}
              style={
                fill
                  ? { minHeight: "22rem", maxHeight: "calc(32rem - 5.5rem)" }
                  : { minHeight: `${minHeight}rem`, maxHeight: "28rem" }
              }
            >
              {value ? (
                <pre className="m-0 grid grid-cols-[auto_1fr] gap-x-3 p-3 font-mono text-[12px] leading-relaxed sm:p-4 sm:text-[13px]">
                  <code className="select-none text-right text-[#484f58]" aria-hidden>
                    {Array.from({ length: lineCount }, (_, i) => (
                      <span key={i} className="block">
                        {i + 1}
                      </span>
                    ))}
                  </code>
                  <code className="min-w-0 whitespace-pre break-words text-[#e6edf3]">
                    {tokens.map((t, i) => (
                      <span key={i} className={tokenClassName(t.type)}>
                        {t.text}
                      </span>
                    ))}
                  </code>
                </pre>
              ) : (
                <div className="flex min-h-[8rem] items-center justify-center px-4 text-sm text-[#8b949e]">
                  {emptyMessage}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#30363d] bg-[#161b22] px-3 py-2 text-[11px] text-[#8b949e] sm:px-5">
        <span>
          {value.length.toLocaleString()} characters
          {value ? ` | ${lineCount.toLocaleString()} lines` : ""}
        </span>
        <span className="font-medium text-[#f472b6]">IDE view - syntax highlighted</span>
      </div>
    </div>
  );
}

export function IdeCodeBlock({
  value,
  language = "json",
  className,
  maxHeight = "18rem",
}: {
  value: string;
  language?: CodeLanguage;
  className?: string;
  maxHeight?: string;
}) {
  const tokens = useMemo(() => highlightCode(value, language), [value, language]);
  return (
    <motion.pre
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "m-0 overflow-auto rounded-xl border border-[#30363d] bg-[#0d1117] p-3 font-mono text-[12px] leading-relaxed text-[#e6edf3] sm:p-4 sm:text-[13px]",
        className
      )}
      style={{ maxHeight }}
    >
      <code>
        {tokens.map((t, i) => (
          <span key={i} className={tokenClassName(t.type)}>
            {t.text}
          </span>
        ))}
      </code>
    </motion.pre>
  );
}

export function IdePanelChrome({
  title,
  children,
  actions,
  language,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  language?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#30363d] bg-[#0d1117] shadow-sm sm:rounded-3xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#30363d] bg-[#161b22] px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-1" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-[#ff5f56]" />
            <span className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
            <span className="h-2 w-2 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-xs font-semibold text-[#e6edf3]">{title}</span>
          {language && <span className="font-mono text-[10px] text-[#8b949e]">{language}</span>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
