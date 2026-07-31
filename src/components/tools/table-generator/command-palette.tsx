"use client";

import { useEffect, useMemo, useState } from "react";
import { useTableGeneratorStore } from "@/store/table-generator-store";
import { TABLE_PRESETS } from "@/lib/table-generator/presets";
import { EXPORT_META } from "@/lib/table-generator/export";
import type { ExportFormat } from "@/lib/table-generator/types";
import { cn } from "@/lib/utils";

export function TableCommandPalette() {
  const open = useTableGeneratorStore((s) => s.commandOpen);
  const setCommandOpen = useTableGeneratorStore((s) => s.setCommandOpen);
  const runTool = useTableGeneratorStore((s) => s.runTool);
  const loadPreset = useTableGeneratorStore((s) => s.loadPreset);
  const setExportFormat = useTableGeneratorStore((s) => s.setExportFormat);
  const setImportOpen = useTableGeneratorStore((s) => s.setImportOpen);
  const undo = useTableGeneratorStore((s) => s.undo);
  const redo = useTableGeneratorStore((s) => s.redo);
  const saveCurrent = useTableGeneratorStore((s) => s.saveCurrent);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(!open);
      }
      if (e.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setCommandOpen]);

  const actions = useMemo(() => {
    const list = [
      { id: "import", label: "Import data", run: () => setImportOpen(true) },
      { id: "remove-table", label: "Remove table", run: () => {
        if (window.confirm("Remove the current table and start fresh?")) {
          useTableGeneratorStore.getState().newTable(6, 4);
        }
      }},
      { id: "save", label: "Save table", run: () => saveCurrent() },
      { id: "undo", label: "Undo", run: () => undo() },
      { id: "redo", label: "Redo", run: () => redo() },
      ...[
        "transpose",
        "sort-asc",
        "sort-desc",
        "trim",
        "upper",
        "lower",
        "capitalize",
        "remove-empty-rows",
        "find-dupes",
        "random",
      ].map((id) => ({
        id,
        label: id.replace(/-/g, " "),
        run: () => runTool(id),
      })),
      ...TABLE_PRESETS.map((p) => ({
        id: `preset-${p.id}`,
        label: `Template: ${p.name}`,
        run: () => loadPreset(p.id),
      })),
      ...EXPORT_META.map((e) => ({
        id: `export-${e.id}`,
        label: `Export ${e.label}`,
        run: () => setExportFormat(e.id as ExportFormat),
      })),
    ];
    const query = q.trim().toLowerCase();
    return query ? list.filter((a) => a.label.toLowerCase().includes(query)) : list;
  }, [q, runTool, loadPreset, setExportFormat, setImportOpen, undo, redo, saveCurrent]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[12vh]"
      onClick={() => setCommandOpen(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border/50 bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Command palette"
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type a command…"
          className="w-full border-b border-border/40 bg-transparent px-4 py-3 text-sm outline-none"
        />
        <ul className="max-h-80 overflow-auto p-2">
          {actions.slice(0, 40).map((action, i) => (
            <li key={action.id}>
              <button
                type="button"
                className={cn(
                  "w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-rose-500/10",
                  i === 0 && "bg-muted/40"
                )}
                onClick={() => {
                  action.run();
                  setCommandOpen(false);
                  setQ("");
                }}
              >
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
