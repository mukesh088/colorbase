"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Braces,
  Code2,
  FileSpreadsheet,
  Import,
  Sparkles,
  Table2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TABLE_PRESETS } from "@/lib/table-generator/presets";
import { EXPORT_META } from "@/lib/table-generator/export";
import { useTableGeneratorStore } from "@/store/table-generator-store";

const FORMAT_SHOWCASE = EXPORT_META.slice(0, 12);

export function TableGeneratorLanding() {
  const newTable = useTableGeneratorStore((s) => s.newTable);
  const loadPreset = useTableGeneratorStore((s) => s.loadPreset);
  const setImportOpen = useTableGeneratorStore((s) => s.setImportOpen);
  const savedDocs = useTableGeneratorStore((s) => s.savedDocs);
  const loadDocument = useTableGeneratorStore((s) => s.loadDocument);

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-background/70 shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(244,63,94,0.18),transparent_42%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.14),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
        <div className="relative grid gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:py-16">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700 dark:text-rose-300"
            >
              <Table2 className="h-3.5 w-3.5" />
              Developer & design tool
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Universal Table Generator
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Create HTML, Markdown, LaTeX, CSV, TSV, MediaWiki and BBCode tables visually —
              then export React, Tailwind, Bootstrap, SQL, and more in one click.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-7 flex flex-wrap gap-3"
            >
              <Button size="lg" className="rounded-full" onClick={() => newTable()}>
                Create Table
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setImportOpen(true);
                  newTable();
                }}
              >
                <Import className="h-4 w-4" />
                Import Data
              </Button>
            </motion.div>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Unlimited grid", "Merge cells", "19 export formats", "Autosave", "Offline"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12 }}
            className="rounded-[1.5rem] border border-border/50 bg-background p-4 shadow-lg"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600">
                Live example
              </p>
              <Sparkles className="h-4 w-4 text-rose-500" />
            </div>
            <div className="overflow-hidden rounded-2xl border border-border/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-rose-600 text-white">
                    {["Plan", "Price", "Projects"].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Starter", "$0", "1"],
                    ["Pro", "$19", "10"],
                    ["Business", "$49", "∞"],
                  ].map((row, i) => (
                    <tr key={row[0]} className={i % 2 ? "bg-muted/30" : ""}>
                      {row.map((cell) => (
                        <td key={cell} className="px-3 py-2.5">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Edit visually, then copy production-ready code for the web, docs, or data pipelines.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600">Templates</p>
            <h3 className="font-display text-2xl font-semibold tracking-tight">Start from a preset</h3>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {TABLE_PRESETS.map((preset, i) => (
            <motion.button
              key={preset.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => loadPreset(preset.id)}
              className="group rounded-2xl border border-border/50 bg-background/70 p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-rose-500/30 hover:shadow-md"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {preset.category}
              </p>
              <p className="mt-1 font-display text-base font-semibold group-hover:text-rose-700 dark:group-hover:text-rose-300">
                {preset.name}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{preset.description}</p>
            </motion.button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600">Exports</p>
          <h3 className="font-display text-2xl font-semibold tracking-tight">
            Every format you need
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            HTML, docs markup, data formats, and framework-ready components.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FORMAT_SHOWCASE.map((fmt) => (
            <div
              key={fmt.id}
              className="rounded-2xl border border-border/50 bg-muted/15 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                {fmt.id === "json" || fmt.id === "sql" ? (
                  <Braces className="h-4 w-4 text-rose-600" />
                ) : fmt.id === "csv" || fmt.id === "tsv" || fmt.id === "excel-xml" ? (
                  <FileSpreadsheet className="h-4 w-4 text-rose-600" />
                ) : (
                  <Code2 className="h-4 w-4 text-rose-600" />
                )}
                <p className="text-sm font-semibold">{fmt.label}</p>
              </div>
              <p className="font-mono text-[11px] text-muted-foreground">.{fmt.ext}</p>
            </div>
          ))}
        </div>
      </section>

      {savedDocs.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-display text-xl font-semibold">Recently saved</h3>
          <div className="flex flex-wrap gap-2">
            {savedDocs.slice(0, 8).map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => loadDocument(doc)}
                className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-medium hover:border-rose-500/30"
              >
                {doc.name}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
