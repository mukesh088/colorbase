"use client";

import { useMemo, useState } from "react";
import { CODE_FORMATS, generateCode, type CodeFormat } from "@/lib/codegen";
import { CodeBlock } from "@/components/ui/code-block";
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
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-sm)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 px-5 py-4 sm:px-6">
        <div>
          <p className="kicker">
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
        <CodeBlock code={code} language={format} />
      </div>
    </div>
  );
}
