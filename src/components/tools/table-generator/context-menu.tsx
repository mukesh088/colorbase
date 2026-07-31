"use client";

import { useTableGeneratorStore } from "@/store/table-generator-store";

export function TableContextMenu() {
  const menu = useTableGeneratorStore((s) => s.contextMenu);
  const setContextMenu = useTableGeneratorStore((s) => s.setContextMenu);
  const activeCell = useTableGeneratorStore((s) => s.activeCell);
  const addRow = useTableGeneratorStore((s) => s.addRow);
  const addCol = useTableGeneratorStore((s) => s.addCol);
  const removeRow = useTableGeneratorStore((s) => s.removeRow);
  const removeCol = useTableGeneratorStore((s) => s.removeCol);
  const copySelection = useTableGeneratorStore((s) => s.copySelection);
  const cutSelection = useTableGeneratorStore((s) => s.cutSelection);
  const pasteClipboard = useTableGeneratorStore((s) => s.pasteClipboard);
  const merge = useTableGeneratorStore((s) => s.merge);
  const split = useTableGeneratorStore((s) => s.split);

  if (!menu) return null;

  const items = [
    { label: "Copy", run: () => void copySelection() },
    { label: "Cut", run: () => void cutSelection() },
    { label: "Paste", run: () => void pasteClipboard() },
    { label: "Insert row above", run: () => addRow(activeCell?.row ?? 0) },
    { label: "Insert row below", run: () => addRow((activeCell?.row ?? 0) + 1) },
    { label: "Duplicate row", run: () => addRow(activeCell?.row ?? 0, true) },
    { label: "Delete row", run: () => removeRow(activeCell?.row) },
    { label: "Insert column left", run: () => addCol(activeCell?.col ?? 0) },
    { label: "Insert column right", run: () => addCol((activeCell?.col ?? 0) + 1) },
    { label: "Duplicate column", run: () => addCol(activeCell?.col ?? 0, true) },
    { label: "Delete column", run: () => removeCol(activeCell?.col) },
    { label: "Merge cells", run: () => merge() },
    { label: "Split cells", run: () => split() },
  ];

  return (
    <div
      className="fixed z-50 min-w-48 overflow-hidden rounded-2xl border border-border/50 bg-background py-1 shadow-xl"
      style={{ left: menu.x, top: menu.y }}
      role="menu"
      onMouseLeave={() => setContextMenu(null)}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          className="block w-full px-3 py-2 text-left text-sm hover:bg-rose-500/10"
          onClick={() => {
            item.run();
            setContextMenu(null);
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
