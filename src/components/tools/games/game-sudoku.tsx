"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GameShell, GameStat, WinBanner } from "./game-shell";
import { cn } from "@/lib/utils";

type Grid = number[][]; // 0 empty

function clone(g: Grid): Grid {
  return g.map((r) => [...r]);
}

function isValid(grid: Grid, r: number, c: number, n: number) {
  for (let i = 0; i < 9; i++) {
    if (grid[r]![i] === n || grid[i]![c] === n) return false;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) if (grid[br + i]![bc + j] === n) return false;
  return true;
}

function findEmpty(grid: Grid) {
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (grid[r]![c] === 0) return [r, c] as const;
  return null;
}

function solve(grid: Grid): boolean {
  const empty = findEmpty(grid);
  if (!empty) return true;
  const [r, c] = empty;
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
  for (const n of nums) {
    if (isValid(grid, r, c, n)) {
      grid[r]![c] = n;
      if (solve(grid)) return true;
      grid[r]![c] = 0;
    }
  }
  return false;
}

function generatePuzzle(holes = 45): { puzzle: Grid; solution: Grid } {
  const solution: Grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  solve(solution);
  const puzzle = clone(solution);
  let removed = 0;
  const cells = Array.from({ length: 81 }, (_, i) => i).sort(() => Math.random() - 0.5);
  for (const idx of cells) {
    if (removed >= holes) break;
    const r = Math.floor(idx / 9);
    const c = idx % 9;
    puzzle[r]![c] = 0;
    removed++;
  }
  return { puzzle, solution };
}

export function GameSudoku() {
  const [seed, setSeed] = useState(0);
  const [bundle, setBundle] = useState(() => generatePuzzle(42));
  const solution = bundle.solution;
  const [lockedCells, setLockedCells] = useState(() =>
    bundle.puzzle.map((r) => r.map((v) => v !== 0))
  );
  const [board, setBoard] = useState(() => clone(bundle.puzzle));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [won, setWon] = useState(false);

  const newGame = () => {
    const next = generatePuzzle(42);
    setBundle(next);
    setBoard(clone(next.puzzle));
    setLockedCells(next.puzzle.map((r) => r.map((v) => v !== 0)));
    setWon(false);
    setSelected(null);
    setSeed((s) => s + 1);
  };

  const put = (n: number) => {
    if (!selected || won) return;
    const [r, c] = selected;
    if (lockedCells[r]![c]) return;
    const next = clone(board);
    next[r]![c] = n;
    setBoard(next);
    const complete = next.every((row, ri) => row.every((v, ci) => v === solution[ri]![ci]));
    if (complete) {
      setWon(true);
      toast.success("Sudoku solved!");
    }
  };

  const filled = board.flat().filter((v) => v !== 0).length;

  return (
    <GameShell
      title="Sudoku"
      subtitle="Fill every row, column, and 3×3 box with digits 1–9."
      accent="from-indigo-500/20 via-violet-500/10 to-sky-500/15"
      onNewGame={newGame}
      stats={<GameStat label="Filled" value={`${filled}/81`} />}
      footer="Tap a cell, then pick a number. Locked clues cannot be changed."
    >
      {won && <WinBanner title="Puzzle complete!" onAgain={newGame} />}

      <div className="mx-auto grid max-w-md gap-4">
        <div key={seed} className="grid grid-cols-9 gap-0.5 rounded-2xl bg-indigo-950/20 p-1.5 dark:bg-black/40">
          {board.map((row, r) =>
            row.map((v, c) => {
              const boxShade = (Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 0;
              const sel = selected?.[0] === r && selected?.[1] === c;
              const conflict =
                v !== 0 &&
                !lockedCells[r]![c] &&
                (() => {
                  for (let i = 0; i < 9; i++) {
                    if (i !== c && board[r]![i] === v) return true;
                    if (i !== r && board[i]![c] === v) return true;
                  }
                  return false;
                })();
              return (
                <motion.button
                  key={`${r}-${c}`}
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setSelected([r, c])}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-md text-sm font-semibold sm:text-lg",
                    boxShade ? "bg-background/90" : "bg-muted/40",
                    sel && "ring-2 ring-indigo-500",
                    lockedCells[r]![c] && "font-bold text-indigo-700 dark:text-indigo-300",
                    conflict && "bg-rose-500/20 text-rose-700"
                  )}
                >
                  {v || ""}
                </motion.button>
              );
            })
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <Button key={n} type="button" className="h-11 w-11 rounded-xl" onClick={() => put(n)}>
              {n}
            </Button>
          ))}
          <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={() => put(0)}>
            Clear
          </Button>
        </div>
      </div>
    </GameShell>
  );
}
