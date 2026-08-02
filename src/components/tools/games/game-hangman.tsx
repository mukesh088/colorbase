"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GameShell, GameStat, WinBanner, LoseBanner } from "./game-shell";
import { HANGMAN_WORDS, pickOne } from "@/lib/games/data";
import { cn } from "@/lib/utils";

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MAX_WRONG = 6;

function HangmanArt({ wrong }: { wrong: number }) {
  return (
    <svg viewBox="0 0 200 240" className="mx-auto h-48 w-40 text-foreground sm:h-56 sm:w-48">
      <motion.path d="M20 220 H180" stroke="currentColor" strokeWidth="6" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
      <motion.path d="M50 220 V30 H130 V55" stroke="currentColor" strokeWidth="6" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
      {wrong >= 1 && <motion.circle cx="130" cy="75" r="18" stroke="currentColor" strokeWidth="5" fill="none" initial={{ scale: 0 }} animate={{ scale: 1 }} />}
      {wrong >= 2 && <motion.line x1="130" y1="93" x2="130" y2="150" stroke="currentColor" strokeWidth="5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />}
      {wrong >= 3 && <motion.line x1="130" y1="110" x2="105" y2="135" stroke="currentColor" strokeWidth="5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />}
      {wrong >= 4 && <motion.line x1="130" y1="110" x2="155" y2="135" stroke="currentColor" strokeWidth="5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />}
      {wrong >= 5 && <motion.line x1="130" y1="150" x2="110" y2="185" stroke="currentColor" strokeWidth="5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />}
      {wrong >= 6 && <motion.line x1="130" y1="150" x2="150" y2="185" stroke="currentColor" strokeWidth="5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />}
    </svg>
  );
}

export function GameHangman() {
  const [puzzle, setPuzzle] = useState(() => pickOne(HANGMAN_WORDS));
  const [guessed, setGuessed] = useState<Set<string>>(new Set());

  const wrong = useMemo(
    () => [...guessed].filter((l) => !puzzle.word.includes(l)).length,
    [guessed, puzzle.word]
  );
  const won = puzzle.word.split("").every((c) => guessed.has(c));
  const lost = wrong >= MAX_WRONG;

  const reset = () => {
    setPuzzle(pickOne(HANGMAN_WORDS, Date.now()));
    setGuessed(new Set());
  };

  const guess = (letter: string) => {
    if (won || lost || guessed.has(letter)) return;
    setGuessed(new Set(guessed).add(letter));
  };

  return (
    <GameShell
      title="Hangman"
      subtitle="Guess letters to reveal the word before the drawing is complete."
      accent="from-slate-500/20 via-rose-500/10 to-orange-500/15"
      onNewGame={reset}
      stats={
        <>
          <GameStat label="Wrong" value={`${wrong}/${MAX_WRONG}`} />
          <GameStat label="Hint" value="?" />
        </>
      }
      footer={`Hint: ${puzzle.hint}`}
    >
      {won && <WinBanner title="You saved them!" detail={puzzle.word} onAgain={reset} />}
      {lost && <LoseBanner title="Game over" detail={`Word was ${puzzle.word}`} onAgain={reset} />}

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="rounded-3xl border border-border/50 bg-muted/15 p-4">
          <HangmanArt wrong={wrong} />
        </div>
        <div className="space-y-6">
          <div className="flex flex-wrap justify-center gap-2">
            {puzzle.word.split("").map((ch, i) => (
              <motion.span
                key={`${ch}-${i}`}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex h-12 w-10 items-center justify-center rounded-xl border border-border/60 bg-background font-display text-2xl font-bold"
              >
                {guessed.has(ch) || lost ? ch : ""}
              </motion.span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {ALPHA.map((l) => {
              const used = guessed.has(l);
              const bad = used && !puzzle.word.includes(l);
              const good = used && puzzle.word.includes(l);
              return (
                <Button
                  key={l}
                  type="button"
                  size="sm"
                  disabled={used || won || lost}
                  variant={good ? "default" : bad ? "destructive" : "outline"}
                  className={cn("h-10 w-10 rounded-xl p-0", good && "bg-emerald-500 hover:bg-emerald-500")}
                  onClick={() => guess(l)}
                >
                  {l}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </GameShell>
  );
}
