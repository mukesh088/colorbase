import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ToolWorkspace({
  toolbar,
  preview,
  controls,
  results,
  code,
  children,
  className,
}: {
  toolbar?: ReactNode;
  preview?: ReactNode;
  controls?: ReactNode;
  results?: ReactNode;
  code?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const composed = Boolean(preview || controls || results || code);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-sm)]",
        className
      )}
    >
      {toolbar ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-[var(--surface-hover)] px-3 py-2.5 sm:px-4">
          {toolbar}
        </div>
      ) : null}
      {children ? <div className="min-w-0 p-4 sm:p-5">{children}</div> : null}
      {composed ? (
        <div className="grid gap-px bg-border lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)]">
          {preview ? <div className="min-w-0 bg-card p-4 sm:p-5">{preview}</div> : null}
          {controls ? <div className="min-w-0 bg-card p-4 sm:p-5">{controls}</div> : null}
        </div>
      ) : null}
      {results ? <div className="border-t border-border p-4 sm:p-5">{results}</div> : null}
      {code ? <div className="border-t border-border p-4 sm:p-5">{code}</div> : null}
    </div>
  );
}
