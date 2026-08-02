"use client";

/**
 * Classic 2048 rules (Gabriele Cirulli):
 * 1. Choose a direction — every tile slides as far as it can.
 * 2. Equal tiles collide → merge into one double-value tile (once per move).
 * 3. A merged tile cannot merge again in the same move.
 * 4. After a successful move, spawn a 2 (90%) or 4 (10%) in a random empty cell.
 * 5. Clicks do nothing — only arrow keys / WASD / swipe / d-pad.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GameShell, GameStat, WinBanner } from "./game-shell";
import { cn } from "@/lib/utils";

const SIZE = 4;
const SWIPE_TOUCH = 36;
const SWIPE_MOUSE = 56;

type Dir = "left" | "right" | "up" | "down";
type Board = number[][]; // 0 = empty

const TILE_COLORS: Record<number, string> = {
  2: "bg-[#eee4da] text-[#776e65]",
  4: "bg-[#ede0c8] text-[#776e65]",
  8: "bg-[#f2b179] text-white",
  16: "bg-[#f59563] text-white",
  32: "bg-[#f67c5f] text-white",
  64: "bg-[#f65e3b] text-white",
  128: "bg-[#edcf72] text-white shadow-[0_0_18px_rgba(237,207,114,0.45)]",
  256: "bg-[#edcc61] text-white shadow-[0_0_22px_rgba(237,204,97,0.5)]",
  512: "bg-[#edc850] text-white",
  1024: "bg-[#edc53f] text-white",
  2048: "bg-[#edc22e] text-white shadow-[0_0_28px_rgba(237,194,46,0.55)]",
};

function emptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function cloneBoard(b: Board): Board {
  return b.map((row) => [...row]);
}

function boardsEqual(a: Board, b: Board) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (a[r]![c] !== b[r]![c]) return false;
  return true;
}

/** Slide one row toward the left (index 0), merging at most once per tile. */
function slideRowLeft(row: number[]): { row: number[]; score: number } {
  const nums = row.filter((n) => n !== 0);
  const out: number[] = [];
  let score = 0;
  let i = 0;
  while (i < nums.length) {
    if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
      const merged = nums[i]! * 2;
      out.push(merged);
      score += merged;
      i += 2; // skip partner — merged tile cannot merge again this move
    } else {
      out.push(nums[i]!);
      i += 1;
    }
  }
  while (out.length < SIZE) out.push(0);
  return { row: out, score };
}

function transpose(b: Board): Board {
  const t = emptyBoard();
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) t[c]![r] = b[r]![c]!;
  return t;
}

function reverseRows(b: Board): Board {
  return b.map((row) => [...row].reverse());
}

/**
 * Apply a directional move using only left-slide + transforms.
 * left  → slide each row left
 * right → reverse, slide left, reverse
 * up    → transpose, slide left, transpose
 * down  → transpose, reverse, slide left, reverse, transpose
 */
function moveBoard(board: Board, dir: Dir): { board: Board; score: number; moved: boolean } {
  let working = cloneBoard(board);
  let score = 0;

  if (dir === "right") working = reverseRows(working);
  else if (dir === "up") working = transpose(working);
  else if (dir === "down") working = reverseRows(transpose(working));

  const slid = working.map((row) => {
    const res = slideRowLeft(row);
    score += res.score;
    return res.row;
  });

  if (dir === "right") working = reverseRows(slid);
  else if (dir === "up") working = transpose(slid);
  else if (dir === "down") working = transpose(reverseRows(slid));
  else working = slid;

  return { board: working, score, moved: !boardsEqual(board, working) };
}

function emptyCells(board: Board): { r: number; c: number }[] {
  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (board[r]![c] === 0) cells.push({ r, c });
  return cells;
}

