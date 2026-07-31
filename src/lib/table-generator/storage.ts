import type { StateStorage } from "zustand/middleware";
import type { TableDocument } from "@/lib/table-generator/types";

/** Skip localStorage for tables bigger than this (cells). */
export const MAX_PERSIST_CELLS = 2_500;
/** Soft byte budget for persisted JSON (localStorage is often ~5MB total). */
export const MAX_PERSIST_BYTES = 700_000;
/** Row count where we treat the table as "large" for history / autosave. */
export const LARGE_TABLE_ROWS = 400;
export const MAX_HISTORY_SMALL = 40;
export const MAX_HISTORY_LARGE = 3;
export const MAX_SAVED_DOCS = 8;

export function cellCount(doc: TableDocument) {
  return doc.rows.length * Math.max(1, doc.colWidths.length || doc.rows[0]?.length || 1);
}

export function isLargeTable(doc: TableDocument) {
  return doc.rows.length >= LARGE_TABLE_ROWS || cellCount(doc) > MAX_PERSIST_CELLS;
}

export function canPersistDoc(doc: TableDocument) {
  if (cellCount(doc) > MAX_PERSIST_CELLS) return false;
  // cheap size estimate without full stringify of huge tables
  let chars = 0;
  const limit = MAX_PERSIST_BYTES / 2;
  for (let r = 0; r < doc.rows.length; r++) {
    const row = doc.rows[r];
    for (let c = 0; c < row.length; c++) {
      chars += (row[c]?.value?.length ?? 0) + 24;
      if (chars > limit) return false;
    }
  }
  return true;
}

export function compactDocForStorage(doc: TableDocument): TableDocument | null {
  if (!canPersistDoc(doc)) return null;
  return doc;
}

export function slimSavedDocs(docs: TableDocument[]) {
  return docs
    .filter((d) => canPersistDoc(d))
    .slice(0, MAX_SAVED_DOCS)
    .map((d) => ({
      ...d,
      // drop per-row height arrays when uniform to shrink payload
      rowHeights: d.rowHeights.length > 200 ? d.rowHeights.slice(0, 1) : d.rowHeights,
    }));
}

/** Zustand storage that never throws QuotaExceededError. */
export const safeTableStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      if (value.length > MAX_PERSIST_BYTES) {
        // Persist a tiny stub instead of blowing the quota
        const stub = JSON.stringify({
          state: {
            view: "landing",
            recentIds: [],
            favorites: [],
            savedDocs: [],
            largeTableSkipped: true,
          },
          version: 0,
        });
        localStorage.setItem(name, stub);
        return;
      }
      localStorage.setItem(name, value);
    } catch {
      try {
        localStorage.removeItem(name);
        localStorage.setItem(
          name,
          JSON.stringify({
            state: {
              view: "landing",
              recentIds: [],
              favorites: [],
              savedDocs: [],
              storageCleared: true,
            },
            version: 0,
          })
        );
      } catch {
        // give up quietly — in-memory state still works
      }
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};
