"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GameShell, GameStat, WinBanner } from "./game-shell";
import { COUNTRIES, shuffle, type CountryQuiz } from "@/lib/games/data";
import { cn } from "@/lib/utils";

const ROUNDS = 10;

function nextQuestion(used: Set<string>, seed: number): { country: CountryQuiz; options: string[] } {
  const pool = COUNTRIES.filter((c) => !used.has(c.code));
  const country = shuffle(pool.length ? pool : COUNTRIES, seed)[0]!;
  const distractors = shuffle(
    COUNTRIES.filter((c) => c.code !== country.code),
    seed + 5
  )
    .slice(0, 3)
    .map((c) => c.capital);
  const options = shuffle([country.capital, ...distractors], seed + 11);
  return { country, options };
}

export function GameCapitalQuiz() {
  const [seed, setSeed] = useState(1);
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const q = useMemo(() => nextQuestion(used, seed + round * 19), [used, seed, round]);

  const reset = () => {
    setSeed((s) => s + 1);
    setUsed(new Set());
    setScore(0);
    setRound(1);
    setPicked(null);
    setDone(false);
  };

  const choose = (capital: string) => {
    if (picked || done) return;
    setPicked(capital);
    const correct = capital === q.country.capital;
    if (correct) {
      setScore((s) => s + 1);
      toast.success("Correct!");
    } else toast.error(`Capital is ${q.country.capital}`);
    window.setTimeout(() => {
      const nextUsed = new Set(used).add(q.country.code);
      if (round >= ROUNDS) {
        setUsed(nextUsed);
        setDone(true);
      } else {
        setUsed(nextUsed);
        setRound((r) => r + 1);
        setPicked(null);
      }
    }, 700);
  };

  return (
    <GameShell
      title="Capital Quiz"
      subtitle="Name the capital city of each country. Ten geography rounds."
      accent="from-violet-500/20 via-indigo-500/10 to-fuchsia-500/15"
      onNewGame={reset}
      stats={
        <>
          <GameStat label="Score" value={`${score}/${ROUNDS}`} />
          <GameStat label="Round" value={`${Math.min(round, ROUNDS)}/${ROUNDS}`} />
        </>
      }
    >
      {done && (
        <WinBanner title="Quiz complete!" detail={`You scored ${score} / ${ROUNDS}`} onAgain={reset} />
      )}

      {!done && (
        <div className="mx-auto max-w-lg space-y-6 text-center">
          <motion.div
            key={q.country.code}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="rounded-3xl border border-border/50 bg-gradient-to-br from-violet-500/10 via-background to-indigo-500/10 px-6 py-8 shadow-sm"
          >
            <p className="text-5xl">{q.country.flag}</p>
            <p className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {q.country.name}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">What is the capital?</p>
          </motion.div>
          <div className="grid gap-2 sm:grid-cols-2">
            {q.options.map((opt) => {
              const show = picked !== null;
              const isRight = opt === q.country.capital;
              const isPick = opt === picked;
              return (
                <Button
                  key={opt}
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-12 rounded-2xl text-base",
                    show && isRight && "border-emerald-500 bg-emerald-500/15",
                    show && isPick && !isRight && "border-rose-500 bg-rose-500/15"
                  )}
                  onClick={() => choose(opt)}
                >
                  {opt}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </GameShell>
  );
}
