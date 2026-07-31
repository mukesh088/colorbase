"use client";

import { useId, useMemo, useState } from "react";
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
  "text-shadow-generator": "Soft or hard shadows for headlines and UI labels.",
  "flexbox-playground": "Live flex layout with direction, alignment, and gap.",
  "css-grid-generator": "Build a responsive grid template visually.",
  "css-transition-generator": "Hover the preview to feel duration, easing, and delay.",
  "css-filter-generator": "Stack blur, brightness, contrast, saturate, and hue.",
  "border-generator": "Width, style, color, and radius in one snippet.",
  "outline-generator": "Outlines that don’t affect layout size.",
  "cursor-generator": "Pick a cursor and hover the preview area.",
  "scrollbar-generator": "Firefox + WebKit scrollbar colors.",
  "typography-generator": "Size, weight, leading, and tracking.",
  "css-clamp-generator": "Fluid type that scales between min and max.",
};

const EASINGS = [
  ["ease", "ease"],
  ["ease-in", "ease-in"],
  ["ease-out", "ease-out"],
  ["ease-in-out", "ease-in-out"],
  ["linear", "linear"],
  ["cubic-bezier(0.34, 1.56, 0.64, 1)", "springy"],
  ["cubic-bezier(0.4, 0, 0.2, 1)", "material"],
] as const;

