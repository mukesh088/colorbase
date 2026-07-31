"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { isInSelection } from "@/lib/table-generator/operations";
import { useTableGeneratorStore } from "@/store/table-generator-store";

const DEFAULT_ROW_H = 36;
const OVERSCAN = 8;

export function TableGrid() {
  const doc = useTableGeneratorStore((s) => s.doc);
  const selection = useTableGeneratorStore((s) => s.selection);
  const activeCell = useTableGeneratorStore((s) => s.activeCell);
  const editing = useTableGeneratorStore((s) => s.editing);
  const searchHits = useTableGeneratorStore((s) => s.searchHits);
  const duplicateHits = useTableGeneratorStore((s) => s.duplicateHits);
  const setSelection = useTableGeneratorStore((s) => s.setSelection);
  const setActiveCell = useTableGeneratorStore((s) => s.setActiveCell);
  const setEditing = useTableGeneratorStore((s) => s.setEditing);
  const setCellValue = useTableGeneratorStore((s) => s.setCellValue);
  const setColWidth = useTableGeneratorStore((s) => s.setColWidth);
  const setRowHeight = useTableGeneratorStore((s) => s.setRowHeight);
  const setContextMenu = useTableGeneratorStore((s) => s.setContextMenu);
  const addRow = useTableGeneratorStore((s) => s.addRow);
  const addCol = useTableGeneratorStore((s) => s.addCol);
  const copySelection = useTableGeneratorStore((s) => s.copySelection);
  const cutSelection = useTableGeneratorStore((s) => s.cutSelection);
  const pasteClipboard = useTableGeneratorStore((s) => s.pasteClipboard);
  const undo = useTableGeneratorStore((s) => s.undo);
  const redo = useTableGeneratorStore((s) => s.redo);

  const [draft, setDraft] = useState("");
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportH, setViewportH] = useState(480);
  const dragSelect = useRef(false);
  const resizeCol = useRef<{ index: number; startX: number; startW: number } | null>(null);
  const resizeRow = useRef<{ index: number; startY: number; startH: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const rowH = (r: number) => doc.rowHeights[r] ?? doc.rowHeights[0] ?? DEFAULT_ROW_H;
  const uniformH = doc.rowHeights.length <= 1;
  const baseH = doc.rowHeights[0] ?? DEFAULT_ROW_H;

  const hitSet = useMemo(
    () => new Set(searchHits.map((h) => `${h.row}:${h.col}`)),
    [searchHits]
  );
  const dupSet = useMemo(
    () => new Set(duplicateHits.map((h) => `${h.row}:${h.col}`)),
    [duplicateHits]
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setViewportH(el.clientHeight || 480));
    ro.observe(el);
    setViewportH(el.clientHeight || 480);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (editing && activeCell) {
      setDraft(doc.rows[activeCell.row]?.[activeCell.col]?.value ?? "");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [editing, activeCell, doc.rows]);

  const commitEdit = useCallback(() => {
    if (!activeCell || !editing) return;
    setCellValue(activeCell.row, activeCell.col, draft);
    setEditing(false);
  }, [activeCell, editing, draft, setCellValue, setEditing]);

  const moveActive = useCallback(
    (row: number, col: number, extend = false) => {
      const r = Math.max(0, Math.min(doc.rows.length - 1, row));
      const c = Math.max(0, Math.min(doc.colWidths.length - 1, col));
      setActiveCell({ row: r, col: c });
      if (extend && selection) {
        setSelection({ start: selection.start, end: { row: r, col: c } });
      } else {
        setSelection({ start: { row: r, col: c }, end: { row: r, col: c } });
      }
      // Keep active row in view
      const el = scrollerRef.current;
      if (el && uniformH) {
        const top = r * baseH;
        if (top < el.scrollTop) el.scrollTop = top;
        if (top + baseH > el.scrollTop + el.clientHeight) el.scrollTop = top - el.clientHeight + baseH * 2;
      }
    },
    [doc.rows.length, doc.colWidths.length, selection, setActiveCell, setSelection, uniformH, baseH]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (meta && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (meta && e.key.toLowerCase() === "c") {
        e.preventDefault();
        void copySelection();
        return;
      }
      if (meta && e.key.toLowerCase() === "x") {
        e.preventDefault();
        void cutSelection();
        return;
      }
      if (meta && e.key.toLowerCase() === "v") {
        e.preventDefault();
        void pasteClipboard();
        return;
      }
      if (!activeCell) return;
      if (editing) {
        if (e.key === "Enter") {
          e.preventDefault();
          commitEdit();
          moveActive(activeCell.row + 1, activeCell.col);
        } else if (e.key === "Escape") {
          setEditing(false);
        } else if (e.key === "Tab") {
          e.preventDefault();
          commitEdit();
          moveActive(activeCell.row, activeCell.col + (e.shiftKey ? -1 : 1));
        }
        return;
      }
      if (e.key === "Enter" || e.key === "F2") {
        e.preventDefault();
        setEditing(true);
        return;
      }
      if (e.key.length === 1 && !meta) {
        setEditing(true);
        setDraft(e.key);
        return;
      }
      const extend = e.shiftKey;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        moveActive(activeCell.row - 1, activeCell.col, extend);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        moveActive(activeCell.row + 1, activeCell.col, extend);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveActive(activeCell.row, activeCell.col - 1, extend);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        moveActive(activeCell.row, activeCell.col + 1, extend);
      } else if (e.key === "Tab") {
        e.preventDefault();
        moveActive(activeCell.row, activeCell.col + (e.shiftKey ? -1 : 1));
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        void cutSelection();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    activeCell,
    editing,
    commitEdit,
    moveActive,
    copySelection,
    cutSelection,
    pasteClipboard,
    undo,
    redo,
    setEditing,
  ]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (resizeCol.current) {
        const dx = e.clientX - resizeCol.current.startX;
        setColWidth(resizeCol.current.index, resizeCol.current.startW + dx);
      }
      if (resizeRow.current) {
        const dy = e.clientY - resizeRow.current.startY;
        setRowHeight(resizeRow.current.index, resizeRow.current.startH + dy);
      }
    };
    const onUp = () => {
      dragSelect.current = false;
      resizeCol.current = null;
      resizeRow.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [setColWidth, setRowHeight]);

  const totalRows = doc.rows.length;
  const useVirtual = totalRows > 80 && uniformH;

  const { start, end, padTop, padBottom } = useMemo(() => {
    if (!useVirtual) {
      return { start: 0, end: totalRows, padTop: 0, padBottom: 0 };
    }
    const startIdx = Math.max(0, Math.floor(scrollTop / baseH) - OVERSCAN);
    const visible = Math.ceil(viewportH / baseH) + OVERSCAN * 2;
    const endIdx = Math.min(totalRows, startIdx + visible);
    return {
      start: startIdx,
      end: endIdx,
      padTop: startIdx * baseH,
      padBottom: Math.max(0, (totalRows - endIdx) * baseH),
    };
  }, [useVirtual, scrollTop, viewportH, baseH, totalRows]);

  const st = doc.style;
  const visibleRows = useVirtual ? doc.rows.slice(start, end) : doc.rows;

  return (
    <div className="space-y-2">
      {totalRows > 500 && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
          Large table · {totalRows.toLocaleString()} rows · virtual scrolling on · autosave disabled (keeps the app fast)
        </p>
      )}
      <div
        ref={scrollerRef}
        className="relative max-h-[min(62vh,640px)] min-h-[320px] overflow-auto rounded-[1.25rem] border border-border/50 bg-background"
        role="grid"
        aria-label="Table spreadsheet editor"
        aria-rowcount={totalRows}
        onScroll={(e) => {
          if (useVirtual) setScrollTop(e.currentTarget.scrollTop);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ x: e.clientX, y: e.clientY });
        }}
      >
        <table
          className="border-separate border-spacing-0"
          style={{ fontFamily: st.fontFamily, fontSize: st.fontSize }}
        >
          <thead className={cn(doc.freezeHeader && "sticky top-0 z-20")}>
            <tr>
              <th className="sticky left-0 z-30 h-8 w-10 border border-border/40 bg-muted/80" />
              {doc.colWidths.map((w, c) => (
                <th
                  key={`col-${c}`}
                  className="relative border border-border/40 bg-muted/70 px-2 py-1 text-[11px] font-semibold text-muted-foreground"
                  style={{ width: w, minWidth: w }}
                >
                  {String.fromCharCode(65 + (c % 26))}
                  {c >= 26 ? Math.floor(c / 26) : ""}
                  <span
                    className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-rose-500/40"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      resizeCol.current = { index: c, startX: e.clientX, startW: w };
                    }}
                  />
                </th>
              ))}
              <th className="w-10 border border-border/40 bg-muted/50">
                <button
                  type="button"
                  className="h-full w-full text-rose-600"
                  aria-label="Add column"
                  onClick={() => addCol()}
                >
                  +
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {padTop > 0 && (
              <tr aria-hidden>
                <td colSpan={doc.colWidths.length + 2} style={{ height: padTop, padding: 0, border: 0 }} />
              </tr>
            )}
            {visibleRows.map((row, i) => {
              const r = useVirtual ? start + i : i;
              return (
                <tr key={`row-${r}`} style={{ height: rowH(r) }}>
                  <th
                    className={cn(
                      "relative sticky left-0 z-10 border border-border/40 bg-muted/70 px-2 text-[11px] font-semibold text-muted-foreground",
                      doc.stickyFirstColumn && "z-20"
                    )}
                  >
                    {r + 1}
                    <span
                      className="absolute bottom-0 left-0 h-1.5 w-full cursor-row-resize hover:bg-rose-500/40"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        resizeRow.current = {
                          index: r,
                          startY: e.clientY,
                          startH: rowH(r),
                        };
                      }}
                    />
                  </th>
                  {row.map((cell, c) => {
                    if (cell.hidden) return null;
                    const selected = isInSelection(r, c, selection);
                    const active = activeCell?.row === r && activeCell?.col === c;
                    const isHeader = doc.hasHeader && r === 0;
                    const hit = hitSet.has(`${r}:${c}`);
                    const dup = dupSet.has(`${r}:${c}`);
                    const style = cell.style;
                    return (
                      <td
                        key={cell.id}
                        role="gridcell"
                        tabIndex={active ? 0 : -1}
                        colSpan={cell.colspan ?? 1}
                        rowSpan={cell.rowspan ?? 1}
                        aria-selected={selected}
                        className={cn(
                          "relative border border-border/40 align-middle outline-none",
                          selected && "bg-rose-500/10",
                          active && "ring-2 ring-inset ring-rose-500",
                          hit && "bg-amber-300/30",
                          dup && "bg-fuchsia-400/20",
                          isHeader && "font-semibold",
                          doc.stickyFirstColumn && c === 0 && "sticky left-10 z-10 bg-background"
                        )}
                        style={{
                          width: doc.colWidths[c],
                          minWidth: doc.colWidths[c],
                          height: rowH(r),
                          background: style.background || (isHeader ? st.headerBackground : undefined),
                          color: style.color || (isHeader ? st.headerColor : undefined),
                          fontWeight: style.bold || isHeader ? 700 : undefined,
                          fontStyle: style.italic ? "italic" : undefined,
                          textDecoration: style.underline
                            ? "underline"
                            : style.strike
                              ? "line-through"
                              : undefined,
                          textAlign: style.align ?? "left",
                          verticalAlign: style.verticalAlign ?? "middle",
                          padding: style.padding ?? st.cellPadding,
                          fontSize: style.fontSize,
                          fontFamily: style.fontFamily,
                          whiteSpace: style.wrap === false ? "nowrap" : "pre-wrap",
                        }}
                        onMouseDown={(e) => {
                          if (e.button !== 0) return;
                          dragSelect.current = true;
                          const coord = { row: r, col: c };
                          setActiveCell(coord);
                          setSelection({ start: coord, end: coord });
                          setEditing(false);
                        }}
                        onMouseEnter={() => {
                          if (!dragSelect.current || !selection) return;
                          setSelection({ start: selection.start, end: { row: r, col: c } });
                        }}
                        onDoubleClick={() => {
                          setActiveCell({ row: r, col: c });
                          setEditing(true);
                        }}
                      >
                        {editing && active ? (
                          <input
                            ref={inputRef}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={commitEdit}
                            className="h-full w-full bg-transparent outline-none"
                            aria-label={`Edit cell ${r + 1}, ${c + 1}`}
                          />
                        ) : (
                          <span className="block max-w-full truncate">{cell.value}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {padBottom > 0 && (
              <tr aria-hidden>
                <td colSpan={doc.colWidths.length + 2} style={{ height: padBottom, padding: 0, border: 0 }} />
              </tr>
            )}
            <tr>
              <td className="border border-border/40 bg-muted/40 p-0" colSpan={doc.colWidths.length + 1}>
                <button
                  type="button"
                  className="w-full py-2 text-xs font-medium text-rose-600 hover:bg-rose-500/5"
                  onClick={() => addRow()}
                >
                  + Add row
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
