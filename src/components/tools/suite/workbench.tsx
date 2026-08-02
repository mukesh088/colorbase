"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CodeOutput } from "@/components/tools/suite/code-output";
import type { CodeLanguage } from "@/lib/syntax-highlight";
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
  language = "auto",
  title = "Output",
  emptyMessage,
}: {
  value: string;
  label?: string;
  /** @deprecated Kept for API compatibility; IDE view is always monospace. */
  mono?: boolean;
  rows?: number;
  filename?: string;
  onClear?: () => void;
  language?: CodeLanguage | "auto";
  title?: string;
  emptyMessage?: string;
}) {
  void mono;
  return (
    <CodeOutput
      value={value}
      label={label}
      filename={filename}
      language={language}
      title={title}
      rows={rows}
      onClear={onClear}
      emptyMessage={emptyMessage}
      animate
    />
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
