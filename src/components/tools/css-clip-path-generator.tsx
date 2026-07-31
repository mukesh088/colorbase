"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ToolWorkbench, OutputBox } from "@/components/tools/suite/workbench";

type ClipMode = "polygon" | "circle" | "ellipse" | "inset";

type Point = { x: number; y: number };

type Preset = {
  id: string;
  name: string;
  points: Point[];
};

const MODES: { id: ClipMode; label: string }[] = [
  { id: "polygon", label: "Polygon" },
  { id: "circle", label: "Circle" },
  { id: "ellipse", label: "Ellipse" },
  { id: "inset", label: "Inset" },
];

const PRESETS: Preset[] = [
  {
    id: "triangle",
    name: "Triangle",
    points: [
      { x: 50, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ],
  },
  {
    id: "trapezoid",
    name: "Trapezoid",
    points: [
      { x: 20, y: 0 },
      { x: 80, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ],
  },
  {
    id: "parallelogram",
    name: "Parallelogram",
    points: [
      { x: 25, y: 0 },
      { x: 100, y: 0 },
      { x: 75, y: 100 },
      { x: 0, y: 100 },
    ],
  },
  {
    id: "rhombus",
    name: "Rhombus",
    points: [
      { x: 50, y: 0 },
      { x: 100, y: 50 },
      { x: 50, y: 100 },
      { x: 0, y: 50 },
    ],
  },
  {
    id: "pentagon",
    name: "Pentagon",
    points: [
      { x: 50, y: 0 },
      { x: 100, y: 38 },
      { x: 82, y: 100 },
      { x: 18, y: 100 },
      { x: 0, y: 38 },
    ],
  },
  {
    id: "hexagon",
    name: "Hexagon",
    points: [
      { x: 25, y: 0 },
      { x: 75, y: 0 },
      { x: 100, y: 50 },
      { x: 75, y: 100 },
      { x: 25, y: 100 },
      { x: 0, y: 50 },
    ],
  },
  {
    id: "heptagon",
    name: "Heptagon",
    points: [
      { x: 50, y: 0 },
      { x: 90, y: 20 },
      { x: 100, y: 60 },
      { x: 75, y: 100 },
      { x: 25, y: 100 },
      { x: 0, y: 60 },
      { x: 10, y: 20 },
    ],
  },
  {
    id: "octagon",
    name: "Octagon",
    points: [
      { x: 30, y: 0 },
      { x: 70, y: 0 },
      { x: 100, y: 30 },
      { x: 100, y: 70 },
      { x: 70, y: 100 },
      { x: 30, y: 100 },
      { x: 0, y: 70 },
      { x: 0, y: 30 },
    ],
  },
  {
    id: "star",
    name: "Star",
    points: [
      { x: 50, y: 0 },
      { x: 61, y: 35 },
      { x: 98, y: 35 },
      { x: 68, y: 57 },
      { x: 79, y: 91 },
      { x: 50, y: 70 },
      { x: 21, y: 91 },
      { x: 32, y: 57 },
      { x: 2, y: 35 },
      { x: 39, y: 35 },
    ],
  },
  {
    id: "arrow",
    name: "Arrow",
    points: [
      { x: 0, y: 20 },
      { x: 60, y: 20 },
      { x: 60, y: 0 },
      { x: 100, y: 50 },
      { x: 60, y: 100 },
      { x: 60, y: 80 },
      { x: 0, y: 80 },
    ],
  },
  {
    id: "chevron",
    name: "Chevron",
    points: [
      { x: 0, y: 0 },
      { x: 75, y: 0 },
      { x: 100, y: 50 },
      { x: 75, y: 100 },
      { x: 0, y: 100 },
      { x: 25, y: 50 },
    ],
  },
  {
    id: "cross",
    name: "Cross",
    points: [
      { x: 35, y: 0 },
      { x: 65, y: 0 },
      { x: 65, y: 35 },
      { x: 100, y: 35 },
      { x: 100, y: 65 },
      { x: 65, y: 65 },
      { x: 65, y: 100 },
      { x: 35, y: 100 },
      { x: 35, y: 65 },
      { x: 0, y: 65 },
      { x: 0, y: 35 },
      { x: 35, y: 35 },
    ],
  },
  {
    id: "message",
    name: "Message",
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 75 },
      { x: 75, y: 75 },
      { x: 75, y: 100 },
      { x: 50, y: 75 },
      { x: 0, y: 75 },
    ],
  },
  {
    id: "close",
    name: "Close X",
    points: [
      { x: 20, y: 0 },
      { x: 0, y: 20 },
      { x: 30, y: 50 },
      { x: 0, y: 80 },
      { x: 20, y: 100 },
      { x: 50, y: 70 },
      { x: 80, y: 100 },
      { x: 100, y: 80 },
      { x: 70, y: 50 },
      { x: 100, y: 20 },
      { x: 80, y: 0 },
      { x: 50, y: 30 },
    ],
  },
];

