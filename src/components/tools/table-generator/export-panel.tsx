"use client";

import { useMemo } from "react";
import { Check, Copy, Download, Monitor, Moon, Printer, Smartphone, Tablet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadText, EXPORT_META, EXPORTERS } from "@/lib/table-generator/export";
import { exportHtml } from "@/lib/table-generator/export";
import { encodeSharePayload } from "@/lib/table-generator/operations";
import type { ExportFormat, PreviewDevice } from "@/lib/table-generator/types";
import { useTableGeneratorStore } from "@/store/table-generator-store";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function TableExportPanel() {
  const doc = useTableGeneratorStore((s) => s.doc);
  const exportFormat = useTableGeneratorStore((s) => s.exportFormat);
  const setExportFormat = useTableGeneratorStore((s) => s.setExportFormat);
  const previewDevice = useTableGeneratorStore((s) => s.previewDevice);
  const setPreviewDevice = useTableGeneratorStore((s) => s.setPreviewDevice);
  const previewDark = useTableGeneratorStore((s) => s.previewDark);
  const setPreviewDark = useTableGeneratorStore((s) => s.setPreviewDark);
  const [copied, setCopied] = useState(false);
  const [codeBusy, setCodeBusy] = useState(false);

  const large = doc.rows.length > 300;

  const previewDoc = useMemo(() => {
    if (!large) return doc;
    return {
      ...doc,
      rows: doc.rows.slice(0, 80),
      rowHeights: doc.rowHeights.length <= 1 ? doc.rowHeights : doc.rowHeights.slice(0, 80),
    };
  }, [doc, large]);

  const code = useMemo(() => {
    // Avoid blocking the UI by generating full export for huge tables until needed
    if (large && (exportFormat === "html" || exportFormat === "react" || exportFormat === "shadcn" || exportFormat === "tailwind")) {
      const fn = EXPORTERS[exportFormat];
      const sample = fn ? fn(previewDoc) : "";
      return `${sample}\n\n/* Preview: first 80 of ${doc.rows.length} rows. Click Copy/Download to export the full table. */`;
    }
    const fn = EXPORTERS[exportFormat];
    return fn ? fn(large && exportFormat !== "csv" && exportFormat !== "tsv" && exportFormat !== "json" ? previewDoc : doc) : "";
  }, [doc, exportFormat, large, previewDoc]);

  const fullExport = () => {
    const fn = EXPORTERS[exportFormat];
    return fn ? fn(doc) : "";
  };

  const previewHtml = useMemo(() => exportHtml(previewDoc, true), [previewDoc]);

  const meta = EXPORT_META.find((m) => m.id === exportFormat) ?? EXPORT_META[0];

  const width: Record<PreviewDevice, string> = {
    desktop: "100%",
    tablet: "768px",
    mobile: "390px",
    print: "720px",
  };

  return (
    <div className="space-y-3 rounded-[1.25rem] border border-border/50 bg-background p-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600">
          Export & preview
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["desktop", Monitor],
              ["tablet", Tablet],
              ["mobile", Smartphone],
              ["print", Printer],
            ] as const
          ).map(([id, Icon]) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant={previewDevice === id ? "default" : "outline"}
              className="h-8 rounded-full"
              aria-label={`${id} preview`}
              onClick={() => setPreviewDevice(id)}
            >
              <Icon className="h-3.5 w-3.5" />
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant={previewDark ? "default" : "outline"}
            className="h-8 rounded-full"
            onClick={() => setPreviewDark(!previewDark)}
          >
            <Moon className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 rounded-full"
            onClick={() => {
              if (doc.rows.length > 500) {
                toast.error("Share URL is disabled for very large tables — export CSV instead");
                return;
              }
              const url = `${window.location.origin}/table-generator?d=${encodeSharePayload(doc)}`;
              void navigator.clipboard.writeText(url);
              toast.success("Share URL copied");
            }}
          >
            Share URL
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 rounded-full"
            onClick={() => window.print()}
          >
            Print
          </Button>
          <Button
            type="button"
            size="sm"
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
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-auto rounded-2xl border border-border/50 p-3",
          previewDark ? "bg-slate-950" : "bg-muted/20"
        )}
      >
        <iframe
          title="Table live preview"
          sandbox=""
          referrerPolicy="no-referrer"
          className="mx-auto block min-h-[200px] w-full rounded-xl border-0 bg-transparent transition-all"
          style={{ width: width[previewDevice], maxWidth: "100%", height: 280 }}
          srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8" /><style>body{margin:0;padding:12px;font-family:system-ui,sans-serif;background:${previewDark ? "#020617" : "#ffffff"};color:${previewDark ? "#e2e8f0" : "#0f172a"};}</style></head><body>${previewHtml}</body></html>`}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {EXPORT_META.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setExportFormat(item.id as ExportFormat)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
              exportFormat === item.id
                ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                : "border-border/50 text-muted-foreground hover:border-rose-500/25"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/50">
        <div className="flex items-center justify-between gap-2 border-b border-border/40 bg-muted/20 px-3 py-2">
          <p className="text-xs font-semibold">{meta.label}</p>
          <div className="flex gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 rounded-full"
              disabled={codeBusy}
              onClick={async () => {
                try {
                  setCodeBusy(true);
                  // Yield so UI can paint before heavy stringify
                  await new Promise((r) => setTimeout(r, 0));
                  const payload = large ? fullExport() : code;
                  await navigator.clipboard.writeText(payload);
                  setCopied(true);
                  toast.success(large ? `Copied full ${meta.label} (${doc.rows.length.toLocaleString()} rows)` : "Copied");
                  window.setTimeout(() => setCopied(false), 1200);
                } finally {
                  setCodeBusy(false);
                }
              }}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              Copy
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 rounded-full"
              disabled={codeBusy}
              onClick={async () => {
                try {
                  setCodeBusy(true);
                  await new Promise((r) => setTimeout(r, 0));
                  const payload = large ? fullExport() : code;
                  downloadText(payload, `${doc.name.replace(/\s+/g, "-").toLowerCase()}.${meta.ext}`);
                  toast.success("Downloaded");
                } finally {
                  setCodeBusy(false);
                }
              }}
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          </div>
        </div>
        <pre className="max-h-64 overflow-auto bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-slate-100">
          {code}
        </pre>
      </div>
    </div>
  );
}
