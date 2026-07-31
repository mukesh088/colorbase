import type { CellCoord, CellStyle, SelectionRange, TableCell, TableDocument, TableHistoryEntry, TableStyle } from "./types";
import { createBlankDocument, createCell } from "./types";

export function cloneRows(rows: TableCell[][]): TableCell[][] {
  return rows.map((row) => row.map((cell) => ({ ...cell, style: { ...cell.style } })));
}

export function snapshot(doc: TableDocument): TableHistoryEntry {
  return {
    rows: cloneRows(doc.rows),
    colWidths: [...doc.colWidths],
    rowHeights: [...doc.rowHeights],
    hasHeader: doc.hasHeader,
    style: { ...doc.style },
    name: doc.name,
  };
}

export function normalizeSelection(sel: SelectionRange): { r1: number; r2: number; c1: number; c2: number } {
  return {
    r1: Math.min(sel.start.row, sel.end.row),
    r2: Math.max(sel.start.row, sel.end.row),
    c1: Math.min(sel.start.col, sel.end.col),
    c2: Math.max(sel.start.col, sel.end.col),
  };
}

export function isInSelection(row: number, col: number, sel: SelectionRange | null) {
  if (!sel) return false;
  const { r1, r2, c1, c2 } = normalizeSelection(sel);
  return row >= r1 && row <= r2 && col >= c1 && col <= c2;
}

export function ensureGrid(doc: TableDocument) {
  const cols = Math.max(1, doc.colWidths.length, ...doc.rows.map((r) => r.length));
  doc.rows = doc.rows.map((row) => {
    const next = [...row];
    while (next.length < cols) next.push(createCell(""));
    return next.slice(0, cols);
  });
  while (doc.colWidths.length < cols) doc.colWidths.push(140);
  doc.colWidths = doc.colWidths.slice(0, cols);
  while (doc.rowHeights.length < doc.rows.length) doc.rowHeights.push(40);
  doc.rowHeights = doc.rowHeights.slice(0, doc.rows.length);
}

export function insertRow(doc: TableDocument, index: number, duplicate = false) {
  const cols = doc.colWidths.length;
  const source = duplicate ? doc.rows[Math.min(index, doc.rows.length - 1)] : null;
  const row = source
    ? source.map((c) => createCell(c.value, { ...c.style }))
    : Array.from({ length: cols }, () => createCell(""));
  doc.rows.splice(index, 0, row);
  doc.rowHeights.splice(index, 0, 40);
}

export function deleteRow(doc: TableDocument, index: number) {
  if (doc.rows.length <= 1) return;
  doc.rows.splice(index, 1);
  doc.rowHeights.splice(index, 1);
}

export function insertCol(doc: TableDocument, index: number, duplicate = false) {
  doc.rows.forEach((row) => {
    const source = duplicate ? row[Math.min(index, row.length - 1)] : null;
    row.splice(index, 0, createCell(source?.value ?? "", source ? { ...source.style } : {}));
  });
  doc.colWidths.splice(index, 0, duplicate ? doc.colWidths[Math.min(index, doc.colWidths.length - 1)] ?? 140 : 140);
}

export function deleteCol(doc: TableDocument, index: number) {
  if (doc.colWidths.length <= 1) return;
  doc.rows.forEach((row) => row.splice(index, 1));
  doc.colWidths.splice(index, 1);
}

export function transpose(doc: TableDocument) {
  const rows = doc.rows.length;
  const cols = doc.colWidths.length;
  const next: TableCell[][] = Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (_, r) => createCell(doc.rows[r]?.[c]?.value ?? "", { ...(doc.rows[r]?.[c]?.style ?? {}) }))
  );
  doc.rows = next;
  const cw = [...doc.colWidths];
  const rh = [...doc.rowHeights];
  doc.colWidths = Array.from({ length: rows }, (_, i) => rh[i] ?? 140);
  doc.rowHeights = Array.from({ length: cols }, (_, i) => cw[i] ?? 40);
}

