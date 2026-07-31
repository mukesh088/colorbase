"use client";

import { useMemo, useState } from "react";
import { CODE_FORMATS, generateCode, type CodeFormat } from "@/lib/codegen";
import { CopyButton } from "@/components/color/copy-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CodeExportPanel({
  colors,
  name = "palette",
  initialFormat,
}: {
  colors: string[];
  name?: string;
  initialFormat?: CodeFormat;
}) {
  const [format, setFormat] = useState<CodeFormat>(initialFormat ?? "css");
  const code = useMemo(() => generateCode(colors, format, name), [colors, format, name]);

  return (
    <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 px-5 py-4 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
            Export
          </p>
          <h3 className="mt-0.5 font-display text-lg font-semibold">Developer code</h3>
        </div>
        <Select value={format} onValueChange={(v) => setFormat(v as CodeFormat)}>
          <SelectTrigger className="w-48 rounded-full" aria-label="Export format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CODE_FORMATS.map((f) => (
              <SelectItem key={f.slug} value={f.slug}>
                {f.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3 p-5 sm:p-6">
        <pre className="max-h-80 overflow-auto rounded-2xl border border-border/40 bg-muted/40 p-4 font-mono text-xs leading-relaxed">
          {code}
        </pre>
        <CopyButton value={code} label="Copy code" />
      </div>
    </div>
  );
}
