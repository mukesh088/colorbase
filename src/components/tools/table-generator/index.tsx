"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { TableGeneratorLanding } from "./landing";
import { TableToolbar } from "./toolbar";
import { TableSidebar } from "./sidebar";
import { TableGrid } from "./table-grid";
import { TableExportPanel } from "./export-panel";
import { TableImportDialog } from "./import-dialog";
import { TableCommandPalette } from "./command-palette";
import { TableContextMenu } from "./context-menu";
import { useTableGeneratorStore } from "@/store/table-generator-store";
import { decodeSharePayload } from "@/lib/table-generator/operations";

export function TableGeneratorApp() {
  const view = useTableGeneratorStore((s) => s.view);
  const loadDocument = useTableGeneratorStore((s) => s.loadDocument);
  const persistSkipped = useTableGeneratorStore((s) => s.persistSkipped);
  const rowCount = useTableGeneratorStore((s) => s.doc.rows.length);
  const setImportOpen = useTableGeneratorStore((s) => s.setImportOpen);
  const setCommandOpen = useTableGeneratorStore((s) => s.setCommandOpen);
  const setContextMenu = useTableGeneratorStore((s) => s.setContextMenu);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Recover from previous QuotaExceededError payloads
    try {
      const raw = localStorage.getItem("cb-table-docs");
      if (raw && raw.length > 700_000) localStorage.removeItem("cb-table-docs");
    } catch {
      try {
        localStorage.removeItem("cb-table-docs");
      } catch {
        /* ignore */
      }
    }
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("d");
    if (shared) {
      const doc = decodeSharePayload(shared);
      if (doc) loadDocument(doc);
    }
  }, [loadDocument]);

  useEffect(() => {
    if (view !== "editor") return;
    const id = window.setInterval(() => {
      const { doc, persistSkipped, saveCurrent } = useTableGeneratorStore.getState();
      // Never autosave huge CSVs into localStorage
      if (persistSkipped || doc.rows.length >= 400) return;
      saveCurrent();
    }, 30000);
    return () => window.clearInterval(id);
  }, [view]);

  // Clear overlays on mount so nothing covers the footer
  useEffect(() => {
    setImportOpen(false);
    setCommandOpen(false);
    setContextMenu(null);
  }, [setImportOpen, setCommandOpen, setContextMenu]);

  if (view === "landing") {
    return (
      <div className="pb-8">
        <TableGeneratorLanding />
        <TableImportDialog />
        <TableCommandPalette />
      </div>
    );
  }

  return (
    <div className="relative space-y-4 pb-10">
      {(persistSkipped || rowCount >= 400) && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
          Large table loaded ({rowCount.toLocaleString()} rows). Browser autosave is skipped to avoid storage
          quota errors — export CSV/PDF to keep your work.
        </div>
      )}
      <TableToolbar />
      <div className="grid items-start gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="min-w-0"
        >
          <TableSidebar />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-w-0 space-y-4"
        >
          <TableGrid />
          <TableExportPanel />
        </motion.div>
      </div>

      <TableImportDialog />
      <TableCommandPalette />
      <TableContextMenu />
    </div>
  );
}
