"use client";

import { Import, FileDown, Trash2 } from "lucide-react";
import { TABLE_PRESETS } from "@/lib/table-generator/presets";
import { useTableGeneratorStore } from "@/store/table-generator-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { downloadTablePdf } from "@/lib/table-generator/pdf";
import { toast } from "sonner";

const TOOLS = [
  { id: "transpose", label: "Transpose" },
  { id: "reverse-rows", label: "Reverse rows" },
  { id: "reverse-cols", label: "Reverse columns" },
  { id: "sort-asc", label: "Sort asc" },
  { id: "sort-desc", label: "Sort desc" },
  { id: "shuffle", label: "Shuffle rows" },
  { id: "remove-empty-rows", label: "Remove empty rows" },
  { id: "remove-empty-cols", label: "Remove empty cols" },
  { id: "trim", label: "Trim cells" },
  { id: "upper", label: "Uppercase" },
  { id: "lower", label: "Lowercase" },
  { id: "capitalize", label: "Capitalize" },
  { id: "auto-rows", label: "Auto number rows" },
  { id: "auto-cols", label: "Auto number cols" },
  { id: "find-dupes", label: "Find duplicates" },
  { id: "random", label: "Lorem data" },
  { id: "numbers", label: "Random numbers" },
  { id: "dates", label: "Random dates" },
  { id: "names", label: "Random names" },
];

export function TableSidebar() {
  const loadPreset = useTableGeneratorStore((s) => s.loadPreset);
  const runTool = useTableGeneratorStore((s) => s.runTool);
  const setImportOpen = useTableGeneratorStore((s) => s.setImportOpen);
  const newTable = useTableGeneratorStore((s) => s.newTable);
  const doc = useTableGeneratorStore((s) => s.doc);
  const updateTableStyle = useTableGeneratorStore((s) => s.updateTableStyle);
  const applyCellStyle = useTableGeneratorStore((s) => s.applyCellStyle);

  const clearTable = () => {
    const ok = window.confirm("Remove the current table and start fresh?");
    if (!ok) return;
    newTable(6, 4);
    toast.success("Table removed");
  };

  return (
    <aside className="flex h-[calc(100dvh-7.5rem)] min-h-[520px] flex-col overflow-hidden rounded-[1.25rem] border border-border/50 bg-background shadow-sm xl:sticky xl:top-20">
      {/* Always-visible actions */}
      <div className="shrink-0 space-y-2 border-b border-border/40 bg-rose-500/5 p-3">
        <Button
          type="button"
          className="h-11 w-full rounded-full text-sm font-semibold shadow-sm shadow-rose-500/20"
          onClick={() => setImportOpen(true)}
        >
          <Import className="h-4 w-4" />
          Import data
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          CSV, JSON, Markdown, HTML · max 5 MB
        </p>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full rounded-full"
          onClick={async () => {
            try {
              await downloadTablePdf(doc);
              toast.success("PDF downloaded");
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "PDF export failed");
            }
          }}
        >
          <FileDown className="h-4 w-4" />
          Download PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full rounded-full border-rose-500/30 text-rose-700 hover:bg-rose-500/10 dark:text-rose-300"
          onClick={clearTable}
        >
          <Trash2 className="h-4 w-4" />
          Remove table
        </Button>
      </div>

      {/* Full-height scroll so every section is reachable */}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-600">
            Templates
          </p>
          <div className="mt-2 space-y-1.5">
            {TABLE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => loadPreset(p.id)}
                className="block w-full rounded-xl border border-border/40 px-2.5 py-2 text-left text-xs transition-colors hover:border-rose-500/30 hover:bg-rose-500/5"
              >
                <span className="font-medium">{p.name}</span>
                <span className="mt-0.5 block text-[10px] text-muted-foreground">{p.category}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-600">Tools</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TOOLS.map((t) => (
              <Button
                key={t.id}
                type="button"
                size="sm"
                variant="outline"
                className="h-7 rounded-full text-[11px]"
                onClick={() => runTool(t.id)}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-600">
            Table style
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px]">Border</Label>
              <Input
                type="color"
                value={doc.style.borderColor}
                onChange={(e) => updateTableStyle({ borderColor: e.target.value })}
                className="h-8 p-1"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Header</Label>
              <Input
                type="color"
                value={doc.style.headerBackground}
                onChange={(e) => updateTableStyle({ headerBackground: e.target.value })}
                className="h-8 p-1"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Radius</Label>
              <Input
                type="number"
                min={0}
                max={32}
                value={doc.style.borderRadius}
                onChange={(e) => updateTableStyle({ borderRadius: Number(e.target.value) })}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Padding</Label>
              <Input
                type="number"
                min={2}
                max={32}
                value={doc.style.cellPadding}
                onChange={(e) => updateTableStyle({ cellPadding: Number(e.target.value) })}
                className="h-8"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["striped", "Striped"],
                ["hoverEffect", "Hover"],
                ["compact", "Compact"],
                ["responsive", "Responsive"],
                ["rounded", "Rounded"],
                ["shadow", "Shadow"],
                ["animation", "Animation"],
              ] as const
            ).map(([key, label]) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={doc.style[key] ? "default" : "outline"}
                className="h-7 rounded-full text-[11px]"
                onClick={() => updateTableStyle({ [key]: !doc.style[key] })}
              >
                {label}
              </Button>
            ))}
            <Button
              type="button"
              size="sm"
              variant={doc.style.theme === "dark" ? "default" : "outline"}
              className="h-7 rounded-full text-[11px]"
              onClick={() =>
                updateTableStyle({ theme: doc.style.theme === "dark" ? "light" : "dark" })
              }
            >
              {doc.style.theme === "dark" ? "Dark" : "Light"}
            </Button>
          </div>
        </div>

        <div className="space-y-2 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-600">Cell</p>
          <div className="flex flex-wrap gap-1.5">
            <Button type="button" size="sm" variant="outline" className="h-7 rounded-full text-[11px]" onClick={() => applyCellStyle({ fontSize: 12 })}>
              12px
            </Button>
            <Button type="button" size="sm" variant="outline" className="h-7 rounded-full text-[11px]" onClick={() => applyCellStyle({ fontSize: 14 })}>
              14px
            </Button>
            <Button type="button" size="sm" variant="outline" className="h-7 rounded-full text-[11px]" onClick={() => applyCellStyle({ fontSize: 18 })}>
              18px
            </Button>
            <Button type="button" size="sm" variant="outline" className="h-7 rounded-full text-[11px]" onClick={() => applyCellStyle({ wrap: true })}>
              Wrap
            </Button>
            <Button type="button" size="sm" variant="outline" className="h-7 rounded-full text-[11px]" onClick={() => applyCellStyle({ verticalAlign: "top" })}>
              Top
            </Button>
            <Button type="button" size="sm" variant="outline" className="h-7 rounded-full text-[11px]" onClick={() => applyCellStyle({ verticalAlign: "middle" })}>
              Middle
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
