"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  Database,
  Eraser,
  Minimize2,
  Sparkles,
  WrapText,
} from "lucide-react";
import { format as formatSql } from "sql-formatter";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CodeOutput } from "@/components/tools/suite/code-output";
import { PrimaryButton } from "@/components/tools/suite/workbench";
import { cn } from "@/lib/utils";

type Dialect =
  | "sql"
  | "mysql"
  | "postgresql"
  | "sqlite"
  | "mariadb"
  | "transactsql"
  | "bigquery"
  | "snowflake"
  | "redshift";

type KeywordCase = "upper" | "lower" | "preserve";
type IndentSize = 2 | 4;
type Mode = "formatted" | "minified";

const DIALECTS: { id: Dialect; label: string }[] = [
  { id: "sql", label: "Standard SQL" },
  { id: "mysql", label: "MySQL" },
  { id: "postgresql", label: "PostgreSQL" },
  { id: "sqlite", label: "SQLite" },
  { id: "mariadb", label: "MariaDB" },
  { id: "transactsql", label: "SQL Server" },
  { id: "bigquery", label: "BigQuery" },
  { id: "snowflake", label: "Snowflake" },
  { id: "redshift", label: "Redshift" },
];

const SAMPLE_SQL = `select u.id, u.name, count(o.id) as order_count from users u left join orders o on o.user_id = u.id where u.active = 1 and u.created_at >= '2024-01-01' group by u.id, u.name having count(o.id) > 0 order by order_count desc limit 25`;

function minifySql(sql: string) {
  return sql
    .replace(/--[^\n]*/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s*([(),;])\s*/g, "$1")
    .trim();
}

export function SqlFormatterTool() {
  const [input, setInput] = useState(SAMPLE_SQL);
  const [dialect, setDialect] = useState<Dialect>("sql");
  const [indent, setIndent] = useState<IndentSize>(2);
  const [keywordCase, setKeywordCase] = useState<KeywordCase>("upper");
  const [mode, setMode] = useState<Mode>("formatted");
  const [runId, setRunId] = useState(0);

  const result = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        output: "",
        error: null as string | null,
        meta: null as null | { lines: number; size: number; keywords: number },
      };
    }
    try {
      const pretty = formatSql(trimmed, {
        language: dialect,
        tabWidth: indent,
        keywordCase,
        linesBetweenQueries: 1,
      });
      const output = mode === "minified" ? minifySql(pretty) : pretty;
      const keywords = (output.match(/\b(SELECT|FROM|WHERE|JOIN|AND|OR|GROUP|ORDER|LIMIT|INSERT|UPDATE|DELETE|CREATE|TABLE|AS|ON|HAVING|INTO|VALUES|SET)\b/gi) || [])
        .length;
      return {
        output,
        error: null,
        meta: {
          lines: output.split("\n").length,
          size: new Blob([output]).size,
          keywords,
        },
      };
    } catch (e) {
      return {
        output: "",
        error: e instanceof Error ? e.message : "Could not format SQL",
        meta: null,
      };
    }
  }, [input, dialect, indent, keywordCase, mode]);

  const formatAction = (nextMode: Mode) => {
    setMode(nextMode);
    setRunId((n) => n + 1);
    if (!input.trim()) {
      toast.error("Paste SQL first");
      return;
    }
    if (result.error) {
      toast.error("Fix SQL errors first");
      return;
    }
    toast.success(nextMode === "minified" ? "Minified" : "Formatted");
  };

  const useOutput = () => {
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
                SQL Formatter
              </p>
              <Badge variant="secondary" className="rounded-full">
                <Database className="mr-1 h-3.5 w-3.5" />
                Local only
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Beautify SQL with dialect support, keyword casing, and IDE syntax highlighting.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full"
              onClick={() => {
                setInput(SAMPLE_SQL);
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
            <Button type="button" variant="outline" size="sm" className="h-8 rounded-full" onClick={useOutput}>
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Use output
            </Button>
          </div>
        </div>

        <div className="space-y-3 px-3 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Dialect
            </span>
            {DIALECTS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setDialect(d.id);
                  setRunId((n) => n + 1);
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  dialect === d.id
                    ? "border-rose-500/50 bg-rose-500 text-white"
                    : "border-border/60 bg-muted/30 hover:bg-muted/60"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
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

            <span className="ml-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:ml-3">
              Keywords
            </span>
            {(
              [
                { id: "upper" as const, label: "UPPER" },
                { id: "lower" as const, label: "lower" },
                { id: "preserve" as const, label: "Preserve" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setKeywordCase(opt.id);
                  setMode("formatted");
                  setRunId((n) => n + 1);
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  keywordCase === opt.id
                    ? "border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                    : "border-border/60 bg-background hover:bg-muted/50"
                )}
              >
                {opt.label}
              </button>
            ))}

            <div className="ml-auto min-w-0 w-full sm:w-auto sm:flex-none">
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
                      Formatted
                    </span>
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {dialect}
                    </Badge>
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {result.meta.lines} lines
                    </Badge>
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {result.meta.size.toLocaleString()} B
                    </Badge>
                    <Badge variant="secondary" className="rounded-full text-[10px]">
                      {mode === "minified" ? "minified" : `${indent}-space`}
                    </Badge>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2 lg:items-stretch lg:gap-4">
        <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm sm:rounded-3xl">
          <div className="flex items-center justify-between gap-2 border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-2.5 sm:px-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Input SQL
              </p>
              <p className="text-sm font-semibold">Query editor</p>
            </div>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {input.length.toLocaleString()} chars
            </span>
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Paste SQL here… e.g. select * from users where id = 1"
            className="min-h-[28rem] flex-1 resize-none rounded-none border-0 bg-[#0d1117] px-3 py-3 font-mono text-[12px] leading-relaxed text-[#e6edf3] shadow-none focus-visible:ring-0 sm:min-h-[32rem] sm:px-4 sm:text-[13px]"
          />
        </div>

        <div className="min-h-0">
          <CodeOutput
            key={runId}
            value={result.output}
            language="sql"
            filename={mode === "minified" ? "query.min.sql" : "query.sql"}
            title={mode === "minified" ? "Minified SQL" : "Formatted SQL"}
            eyebrow="Output"
            label="SQL"
            rows={22}
            emptyMessage={
              result.error ? "Fix the input to see highlighted output" : "Formatted SQL appears here"
            }
            animate
            fill
          />
        </div>
      </div>
    </div>
  );
}
