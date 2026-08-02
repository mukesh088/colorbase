"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GameShell, GameStat, WinBanner } from "./game-shell";
import { WORD_SEARCH_WORDS, shuffle } from "@/lib/games/data";
import { cn } from "@/lib/utils";

const SIZE = 12;
const DIRS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [0, -1],
  [-1, 0],
  [-1, -1],
  [1, -1],
  [-1, 1],
] as const;

function placeWords(words: string[], seed: number) {
  const grid: string[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(""));
  const placed: { word: string; cells: string[] }[] = [];
  const dirs = shuffle([...DIRS], seed);

  for (const word of words) {
    let ok = false;
    for (let attempt = 0; attempt < 80 && !ok; attempt++) {
      const dir = dirs[(seed + attempt) % dirs.length]!;
      const r0 = Math.floor(Math.random() * SIZE);
      const c0 = Math.floor(Math.random() * SIZE);
      const cells: [number, number][] = [];
      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const r = r0 + dir[0] * i;
        const c = c0 + dir[1] * i;
        if (r < 0 || c < 0 || r >= SIZE || c >= SIZE) {
          fits = false;
          break;
        }
        const cur = grid[r]![c]!;
        if (cur && cur !== word[i]) {
          fits = false;
          break;
        }
        cells.push([r, c]);
      }
      if (!fits) continue;
      for (let i = 0; i < word.length; i++) {
        const [r, c] = cells[i]!;
        grid[r]![c] = word[i]!;
      }
      placed.push({ word, cells: cells.map(([r, c]) => `${r},${c}`) });
      ok = true;
    }
  }

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (!grid[r]![c]) grid[r]![c] = letters[Math.floor(Math.random() * 26)]!;

  return { grid, placed };
}

export function GameWordSearch() {
  const [seed, setSeed] = useState(1);
  const words = useMemo(() => shuffle(WORD_SEARCH_WORDS, seed).slice(0, 8), [seed]);
  const { grid, placed } = useMemo(() => placeWords(words, seed), [words, seed]);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [path, setPath] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  const reset = () => {
    setSeed((s) => s + 1);
    setFound(new Set());
    setPath([]);
  };

  const cellKey = (r: number, c: number) => `${r},${c}`;

  const finishPath = (keys: string[]) => {
    if (keys.length < 2) return;
    const hit = placed.find(
      (p) =>
        !found.has(p.word) &&
        p.cells.length === keys.length &&
        (p.cells.every((k, i) => k === keys[i]) || p.cells.every((k, i) => k === keys[keys.length - 1 - i]))
    );
    if (hit) setFound(new Set(found).add(hit.word));
  };

  const onDown = (r: number, c: number) => {
    setDragging(true);
    setPath([cellKey(r, c)]);
  };
  const onEnter = (r: number, c: number) => {
    if (!dragging) return;
    const k = cellKey(r, c);
    setPath((p) => (p.includes(k) ? p : [...p, k]));
  };
  const onUp = () => {
    setDragging(false);
    finishPath(path);
    setPath([]);
  };

  const won = found.size === placed.length && placed.length > 0;

  return (
    <GameShell
      title="Word Search"
      subtitle="Drag across letters to find every hidden word."
      accent="from-fuchsia-500/20 via-pink-500/10 to-rose-500/15"
      onNewGame={reset}
      stats={<GameStat label="Found" value={`${found.size}/${placed.length}`} />}
    >
      {won && <WinBanner title="All words found!" onAgain={reset} />}

      <div className="grid gap-6 lg:grid-cols-[1fr_200px]" onMouseLeave={onUp}>
        <div
          className="mx-auto grid select-none gap-1 rounded-3xl bg-fuchsia-950/10 p-2 dark:bg-black/30"
          style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
          onMouseUp={onUp}
        >
          {grid.map((row, r) =>
            row.map((ch, c) => {
              const k = cellKey(r, c);
              const inPath = path.includes(k);
              const inFound = placed.some((p) => found.has(p.word) && p.cells.includes(k));
              return (
                <motion.button
                  key={k}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onMouseDown={() => onDown(r, c)}
                  onMouseEnter={() => onEnter(r, c)}
                  onTouchStart={() => onDown(r, c)}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-md text-[10px] font-bold sm:text-sm",
                    inFound && "bg-emerald-500 text-white",
                    inPath && !inFound && "bg-fuchsia-500 text-white",
                    !inPath && !inFound && "bg-background/80"
                  )}
                >
                  {ch}
                </motion.button>
              );
            })
          )}
        </div>
        <ul className="space-y-2">
          {placed.map((p) => (
            <li
              key={p.word}
              className={cn(
                "rounded-xl border border-border/50 px-3 py-2 font-semibold tracking-wide",
                found.has(p.word) && "bg-emerald-500/15 text-emerald-700 line-through dark:text-emerald-300"
              )}
            >
              {p.word}
            </li>
          ))}
        </ul>
      </div>
    </GameShell>
  );
}
