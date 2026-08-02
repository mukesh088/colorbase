"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GameShell, GameStat, WinBanner } from "./game-shell";
import { cn } from "@/lib/utils";

const N = 4;

function solved(): number[] {
  return Array.from({ length: N * N }, (_, i) => (i + 1) % (N * N));
}

function shuffleBoard(): number[] {
  const a = solved();
  // Fisher-Yates with parity check for solvability
  do {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
  } while (!isSolvable(a) || a.every((v, i) => v === solved()[i]));
  return a;
}

function isSolvable(board: number[]) {
  let inv = 0;
  for (let i = 0; i < board.length; i++) {
    for (let j = i + 1; j < board.length; j++) {
      if (board[i] && board[j] && board[i]! > board[j]!) inv++;
    }
  }
  const emptyRow = Math.floor(board.indexOf(0) / N);
  if (N % 2 === 1) return inv % 2 === 0;
  return (inv + emptyRow) % 2 === 1;
}

export function GameSlidingPuzzle() {
  const [board, setBoard] = useState(() => shuffleBoard());
  const [moves, setMoves] = useState(0);

  const won = useMemo(() => board.every((v, i) => v === solved()[i]), [board]);

  const reset = () => {
    setBoard(shuffleBoard());
    setMoves(0);
  };

  const move = (idx: number) => {
    if (won) return;
    const empty = board.indexOf(0);
    const er = Math.floor(empty / N);
    const ec = empty % N;
    const r = Math.floor(idx / N);
    const c = idx % N;
    if (Math.abs(er - r) + Math.abs(ec - c) !== 1) return;
    const next = [...board];
    [next[empty], next[idx]] = [next[idx]!, next[empty]!];
    setBoard(next);
    setMoves((m) => m + 1);
  };

  return (
    <GameShell
      title="Sliding Puzzle"
      subtitle="Slide tiles into place to order 1–15. Classic 15-puzzle."
      accent="from-sky-500/20 via-cyan-500/10 to-blue-500/15"
      onNewGame={reset}
      stats={<GameStat label="Moves" value={moves} />}
    >
      {won && <WinBanner title="Solved!" detail={`${moves} moves`} onAgain={reset} />}

      <div className="mx-auto grid max-w-sm grid-cols-4 gap-2 rounded-3xl bg-sky-950/10 p-3 dark:bg-black/30">
        {board.map((v, i) =>
          v === 0 ? (
            <div key={`e-${i}`} className="aspect-square rounded-2xl bg-transparent" />
          ) : (
            <motion.button
              key={v}
              layout
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              type="button"
              onClick={() => move(i)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 font-display text-2xl font-bold text-white shadow-md"
              )}
            >
              {v}
            </motion.button>
          )
        )}
      </div>
    </GameShell>
  );
}
