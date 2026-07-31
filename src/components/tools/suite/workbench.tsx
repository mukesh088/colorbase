"use client";

import type { ReactNode } from "react";
import { Download, Eraser } from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/color/copy-button";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ToolWorkbench({
  title = "Controls",
  hint,
  controls,
  output,
  preview,
  className,
}: {
  title?: string;
  hint?: string;
  controls: ReactNode;
  output?: ReactNode;
  preview?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:gap-5 lg:grid-cols-2 lg:items-start", className)}>
      <div className="min-w-0 overflow-hidden rounded-2xl border border-border/50 bg-background/70 shadow-sm backdrop-blur-sm sm:rounded-3xl">
        <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-3 py-3 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
            Workspace
          </p>
          <h2 className="font-display text-base font-semibold tracking-tight sm:text-lg">{title}</h2>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="space-y-4 p-3 sm:p-5">{controls}</div>
      </div>
      <div className="min-w-0 space-y-4">
        {preview}
        {output}
      </div>
    </div>
  );
}

export function OutputBox({
  value,
  label = "Copy",
  mono = true,
  rows = 12,
  filename = "output.txt",
  onClear,
}: {
  value: string;
  label?: string;
  mono?: boolean;
  rows?: number;
  filename?: string;
  onClear?: () => void;
}) {
  const download = () => {
    if (!value) {
      toast.error("Nothing to download");
      return;
    }
    const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded");
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-2 border-b border-border/40 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
            Result
          </p>
          <p className="text-sm font-semibold">Output</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onClear && (
            <Button type="button" variant="ghost" size="sm" className="h-9 rounded-full" onClick={onClear}>
              <Eraser className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" className="h-9 rounded-full" onClick={download}>
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
          <CopyButton value={value} label={label} className="h-9 rounded-full" />
        </div>
      </div>
      <div className="p-3 sm:p-5">
        <Textarea
          readOnly
          value={value}
          rows={rows}
          className={cn(
            "min-h-[8rem] resize-y rounded-2xl border-border/50 bg-muted/30 text-[13px] sm:text-xs",
            mono && "font-mono leading-relaxed"
          )}
          aria-label="Tool output"
        />
        <p className="mt-2 text-[11px] text-muted-foreground">
          {value.length.toLocaleString()} characters · ready to copy or download
        </p>
      </div>
    </div>
  );
}

export function ActionRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

export function PrimaryButton(props: React.ComponentProps<typeof Button>) {
  const { className, ...rest } = props;
  return (
    <Button
      type="button"
      className={cn(
        "rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white shadow-md shadow-rose-500/20 hover:opacity-95",
        className
      )}
      {...rest}
    />
  );
}
