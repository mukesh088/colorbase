"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GameShell, GameStat, WinBanner } from "./game-shell";
import { cn } from "@/lib/utils";

const W = 15;
const H = 15;

type Cell = { walls: [boolean, boolean, boolean, boolean] }; // N E S W

function generateMaze(seed: number): Cell[][] {
  const grid: Cell[][] = Array.from({ length: H }, () =>
    Array.from({ length: W }, () => ({ walls: [true, true, true, true] as [boolean, boolean, boolean, boolean] }))
  );
  const visited = Array.from({ length: H }, () => Array(W).fill(false));
  let s = seed >>> 0;
  const rand = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };

  const carve = (r: number, c: number) => {
    visited[r]![c] = true;
    const dirs = shuffleDirs(rand);
    for (const [dr, dc, wall, opp] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= H || nc >= W || visited[nr]![nc]) continue;
      grid[r]![c]!.walls[wall] = false;
      grid[nr]![nc]!.walls[opp] = false;
      carve(nr, nc);
    }
  };
  carve(0, 0);
  return grid;
}

function shuffleDirs(rand: () => number) {
  const dirs: [number, number, number, number][] = [
    [-1, 0, 0, 2],
    [0, 1, 1, 3],
    [1, 0, 2, 0],
    [0, -1, 3, 1],
  ];
  for (let i = dirs.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [dirs[i], dirs[j]] = [dirs[j]!, dirs[i]!];
  }
  return dirs;
}

export function GameMaze() {
  const [seed, setSeed] = useState(42);
  const maze = useMemo(() => generateMaze(seed), [seed]);
  const [pos, setPos] = useState({ r: 0, c: 0 });
  const [moves, setMoves] = useState(0);
  const won = pos.r === H - 1 && pos.c === W - 1;

  const reset = () => {
    setSeed((s) => s + 7);
    setPos({ r: 0, c: 0 });
    setMoves(0);
  };

  const tryMove = (dr: number, dc: number) => {
    if (won) return;
    const cell = maze[pos.r]![pos.c]!;
    if (dr === -1 && cell.walls[0]) return;
    if (dc === 1 && cell.walls[1]) return;
    if (dr === 1 && cell.walls[2]) return;
    if (dc === -1 && cell.walls[3]) return;
    const nr = pos.r + dr;
    const nc = pos.c + dc;
    if (nr < 0 || nc < 0 || nr >= H || nc >= W) return;
    setPos({ r: nr, c: nc });
    setMoves((m) => m + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, [number, number]> = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
        w: [-1, 0],
        s: [1, 0],
        a: [0, -1],
        d: [0, 1],
      };
      const m = map[e.key] ?? map[e.key.toLowerCase()];
      if (!m) return;
      e.preventDefault();
      tryMove(m[0], m[1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [maze, pos, won]);

  return (
    <GameShell
      title="Maze"
      subtitle="Find the path from the green start to the gold finish. Use arrow keys."
      accent="from-lime-500/20 via-emerald-500/10 to-teal-500/15"
      onNewGame={reset}
      newGameLabel="New maze"
      stats={<GameStat label="Moves" value={moves} />}
    >
      {won && <WinBanner title="Escaped!" detail={`${moves} moves`} onAgain={reset} />}

      <div
        className="mx-auto inline-grid gap-0 rounded-2xl border-4 border-emerald-800/40 bg-emerald-950/20 p-1"
        style={{ gridTemplateColumns: `repeat(${W}, minmax(0, 1fr))` }}
      >
        {maze.map((row, r) =>
          row.map((cell, c) => {
            const isPlayer = pos.r === r && pos.c === c;
            const isStart = r === 0 && c === 0;
            const isEnd = r === H - 1 && c === W - 1;
            return (
              <div
                key={`${r}-${c}`}
                className={cn(
                  "relative h-5 w-5 sm:h-6 sm:w-6",
                  cell.walls[0] && "border-t-2 border-t-emerald-900 dark:border-t-emerald-300/70",
                  cell.walls[1] && "border-r-2 border-r-emerald-900 dark:border-r-emerald-300/70",
                  cell.walls[2] && "border-b-2 border-b-emerald-900 dark:border-b-emerald-300/70",
                  cell.walls[3] && "border-l-2 border-l-emerald-900 dark:border-l-emerald-300/70",
                  isStart && "bg-emerald-400/40",
                  isEnd && "bg-amber-400/50"
                )}
              >
                {isPlayer && (
                  <motion.div
                    layoutId="maze-player"
                    className="absolute inset-1 rounded-full bg-gradient-to-br from-lime-300 to-emerald-600 shadow"
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mx-auto mt-4 grid max-w-xs grid-cols-3 gap-2 sm:hidden">
        <div />
        <button type="button" className="rounded-xl border py-3" onClick={() => tryMove(-1, 0)}>↑</button>
        <div />
        <button type="button" className="rounded-xl border py-3" onClick={() => tryMove(0, -1)}>←</button>
        <button type="button" className="rounded-xl border py-3" onClick={() => tryMove(1, 0)}>↓</button>
        <button type="button" className="rounded-xl border py-3" onClick={() => tryMove(0, 1)}>→</button>
      </div>
    </GameShell>
  );
}
