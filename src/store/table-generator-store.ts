"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  CellCoord,
  CellStyle,
  ExportFormat,
  PreviewDevice,
  SelectionRange,
  TableDocument,
  TableHistoryEntry,
} from "@/lib/table-generator/types";
import { createBlankDocument } from "@/lib/table-generator/types";
import {
  applyStyleToSelection,
  autoNumberCols,
  autoNumberRows,
  cloneRows,
  deleteCol,
  deleteRow,
  ensureGrid,
  fillRandom,
  findDuplicates,
  insertCol,
  insertRow,
  mergeSelection,
  normalizeSelection,
  patchStyle,
  removeEmptyCols,
  removeEmptyRows,
  reverseCols,
  reverseRows,
  shuffleRows,
  snapshot,
  sortByColumn,
  splitSelection,
  transformCells,
  transpose,
} from "@/lib/table-generator/operations";
import { getPreset } from "@/lib/table-generator/presets";
import { importPlainTextToTable } from "@/lib/table-generator/import";
import {
  canPersistDoc,
  isLargeTable,
  MAX_HISTORY_LARGE,
  MAX_HISTORY_SMALL,
  safeTableStorage,
  slimSavedDocs,
} from "@/lib/table-generator/storage";

const STORAGE_DOCS_KEY = "cb-table-docs";

type ViewMode = "landing" | "editor";

interface TableGeneratorState {
  view: ViewMode;
  doc: TableDocument;
  selection: SelectionRange | null;
  activeCell: CellCoord | null;
  editing: boolean;
  history: TableHistoryEntry[];
  future: TableHistoryEntry[];
  exportFormat: ExportFormat;
  previewDevice: PreviewDevice;
  previewDark: boolean;
  searchQuery: string;
  replaceQuery: string;
  searchHits: CellCoord[];
  clipboard: string[][] | null;
  recentIds: string[];
  favorites: string[];
  savedDocs: TableDocument[];
  commandOpen: boolean;
  importOpen: boolean;
  contextMenu: { x: number; y: number } | null;
  duplicateHits: CellCoord[];
  persistSkipped: boolean;

  setView: (view: ViewMode) => void;
  newTable: (rows?: number, cols?: number) => void;
  loadPreset: (id: string) => void;
  loadDocument: (doc: TableDocument) => void;
  importText: (text: string) => void;
  setName: (name: string) => void;
  setSelection: (sel: SelectionRange | null) => void;
  setActiveCell: (cell: CellCoord | null) => void;
  setEditing: (v: boolean) => void;
  setCellValue: (row: number, col: number, value: string) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  addRow: (index?: number, duplicate?: boolean) => void;
  removeRow: (index?: number) => void;
  addCol: (index?: number, duplicate?: boolean) => void;
  removeCol: (index?: number) => void;
  setColWidth: (index: number, width: number) => void;
  setRowHeight: (index: number, height: number) => void;
  applyCellStyle: (style: Partial<CellStyle>) => void;
  updateTableStyle: (patch: Partial<TableDocument["style"]>) => void;
  toggleHeader: () => void;
  toggleFreezeHeader: () => void;
  toggleStickyFirst: () => void;
  runTool: (tool: string) => void;
  setExportFormat: (f: ExportFormat) => void;
  setPreviewDevice: (d: PreviewDevice) => void;
  setPreviewDark: (v: boolean) => void;
  setSearch: (q: string) => void;
  setReplace: (q: string) => void;
  replaceAll: () => void;
  copySelection: () => Promise<void>;
  cutSelection: () => Promise<void>;
  pasteClipboard: (text?: string) => Promise<void>;
  merge: () => void;
  split: () => void;
  saveCurrent: () => void;
  toggleFavorite: () => void;
  setCommandOpen: (v: boolean) => void;
  setImportOpen: (v: boolean) => void;
  setContextMenu: (v: { x: number; y: number } | null) => void;
}

function historyLimit(doc: TableDocument) {
  return isLargeTable(doc) ? MAX_HISTORY_LARGE : MAX_HISTORY_SMALL;
}