const TRANSITION_PROPS = ["all", "transform", "opacity", "background-color", "color", "box-shadow"] as const;

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
  const scrollId = useId().replace(/:/g, "");
  const [color, setColor] = useState("#e11d48");
  const [shadowColor, setShadowColor] = useState("#000000");
  const [offsetX, setOffsetX] = useState(2);
  const [offsetY, setOffsetY] = useState(4);
  const [blur, setBlur] = useState(8);
  const [opacity, setOpacity] = useState(45);
  const [width, setWidth] = useState(2);
  const [radius, setRadius] = useState(12);
  const [gap, setGap] = useState(12);
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(2);
  const [duration, setDuration] = useState(300);
  const [delay, setDelay] = useState(0);
  const [easing, setEasing] = useState<string>("ease");
  const [transitionProp, setTransitionProp] = useState<string>("all");
  const [min, setMin] = useState(16);
  const [pref, setPref] = useState(4);
  const [max, setMax] = useState(48);
  const [justify, setJustify] = useState("center");
  const [align, setAlign] = useState("center");
  const [wrap, setWrap] = useState("nowrap");
  const [direction, setDirection] = useState("row");
  const [cursor, setCursor] = useState("pointer");
  const [borderStyle, setBorderStyle] = useState("solid");
  const [fontSize, setFontSize] = useState(18);
  const [weight, setWeight] = useState(600);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letter, setLetter] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [hue, setHue] = useState(0);
  const [track, setTrack] = useState("#fce7f3");
  const [thumb, setThumb] = useState("#e11d48");
  const [scrollWidth, setScrollWidth] = useState(10);

  const shadowRgba = useMemo(() => {
    const hex = shadowColor.replace("#", "");
    const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    const r = parseInt(full.slice(0, 2), 16) || 0;
    const g = parseInt(full.slice(2, 4), 16) || 0;
    const b = parseInt(full.slice(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  }, [shadowColor, opacity]);

  const css = useMemo(() => {
    switch (mode) {
      case "text-shadow-generator":
        return `text-shadow: ${offsetX}px ${offsetY}px ${blur}px ${shadowRgba};\ncolor: ${color};`;
      case "flexbox-playground":
        return `.flex {\n  display: flex;\n  flex-direction: ${direction};\n  flex-wrap: ${wrap};\n  justify-content: ${justify};\n  align-items: ${align};\n  gap: ${gap}px;\n}`;
      case "css-grid-generator":
        return `.grid {\n  display: grid;\n  grid-template-columns: repeat(${cols}, minmax(0, 1fr));\n  grid-template-rows: repeat(${rows}, minmax(0, 1fr));\n  gap: ${gap}px;\n}`;
      case "css-transition-generator":
        return `transition: ${transitionProp} ${duration}ms ${easing} ${delay}ms;`;
      case "css-filter-generator":
        return `filter: blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hue}deg);`;
      case "border-generator":
        return `border: ${width}px ${borderStyle} ${color};\nborder-radius: ${radius}px;`;
      case "outline-generator":
        return `outline: ${width}px ${borderStyle} ${color};\noutline-offset: ${offsetX}px;`;
      case "cursor-generator":
        return `cursor: ${cursor};`;
      case "scrollbar-generator":
        return `/* Firefox */\n.scroll {\n  scrollbar-width: thin;\n  scrollbar-color: ${thumb} ${track};\n}\n\n/* WebKit */\n.scroll::-webkit-scrollbar {\n  width: ${scrollWidth}px;\n}\n.scroll::-webkit-scrollbar-track {\n  background: ${track};\n}\n.scroll::-webkit-scrollbar-thumb {\n  background: ${thumb};\n  border-radius: 999px;\n}`;
      case "typography-generator":
        return `font-size: ${fontSize}px;\nfont-weight: ${weight};\nline-height: ${lineHeight};\nletter-spacing: ${letter}px;\ncolor: ${color};`;
      case "css-clamp-generator":
        return `font-size: clamp(${min}px, ${pref}vw, ${max}px);`;
      default:
        return "";
    }
  }, [
    mode, color, shadowRgba, offsetX, offsetY, blur, opacity, width, radius, gap, cols, rows,
    duration, delay, easing, transitionProp, min, pref, max, justify, align, wrap, direction,
    cursor, borderStyle, fontSize, weight, lineHeight, letter, brightness, contrast, saturate,
    hue, track, thumb, scrollWidth,
  ]);

  return (
    <ToolWorkbench
      hint={HINTS[mode]}
      controls={
        <div className="space-y-4">
          {mode === "text-shadow-generator" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Text color</Label>
                  <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-full p-1" />
                </div>
                <div className="space-y-1.5">
                  <Label>Shadow color</Label>
                  <Input type="color" value={shadowColor} onChange={(e) => setShadowColor(e.target.value)} className="h-10 w-full p-1" />
                </div>
              </div>
              <div className="space-y-1.5"><Label>Offset X · {offsetX}px</Label><Slider min={-24} max={24} value={[offsetX]} onValueChange={([n]) => setOffsetX(n)} /></div>
              <div className="space-y-1.5"><Label>Offset Y · {offsetY}px</Label><Slider min={-24} max={24} value={[offsetY]} onValueChange={([n]) => setOffsetY(n)} /></div>
              <div className="space-y-1.5"><Label>Blur · {blur}px</Label><Slider min={0} max={40} value={[blur]} onValueChange={([n]) => setBlur(n)} /></div>
              <div className="space-y-1.5"><Label>Opacity · {opacity}%</Label><Slider min={0} max={100} value={[opacity]} onValueChange={([n]) => setOpacity(n)} /></div>
            </>
          )}

          {mode === "flexbox-playground" && (
            <>
              <div className="space-y-1.5">
                <Label>Direction</Label>
                <Select value={direction} onValueChange={setDirection}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["row", "column", "row-reverse", "column-reverse"].map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Wrap</Label>
                <Select value={wrap} onValueChange={setWrap}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["nowrap", "wrap", "wrap-reverse"].map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Justify content</Label>
                <Select value={justify} onValueChange={setJustify}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"].map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Align items</Label>
                <Select value={align} onValueChange={setAlign}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["stretch", "flex-start", "center", "flex-end", "baseline"].map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Gap · {gap}px</Label><Slider min={0} max={48} value={[gap]} onValueChange={([n]) => setGap(n)} /></div>
            </>
          )}

          {mode === "css-grid-generator" && (
            <>
              <div className="space-y-1.5"><Label>Columns · {cols}</Label><Slider min={1} max={8} value={[cols]} onValueChange={([n]) => setCols(n)} /></div>
              <div className="space-y-1.5"><Label>Rows · {rows}</Label><Slider min={1} max={6} value={[rows]} onValueChange={([n]) => setRows(n)} /></div>
              <div className="space-y-1.5"><Label>Gap · {gap}px</Label><Slider min={0} max={48} value={[gap]} onValueChange={([n]) => setGap(n)} /></div>
            </>
          )}

          {mode === "css-transition-generator" && (
            <>
              <div className="space-y-1.5">
                <Label>Property</Label>
                <Select value={transitionProp} onValueChange={setTransitionProp}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRANSITION_PROPS.map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Easing</Label>
                <Select value={easing} onValueChange={setEasing}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EASINGS.map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Duration · {duration}ms</Label><Slider min={50} max={2000} step={50} value={[duration]} onValueChange={([n]) => setDuration(n)} /></div>
              <div className="space-y-1.5"><Label>Delay · {delay}ms</Label><Slider min={0} max={1000} step={50} value={[delay]} onValueChange={([n]) => setDelay(n)} /></div>
            </>
          )}

          {mode === "css-filter-generator" && (
            <>
              <div className="space-y-1.5"><Label>Blur · {blur}px</Label><Slider min={0} max={40} value={[blur]} onValueChange={([n]) => setBlur(n)} /></div>
              <div className="space-y-1.5"><Label>Saturate · {saturate}%</Label><Slider min={0} max={200} value={[saturate]} onValueChange={([n]) => setSaturate(n)} /></div>
              <div className="space-y-1.5"><Label>Brightness · {brightness}%</Label><Slider min={0} max={200} value={[brightness]} onValueChange={([n]) => setBrightness(n)} /></div>
              <div className="space-y-1.5"><Label>Contrast · {contrast}%</Label><Slider min={0} max={200} value={[contrast]} onValueChange={([n]) => setContrast(n)} /></div>
              <div className="space-y-1.5"><Label>Hue · {hue}°</Label><Slider min={0} max={360} value={[hue]} onValueChange={([n]) => setHue(n)} /></div>
            </>
          )}

          {(mode === "border-generator" || mode === "outline-generator") && (
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
              {mode === "border-generator" && (
                <div className="space-y-1.5"><Label>Radius · {radius}px</Label><Slider min={0} max={48} value={[radius]} onValueChange={([n]) => setRadius(n)} /></div>
              )}
              {mode === "outline-generator" && (
                <div className="space-y-1.5"><Label>Offset · {offsetX}px</Label><Slider min={-8} max={24} value={[offsetX]} onValueChange={([n]) => setOffsetX(n)} /></div>
              )}
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

          {mode === "scrollbar-generator" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Track</Label>
                  <Input type="color" value={track} onChange={(e) => setTrack(e.target.value)} className="h-10 w-full p-1" />
                </div>
                <div className="space-y-1.5">
                  <Label>Thumb</Label>
                  <Input type="color" value={thumb} onChange={(e) => setThumb(e.target.value)} className="h-10 w-full p-1" />
                </div>
              </div>
              <div className="space-y-1.5"><Label>Width · {scrollWidth}px</Label><Slider min={6} max={24} value={[scrollWidth]} onValueChange={([n]) => setScrollWidth(n)} /></div>
            </>
          )}

          {mode === "typography-generator" && (
            <>
              <div className="space-y-1.5">
                <Label>Color</Label>
                <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-16 p-1" />
              </div>
              <div className="space-y-1.5"><Label>Size · {fontSize}px</Label><Slider min={10} max={72} value={[fontSize]} onValueChange={([n]) => setFontSize(n)} /></div>
              <div className="space-y-1.5"><Label>Weight · {weight}</Label><Slider min={100} max={900} step={100} value={[weight]} onValueChange={([n]) => setWeight(n)} /></div>
              <div className="space-y-1.5"><Label>Line height · {lineHeight}</Label><Slider min={1} max={2.4} step={0.05} value={[lineHeight]} onValueChange={([n]) => setLineHeight(Number(n.toFixed(2)))} /></div>
              <div className="space-y-1.5"><Label>Letter spacing · {letter}px</Label><Slider min={-2} max={8} step={0.1} value={[letter]} onValueChange={([n]) => setLetter(Number(n.toFixed(1)))} /></div>
            </>
          )}

          {mode === "css-clamp-generator" && (
            <>
              <div className="space-y-1.5"><Label>Min · {min}px</Label><Slider min={10} max={40} value={[min]} onValueChange={([n]) => setMin(n)} /></div>
              <div className="space-y-1.5"><Label>Preferred · {pref}vw</Label><Slider min={1} max={10} step={0.1} value={[pref]} onValueChange={([n]) => setPref(Number(n.toFixed(1)))} /></div>
              <div className="space-y-1.5"><Label>Max · {max}px</Label><Slider min={24} max={96} value={[max]} onValueChange={([n]) => setMax(n)} /></div>
            </>
          )}
        </div>
      }
      preview={
        <PreviewShell>
          {mode === "flexbox-playground" && (
            <div
              className="flex min-h-44 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-3"
              style={{
                flexDirection: direction as React.CSSProperties["flexDirection"],
                flexWrap: wrap as React.CSSProperties["flexWrap"],
                justifyContent: justify,
                alignItems: align,
                gap,
              }}
            >
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-500 px-4 py-3 text-sm font-medium text-white shadow-sm"
                  style={{ minWidth: n === 4 ? 96 : undefined }}
                >
                  Item {n}
                </div>
              ))}
            </div>
          )}

          {mode === "css-grid-generator" && (
            <div
              className="grid min-h-44 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-3"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                gap,
              }}
            >
              {Array.from({ length: cols * rows }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/90 to-fuchsia-500/90 p-3 text-center text-xs font-semibold text-white"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          )}

          {mode === "cursor-generator" && (
            <div
              className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 text-sm font-medium"
              style={{ cursor }}
            >
              Hover here · <span className="ml-1 font-mono text-rose-600">{cursor}</span>
            </div>
          )}

          {mode === "scrollbar-generator" && (
            <>
              <style>{`
                .scroll-${scrollId}::-webkit-scrollbar { width: ${scrollWidth}px; }
                .scroll-${scrollId}::-webkit-scrollbar-track { background: ${track}; }
                .scroll-${scrollId}::-webkit-scrollbar-thumb { background: ${thumb}; border-radius: 999px; }
              `}</style>
              <div
                className={`scroll-${scrollId} h-44 overflow-auto rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm leading-relaxed`}
                style={{ scrollbarWidth: "thin", scrollbarColor: `${thumb} ${track}` }}
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <p key={i} className="mb-2 text-muted-foreground">
                    Scrollbar preview line {i + 1} — customize track and thumb colors.
                  </p>
                ))}
              </div>
            </>
          )}

          {mode === "css-transition-generator" && (
            <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6">
              <button
                type="button"
                className="rounded-2xl bg-rose-500 px-6 py-4 text-sm font-semibold text-white shadow-md outline-none"
                style={{
                  transition: `${transitionProp} ${duration}ms ${easing} ${delay}ms`,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  if (transitionProp === "opacity" || transitionProp === "all") el.style.opacity = "0.7";
                  if (transitionProp === "transform" || transitionProp === "all") el.style.transform = "scale(1.08) translateY(-4px)";
                  if (transitionProp === "background-color" || transitionProp === "all") el.style.backgroundColor = "#a21caf";
                  if (transitionProp === "box-shadow" || transitionProp === "all") el.style.boxShadow = "0 16px 32px rgba(225,29,72,0.35)";
                  if (transitionProp === "color") el.style.color = "#ffe4e6";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.opacity = "1";
                  el.style.transform = "none";
                  el.style.backgroundColor = "";
                  el.style.boxShadow = "";
                  el.style.color = "";
                }}
              >
                Hover me
              </button>
            </div>
          )}

          {mode === "css-filter-generator" && (
            <div
              className="overflow-hidden rounded-2xl"
              style={{
                filter: `blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hue}deg)`,
              }}
            >
              <div className="relative h-40 w-full bg-[linear-gradient(135deg,#fb7185_0%,#f59e0b_35%,#34d399_70%,#60a5fa_100%)]">
                <div className="absolute inset-0 flex items-center justify-center gap-3">
                  <div className="h-16 w-16 rounded-full bg-white/90 shadow-lg" />
                  <div className="space-y-2">
                    <div className="h-3 w-28 rounded-full bg-white/90" />
                    <div className="h-3 w-20 rounded-full bg-white/70" />
                    <div className="h-3 w-24 rounded-full bg-white/50" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode === "text-shadow-generator" && (
            <div className="flex h-40 items-center justify-center rounded-2xl bg-muted/20">
              <p
                className="font-display text-4xl font-bold tracking-tight"
                style={{ textShadow: `${offsetX}px ${offsetY}px ${blur}px ${shadowRgba}`, color }}
              >
                Aa Preview
              </p>
            </div>
          )}

          {mode === "border-generator" && (
            <div className="flex h-40 items-center justify-center rounded-2xl bg-muted/20 p-6">
              <div
                className="flex h-24 w-40 items-center justify-center bg-background text-sm font-medium"
                style={{ border: `${width}px ${borderStyle} ${color}`, borderRadius: radius }}
              >
                Border
              </div>
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

          {mode === "typography-generator" && (
            <div className="rounded-2xl bg-muted/20 p-5">
              <p style={{ fontSize, fontWeight: weight, lineHeight, letterSpacing: letter, color }}>
                The quick brown fox jumps over the lazy dog.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {fontSize}px · weight {weight} · lh {lineHeight} · tracking {letter}px
              </p>
            </div>
          )}

          {mode === "css-clamp-generator" && (
            <div className="rounded-2xl bg-muted/20 p-5">
              <p className="font-display font-semibold tracking-tight" style={{ fontSize: `clamp(${min}px, ${pref}vw, ${max}px)` }}>
                Fluid type scales with the viewport.
              </p>
              <p className="mt-3 font-mono text-xs text-muted-foreground">
                clamp({min}px, {pref}vw, {max}px)
              </p>
            </div>
          )}
        </PreviewShell>
      }
      output={<OutputBox value={css} label="CSS" filename={`${mode}.css`} rows={10} />}
    />
  );
}
