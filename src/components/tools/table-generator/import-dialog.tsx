"use client";

import { useCallback, useRef, useState } from "react";
import { Import, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { importHtml, importPlainTextToTable } from "@/lib/table-generator/import";
import { useTableGeneratorStore } from "@/store/table-generator-store";

const MAX_IMPORT_BYTES = 5 * 1024 * 1024; // 5 MB

function assertFileSize(file: File) {
  if (file.size > MAX_IMPORT_BYTES) {
    throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max size is 5 MB.`);
  }
}

export function TableImportDialog() {
  const open = useTableGeneratorStore((s) => s.importOpen);
  const setImportOpen = useTableGeneratorStore((s) => s.setImportOpen);
  const loadDocument = useTableGeneratorStore((s) => s.loadDocument);
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const applyText = useCallback(() => {
    try {
      const bytes = new Blob([text]).size;
      if (bytes > MAX_IMPORT_BYTES) {
        throw new Error("Pasted data exceeds 5 MB. Please split the file and try again.");
      }
      const doc = importPlainTextToTable(text);
      loadDocument(doc);
      setImportOpen(false);
      setText("");
      toast.success(
        doc.rows.length > 400
          ? `Imported ${doc.rows.length.toLocaleString()} rows (large table mode)`
          : "Data imported"
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    }
  }, [text, loadDocument, setImportOpen]);

  const onFile = async (file: File) => {
    try {
      assertFileSize(file);
      toast.message("Importing…", { description: "Large files may take a moment" });
      // Let the dialog close paint before heavy parse
      await new Promise((r) => setTimeout(r, 30));
      if (/\.xlsx?$/i.test(file.name)) {
        throw new Error(
          "Excel (.xlsx/.xls) upload was removed for security. Please export as CSV from Excel and import that instead."
        );
      } else {
        const raw = await file.text();
        await new Promise((r) => setTimeout(r, 0));
        const doc =
          file.name.endsWith(".html") || raw.includes("<table")
            ? importHtml(raw)
            : importPlainTextToTable(raw);
        loadDocument(doc);
        toast.success(`Imported ${file.name} · ${doc.rows.length.toLocaleString()} rows`);
      }
      setImportOpen(false);
      setText("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Import table data"
      onClick={() => setImportOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-border/50 bg-background p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-500 text-white">
            <Import className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-xl font-semibold">Import data</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste CSV, TSV, JSON, Markdown, or HTML — or drop a spreadsheet. Max file size{" "}
              <span className="font-semibold text-foreground">5 MB</span>.
            </p>
          </div>
        </div>

        <div
          className={`mt-4 rounded-2xl border border-dashed p-6 text-center transition-colors ${
            dragging ? "border-rose-500 bg-rose-500/5" : "border-border/60"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void onFile(file);
          }}
        >
          <Upload className="mx-auto h-8 w-8 text-rose-600" />
          <p className="mt-2 text-sm font-medium">Drag & drop a file here</p>
          <p className="mt-1 text-xs text-muted-foreground">
            CSV, TSV, JSON, MD, HTML · up to 5 MB
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3 rounded-full"
            onClick={() => fileRef.current?.click()}
          >
            Choose file
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.tsv,.txt,.json,.md,.html"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onFile(file);
              e.target.value = "";
            }}
          />
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="mt-4 font-mono text-xs"
          placeholder={"name,role,score\nAva,Design,92\nNoah,Eng,88"}
        />

        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" className="rounded-full" onClick={() => setImportOpen(false)}>
            Cancel
          </Button>
          <Button type="button" className="rounded-full" onClick={applyText}>
            Import
          </Button>
        </div>
      </div>
    </div>
  );
}