function spawn(board: Board): Board {
  const cells = emptyCells(board);
  if (!cells.length) return board;
  const { r, c } = cells[Math.floor(Math.random() * cells.length)]!;
  const next = cloneBoard(board);
  next[r]![c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function freshBoard(): Board {
  return spawn(spawn(emptyBoard()));
}

function canMove(board: Board) {
  if (emptyCells(board).length > 0) return true;
  return (["left", "right", "up", "down"] as const).some((d) => moveBoard(board, d).moved);
}

function fontFor(v: number) {
  if (v >= 1024) return "text-[clamp(0.95rem,3.8vw,1.45rem)]";
  if (v >= 128) return "text-[clamp(1.1rem,4.4vw,1.7rem)]";
  return "text-[clamp(1.35rem,5.5vw,2.1rem)]";
}

export function Game2048() {
  const [board, setBoard] = useState<Board>(() => freshBoard());
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [won, setWon] = useState(false);
  const [keepGoing, setKeepGoing] = useState(false);
  const [over, setOver] = useState(false);
  const [moveId, setMoveId] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const gesture = useRef({
    x: 0,
    y: 0,
    active: false,
    pointerType: "mouse" as string,
    moved: false,
  });
  const busyRef = useRef(false);

  useEffect(() => {
    try {
      const b = Number(localStorage.getItem("cb-2048-best") || 0);
      if (b) setBest(b);
    } catch {
      /* ignore */
    }
  }, []);

  const persistBest = (ns: number) => {
    setBest((b) => {
      const nb = Math.max(b, ns);
      try {
        localStorage.setItem("cb-2048-best", String(nb));
      } catch {
        /* ignore */
      }
      return nb;
    });
  };

  const reset = () => {
    setBoard(freshBoard());
    setScore(0);
    setWon(false);
    setKeepGoing(false);
    setOver(false);
    setMoveId(0);
    busyRef.current = false;
  };

  const applyMove = useCallback(
    (dir: Dir) => {
      if (over || busyRef.current) return;
      if (won && !keepGoing) return;

      setBoard((prev) => {
        const res = moveBoard(prev, dir);
        // Rule: if nothing slid or merged, ignore the input entirely (no spawn).
        if (!res.moved) return prev;

        busyRef.current = true;
        window.setTimeout(() => {
          busyRef.current = false;
        }, 100);

        const next = spawn(res.board);
        setMoveId((n) => n + 1);

        if (res.score > 0) {
          setScore((s) => {
            const ns = s + res.score;
            persistBest(ns);
            return ns;
          });
        }

        if (!won && next.some((row) => row.some((v) => v >= 2048))) setWon(true);
        if (!canMove(next)) {
          setOver(true);
          toast.message("No more moves");
        }
        return next;
      });
    },
    [over, won, keepGoing]
  );

  // Keyboard only — never mouse click
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
        a: "left",
        d: "right",
        w: "up",
        s: "down",
        A: "left",
        D: "right",
        W: "up",
        S: "down",
      };
      const dir = map[e.key];
      if (!dir) return;
      e.preventDefault();
      applyMove(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyMove]);

  // Swipe only — plain click / tap without travel does nothing
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      gesture.current = {
        x: e.clientX,
        y: e.clientY,
        active: true,
        pointerType: e.pointerType || "mouse",
        moved: false,
      };
    };

    const onMove = (e: PointerEvent) => {
      if (!gesture.current.active) return;
      const dx = e.clientX - gesture.current.x;
      const dy = e.clientY - gesture.current.y;
      const min = gesture.current.pointerType === "touch" ? SWIPE_TOUCH : SWIPE_MOUSE;
      if (Math.abs(dx) > min * 0.4 || Math.abs(dy) > min * 0.4) {
        gesture.current.moved = true;
      }
    };

    const onUp = (e: PointerEvent) => {
      if (!gesture.current.active) return;
      const { x, y, pointerType, moved } = gesture.current;
      gesture.current.active = false;

      // Click / tap without a real swipe → no merge, no move
      if (!moved && pointerType === "mouse") return;

      const dx = e.clientX - x;
      const dy = e.clientY - y;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      const min = pointerType === "touch" ? SWIPE_TOUCH : SWIPE_MOUSE;
      if (Math.max(ax, ay) < min) return;

      applyMove(ax > ay ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
    };

    const onCancel = () => {
      gesture.current.active = false;
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onCancel);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onCancel);
    };
  }, [applyMove]);

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const blockScroll = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
    };
    el.addEventListener("touchmove", blockScroll, { passive: false });
    return () => el.removeEventListener("touchmove", blockScroll);
  }, []);

  return (
    <GameShell
      title="2048"
      subtitle="Slide tiles with arrows, WASD, swipe, or the d-pad. Same values merge once per move — clicks on the board do nothing."
      accent="from-orange-500/25 via-amber-400/10 to-yellow-500/15"
      onNewGame={reset}
      stats={
        <>
          <GameStat label="Score" value={score} />
          <GameStat label="Best" value={best} />
        </>
      }
      footer="Rules: tiles slide fully in one direction; only equal neighbors merge; a new tile appears only after a real move."
    >
      {won && !keepGoing && !over && (
        <div className="mb-4 space-y-3">
          <WinBanner title="You made 2048!" detail="Keep going for a higher score, or start fresh." onAgain={reset} />
          <div className="flex justify-center">
            <Button
              type="button"
              className="rounded-full bg-amber-500 text-amber-950 hover:bg-amber-400"
              onClick={() => setKeepGoing(true)}
            >
              Keep going
            </Button>
          </div>
        </div>
      )}
      {over && <WinBanner title="Game over" detail={`Final score: ${score}`} onAgain={reset} />}

      <div className="mx-auto w-full max-w-[min(100%,26rem)] sm:max-w-[28rem] md:max-w-[30rem]">
        <div
          ref={boardRef}
          className="relative aspect-square w-full touch-none select-none rounded-[1.15rem] bg-[#bbada0] p-[3%] shadow-inner sm:rounded-3xl"
          role="application"
          aria-label="2048 board. Swipe or use arrow keys to move. Clicking does not merge tiles."
        >
          <div
            className="grid h-full w-full"
            style={{
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(4, 1fr)",
              gap: "2.8%",
            }}
          >
            {board.map((row, r) =>
              row.map((value, c) => (
                <div
                  key={`${r}-${c}`}
                  className="relative rounded-md bg-[#cdc1b4] sm:rounded-xl"
                >
                  {value > 0 && (
                    <motion.div
                      key={`${moveId}-${r}-${c}-${value}`}
                      initial={{ scale: 0.85, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 480, damping: 28 }}
                      className={cn(
                        "absolute inset-0 flex items-center justify-center rounded-md font-display font-bold sm:rounded-xl",
                        fontFor(value),
                        TILE_COLORS[value] ?? "bg-[#3c3a32] text-white"
                      )}
                    >
                      {value}
                    </motion.div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-5 grid w-full max-w-[15rem] grid-cols-3 gap-2 sm:max-w-[16rem]">
        <div />
        <Button type="button" variant="outline" className="h-12 touch-manipulation rounded-2xl text-lg" onClick={() => applyMove("up")} aria-label="Move up">
          ↑
        </Button>
        <div />
        <Button type="button" variant="outline" className="h-12 touch-manipulation rounded-2xl text-lg" onClick={() => applyMove("left")} aria-label="Move left">
          ←
        </Button>
        <Button type="button" variant="outline" className="h-12 touch-manipulation rounded-2xl text-lg" onClick={() => applyMove("down")} aria-label="Move down">
          ↓
        </Button>
        <Button type="button" variant="outline" className="h-12 touch-manipulation rounded-2xl text-lg" onClick={() => applyMove("right")} aria-label="Move right">
          →
        </Button>
      </div>
    </GameShell>
  );
}
