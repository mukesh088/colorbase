"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, ArrowRight, Check, LockKeyhole, RotateCcw, Wand2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import { checkContrast, getContrastRatio } from "@/lib/colors/convert";
import { readHexColor } from "@/lib/colors/tool-links";
import { suggestContrastRepair } from "@/lib/colors/contrast-repair";

export function ContrastCheckerTool() {
  const [fgInput, setFg] = useState("#0f172a");
  const [bgInput, setBg] = useState("#ffffff");
  const [adjust, setAdjust] = useState<"foreground" | "background">("foreground");
  const [target, setTarget] = useState<4.5 | 7>(4.5);
  const [previous, setPrevious] = useState<{ fg: string; bg: string } | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const foreground = readHexColor(params.get("fg"));
    const background = readHexColor(params.get("bg"));
    if (foreground) setFg(foreground);
    if (background) setBg(background);
  }, []);
  const fg = readHexColor(fgInput);
  const bg = readHexColor(bgInput);
  const result = useMemo(() => (fg && bg ? checkContrast(fg, bg) : null), [fg, bg]);
  const suggestion = useMemo(
    () => (fg && bg ? suggestContrastRepair(fg, bg, target, adjust) : null),
    [fg, bg, target, adjust]
  );
  const passes = Boolean(fg && bg && getContrastRatio(fg, bg) >= target);

  return (
    <div className="space-y-5">
      <div className="border-border bg-card grid overflow-hidden rounded-2xl border lg:grid-cols-2">
        <section className="p-5 sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-semibold">A considered contrast.</h2>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Swap foreground and background"
              onClick={() => {
                setFg(bgInput);
                setBg(fgInput);
              }}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </div>
          {[
            { id: "fg", label: "Foreground / text", value: fgInput, valid: fg, set: setFg },
            { id: "bg", label: "Background", value: bgInput, valid: bg, set: setBg },
          ].map((field) => (
            <div className="mb-5 space-y-2" key={field.id}>
              <Label htmlFor={field.id} className="text-xs">
                {field.label}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  aria-label={`Pick ${field.label.toLowerCase()}`}
                  value={field.valid ?? "#000000"}
                  className="h-11 w-12 shrink-0 p-1"
                  onChange={(event) => field.set(event.target.value)}
                />
                <Input
                  id={field.id}
                  value={field.value}
                  maxLength={7}
                  className="h-11 font-mono text-xs"
                  onChange={(event) => field.set(event.target.value)}
                  aria-invalid={!field.valid}
                  aria-describedby={!field.valid ? `${field.id}-error` : undefined}
                />
                {field.valid && <CopyButton value={field.valid} />}
              </div>
              {!field.valid && (
                <p id={`${field.id}-error`} role="alert" className="text-destructive text-xs">
                  Enter a 3 or 6 digit HEX color.
                </p>
              )}
            </div>
          ))}
          {result ? (
            <div className="border-border mt-7 border-t pt-6">
              <p className="text-muted-foreground text-xs">CONTRAST RATIO</p>
              <div className="mt-2 flex items-end gap-3">
                <strong className="font-display text-5xl font-medium tracking-tight">
                  {result.ratio}
                  <span className="text-muted-foreground text-xl">:1</span>
                </strong>
                <span
                  className={`mb-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${result.normalAA ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400" : "text-destructive bg-red-500/10"}`}
                >
                  {result.normalAA ? "AA normal text passes" : "AA normal text fails"}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {[
                  { label: "Normal AA", pass: result.normalAA },
                  { label: "Normal AAA", pass: result.normalAAA },
                  { label: "Large AA", pass: result.largeAA },
                  { label: "Large AAA", pass: result.largeAAA },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="border-border flex items-center justify-between rounded-lg border px-3 py-2 text-xs"
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <strong
                      className={
                        item.pass ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
                      }
                    >
                      {item.pass ? "Pass" : "Fail"}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p role="status" className="bg-muted text-muted-foreground rounded-xl p-4 text-sm">
              Enter two valid colors to measure their contrast.
            </p>
          )}
        </section>
        <section className="border-border bg-muted/30 flex flex-col border-t p-5 sm:p-7 lg:border-t-0 lg:border-l">
          <p className="text-muted-foreground mb-4 text-[10px] font-semibold tracking-widest uppercase">
            Live text preview
          </p>
          {fg && bg ? (
            <div
              className="border-border flex flex-1 flex-col justify-center rounded-xl border px-6 py-10"
              style={{ backgroundColor: bg, color: fg }}
            >
              <p className="mb-4 text-[10px] font-medium tracking-[.2em] uppercase">
                MADE TO BE READ
              </p>
              <h3 className="font-display text-4xl leading-tight font-medium tracking-tight">
                Clarity in
                <br />
                every detail.
              </h3>
              <p className="mt-5 max-w-sm text-sm leading-7">
                Good color makes the important things clear. This paragraph uses your exact
                foreground and background colors.
              </p>
              <span className="mt-7 inline-flex items-center gap-2 self-start border-b pb-1 text-xs">
                Sample text link <ArrowRight size={13} />
              </span>
            </div>
          ) : (
            <div className="border-border text-muted-foreground grid min-h-64 flex-1 place-items-center rounded-xl border border-dashed text-sm">
              Your preview will appear here.
            </div>
          )}
          <p className="text-muted-foreground mt-4 text-[10px] leading-relaxed">
            AA normal text requires 4.5:1; large text requires 3:1. Large text is at least 18 pt, or
            14 pt bold. These checks apply to this color pair.
          </p>
        </section>
      </div>
      <section className="border-border bg-card rounded-2xl border p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-widest uppercase">
              <LockKeyhole size={13} /> KEEP WHAT MATTERS
            </p>
            <h2 className="text-base font-semibold">Repair contrast. Keep your brand.</h2>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              Choose which color stays fixed, then review a tested alternative.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Color to preserve"
              className="border-input bg-background rounded-lg border p-2.5 text-xs"
              value={adjust}
              onChange={(event) => setAdjust(event.target.value as typeof adjust)}
            >
              <option value="foreground">Keep background</option>
              <option value="background">Keep foreground</option>
            </select>
            <select
              aria-label="Repair contrast target"
              className="border-input bg-background rounded-lg border p-2.5 text-xs"
              value={target}
              onChange={(event) => setTarget(Number(event.target.value) as 4.5 | 7)}
            >
              <option value="4.5">AA · 4.5:1</option>
              <option value="7">AAA · 7:1</option>
            </select>
          </div>
        </div>
        {fg &&
          bg &&
          (passes ? (
            <p className="bg-muted mt-5 flex items-center gap-2 rounded-lg p-4 text-xs">
              <Check size={15} />
              This pair already meets your selected normal-text target.
            </p>
          ) : suggestion ? (
            <div className="border-border mt-5 flex flex-wrap items-center gap-4 rounded-xl border p-4">
              <span
                className="border-border grid h-14 w-20 place-items-center rounded-lg border text-xl"
                style={{ background: suggestion.bg, color: suggestion.fg }}
              >
                Aa
              </span>
              <div className="flex-1">
                <p className="text-xs font-medium">
                  Suggested {adjust === "foreground" ? "foreground" : "background"}:{" "}
                  <span className="font-mono">
                    {adjust === "foreground" ? suggestion.fg : suggestion.bg}
                  </span>
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {getContrastRatio(suggestion.fg, suggestion.bg).toFixed(2)}:1 ·{" "}
                  {target === 7 ? "AAA" : "AA"} normal text passes
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setPrevious({ fg, bg });
                  setFg(suggestion.fg);
                  setBg(suggestion.bg);
                }}
              >
                <Wand2 />
                Apply suggestion
              </Button>
            </div>
          ) : (
            <p role="status" className="bg-muted mt-5 rounded-lg p-4 text-xs leading-relaxed">
              No foreground/background adjustment can meet this target while keeping the selected
              color. Try preserving the other color or choosing AA.
            </p>
          ))}
        {previous && (
          <Button
            size="sm"
            variant="ghost"
            className="mt-4"
            onClick={() => {
              setFg(previous.fg);
              setBg(previous.bg);
              setPrevious(null);
            }}
          >
            <RotateCcw />
            Undo last repair
          </Button>
        )}
      </section>
    </div>
  );
}
