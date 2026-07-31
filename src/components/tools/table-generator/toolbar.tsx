"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Columns3,
  Copy,
  ClipboardPaste,
  Command,
  Heading,
  Italic,
  Link2,
  Merge,
  Pin,
  Plus,
  Redo2,
  Rows3,
  Save,
  Scissors,
  Search,
  Split,
  Strikethrough,
  Trash2,
  Underline,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTableGeneratorStore } from "@/store/table-generator-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function ToolBtn({
  label,
  onClick,
  children,
  active,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      className={cn("h-8 rounded-full", active && "bg-rose-600")}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function TableToolbar() {
  const doc = useTableGeneratorStore((s) => s.doc);
  const setName = useTableGeneratorStore((s) => s.setName);
  const undo = useTableGeneratorStore((s) => s.undo);
  const redo = useTableGeneratorStore((s) => s.redo);
  const addRow = useTableGeneratorStore((s) => s.addRow);
  const addCol = useTableGeneratorStore((s) => s.addCol);
  const removeRow = useTableGeneratorStore((s) => s.removeRow);
  const removeCol = useTableGeneratorStore((s) => s.removeCol);
  const applyCellStyle = useTableGeneratorStore((s) => s.applyCellStyle);
  const copySelection = useTableGeneratorStore((s) => s.copySelection);
  const cutSelection = useTableGeneratorStore((s) => s.cutSelection);
  const pasteClipboard = useTableGeneratorStore((s) => s.pasteClipboard);
  const merge = useTableGeneratorStore((s) => s.merge);
  const split = useTableGeneratorStore((s) => s.split);
  const toggleHeader = useTableGeneratorStore((s) => s.toggleHeader);
  const toggleFreezeHeader = useTableGeneratorStore((s) => s.toggleFreezeHeader);
  const toggleStickyFirst = useTableGeneratorStore((s) => s.toggleStickyFirst);
  const saveCurrent = useTableGeneratorStore((s) => s.saveCurrent);
  const setCommandOpen = useTableGeneratorStore((s) => s.setCommandOpen);
  const setImportOpen = useTableGeneratorStore((s) => s.setImportOpen);
  const setView = useTableGeneratorStore((s) => s.setView);
  const newTable = useTableGeneratorStore((s) => s.newTable);
  const searchQuery = useTableGeneratorStore((s) => s.searchQuery);
  const setSearch = useTableGeneratorStore((s) => s.setSearch);
  const replaceQuery = useTableGeneratorStore((s) => s.replaceQuery);
  const setReplace = useTableGeneratorStore((s) => s.setReplace);
  const replaceAll = useTableGeneratorStore((s) => s.replaceAll);
  const searchHits = useTableGeneratorStore((s) => s.searchHits);

  return (
    <div className="space-y-3 rounded-[1.25rem] border border-border/50 bg-background p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="ghost" className="rounded-full" onClick={() => setView("landing")}>
          ← Home
        </Button>
        <Input
          value={doc.name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 max-w-xs rounded-full"
          aria-label="Table name"
        />
        <ToolBtn
          label="Save"
          onClick={() => {
            saveCurrent();
            toast.success("Table saved locally");
          }}
        >
          <Save className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn label="Command palette" onClick={() => setCommandOpen(true)}>
          <Command className="h-3.5 w-3.5" />
          <span className="text-[10px]">Ctrl K</span>
        </ToolBtn>
        <Button
          type="button"
          size="sm"
          className="h-8 rounded-full font-semibold"
          onClick={() => setImportOpen(true)}
        >
          Import data
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 rounded-full"
          onClick={async () => {
            try {
              const { downloadTablePdf } = await import("@/lib/table-generator/pdf");
              await downloadTablePdf(doc);
              toast.success("PDF downloaded");
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "PDF export failed");
            }
          }}
        >
          Download PDF
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 rounded-full border-rose-500/30 text-rose-700 dark:text-rose-300"
          onClick={() => {
            if (!window.confirm("Remove the current table and start fresh?")) return;
            newTable(6, 4);
            toast.success("Table removed");
          }}
        >
          Remove table
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <ToolBtn label="Undo" onClick={undo}><Undo2 className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn label="Redo" onClick={redo}><Redo2 className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn label="Copy" onClick={() => void copySelection()}><Copy className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn label="Cut" onClick={() => void cutSelection()}><Scissors className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn label="Paste" onClick={() => void pasteClipboard()}><ClipboardPaste className="h-3.5 w-3.5" /></ToolBtn>
        <span className="mx-1 w-px self-stretch bg-border/60" />
        <ToolBtn label="Bold" onClick={() => applyCellStyle({ bold: true })}><Bold className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn label="Italic" onClick={() => applyCellStyle({ italic: true })}><Italic className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn label="Underline" onClick={() => applyCellStyle({ underline: true })}><Underline className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn label="Strike" onClick={() => applyCellStyle({ strike: true })}><Strikethrough className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn label="Align left" onClick={() => applyCellStyle({ align: "left" })}><AlignLeft className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn label="Align center" onClick={() => applyCellStyle({ align: "center" })}><AlignCenter className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn label="Align right" onClick={() => applyCellStyle({ align: "right" })}><AlignRight className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn
          label="Link"
          onClick={() => {
            const href = window.prompt("Link URL (https://…)");
            if (href) {
              const trimmed = href.trim();
              if (!/^(https?:\/\/|mailto:|#)/i.test(trimmed)) {
                toast.error("Only http(s), mailto, or # links are allowed");
                return;
              }
              applyCellStyle({ href: trimmed });
            }
          }}
        >
          <Link2 className="h-3.5 w-3.5" />
        </ToolBtn>
        <Input
          type="color"
          className="h-8 w-10 rounded-full p-1"
          title="Text color"
          onChange={(e) => applyCellStyle({ color: e.target.value })}
        />
        <Input
          type="color"
          className="h-8 w-10 rounded-full p-1"
          title="Background"
          onChange={(e) => applyCellStyle({ background: e.target.value })}
        />
        <span className="mx-1 w-px self-stretch bg-border/60" />
        <ToolBtn label="Add row" onClick={() => addRow()}><Rows3 className="h-3.5 w-3.5" /><Plus className="h-3 w-3" /></ToolBtn>
        <ToolBtn label="Add column" onClick={() => addCol()}><Columns3 className="h-3.5 w-3.5" /><Plus className="h-3 w-3" /></ToolBtn>
        <ToolBtn label="Delete row" onClick={() => removeRow()}><Trash2 className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn label="Delete column" onClick={() => removeCol()}><Trash2 className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn label="Merge cells" onClick={merge}><Merge className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn label="Split cells" onClick={split}><Split className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn label="Header row" active={doc.hasHeader} onClick={toggleHeader}><Heading className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn label="Freeze header" active={doc.freezeHeader} onClick={toggleFreezeHeader}><Pin className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn label="Sticky first column" active={doc.stickyFirstColumn} onClick={toggleStickyFirst}><Pin className="h-3.5 w-3.5" /></ToolBtn>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search table…"
            className="h-8 w-44 rounded-full pl-8"
          />
        </div>
        <Input
          value={replaceQuery}
          onChange={(e) => setReplace(e.target.value)}
          placeholder="Replace with…"
          className="h-8 w-40 rounded-full"
        />
        <Button type="button" size="sm" variant="outline" className="h-8 rounded-full" onClick={replaceAll}>
          Replace all
        </Button>
        {searchQuery && (
          <span className="text-xs text-muted-foreground">{searchHits.length} matches</span>
        )}
      </div>
    </div>
  );
}
