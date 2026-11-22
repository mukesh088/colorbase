"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PlateKind = "control" | "red-green" | "blue-yellow";
type Plate = { answer: string; kind: PlateKind; figure: string[]; ground: string[] };

/**
 * Original pseudo-isochromatic plates (not Ishihara reproductions). Figure and
 * ground colors sit on confusion lines for each deficiency and vary in
 * lightness so the number cannot be read from brightness alone.
 */
const PLATES: Plate[] = [
  { answer: "12", kind: "control", figure: ["#3f3f46", "#52525b", "#27272a"], ground: ["#d4d4d8", "#e4e4e7", "#c7c7cc"] },
  { answer: "74", kind: "red-green", figure: ["#d0573f", "#e07a4f", "#c9663a", "#db6a4a"], ground: ["#8fa04a", "#9fae58", "#7f9447", "#a8ad5c"] },
  { answer: "8", kind: "red-green", figure: ["#cc6b55", "#d98163", "#c25e4c"], ground: ["#86a36b", "#97ad6f", "#7b9a63"] },
  { answer: "29", kind: "red-green", figure: ["#c96f4a", "#d6825a", "#bf6544", "#da7752"], ground: ["#99a35a", "#a7ad65", "#8c9a52", "#b0ae67"] },
  { answer: "5", kind: "red-green", figure: ["#b9767a", "#c58589", "#ad6c70"], ground: ["#8e9a7a", "#9aa684", "#839070"] },
  { answer: "6", kind: "blue-yellow", figure: ["#6f86c4", "#7c8fcc", "#6479b8"], ground: ["#9aa889", "#a7b293", "#8f9d7f"] },
  { answer: "42", kind: "blue-yellow", figure: ["#7c79c0", "#8986c9", "#6f6cb3", "#8581c4"], ground: ["#a3ad7c", "#b0b887", "#97a271", "#a9b180"] },
];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function drawPlate(canvas: HTMLCanvasElement, plate: Plate, seed: number) {
  const size = 320;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  // Mask: the number drawn off-screen.
  const mask = document.createElement("canvas");
  mask.width = size;
  mask.height = size;
  const m = mask.getContext("2d");
  if (!m) return;
  m.fillStyle = "#000";
  m.font = `bold ${plate.answer.length > 1 ? 150 : 190}px Arial, sans-serif`;
  m.textAlign = "center";
  m.textBaseline = "middle";
  m.fillText(plate.answer, size / 2, size / 2 + 8);
  const maskData = m.getImageData(0, 0, size, size).data;
  const inside = (x: number, y: number) => maskData[(Math.round(y) * size + Math.round(x)) * 4 + 3] > 128;

  ctx.clearRect(0, 0, size, size);
  const rand = seeded(seed);
  const placed: [number, number, number][] = [];
  const r0 = size / 2 - 4;
  for (let tries = 0; tries < 9000 && placed.length < 1100; tries++) {
    const radius = 3 + rand() * 6;
    const angle = rand() * Math.PI * 2;
    const dist = Math.sqrt(rand()) * (r0 - radius);
    const x = size / 2 + Math.cos(angle) * dist;
    const y = size / 2 + Math.sin(angle) * dist;
    if (placed.some(([px, py, pr]) => (px - x) ** 2 + (py - y) ** 2 < (pr + radius + 1) ** 2)) continue;
    placed.push([x, y, radius]);
    const set = inside(x, y) ? plate.figure : plate.ground;
    ctx.fillStyle = set[Math.floor(rand() * set.length)];
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function ColorBlindTest() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [value, setValue] = useState("");
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const done = index >= PLATES.length;

  useEffect(() => {
    if (!done && canvas.current) drawPlate(canvas.current, PLATES[index], 1000 + index * 97);
  }, [index, done]);

  const submit = (answer: string) => {
    setAnswers((a) => [...a, answer.trim()]);
    setValue("");
    setIndex((i) => i + 1);
  };
  const restart = () => {
    setAnswers([]);
    setValue("");
    setIndex(0);
  };

  if (done) {
    const score = (kind: PlateKind) => {
      const plates = PLATES.map((p, i) => ({ p, a: answers[i] })).filter((x) => x.p.kind === kind);
      return { right: plates.filter((x) => x.a === x.p.answer).length, total: plates.length };
    };
    const control = score("control");
    const rg = score("red-green");
    const by = score("blue-yellow");
    const summary =
      control.right < control.total
        ? "You missed the control plate, which almost everyone can read. Check your screen brightness and viewing distance, then try again."
        : rg.right <= rg.total / 2
          ? "You missed several red–green plates. That pattern can point to a red–green color vision deficiency (protan or deutan)."
          : by.right < by.total
            ? "You missed a blue–yellow plate. That can happen with a tritan deficiency, but it is also common on uncalibrated screens."
            : "You read every plate. That suggests typical color vision, at least on this screen.";
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ul className="grid gap-2 sm:grid-cols-3">
            <li className="rounded-xl border border-border p-3">Control: {control.right}/{control.total}</li>
            <li className="rounded-xl border border-border p-3">Red–green: {rg.right}/{rg.total}</li>
            <li className="rounded-xl border border-border p-3">Blue–yellow: {by.right}/{by.total}</li>
          </ul>
          <p className="text-base">{summary}</p>
          <p className="text-muted-foreground">
            This is a screening on a screen, not a medical diagnosis. Monitor colors, brightness and night modes change the
            result. For a reliable answer, ask an optometrist for a clinical test.
          </p>
          <ol className="text-muted-foreground list-decimal space-y-1 pl-5">
            {PLATES.map((p, i) => (
              <li key={i}>
                Plate {i + 1} ({p.kind}): you entered “{answers[i] || "nothing"}”, the number was {p.answer}.
              </li>
            ))}
          </ol>
          <Button type="button" onClick={restart}>
            Take the test again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Plate {index + 1} of {PLATES.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <canvas
          ref={canvas}
          className="h-72 w-72 rounded-full sm:h-80 sm:w-80"
          role="img"
          aria-label={`Color vision test plate ${index + 1}`}
        />
        <form
          className="flex w-full max-w-xs gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
          }}
        >
          <label htmlFor="cvd-answer" className="sr-only">
            Number you see
          </label>
          <Input id="cvd-answer" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))} placeholder="Number you see" autoFocus />
          <Button type="submit">Next</Button>
        </form>
        <Button type="button" variant="ghost" size="sm" onClick={() => submit("")}>
          I can&apos;t see a number
        </Button>
        <p className="text-muted-foreground text-center text-xs">
          View the plate at arm&apos;s length with screen brightness at normal and night mode off.
        </p>
      </CardContent>
    </Card>
  );
}