export function reverseRows(doc: TableDocument) {
  const header = doc.hasHeader ? doc.rows[0] : null;
  const body = doc.hasHeader ? doc.rows.slice(1) : [...doc.rows];
  body.reverse();
  doc.rows = header ? [header, ...body] : body;
}

export function reverseCols(doc: TableDocument) {
  doc.rows = doc.rows.map((row) => [...row].reverse());
  doc.colWidths.reverse();
}

export function sortByColumn(doc: TableDocument, col: number, dir: "asc" | "desc") {
  const header = doc.hasHeader ? doc.rows[0] : null;
  const body = doc.hasHeader ? doc.rows.slice(1) : [...doc.rows];
  body.sort((a, b) => {
    const av = a[col]?.value ?? "";
    const bv = b[col]?.value ?? "";
    const an = Number(av);
    const bn = Number(bv);
    const cmp =
      !Number.isNaN(an) && !Number.isNaN(bn) && av.trim() !== "" && bv.trim() !== ""
        ? an - bn
        : av.localeCompare(bv, undefined, { sensitivity: "base" });
    return dir === "asc" ? cmp : -cmp;
  });
  doc.rows = header ? [header, ...body] : body;
}

export function shuffleRows(doc: TableDocument) {
  const header = doc.hasHeader ? doc.rows[0] : null;
  const body = doc.hasHeader ? doc.rows.slice(1) : [...doc.rows];
  for (let i = body.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [body[i], body[j]] = [body[j], body[i]];
  }
  doc.rows = header ? [header, ...body] : body;
}

export function removeEmptyRows(doc: TableDocument) {
  const keep = doc.rows
    .map((row, i) => ({ row, i, empty: row.every((c) => !c.value.trim()) }))
    .filter((x, idx) => (doc.hasHeader && idx === 0) || !x.empty);
  doc.rows = keep.map((k) => k.row);
  doc.rowHeights = keep.map((k) => doc.rowHeights[k.i] ?? 40);
}

export function removeEmptyCols(doc: TableDocument) {
  const cols = doc.colWidths.length;
  const keepIdx: number[] = [];
  for (let c = 0; c < cols; c++) {
    const empty = doc.rows.every((row) => !row[c]?.value.trim());
    if (!empty) keepIdx.push(c);
  }
  if (!keepIdx.length) return;
  doc.rows = doc.rows.map((row) => keepIdx.map((i) => row[i]));
  doc.colWidths = keepIdx.map((i) => doc.colWidths[i]);
}

export function transformCells(
  doc: TableDocument,
  sel: SelectionRange | null,
  fn: (value: string) => string
) {
  const applyAll = !sel;
  const norm = sel ? normalizeSelection(sel) : null;
  doc.rows.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (applyAll || (norm && r >= norm.r1 && r <= norm.r2 && c >= norm.c1 && c <= norm.c2)) {
        cell.value = fn(cell.value);
      }
    });
  });
}

export function applyStyleToSelection(
  doc: TableDocument,
  sel: SelectionRange | null,
  style: Partial<CellStyle>
) {
  if (!sel) return;
  const { r1, r2, c1, c2 } = normalizeSelection(sel);
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      const cell = doc.rows[r]?.[c];
      if (cell) cell.style = { ...cell.style, ...style };
    }
  }
}

export function autoNumberRows(doc: TableDocument, col = 0) {
  const start = doc.hasHeader ? 1 : 0;
  for (let i = start; i < doc.rows.length; i++) {
    if (doc.rows[i][col]) doc.rows[i][col].value = String(i - start + 1);
  }
}

export function autoNumberCols(doc: TableDocument, row = 0) {
  doc.rows[row]?.forEach((cell, i) => {
    cell.value = String(i + 1);
  });
}