function formatPct(n: number) {
  return `${Math.round(n * 10) / 10}%`;
}

function pointsToCss(points: Point[]) {
  return points.map((p) => `${formatPct(p.x)} ${formatPct(p.y)}`).join(", ");
}

function regularPolygon(sides: number, radius = 48, cx = 50, cy = 50): Point[] {
  const pts: Point[] = [];
  const start = -Math.PI / 2;
  for (let i = 0; i < sides; i++) {
    const a = start + (i * 2 * Math.PI) / sides;
    pts.push({
      x: Math.round((cx + radius * Math.cos(a)) * 10) / 10,
      y: Math.round((cy + radius * Math.sin(a)) * 10) / 10,
    });
  }
  return pts;
}

function MiniShape({ points, active }: { points: Point[]; active?: boolean }) {
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
  return (
    <svg viewBox="0 0 100 100" className="h-8 w-8" aria-hidden>
      <path
        d={d}
        className={cn(
          "transition-colors",
          active ? "fill-rose-500/80 stroke-rose-600" : "fill-muted-foreground/40 stroke-muted-foreground/60"
        )}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function CssClipPathGenerator() {
  const [mode, setMode] = useState<ClipMode>("polygon");
  const [presetId, setPresetId] = useState("pentagon");
  const [points, setPoints] = useState<Point[]>(PRESETS[4].points);
  const [sides, setSides] = useState(5);
  const [circleR, setCircleR] = useState(50);
  const [circleX, setCircleX] = useState(50);
  const [circleY, setCircleY] = useState(50);
  const [ellRx, setEllRx] = useState(50);
  const [ellRy, setEllRy] = useState(35);
  const [ellX, setEllX] = useState(50);
  const [ellY, setEllY] = useState(50);
  const [insetT, setInsetT] = useState(10);
  const [insetR, setInsetR] = useState(10);
  const [insetB, setInsetB] = useState(10);
  const [insetL, setInsetL] = useState(10);
  const [insetRound, setInsetRound] = useState(0);
  const [fill, setFill] = useState("#e11d48");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const clipPath = useMemo(() => {
    switch (mode) {
      case "polygon":
        return `polygon(${pointsToCss(points)})`;
      case "circle":
        return `circle(${formatPct(circleR)} at ${formatPct(circleX)} ${formatPct(circleY)})`;
      case "ellipse":
        return `ellipse(${formatPct(ellRx)} ${formatPct(ellRy)} at ${formatPct(ellX)} ${formatPct(ellY)})`;
      case "inset": {
        const round = insetRound > 0 ? ` round ${insetRound}px` : "";
        return `inset(${formatPct(insetT)} ${formatPct(insetR)} ${formatPct(insetB)} ${formatPct(insetL)}${round})`;
      }
    }
  }, [
    mode, points, circleR, circleX, circleY, ellRx, ellRy, ellX, ellY,
    insetT, insetR, insetB, insetL, insetRound,
  ]);

  const css = useMemo(
    () =>
      [
        `/* CSS clip-path */`,
        `-webkit-clip-path: ${clipPath};`,
        `clip-path: ${clipPath};`,
      ].join("\n"),
    [clipPath]
  );

  const applyPreset = (preset: Preset) => {
    setPresetId(preset.id);
    setPoints(preset.points.map((p) => ({ ...p })));
    setMode("polygon");
  };

  const applyRegular = (n: number) => {
    setSides(n);
    setPresetId(`regular-${n}`);
    setPoints(regularPolygon(n));
    setMode("polygon");
  };

  const updatePointFromEvent = useCallback(
    (clientX: number, clientY: number, index: number) => {
      const el = stageRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
      const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
      setPoints((prev) => prev.map((p, i) => (i === index ? { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 } : p)));
      setPresetId("custom");
    },
    []
  );

  const onPointerDown = (index: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragIndex(index);
    updatePointFromEvent(e.clientX, e.clientY, index);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragIndex === null) return;
    updatePointFromEvent(e.clientX, e.clientY, dragIndex);
  };

  const onPointerUp = () => setDragIndex(null);

  return (
    <ToolWorkbench
      title="Clip-path builder"
      hint="Pick a shape, drag polygon points, then copy production-ready CSS."
      controls={
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Shape type</Label>
            <div className="flex flex-wrap gap-1.5">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
                    mode === m.id
                      ? "border-rose-500/40 bg-rose-500 text-white shadow-sm shadow-rose-500/20"
                      : "border-border/60 bg-background/80 text-muted-foreground hover:border-rose-500/30 hover:text-foreground"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {mode === "polygon" && (
            <>
              <div className="space-y-2">
                <Label>Presets</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PRESETS.map((preset) => {
                    const active = presetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-2xl border px-2.5 py-2 text-left transition-all",
                          active
                            ? "border-rose-500/40 bg-rose-500/10 shadow-sm"
                            : "border-border/50 bg-background/60 hover:border-rose-500/25"
                        )}
                      >
                        <MiniShape points={preset.points} active={active} />
                        <span className="text-xs font-semibold">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Regular polygon · {sides} sides</Label>
                <Slider
                  min={3}
                  max={12}
                  step={1}
                  value={[sides]}
                  onValueChange={([n]) => applyRegular(n)}
                />
              </div>

              <p className="text-[11px] text-muted-foreground">
                Drag the handles on the preview to reshape the polygon.
              </p>
            </>
          )}

          {mode === "circle" && (
            <>
              <div className="space-y-1.5">
                <Label>Radius · {formatPct(circleR)}</Label>
                <Slider min={5} max={70} value={[circleR]} onValueChange={([n]) => setCircleR(n)} />
              </div>
              <div className="space-y-1.5">
                <Label>Center X · {formatPct(circleX)}</Label>
                <Slider min={0} max={100} value={[circleX]} onValueChange={([n]) => setCircleX(n)} />
              </div>
              <div className="space-y-1.5">
                <Label>Center Y · {formatPct(circleY)}</Label>
                <Slider min={0} max={100} value={[circleY]} onValueChange={([n]) => setCircleY(n)} />
              </div>
            </>
          )}

          {mode === "ellipse" && (
            <>
              <div className="space-y-1.5">
                <Label>Radius X · {formatPct(ellRx)}</Label>
                <Slider min={5} max={70} value={[ellRx]} onValueChange={([n]) => setEllRx(n)} />
              </div>
              <div className="space-y-1.5">
                <Label>Radius Y · {formatPct(ellRy)}</Label>
                <Slider min={5} max={70} value={[ellRy]} onValueChange={([n]) => setEllRy(n)} />
              </div>
              <div className="space-y-1.5">
                <Label>Center X · {formatPct(ellX)}</Label>
                <Slider min={0} max={100} value={[ellX]} onValueChange={([n]) => setEllX(n)} />
              </div>
              <div className="space-y-1.5">
                <Label>Center Y · {formatPct(ellY)}</Label>
                <Slider min={0} max={100} value={[ellY]} onValueChange={([n]) => setEllY(n)} />
              </div>
            </>
          )}

          {mode === "inset" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Top · {formatPct(insetT)}</Label>
                  <Slider min={0} max={45} value={[insetT]} onValueChange={([n]) => setInsetT(n)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Right · {formatPct(insetR)}</Label>
                  <Slider min={0} max={45} value={[insetR]} onValueChange={([n]) => setInsetR(n)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Bottom · {formatPct(insetB)}</Label>
                  <Slider min={0} max={45} value={[insetB]} onValueChange={([n]) => setInsetB(n)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Left · {formatPct(insetL)}</Label>
                  <Slider min={0} max={45} value={[insetL]} onValueChange={([n]) => setInsetL(n)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Round · {insetRound}px</Label>
                <Slider min={0} max={80} value={[insetRound]} onValueChange={([n]) => setInsetRound(n)} />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label>Preview fill</Label>
            <Input
              type="color"
              value={fill}
              onChange={(e) => setFill(e.target.value)}
              className="h-10 w-full max-w-[8rem] cursor-pointer p-1"
            />
          </div>
        </div>
      }
      preview={
        <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm">
          <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
              Preview
            </p>
            <p className="text-sm font-semibold">Live clip-path</p>
          </div>
          <div className="p-4 sm:p-5">
            <div
              ref={stageRef}
              className="relative mx-auto aspect-square w-full max-w-md touch-none overflow-hidden rounded-2xl border border-border/40"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)",
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
                backgroundColor: "hsl(var(--background))",
              }}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            >
              <div
                className="absolute inset-0 transition-[clip-path] duration-75"
                style={{
                  background: `linear-gradient(145deg, ${fill}, color-mix(in srgb, ${fill} 55%, #0f172a))`,
                  clipPath,
                  WebkitClipPath: clipPath,
                }}
              />
              {mode === "polygon" &&
                points.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Point ${i + 1}`}
                    className={cn(
                      "absolute z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-rose-500 shadow-md transition-transform",
                      dragIndex === i ? "scale-125 ring-2 ring-rose-500/40" : "hover:scale-110"
                    )}
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    onPointerDown={onPointerDown(i)}
                  />
                ))}
            </div>
            <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
              {clipPath}
            </p>
          </div>
        </div>
      }
      output={<OutputBox value={css} label="Copy CSS" filename="clip-path.css" rows={5} />}
    />
  );
}
