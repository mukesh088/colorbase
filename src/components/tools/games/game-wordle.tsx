"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameShell, GameStat, WinBanner, LoseBanner } from "./game-shell";
import { WORDLE_ALLOWED, WORDLE_ANSWERS, pickOne } from "@/lib/games/data";
import { cn } from "@/lib/utils";

type Mark = "correct" | "present" | "absent" | "empty";

function scoreGuess(guess: string, answer: string): Mark[] {
  const res: Mark[] = Array(5).fill("absent");
  const rem = answer.split("");
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      res[i] = "correct";
      rem[i] = "";
    }
  }
  for (let i = 0; i < 5; i++) {
    if (res[i] === "correct") continue;
    const idx = rem.indexOf(guess[i]!);
    if (idx >= 0) {
      res[i] = "present";
      rem[idx] = "";
    }
  }
  return res;
}

const KEYS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

export function GameWordle() {
  const [answer, setAnswer] = useState(() => pickOne(WORDLE_ANSWERS));
  const [guesses, setGuesses] = useState<string[]>([]);
  const [marks, setMarks] = useState<Mark[][]>([]);
  const [current, setCurrent] = useState("");
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");

  const letterState = useMemo(() => {
    const map: Record<string, Mark> = {};
    guesses.forEach((g, gi) => {
      g.split("").forEach((ch, i) => {
        const m = marks[gi]![i]!;
        const prev = map[ch];
        if (prev === "correct") return;
        if (m === "correct" || prev !== "present") map[ch] = m;
      });
    });
    return map;
  }, [guesses, marks]);

  const reset = () => {
    setAnswer(pickOne(WORDLE_ANSWERS, Date.now()));
    setGuesses([]);
    setMarks([]);
    setCurrent("");
    setStatus("playing");
  };

  const submit = useCallback(() => {
    if (status !== "playing") return;
    if (current.length !== 5) {
      toast.message("Need 5 letters");
      return;
    }
    if (!WORDLE_ALLOWED.has(current) && !WORDLE_ANSWERS.includes(current)) {
      toast.error("Not in word list");
      return;
    }
    const m = scoreGuess(current, answer);
    const nextGuesses = [...guesses, current];
    const nextMarks = [...marks, m];
    setGuesses(nextGuesses);
    setMarks(nextMarks);
    setCurrent("");
    if (current === answer) setStatus("won");
    else if (nextGuesses.length >= 6) setStatus("lost");
  }, [answer, current, guesses, marks, status]);

  const onKey = useCallback(
    (key: string) => {
      if (status !== "playing") return;
      if (key === "ENTER") submit();
      else if (key === "BACK") setCurrent((c) => c.slice(0, -1));
      else if (/^[A-Z]$/.test(key) && current.length < 5) setCurrent((c) => c + key);
    },
    [current.length, status, submit]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") onKey("ENTER");
      else if (e.key === "Backspace") onKey("BACK");
      else if (/^[a-zA-Z]$/.test(e.key)) onKey(e.key.toUpperCase());
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onKey]);

  const rows = Array.from({ length: 6 }, (_, i) => {
    if (guesses[i]) return { letters: guesses[i]!.split(""), marks: marks[i]! };
    if (i === guesses.length)
      return {
        letters: (current + "     ").slice(0, 5).split(""),
        marks: Array(5).fill("empty") as Mark[],
      };
    return { letters: Array(5).fill(""), marks: Array(5).fill("empty") as Mark[] };
  });

  return (
    <GameShell
      title="Wordle"
      subtitle="Guess the 5-letter word in 6 tries. Green = right spot, amber = wrong spot."
      accent="from-emerald-500/20 via-lime-500/10 to-teal-500/15"
      onNewGame={reset}
      stats={<GameStat label="Tries" value={`${guesses.length}/6`} />}
    >
      {status === "won" && <WinBanner title="Brilliant!" detail={`Solved in ${guesses.length}`} onAgain={reset} />}
      {status === "lost" && <LoseBanner title="Out of tries" detail={`The word was ${answer}`} onAgain={reset} />}

      <div className="mx-auto flex w-full max-w-sm flex-col gap-2">
        {rows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-5 gap-2">
            {row.letters.map((ch, ci) => (
              <motion.div
                key={`${ri}-${ci}-${ch}-${row.marks[ci]}`}
                initial={row.marks[ci] !== "empty" ? { rotateX: -90 } : false}
                animate={{ rotateX: 0 }}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-xl border-2 font-display text-xl font-bold uppercase sm:text-2xl",
                  row.marks[ci] === "correct" && "border-emerald-600 bg-emerald-500 text-white",
                  row.marks[ci] === "present" && "border-amber-500 bg-amber-400 text-amber-950",
                  row.marks[ci] === "absent" && "border-slate-500 bg-slate-500 text-white",
                  row.marks[ci] === "empty" && "border-border/60 bg-muted/20"
                )}
              >
                {ch}
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      <div className="mx-auto mt-6 flex w-full max-w-lg flex-col gap-2">
        {KEYS.map((row, i) => (
          <div key={row} className="flex justify-center gap-1.5">
            {i === 2 && (
              <Button type="button" size="sm" className="h-11 px-3" onClick={() => onKey("ENTER")}>
                Enter
              </Button>
            )}
            {row.split("").map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => onKey(k)}
                className={cn(
                  "h-11 min-w-[1.7rem] rounded-lg text-sm font-semibold sm:min-w-[2rem]",
                  letterState[k] === "correct" && "bg-emerald-500 text-white",
                  letterState[k] === "present" && "bg-amber-400 text-amber-950",
                  letterState[k] === "absent" && "bg-slate-500 text-white",
                  !letterState[k] && "bg-muted/40 hover:bg-muted"
                )}
              >
                {k}
              </button>
            ))}
            {i === 2 && (
              <Button type="button" size="sm" variant="outline" className="h-11 px-3" onClick={() => onKey("BACK")}>
                <Delete className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </GameShell>
  );
}
