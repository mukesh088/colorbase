"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolWorkbench, OutputBox } from "./workbench";
import type { CssSuiteMode } from "@/lib/suite-modes";

export type { CssSuiteMode };
export { isCssSuite } from "@/lib/suite-modes";

export function CssSuiteTool({ mode }: { mode: CssSuiteMode }) {
  const [color, setColor] = useState("#e11d48");
  const [x, setX] = useState(2);
  const [y, setY] = useState(4);
  const [blur, setBlur] = useState(8);
  const [opacity, setOpacity] = useState(45);
  const [width, setWidth] = useState(2);
  const [radius, setRadius] = useState(12);
  const [gap, setGap] = useState(12);
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(2);
  const [duration, setDuration] = useState(300);
  const [min, setMin] = useState(16);
  const [pref, setPref] = useState(4);
  const [max, setMax] = useState(48);
  const [justify, setJustify] = useState("center");
  const [align, setAlign] = useState("center");
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

  const css = useMemo(() => {
    switch (mode) {
      case "text-shadow-generator":
        return `text-shadow: ${x}px ${y}px ${blur}px rgba(0,0,0,${opacity / 100});\ncolor: ${color};`;
      case "flexbox-playground":
        return `.flex {\n  display: flex;\n  flex-direction: ${direction};\n  justify-content: ${justify};\n  align-items: ${align};\n  gap: ${gap}px;\n}`;
      case "css-grid-generator":
        return `.grid {\n  display: grid;\n  grid-template-columns: repeat(${cols}, 1fr);\n  grid-template-rows: repeat(${rows}, 1fr);\n  gap: ${gap}px;\n}`;
      case "css-transition-generator":
        return `transition: all ${duration}ms ease ${x}ms;`;
      case "css-filter-generator":
        return `filter: blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hue}deg);`;
      case "backdrop-filter-generator":
        return `backdrop-filter: blur(${blur}px) saturate(${saturate}%);\n-webkit-backdrop-filter: blur(${blur}px) saturate(${saturate}%);\nbackground: rgba(255,255,255,${opacity / 100});`;
      case "border-generator":
        return `border: ${width}px ${borderStyle} ${color};\nborder-radius: ${radius}px;`;
      case "outline-generator":
        return `outline: ${width}px ${borderStyle} ${color};\noutline-offset: ${x}px;`;
      case "cursor-generator":
        return `cursor: ${cursor};`;
      case "scrollbar-generator":
        return `/* Firefox */\n* { scrollbar-width: thin; scrollbar-color: ${thumb} ${track}; }\n/* WebKit */\n*::-webkit-scrollbar { width: 10px; }\n*::-webkit-scrollbar-track { background: ${track}; }\n*::-webkit-scrollbar-thumb { background: ${thumb}; border-radius: 999px; }`;
      case "typography-generator":
        return `font-size: ${fontSize}px;\nfont-weight: ${weight};\nline-height: ${lineHeight};\nletter-spacing: ${letter}px;\ncolor: ${color};`;
      case "css-clamp-generator":
        return `font-size: clamp(${min}px, ${pref}vw, ${max}px);`;
      default:
        return "";
    }
  }, [
    mode, color, x, y, blur, opacity, width, radius, gap, cols, rows, duration, min, pref, max,
    justify, align, direction, cursor, borderStyle, fontSize, weight, lineHeight, letter,
    brightness, contrast, saturate, hue, track, thumb,
  ]);

  return (
    <ToolWorkbench
      controls={
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Adjust controls and copy the generated CSS.</p>
          {["text-shadow-generator", "border-generator", "outline-generator", "typography-generator"].includes(mode) && (
            <div className="space-y-1.5">
              <Label>Color</Label>
              <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-16 p-1" />
            </div>
          )}
          {mode === "text-shadow-generator" && (
            <>
              <div className="space-y-1.5"><Label>X {x}px</Label><Slider min={-20} max={20} value={[x]} onValueChange={([n]) => setX(n)} /></div>
              <div className="space-y-1.5"><Label>Y {y}px</Label><Slider min={-20} max={20} value={[y]} onValueChange={([n]) => setY(n)} /></div>
              <div className="space-y-1.5"><Label>Blur {blur}px</Label><Slider min={0} max={40} value={[blur]} onValueChange={([n]) => setBlur(n)} /></div>
              <div className="space-y-1.5"><Label>Opacity {opacity}%</Label><Slider min={0} max={100} value={[opacity]} onValueChange={([n]) => setOpacity(n)} /></div>
            </>
          )}
          {mode === "flexbox-playground" && (
            <>
              <div className="space-y-1.5"><Label>Direction</Label>
                <Select value={direction} onValueChange={setDirection}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["row", "column", "row-reverse", "column-reverse"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Justify</Label>
                <Select value={justify} onValueChange={setJustify}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["flex-start", "center", "flex-end", "space-between", "space-around"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Align</Label>
                <Select value={align} onValueChange={setAlign}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["stretch", "flex-start", "center", "flex-end"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Gap {gap}px</Label><Slider min={0} max={48} value={[gap]} onValueChange={([n]) => setGap(n)} /></div>
            </>
          )}
          {mode === "css-grid-generator" && (
            <>
              <div className="space-y-1.5"><Label>Columns {cols}</Label><Slider min={1} max={8} value={[cols]} onValueChange={([n]) => setCols(n)} /></div>
              <div className="space-y-1.5"><Label>Rows {rows}</Label><Slider min={1} max={6} value={[rows]} onValueChange={([n]) => setRows(n)} /></div>
              <div className="space-y-1.5"><Label>Gap {gap}px</Label><Slider min={0} max={48} value={[gap]} onValueChange={([n]) => setGap(n)} /></div>
            </>
          )}
          {mode === "css-transition-generator" && (
            <>
              <div className="space-y-1.5"><Label>Duration {duration}ms</Label><Slider min={50} max={2000} step={50} value={[duration]} onValueChange={([n]) => setDuration(n)} /></div>
              <div className="space-y-1.5"><Label>Delay {x}ms</Label><Slider min={0} max={1000} step={50} value={[x]} onValueChange={([n]) => setX(n)} /></div>
            </>
          )}
          {(mode === "css-filter-generator" || mode === "backdrop-filter-generator") && (
            <>
              <div className="space-y-1.5"><Label>Blur {blur}px</Label><Slider min={0} max={40} value={[blur]} onValueChange={([n]) => setBlur(n)} /></div>
              <div className="space-y-1.5"><Label>Saturate {saturate}%</Label><Slider min={0} max={200} value={[saturate]} onValueChange={([n]) => setSaturate(n)} /></div>
              {mode === "css-filter-generator" && (
                <>
                  <div className="space-y-1.5"><Label>Brightness {brightness}%</Label><Slider min={0} max={200} value={[brightness]} onValueChange={([n]) => setBrightness(n)} /></div>
                  <div className="space-y-1.5"><Label>Contrast {contrast}%</Label><Slider min={0} max={200} value={[contrast]} onValueChange={([n]) => setContrast(n)} /></div>
                  <div className="space-y-1.5"><Label>Hue {hue}°</Label><Slider min={0} max={360} value={[hue]} onValueChange={([n]) => setHue(n)} /></div>
                </>
              )}
              {mode === "backdrop-filter-generator" && (
                <div className="space-y-1.5"><Label>Opacity {opacity}%</Label><Slider min={0} max={100} value={[opacity]} onValueChange={([n]) => setOpacity(n)} /></div>
              )}
            </>
          )}
          {(mode === "border-generator" || mode === "outline-generator") && (
            <>
              <div className="space-y-1.5"><Label>Width {width}px</Label><Slider min={0} max={20} value={[width]} onValueChange={([n]) => setWidth(n)} /></div>
              <div className="space-y-1.5"><Label>Style</Label>
                <Select value={borderStyle} onValueChange={setBorderStyle}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["solid", "dashed", "dotted", "double"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {mode === "border-generator" && <div className="space-y-1.5"><Label>Radius {radius}px</Label><Slider min={0} max={40} value={[radius]} onValueChange={([n]) => setRadius(n)} /></div>}
              {mode === "outline-generator" && <div className="space-y-1.5"><Label>Offset {x}px</Label><Slider min={0} max={20} value={[x]} onValueChange={([n]) => setX(n)} /></div>}
            </>
          )}
          {mode === "cursor-generator" && (
            <div className="space-y-1.5"><Label>Cursor</Label>
              <Select value={cursor} onValueChange={setCursor}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["auto", "default", "pointer", "text", "move", "grab", "grabbing", "crosshair", "wait", "help", "not-allowed", "zoom-in", "zoom-out"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {mode === "scrollbar-generator" && (
            <>
              <div className="space-y-1.5"><Label>Track</Label><Input type="color" value={track} onChange={(e) => setTrack(e.target.value)} className="h-10 w-16 p-1" /></div>
              <div className="space-y-1.5"><Label>Thumb</Label><Input type="color" value={thumb} onChange={(e) => setThumb(e.target.value)} className="h-10 w-16 p-1" /></div>
            </>
          )}
          {mode === "typography-generator" && (
            <>
              <div className="space-y-1.5"><Label>Size {fontSize}px</Label><Slider min={10} max={72} value={[fontSize]} onValueChange={([n]) => setFontSize(n)} /></div>
              <div className="space-y-1.5"><Label>Weight {weight}</Label><Slider min={100} max={900} step={100} value={[weight]} onValueChange={([n]) => setWeight(n)} /></div>
              <div className="space-y-1.5"><Label>Line height {lineHeight}</Label><Slider min={1} max={2.4} step={0.05} value={[lineHeight]} onValueChange={([n]) => setLineHeight(Number(n.toFixed(2)))} /></div>
              <div className="space-y-1.5"><Label>Letter spacing {letter}px</Label><Slider min={-2} max={8} step={0.1} value={[letter]} onValueChange={([n]) => setLetter(Number(n.toFixed(1)))} /></div>
            </>
          )}
          {mode === "css-clamp-generator" && (
            <>
              <div className="space-y-1.5"><Label>Min {min}px</Label><Slider min={10} max={40} value={[min]} onValueChange={([n]) => setMin(n)} /></div>
              <div className="space-y-1.5"><Label>Preferred {pref}vw</Label><Slider min={1} max={10} step={0.1} value={[pref]} onValueChange={([n]) => setPref(Number(n.toFixed(1)))} /></div>
              <div className="space-y-1.5"><Label>Max {max}px</Label><Slider min={24} max={96} value={[max]} onValueChange={([n]) => setMax(n)} /></div>
            </>
          )}
        </div>
      }
      preview={
        <div className="rounded-3xl border border-border/50 bg-gradient-to-br from-rose-50 to-fuchsia-50 p-6 dark:from-rose-950/40 dark:to-fuchsia-950/30">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-rose-600">Preview</p>
          {mode === "flexbox-playground" && (
            <div className="flex min-h-40 rounded-2xl bg-white/70 p-3 dark:bg-black/20" style={{ flexDirection: direction as React.CSSProperties["flexDirection"], justifyContent: justify, alignItems: align, gap }}>
              {[1, 2, 3].map((n) => <div key={n} className="rounded-xl bg-rose-500 px-4 py-3 text-sm font-medium text-white">Item {n}</div>)}
            </div>
          )}
          {mode === "css-grid-generator" && (
            <div className="grid min-h-40 rounded-2xl bg-white/70 p-3 dark:bg-black/20" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap }}>
              {Array.from({ length: cols * rows }).map((_, i) => (
                <div key={i} className="rounded-xl bg-fuchsia-500/90 p-3 text-center text-xs font-medium text-white">{i + 1}</div>
              ))}
            </div>
          )}
          {mode === "cursor-generator" && (
            <div className="flex h-40 items-center justify-center rounded-2xl bg-white/80 text-sm dark:bg-black/20" style={{ cursor }}>
              Hover here — cursor: {cursor}
            </div>
          )}
          {mode === "scrollbar-generator" && (
            <div className="h-40 overflow-auto rounded-2xl bg-white/80 p-3 text-sm dark:bg-black/20" style={{ scrollbarColor: `${thumb} ${track}` } as React.CSSProperties}>
              {Array.from({ length: 20 }).map((_, i) => <p key={i}>Scrollbar preview line {i + 1}</p>)}
            </div>
          )}
          {!["flexbox-playground", "css-grid-generator", "cursor-generator", "scrollbar-generator"].includes(mode) && (
            <div
              className="rounded-2xl bg-white/80 p-8 text-center dark:bg-black/20"
              style={
                mode === "text-shadow-generator"
                  ? { textShadow: `${x}px ${y}px ${blur}px rgba(0,0,0,${opacity / 100})`, color, fontSize: 28, fontWeight: 700 }
                  : mode === "css-filter-generator"
                    ? { filter: `blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hue}deg)` }
                    : mode === "backdrop-filter-generator"
                      ? { backdropFilter: `blur(${blur}px) saturate(${saturate}%)`, background: `rgba(255,255,255,${opacity / 100})` }
                      : mode === "border-generator"
                        ? { border: `${width}px ${borderStyle} ${color}`, borderRadius: radius }
                        : mode === "outline-generator"
                          ? { outline: `${width}px ${borderStyle} ${color}`, outlineOffset: x }
                          : mode === "typography-generator"
                            ? { fontSize, fontWeight: weight, lineHeight, letterSpacing: letter, color }
                            : mode === "css-clamp-generator"
                              ? { fontSize: `clamp(${min}px, ${pref}vw, ${max}px)` }
                              : mode === "css-transition-generator"
                                ? { transition: `all ${duration}ms ease ${x}ms` }
                                : undefined
              }
            >
              {mode === "css-filter-generator" ? (
                <div className="mx-auto h-24 w-40 rounded-xl bg-gradient-to-r from-rose-500 to-amber-400" />
              ) : (
                "Aa Preview"
              )}
            </div>
          )}
        </div>
      }
      output={<OutputBox value={css} label="CSS" rows={10} />}
    />
  );
}
