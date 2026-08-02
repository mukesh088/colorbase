"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GameShell, GameStat, WinBanner } from "./game-shell";
import { shuffle } from "@/lib/games/data";
import { cn } from "@/lib/utils";

const COLORS = [
  { id: "rose", className: "bg-rose-500" },
  { id: "sky", className: "bg-sky-500" },
  { id: "amber", className: "bg-amber-400" },
  { id: "emerald", className: "bg-emerald-500" },
  { id: "violet", className: "bg-violet-500" },
  { id: "orange", className: "bg-orange-500" },
];

const CAPACITY = 4;
const TUBE_COUNT = 8; // 6 colors + 2 empty

function makePuzzle(seed: number): string[][] {
  const colors = COLORS.map((c) => c.id);
  const pool: string[] = [];
  for (const c of colors) for (let i = 0; i < CAPACITY; i++) pool.push(c);
  const shuffled = shuffle(pool, seed);
  const tubes: string[][] = Array.from({ length: TUBE_COUNT }, () => []);
  let i = 0;
  for (let t = 0; t < colors.length; t++) {
    for (let k = 0; k < CAPACITY; k++) tubes[t]!.push(shuffled[i++]!);
  }
  return tubes;
}

function topRun(tube: string[]) {
  if (!tube.length) return { color: null as string | null, count: 0 };
  const color = tube[tube.length - 1]!;
  let count = 0;
  for (let i = tube.length - 1; i >= 0; i--) {
    if (tube[i] !== color) break;
    count++;
  }
  return { color, count };
}

function isSolved(tubes: string[][]) {
  return tubes.every((t) => t.length === 0 || (t.length === CAPACITY && t.every((c) => c === t[0])));
}

export function GameWaterSort() {
  const [seed, setSeed] = useState(1);
  const [tubes, setTubes] = useState(() => makePuzzle(1));
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);

  const won = useMemo(() => isSolved(tubes), [tubes]);

  const reset = () => {
    const s = seed + 1;
    setSeed(s);
    setTubes(makePuzzle(s));
    setSelected(null);
    setMoves(0);
  };

  const colorClass = (id: string) => COLORS.find((c) => c.id === id)?.className ?? "bg-muted";

  const pour = (from: number, to: number) => {
    if (from === to) return;
    const src = [...tubes[from]!];
    const dst = [...tubes[to]!];
    const run = topRun(src);
    if (!run.color || !run.count) return;
    if (dst.length >= CAPACITY) return;
    if (dst.length && dst[dst.length - 1] !== run.color) return;
    const space = CAPACITY - dst.length;
    const amount = Math.min(space, run.count);
    for (let i = 0; i < amount; i++) dst.push(src.pop()!);
    const next = tubes.map((t, i) => (i === from ? src : i === to ? dst : [...t]));
    setTubes(next);
    setMoves((m) => m + 1);
    setSelected(null);
    if (isSolved(next)) toast.success("Sorted!");
  };

  const onTube = (i: number) => {
    if (won) return;
    if (selected === null) {
      if (tubes[i]!.length) setSelected(i);
      return;
    }
    if (selected === i) {
      setSelected(null);
      return;
    }
    pour(selected, i);
  };

  return (
    <GameShell
      title="Water Sort Puzzle"
      subtitle="Pour colors between tubes until each tube holds one color."
      accent="from-cyan-500/20 via-sky-500/10 to-teal-500/15"
      onNewGame={reset}
      stats={<GameStat label="Moves" value={moves} />}
      footer="Select a tube, then tap another to pour. Empty tubes help you rearrange."
    >
      {won && <WinBanner title="Perfect pour!" detail={`${moves} moves`} onAgain={reset} />}

      <div className="flex flex-wrap items-end justify-center gap-3 sm:gap-4">
        {tubes.map((tube, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onTube(i)}
            className={cn(
              "relative flex h-52 w-12 flex-col-reverse overflow-hidden rounded-b-2xl rounded-t-lg border-2 border-border/70 bg-background/50 sm:h-60 sm:w-14",
              selected === i && "ring-2 ring-cyan-500 border-cyan-500"
            )}
          >
            {tube.map((c, j) => (
              <motion.div
                key={`${i}-${j}-${c}`}
                layout
                initial={{ opacity: 0.6, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("h-1/4 w-full", colorClass(c))}
              />
            ))}
          </button>
        ))}
      </div>
    </GameShell>
  );
}