export function mergeSelection(doc: TableDocument, sel: SelectionRange) {
  const { r1, r2, c1, c2 } = normalizeSelection(sel);
  const master = doc.rows[r1]?.[c1];
  if (!master) return;
  master.colspan = c2 - c1 + 1;
  master.rowspan = r2 - r1 + 1;
  master.hidden = false;
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      if (r === r1 && c === c1) continue;
      const cell = doc.rows[r]?.[c];
      if (!cell) continue;
      if (cell.value && !master.value) master.value = cell.value;
      cell.hidden = true;
      cell.colspan = 1;
      cell.rowspan = 1;
    }
  }
}

export function splitSelection(doc: TableDocument, sel: SelectionRange) {
  const { r1, r2, c1, c2 } = normalizeSelection(sel);
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      const cell = doc.rows[r]?.[c];
      if (!cell) continue;
      cell.hidden = false;
      cell.colspan = 1;
      cell.rowspan = 1;
    }
  }
}

export function fillRandom(doc: TableDocument, sel: SelectionRange | null, kind: "lorem" | "numbers" | "dates" | "names") {
  const words = ["design", "system", "color", "palette", "layout", "motion", "token", "contrast", "grid", "table"];
  const names = ["Ava", "Noah", "Mia", "Liam", "Zoe", "Omar", "Iris", "Kai"];
  const fn = () => {
    if (kind === "numbers") return String(Math.floor(Math.random() * 1000));
    if (kind === "dates") {
      const d = new Date(2026, Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28));
      return d.toISOString().slice(0, 10);
    }
    if (kind === "names") return names[Math.floor(Math.random() * names.length)];
    return `${words[Math.floor(Math.random() * words.length)]} ${words[Math.floor(Math.random() * words.length)]}`;
  };
  transformCells(doc, sel, () => fn());
}

export function findDuplicates(doc: TableDocument): CellCoord[] {
  const seen = new Map<string, CellCoord>();
  const dups: CellCoord[] = [];
  doc.rows.forEach((row, r) => {
    row.forEach((cell, c) => {
      const key = cell.value.trim().toLowerCase();
      if (!key) return;
      const prev = seen.get(key);
      if (prev) {
        dups.push(prev, { row: r, col: c });
      } else {
        seen.set(key, { row: r, col: c });
      }
    });
  });
  return dups;
}

export function encodeSharePayload(doc: TableDocument): string {
  const payload = {
    n: doc.name.slice(0, 120),
    h: doc.hasHeader,
    r: doc.rows.map((row) => row.map((c) => c.value)),
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

const MAX_SHARE_PAYLOAD_CHARS = 64_000;
const MAX_SHARE_ROWS = 500;
const MAX_SHARE_COLS = 40;
const MAX_SHARE_CELLS = 8_000;

export function decodeSharePayload(raw: string): TableDocument | null {
  try {
    if (!raw || raw.length > MAX_SHARE_PAYLOAD_CHARS) return null;
    const json = JSON.parse(decodeURIComponent(escape(atob(raw)))) as {
      n?: string;
      h?: boolean;
      r: string[][];
    };
    if (!Array.isArray(json.r) || json.r.length === 0) return null;
    const rows = Math.min(json.r.length, MAX_SHARE_ROWS);
    const cols = Math.min(
      Math.max(...json.r.slice(0, rows).map((r) => (Array.isArray(r) ? r.length : 0)), 1),
      MAX_SHARE_COLS
    );
    if (rows * cols > MAX_SHARE_CELLS) return null;

    const name =
      typeof json.n === "string" && json.n.trim()
        ? json.n.trim().slice(0, 120)
        : "Shared table";
    const doc = createBlankDocument(rows, cols, name);
    doc.hasHeader = Boolean(json.h ?? true);
    doc.rows = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => {
        const v = json.r[r]?.[c];
        return createCell(typeof v === "string" ? v.slice(0, 5_000) : String(v ?? "").slice(0, 5_000));
      })
    );
    doc.colWidths = Array.from({ length: cols }, () => 140);
    doc.rowHeights = Array.from({ length: rows }, () => 40);
    return doc;
  } catch {
    return null;
  }
}

export function patchStyle(doc: TableDocument, patch: Partial<TableStyle>) {
  doc.style = { ...doc.style, ...patch };
}
