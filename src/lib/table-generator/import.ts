import type { TableCell, TableDocument } from "./types";
import { createBlankDocument, createCell } from "./types";

function gridFromValues(values: string[][], name = "Imported table"): TableDocument {
  const rows = Math.max(1, values.length);
  let cols = 1;
  for (let i = 0; i < values.length; i++) {
    const len = values[i]?.length ?? 0;
    if (len > cols) cols = len;
  }

  // Fast path: avoid createEmptyGrid + double pass (critical for 10k+ rows)
  let seq = 0;
  const grid: TableCell[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    const src = values[r] ?? [];
    const row: TableCell[] = new Array(cols);
    for (let c = 0; c < cols; c++) {
      row[c] = {
        id: `c${(seq++).toString(36)}`,
        value: src[c] ?? "",
        style: {},
        colspan: 1,
        rowspan: 1,
        hidden: false,
      };
    }
    grid[r] = row;
  }

  const doc = createBlankDocument(1, 1, name);
  doc.rows = grid;
  doc.colWidths = new Array(cols).fill(120);
  // One shared height — grid falls back to 36 when index missing / short arrays
  doc.rowHeights = rows > 500 ? [36] : new Array(rows).fill(36);
  doc.hasHeader = true;
  doc.freezeHeader = true;
  return doc;
}

export function detectDelimiter(text: string): "," | "\t" | ";" | "|" {
  const sample = text.split(/\r?\n/).slice(0, 8).join("\n");
  const counts: Record<string, number> = {
    ",": (sample.match(/,/g) ?? []).length,
    "\t": (sample.match(/\t/g) ?? []).length,
    ";": (sample.match(/;/g) ?? []).length,
    "|": (sample.match(/\|/g) ?? []).length,
  };
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as "," | "\t" | ";" | "|") || ",";
}

function parseDelimited(text: string, sep?: string): string[][] {
  const delimiter = sep ?? detectDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === delimiter) {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    if (ch === "\r") continue;
    cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.length) || rows.length === 0) rows.push(row);
  return rows.filter((r) => r.some((c) => c.trim().length > 0) || r.length > 1);
}

export function importCsv(text: string): TableDocument {
  return gridFromValues(parseDelimited(text, ","), "CSV import");
}

export function importTsv(text: string): TableDocument {
  return gridFromValues(parseDelimited(text, "\t"), "TSV import");
}

export function importAutoDelimited(text: string): TableDocument {
  return gridFromValues(parseDelimited(text), "Imported data");
}

export function importJson(text: string): TableDocument {
  const data = JSON.parse(text) as unknown;
  if (Array.isArray(data)) {
    if (data.length === 0) return createBlankDocument(3, 3, "JSON import");
    if (Array.isArray(data[0])) {
      return gridFromValues(
        data.map((row) => (row as unknown[]).map((c) => String(c ?? ""))),
        "JSON import"
      );
    }
    if (typeof data[0] === "object" && data[0]) {
      const keys = Object.keys(data[0] as object);
      const values = [
        keys,
        ...data.map((item) => keys.map((k) => String((item as Record<string, unknown>)[k] ?? ""))),
      ];
      return gridFromValues(values, "JSON import");
    }
  }
  throw new Error("Unsupported JSON shape");
}

export function importMarkdown(text: string): TableDocument {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.includes("|"));
  const rows = lines
    .map((l) =>
      l
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((c) => c.trim())
    )
    .filter((r) => r.length > 0 && !r.every((c) => /^:?-{3,}:?$/.test(c)));
  return gridFromValues(rows, "Markdown import");
}

export function importHtml(html: string): TableDocument {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const table = doc.querySelector("table");
  if (!table) throw new Error("No HTML table found");
  const values: string[][] = [];
  table.querySelectorAll("tr").forEach((tr) => {
    const cells = Array.from(tr.querySelectorAll("th,td")).map((td) => td.textContent?.trim() ?? "");
    if (cells.length) values.push(cells);
  });
  return gridFromValues(values, "HTML import");
}

export function importPlainTextToTable(text: string): TableDocument {
  const trimmed = text.trim();
  if (!trimmed) return createBlankDocument();

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return importJson(trimmed);
    } catch {
      /* fall through */
    }
  }
  if (trimmed.includes("<table")) {
    try {
      return importHtml(trimmed);
    } catch {
      /* fall through */
    }
  }
  if (trimmed.includes("|") && trimmed.split("\n").filter((l) => l.includes("|")).length >= 2) {
    return importMarkdown(trimmed);
  }
  return importAutoDelimited(trimmed);
}

export function valuesFromDocument(doc: TableDocument): string[][] {
  return doc.rows.map((row) => row.map((c) => c.value));
}

export function mapGrid(values: string[][]): TableCell[][] {
  return values.map((row) => row.map((v) => createCell(v)));
}
