"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolWorkbench, OutputBox } from "./workbench";
import type { CssSuiteMode } from "@/lib/suite-modes";
import { cn } from "@/lib/utils";

export type { CssSuiteMode };
export { isCssSuite } from "@/lib/suite-modes";

const HINTS: Partial<Record<CssSuiteMode, string>> = {
  "outline-generator": "Outlines that don’t affect layout size.",
  "cursor-generator": "Pick a cursor and hover the preview area.",
};

function PreviewShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm", className)}>
      <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-4 py-3 sm:px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
          Preview
        </p>
        <p className="text-sm font-semibold">Live result</p>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

export function CssSuiteTool({ mode }: { mode: CssSuiteMode }) {
  const [color, setColor] = useState("#e11d48");
  const [offsetX, setOffsetX] = useState(2);
  const [width, setWidth] = useState(2);
  const [cursor, setCursor] = useState("pointer");
  const [borderStyle, setBorderStyle] = useState("solid");

  const css = useMemo(() => {
    switch (mode) {
      case "outline-generator":
        return `outline: ${width}px ${borderStyle} ${color};\noutline-offset: ${offsetX}px;`;
      case "cursor-generator":
        return `cursor: ${cursor};`;
      default:
        return "";
    }
  }, [mode, color, offsetX, width, cursor, borderStyle]);

  return (
    <ToolWorkbench
      hint={HINTS[mode]}
      controls={
        <div className="space-y-4">
          {mode === "outline-generator" && (
            <>
              <div className="space-y-1.5">
                <Label>Color</Label>
                <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-16 p-1" />
              </div>
              <div className="space-y-1.5"><Label>Width · {width}px</Label><Slider min={0} max={20} value={[width]} onValueChange={([n]) => setWidth(n)} /></div>
              <div className="space-y-1.5">
                <Label>Style</Label>
                <Select value={borderStyle} onValueChange={setBorderStyle}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["solid", "dashed", "dotted", "double", "groove", "ridge"].map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Offset · {offsetX}px</Label><Slider min={-8} max={24} value={[offsetX]} onValueChange={([n]) => setOffsetX(n)} /></div>
            </>
          )}

          {mode === "cursor-generator" && (
            <div className="space-y-1.5">
              <Label>Cursor</Label>
              <Select value={cursor} onValueChange={setCursor}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["auto", "default", "pointer", "text", "move", "grab", "grabbing", "crosshair", "wait", "help", "not-allowed", "zoom-in", "zoom-out", "col-resize", "row-resize", "copy", "alias"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      }
      preview={
        <PreviewShell>
          {mode === "cursor-generator" && (
            <div
              className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 text-sm font-medium"
              style={{ cursor }}
            >
              Hover here · <span className="ml-1 font-mono text-rose-600">{cursor}</span>
            </div>
          )}

          {mode === "outline-generator" && (
            <div className="flex h-40 items-center justify-center rounded-2xl bg-muted/20 p-6">
              <div
                className="flex h-24 w-40 items-center justify-center rounded-xl bg-background text-sm font-medium"
                style={{ outline: `${width}px ${borderStyle} ${color}`, outlineOffset: offsetX }}
              >
                Outline
              </div>
            </div>
          )}
        </PreviewShell>
      }
      output={<OutputBox value={css} label="CSS" filename={`${mode}.css`} language="css" rows={10} />}
    />
  );
}