function withMutate(
  get: () => TableGeneratorState,
  set: (partial: Partial<TableGeneratorState>) => void,
  mutate: (doc: TableDocument) => void,
  opts?: { skipHistory?: boolean }
) {
  const state = get();
  const large = isLargeTable(state.doc);
  const limit = historyLimit(state.doc);
  const history =
    opts?.skipHistory || large
      ? state.history.slice(-limit)
      : [...state.history, snapshot(state.doc)].slice(-limit);

  const doc: TableDocument = {
    ...state.doc,
    rows: large
      ? state.doc.rows.map((row) => row.slice())
      : cloneRows(state.doc.rows),
    colWidths: state.doc.colWidths.slice(),
    rowHeights: state.doc.rowHeights.slice(),
    style: { ...state.doc.style },
    updatedAt: Date.now(),
  };
  mutate(doc);
  if (!large) ensureGrid(doc);
  set({
    doc,
    history,
    future: [],
    persistSkipped: !canPersistDoc(doc),
  });
}

export const useTableGeneratorStore = create<TableGeneratorState>()(
  persist(
    (set, get) => ({
      view: "landing",
      doc: createBlankDocument(6, 4, "Untitled table"),
      selection: { start: { row: 0, col: 0 }, end: { row: 0, col: 0 } },
      activeCell: { row: 0, col: 0 },
      editing: false,
      history: [],
      future: [],
      exportFormat: "html",
      previewDevice: "desktop",
      previewDark: false,
      searchQuery: "",
      replaceQuery: "",
      searchHits: [],
      clipboard: null,
      recentIds: [],
      favorites: [],
      savedDocs: [],
      commandOpen: false,
      importOpen: false,
      contextMenu: null,
      duplicateHits: [],
      persistSkipped: false,

      setView: (view) => set({ view }),
      newTable: (rows = 6, cols = 4) =>
        set({
          view: "editor",
          doc: createBlankDocument(rows, cols),
          history: [],
          future: [],
          persistSkipped: false,
          selection: { start: { row: 0, col: 0 }, end: { row: 0, col: 0 } },
          activeCell: { row: 0, col: 0 },
        }),
      loadPreset: (id) => {
        const preset = getPreset(id);
        if (!preset) return;
        const base = createBlankDocument();
        const created = preset.create();
        const doc: TableDocument = {
          ...base,
          ...created,
          id: `t_${Math.random().toString(36).slice(2, 10)}`,
          updatedAt: Date.now(),
        };
        set({
          view: "editor",
          doc,
          history: [],
          future: [],
          persistSkipped: false,
          selection: { start: { row: 0, col: 0 }, end: { row: 0, col: 0 } },
          activeCell: { row: 0, col: 0 },
        });
      },
      loadDocument: (doc) =>
        set({
          view: "editor",
          doc: { ...doc, updatedAt: Date.now() },
          history: [],
          future: [],
          persistSkipped: !canPersistDoc(doc),
          selection: { start: { row: 0, col: 0 }, end: { row: 0, col: 0 } },
          activeCell: { row: 0, col: 0 },
          searchHits: [],
          duplicateHits: [],
        }),
      importText: (text) => {
        const doc = importPlainTextToTable(text);
        set({
          view: "editor",
          doc,
          history: [],
          future: [],
          persistSkipped: !canPersistDoc(doc),
          importOpen: false,
        });
      },
      setName: (name) => set({ doc: { ...get().doc, name, updatedAt: Date.now() } }),
      setSelection: (selection) => set({ selection }),
      setActiveCell: (activeCell) => set({ activeCell }),
      setEditing: (editing) => set({ editing }),
      setCellValue: (row, col, value) => {
        const state = get();
        const prevRow = state.doc.rows[row];
        if (!prevRow?.[col]) return;
        const nextRow = prevRow.slice();
        nextRow[col] = { ...nextRow[col], value };
        const rows = state.doc.rows.slice();
        rows[row] = nextRow;
        const nextDoc = { ...state.doc, rows, updatedAt: Date.now() };
        set({ doc: nextDoc, persistSkipped: !canPersistDoc(nextDoc) });
      },
      pushHistory: () => {
        const { doc, history } = get();
        if (isLargeTable(doc)) return;
        set({ history: [...history, snapshot(doc)].slice(-historyLimit(doc)), future: [] });
      },
      undo: () => {
        const { history, future, doc } = get();
        if (!history.length) return;
        const prev = history[history.length - 1];
        set({
          history: history.slice(0, -1),
          future: isLargeTable(doc) ? [] : [snapshot(doc), ...future].slice(0, historyLimit(doc)),
          doc: {
            ...doc,
            rows: cloneRows(prev.rows),
            colWidths: [...prev.colWidths],
            rowHeights: [...prev.rowHeights],
            hasHeader: prev.hasHeader,
            style: { ...prev.style },
            name: prev.name,
            updatedAt: Date.now(),
          },
        });
      },
      redo: () => {
        const { history, future, doc } = get();
        if (!future.length) return;
        const next = future[0];
        set({
          future: future.slice(1),
          history: [...history, snapshot(doc)].slice(-historyLimit(doc)),
          doc: {
            ...doc,
            rows: cloneRows(next.rows),
            colWidths: [...next.colWidths],
            rowHeights: [...next.rowHeights],
            hasHeader: next.hasHeader,
            style: { ...next.style },
            name: next.name,
            updatedAt: Date.now(),
          },
        });
      },
      addRow: (index, duplicate) =>
        withMutate(get, set, (doc) =>
          insertRow(doc, index ?? doc.rows.length, Boolean(duplicate))
        ),
      removeRow: (index) => {
        const { activeCell } = get();
        withMutate(get, set, (doc) => deleteRow(doc, index ?? activeCell?.row ?? doc.rows.length - 1));
      },
      addCol: (index, duplicate) =>
        withMutate(get, set, (doc) =>
          insertCol(doc, index ?? doc.colWidths.length, Boolean(duplicate))
        ),
      removeCol: (index) => {
        const { activeCell } = get();
        withMutate(get, set, (doc) =>
          deleteCol(doc, index ?? activeCell?.col ?? doc.colWidths.length - 1)
        );
      },
      setColWidth: (index, width) =>
        set({
          doc: {
            ...get().doc,
            colWidths: get().doc.colWidths.map((w, i) => (i === index ? Math.max(60, width) : w)),
          },
        }),
      setRowHeight: (index, height) =>
        set({
          doc: {
            ...get().doc,
            rowHeights: get().doc.rowHeights.map((h, i) => (i === index ? Math.max(28, height) : h)),
          },
        }),
      applyCellStyle: (style) =>
        withMutate(get, set, (doc) => applyStyleToSelection(doc, get().selection, style)),
      updateTableStyle: (patch) =>
        withMutate(get, set, (doc) => patchStyle(doc, patch)),
      toggleHeader: () => withMutate(get, set, (doc) => { doc.hasHeader = !doc.hasHeader; }),
      toggleFreezeHeader: () =>
        set({ doc: { ...get().doc, freezeHeader: !get().doc.freezeHeader } }),
      toggleStickyFirst: () =>
        set({ doc: { ...get().doc, stickyFirstColumn: !get().doc.stickyFirstColumn } }),
      runTool: (tool) => {
        withMutate(get, set, (doc) => {
          const sel = get().selection;
          switch (tool) {
            case "transpose":
              transpose(doc);
              break;
            case "reverse-rows":
              reverseRows(doc);
              break;
            case "reverse-cols":
              reverseCols(doc);
              break;
            case "sort-asc":
              sortByColumn(doc, get().activeCell?.col ?? 0, "asc");
              break;
            case "sort-desc":
              sortByColumn(doc, get().activeCell?.col ?? 0, "desc");
              break;
            case "shuffle":
              shuffleRows(doc);
              break;
            case "remove-empty-rows":
              removeEmptyRows(doc);
              break;
            case "remove-empty-cols":
              removeEmptyCols(doc);
              break;
            case "trim":
              transformCells(doc, sel, (v) => v.trim());
              break;
            case "upper":
              transformCells(doc, sel, (v) => v.toUpperCase());
              break;
            case "lower":
              transformCells(doc, sel, (v) => v.toLowerCase());
              break;
            case "capitalize":
              transformCells(doc, sel, (v) =>
                v.replace(/\b\w/g, (ch) => ch.toUpperCase())
              );
              break;
            case "auto-rows":
              autoNumberRows(doc, 0);
              break;
            case "auto-cols":
              autoNumberCols(doc, 0);
              break;
            case "random":
              fillRandom(doc, sel, "lorem");
              break;
            case "numbers":
              fillRandom(doc, sel, "numbers");
              break;
            case "dates":
              fillRandom(doc, sel, "dates");
              break;
            case "names":
              fillRandom(doc, sel, "names");
              break;
            case "find-dupes":
              set({ duplicateHits: findDuplicates(doc) });
              break;
            default:
              break;
          }
        });
      },
      setExportFormat: (exportFormat) => set({ exportFormat }),
      setPreviewDevice: (previewDevice) => set({ previewDevice }),
      setPreviewDark: (previewDark) => set({ previewDark }),
      setSearch: (searchQuery) => {
        const q = searchQuery.trim().toLowerCase();
        const hits: CellCoord[] = [];
        if (q) {
          const rows = get().doc.rows;
          const maxHits = 500;
          outer: for (let r = 0; r < rows.length; r++) {
            const row = rows[r];
            for (let c = 0; c < row.length; c++) {
              if (row[c].value.toLowerCase().includes(q)) {
                hits.push({ row: r, col: c });
                if (hits.length >= maxHits) break outer;
              }
            }
          }
        }
        set({ searchQuery, searchHits: hits });
      },
      setReplace: (replaceQuery) => set({ replaceQuery }),
      replaceAll: () => {
        const { searchQuery, replaceQuery } = get();
        if (!searchQuery) return;
        withMutate(get, set, (doc) => {
          transformCells(doc, null, (v) => v.split(searchQuery).join(replaceQuery));
        });
        get().setSearch(searchQuery);
      },
      copySelection: async () => {
        const { selection, doc } = get();
        if (!selection) return;
        const { r1, r2, c1, c2 } = normalizeSelection(selection);
        const grid = [];
        for (let r = r1; r <= r2; r++) {
          const row = [];
          for (let c = c1; c <= c2; c++) row.push(doc.rows[r]?.[c]?.value ?? "");
          grid.push(row);
        }
        const text = grid.map((r) => r.join("\t")).join("\n");
        set({ clipboard: grid });
        await navigator.clipboard.writeText(text);
      },
      cutSelection: async () => {
        await get().copySelection();
        withMutate(get, set, (doc) => {
          transformCells(doc, get().selection, () => "");
        });
      },
      pasteClipboard: async (text) => {
        const raw = text ?? (await navigator.clipboard.readText());
        const grid = raw
          .replace(/\r/g, "")
          .split("\n")
          .filter((l, i, arr) => l.length || i < arr.length - 1)
          .map((line) => line.split("\t"));
        const start = get().activeCell ?? { row: 0, col: 0 };
        withMutate(get, set, (doc) => {
          grid.forEach((row, ri) => {
            row.forEach((value, ci) => {
              const r = start.row + ri;
              const c = start.col + ci;
              while (doc.rows.length <= r) insertRow(doc, doc.rows.length);
              while (doc.colWidths.length <= c) insertCol(doc, doc.colWidths.length);
              if (doc.rows[r]?.[c]) doc.rows[r][c].value = value;
            });
          });
        });
        set({ clipboard: grid });
      },
      merge: () => {
        const sel = get().selection;
        if (!sel) return;
        withMutate(get, set, (doc) => mergeSelection(doc, sel));
      },
      split: () => {
        const sel = get().selection;
        if (!sel) return;
        withMutate(get, set, (doc) => splitSelection(doc, sel));
      },
      saveCurrent: () => {
        const doc = get().doc;
        if (!canPersistDoc(doc)) {
          set({ persistSkipped: true });
          return;
        }
        try {
          const savedDocs = slimSavedDocs([
            doc,
            ...get().savedDocs.filter((d) => d.id !== doc.id),
          ]);
          const recentIds = [doc.id, ...get().recentIds.filter((id) => id !== doc.id)].slice(0, 12);
          set({ savedDocs, recentIds, persistSkipped: false });
        } catch {
          set({ persistSkipped: true });
        }
      },
      toggleFavorite: () => {
        const id = get().doc.id;
        if (!canPersistDoc(get().doc)) {
          set({ persistSkipped: true });
          return;
        }
        const favorites = get().favorites.includes(id)
          ? get().favorites.filter((f) => f !== id)
          : [id, ...get().favorites];
        set({
          favorites,
          doc: { ...get().doc, favorite: !get().doc.favorite },
        });
      },
      setCommandOpen: (commandOpen) => set({ commandOpen }),
      setImportOpen: (importOpen) => set({ importOpen }),
      setContextMenu: (contextMenu) => set({ contextMenu }),
    }),
    {
      name: STORAGE_DOCS_KEY,
      storage: createJSONStorage(() => safeTableStorage),
      partialize: (s) => {
        const persistDoc = canPersistDoc(s.doc) ? s.doc : null;
        return {
          doc: persistDoc ?? createBlankDocument(6, 4, "Untitled table"),
          view: persistDoc ? (s.view === "editor" ? "editor" : "landing") : "landing",
          savedDocs: slimSavedDocs(s.savedDocs),
          recentIds: s.recentIds.slice(0, 12),
          favorites: s.favorites.slice(0, 20),
        };
      },
    }
  )
);
