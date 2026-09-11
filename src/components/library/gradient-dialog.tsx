"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/color/copy-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadGradientJpg } from "@/lib/gradients/download-jpg";
import { useCopyToClipboard } from "@/hooks";
import type { LibraryGradient } from "@/lib/data/gradient-library";

export function GradientDialog({
  gradient,
  open,
  onOpenChange,
}: {
  gradient: LibraryGradient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { copy } = useCopyToClipboard();
  if (!gradient) return null;
  const css = `background: ${gradient.css};`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{gradient.name}</DialogTitle>
          <DialogDescription>
            {gradient.category} · {gradient.angle}°
          </DialogDescription>
        </DialogHeader>
        <div
          className="h-36 w-full rounded-2xl border border-border/40"
          style={{ background: gradient.css }}
          role="img"
          aria-label={`${gradient.name} preview`}
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Colors
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {gradient.colors.map((hex, i) => (
              <button
                key={`${hex}-${i}`}
                type="button"
                onClick={async () => {
                  const ok = await copy(hex);
                  if (ok) toast.success(`${hex.toUpperCase()} copied`);
                  else toast.error("Failed to copy");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-2.5 py-1.5 text-left transition hover:border-primary/40"
                aria-label={`Copy ${hex}`}
              >
                <span
                  className="h-5 w-5 shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: hex }}
                  aria-hidden
                />
                <span className="font-mono text-xs">{hex.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
        <CodeBlock label="CSS" value={css} />
        <CodeBlock label="Tailwind" value={gradient.tailwind} />
        <CodeBlock label="SCSS" value={gradient.scss} />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => {
              downloadGradientJpg(gradient);
              toast.success("JPG downloaded");
            }}
          >
            <Download />
            Download JPG
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/gradient-library/${gradient.slug}`}>Open page</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CodeBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <CopyButton value={value} label={label} size="sm" variant="ghost" />
      </div>
      <pre className="overflow-x-auto font-mono text-xs leading-relaxed">{value}</pre>
    </div>
  );
}
