"use client";

import { CopyButton } from "@/components/color/copy-button";
import { cn } from "@/lib/utils";

export function CodeBlock({
  code,
  language = "css",
  className,
}: {
  code: string;
  language?: string;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[var(--radius-md)]", className)}>
      <div className="flex items-center justify-between border-b border-white/10 bg-[#0c0a0f] px-3 py-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          {language}
        </span>
        <CopyButton
          value={code}
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-[11px] text-zinc-200 hover:bg-white/10 hover:text-white"
        />
      </div>
      <pre className="code-surface max-h-80 overflow-auto p-4 font-mono text-xs leading-relaxed">
        {code}
      </pre>
    </div>
  );
}
