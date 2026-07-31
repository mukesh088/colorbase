/**
 * Core types for the Universal Table Generator.
 */

export type TextAlign = "left" | "center" | "right" | "justify";
export type VerticalAlign = "top" | "middle" | "bottom";
export type PreviewDevice = "desktop" | "tablet" | "mobile" | "print";
export type ThemeMode = "light" | "dark" | "auto";

export type ExportFormat =
  | "html"
  | "css"
  | "markdown"
  | "latex"
  | "csv"
  | "tsv"
  | "json"
  | "sql"
  | "excel-xml"
  | "mediawiki"
  | "ascii"
  | "bbcode"
  | "rst"
  | "org"
  | "asciidoc"
  | "tailwind"
  | "bootstrap"
  | "shadcn"
  | "react";

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  background?: string;
  align?: TextAlign;
  verticalAlign?: VerticalAlign;
  padding?: number;
  borderColor?: string;
  borderWidth?: number;
  wrap?: boolean;
  rotation?: number;
  href?: string;
}

export interface TableCell {
  id: string;
  value: string;
  style: CellStyle;
  /** colspan > 1 means merged horizontally */
  colspan?: number;
  /** rowspan > 1 means merged vertically */
  rowspan?: number;
  /** hidden when covered by another merged cell */
  hidden?: boolean;
}

export interface TableStyle {
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  headerBackground: string;
  headerColor: string;
  alternateRows: boolean;
  hoverEffect: boolean;
  striped: boolean;
  compact: boolean;
  responsive: boolean;
  theme: ThemeMode;
  rounded: boolean;
  shadow: boolean;
  animation: boolean;
  fontFamily: string;
  fontSize: number;
  cellPadding: number;
}

export interface TableDocument {
  id: string;
  name: string;
  rows: TableCell[][];
  colWidths: number[];
  rowHeights: number[];
  hasHeader: boolean;
  freezeHeader: boolean;
  stickyFirstColumn: boolean;
  style: TableStyle;
  updatedAt: number;
  favorite?: boolean;
}

export interface CellCoord {
  row: number;
  col: number;
}

export interface SelectionRange {
  start: CellCoord;
  end: CellCoord;
}

export interface TableHistoryEntry {
  rows: TableCell[][];
  colWidths: number[];
  rowHeights: number[];
  hasHeader: boolean;
  style: TableStyle;
  name: string;
}

export interface TablePreset {
  id: string;
  name: string;
  description: string;
  category: string;
  create: () => Omit<TableDocument, "id" | "updatedAt">;
}

export const DEFAULT_TABLE_STYLE: TableStyle = {
  borderColor: "#e2e8f0",
  borderWidth: 1,
  borderRadius: 12,
  headerBackground: "#e11d48",
  headerColor: "#ffffff",
  alternateRows: true,
  hoverEffect: true,
  striped: true,
  compact: false,
  responsive: true,
  theme: "light",
  rounded: true,
  shadow: true,
  animation: true,
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: 14,
  cellPadding: 10,
};

export function createCell(value = "", style: CellStyle = {}): TableCell {
  return {
    id: `c_${Math.random().toString(36).slice(2, 10)}`,
    value,
    style,
    colspan: 1,
    rowspan: 1,
    hidden: false,
  };
}

export function createEmptyGrid(rows: number, cols: number): TableCell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => createCell(""))
  );
}

export function createBlankDocument(
  rows = 5,
  cols = 4,
  name = "Untitled table"
): TableDocument {
  return {
    id: `t_${Math.random().toString(36).slice(2, 10)}`,
    name,
    rows: createEmptyGrid(rows, cols),
    colWidths: Array.from({ length: cols }, () => 140),
    rowHeights: Array.from({ length: rows }, () => 40),
    hasHeader: true,
    freezeHeader: true,
    stickyFirstColumn: false,
    style: { ...DEFAULT_TABLE_STYLE },
    updatedAt: Date.now(),
  };
}
