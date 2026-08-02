"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles, Trophy, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GameShell, GameStat, WinBanner } from "./game-shell";
import { COUNTRIES, shuffle, type CountryQuiz } from "@/lib/games/data";
import { cn } from "@/lib/utils";

const ROUNDS = 10;
const KEY_HINTS = ["1", "2", "3", "4"] as const;
const LETTER_HINTS = ["A", "B", "C", "D"] as const;

const CONFETTI = [
  "#22c55e", "#10b981", "#34d399", "#fbbf24", "#f472b6", "#38bdf8", "#a78bfa", "#fb7185",
];

function flagUrl(code: string, width = 640) {
  return `https://flagcdn.com/w${width}/${code.toLowerCase()}.png`;
}

function nextQuestion(used: Set<string>, seed: number): { country: CountryQuiz; options: string[] } {
  const pool = COUNTRIES.filter((c) => !used.has(c.code));
  const country = shuffle(pool.length ? pool : COUNTRIES, seed)[0]!;
  const distractors = shuffle(
    COUNTRIES.filter((c) => c.code !== country.code),
    seed + 3
  )
    .slice(0, 3)
    .map((c) => c.name);
  const options = shuffle([country.name, ...distractors], seed + 9);
  return { country, options };
}

function SuccessBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-3xl">
      {/* Soft green wash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.85] }}
        className="absolute inset-0 bg-gradient-to-t from-emerald-500/35 via-emerald-400/10 to-transparent"
      />

      {/* Expanding rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`ring-${i}`}
          initial={{ scale: 0.4, opacity: 0.7 }}
          animate={{ scale: 2.4 + i * 0.35, opacity: 0 }}
          transition={{ duration: 0.85, delay: i * 0.08, ease: "easeOut" }}
          className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-400/70"
        />
      ))}

      {/* Confetti bits */}
      {Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        const dist = 70 + (i % 5) * 22;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist - 20;
        const color = CONFETTI[i % CONFETTI.length]!;
        return (
          <motion.span
            key={`c-${i}`}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
            animate={{
              x,
              y,
              opacity: [1, 1, 0],
              scale: [0, 1.2, 0.6],
              rotate: (i % 2 === 0 ? 1 : -1) * (120 + i * 12),
            }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: color, marginLeft: -5, marginTop: -5 }}
          />
        );
      })}

      {/* Center badge */}
      <motion.div
        initial={{ scale: 0.4, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 18 }}
        className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2 px-4"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-xl shadow-emerald-500/40 ring-4 ring-white/40 dark:ring-emerald-950/40">
          <Trophy className="h-8 w-8" />
        </div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-full bg-emerald-600/95 px-5 py-1.5 font-display text-lg font-semibold tracking-tight text-white shadow-lg backdrop-blur"
        >
          Correct!
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-50 drop-shadow"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Nice catch
        </motion.p>
      </motion.div>
    </div>
  );
}

export function GameFlagsQuiz() {
  const [seed, setSeed] = useState(1);
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [picked, setPicked] = useState<string | null>(null);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);
  const [imgOk, setImgOk] = useState(true);

  const q = useMemo(() => nextQuestion(used, seed + round * 17), [used, seed, round]);

  useEffect(() => {
    setImgOk(true);
  }, [q.country.code]);

  const reset = () => {
    setSeed((s) => s + 1);
    setUsed(new Set());
    setScore(0);
    setRound(1);
    setPicked(null);
    setPickedIndex(null);
    setFlash(null);
    setDone(false);
  };

  const choose = useCallback(
    (name: string, index?: number) => {
      if (picked || done) return;
      const idx = index ?? q.options.indexOf(name);
      setPicked(name);
      setPickedIndex(idx >= 0 ? idx : null);
      const correct = name === q.country.name;
      setFlash(correct ? "correct" : "wrong");
      if (correct) {
        setScore((s) => s + 1);
        toast.success("Correct!", { description: q.country.name });
      } else {
        toast.error(`It was ${q.country.name}`);
      }

      window.setTimeout(() => {
        const nextUsed = new Set(used).add(q.country.code);
        setFlash(null);
        setPickedIndex(null);
        if (round >= ROUNDS) {
          setUsed(nextUsed);
          setDone(true);
        } else {
          setUsed(nextUsed);
          setRound((r) => r + 1);
          setPicked(null);
        }
      }, correct ? 1200 : 900);
    },
    [picked, done, q.country.name, q.country.code, q.options, used, round]
  );

  useEffect(() => {
    if (done || picked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      const map: Record<string, number> = {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3,
        a: 0,
        b: 1,
        c: 2,
        d: 3,
      };
      const idx = map[key];
      if (idx === undefined) return;
      e.preventDefault();
      const opt = q.options[idx];
      if (opt) choose(opt, idx);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose, done, picked, q.options]);

  return (
    <GameShell
      title="Flags Quiz"
      subtitle="Guess the country from a real flag. Use keys 1–4 or A–D, or tap an answer."
      accent="from-rose-500/20 via-amber-500/10 to-sky-500/15"
      onNewGame={reset}
      stats={
        <>
          <GameStat label="Score" value={`${score}/${ROUNDS}`} />
          <GameStat label="Round" value={`${Math.min(round, ROUNDS)}/${ROUNDS}`} />
        </>
      }
      footer="Keyboard: 1–4 or A–D. A correct answer triggers a celebration burst on the flag."
    >
      {done && (
        <WinBanner title="Quiz complete!" detail={`You scored ${score} / ${ROUNDS}`} onAgain={reset} />
      )}

      {!done && (
        <div className="relative mx-auto max-w-xl space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={q.country.code}
              initial={{ opacity: 0, x: 48, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -48, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="space-y-6 text-center"
            >
              <motion.div
                animate={
                  flash === "wrong"
                    ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
                    : flash === "correct"
                      ? { scale: [1, 1.02, 1] }
                      : { x: 0, scale: 1 }
                }
                transition={{ duration: flash === "wrong" ? 0.45 : 0.4 }}
                className={cn(
                  "relative mx-auto flex aspect-[3/2] w-full max-w-md items-center justify-center overflow-hidden rounded-3xl border bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg transition dark:from-slate-900 dark:to-slate-800",
                  flash === "correct" && "border-emerald-400 shadow-emerald-500/30",
                  flash === "wrong" && "border-rose-400 shadow-rose-500/20",
                  !flash && "border-border/60"
                )}
              >
                {imgOk ? (
                  <Image
                    src={flagUrl(q.country.code)}
                    alt={`Flag of ${q.country.name}`}
                    fill
                    className={cn(
                      "object-cover transition duration-500",
                      flash === "correct" && "brightness-110 saturate-125",
                      flash === "wrong" && "brightness-90 saturate-50"
                    )}
                    sizes="(max-width: 768px) 100vw, 448px"
                    priority
                    onError={() => setImgOk(false)}
                  />
                ) : (
                  <span className="text-7xl sm:text-8xl" aria-hidden>
                    {q.country.flag}
                  </span>
                )}
                <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/10 dark:ring-white/10" />

                <AnimatePresence>{flash === "correct" && <SuccessBurst />}</AnimatePresence>

                <AnimatePresence>
                  {flash === "wrong" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-rose-950/45 backdrop-blur-[2px]"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg"
                      >
                        <X className="h-8 w-8" strokeWidth={3} />
                      </motion.div>
                      <p className="rounded-full bg-rose-600/90 px-4 py-1 text-sm font-semibold text-white">
                        Not quite — {q.country.name}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <AnimatePresence mode="wait">
                {flash === "correct" ? (
                  <motion.p
                    key="ok-label"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="font-display text-base font-semibold text-emerald-600 dark:text-emerald-400"
                  >
                    +1 point · {q.country.name}
                  </motion.p>
                ) : (
                  <motion.p
                    key="ask"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-muted-foreground"
                  >
                    Which country is this?
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {q.options.map((opt, i) => {
                  const show = picked !== null;
                  const isRight = opt === q.country.name;
                  const isPick = opt === picked;
                  const isWrongPick = show && isPick && !isRight;
                  const isSuccessPick = show && isRight;
                  const wasKeyTarget = pickedIndex === i;

                  return (
                    <motion.div
                      key={`${q.country.code}-${opt}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={
                        isWrongPick
                          ? { opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }
                          : isSuccessPick
                            ? { opacity: 1, y: 0, scale: [1, 1.06, 1], zIndex: 2 }
                            : { opacity: show && !isRight ? 0.45 : 1, y: 0, scale: 1 }
                      }
                      transition={{ delay: i * 0.04, duration: isWrongPick ? 0.4 : 0.35 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!!picked}
                        className={cn(
                          "relative h-14 w-full justify-start gap-3 overflow-hidden rounded-2xl px-4 text-left text-base transition",
                          isSuccessPick &&
                            "border-emerald-500 bg-gradient-to-r from-emerald-500/25 via-teal-500/15 to-emerald-500/25 text-emerald-900 shadow-md shadow-emerald-500/25 dark:text-emerald-100",
                          isWrongPick && "border-rose-500 bg-rose-500/15 text-rose-800 dark:text-rose-200",
                          !show && "hover:border-rose-400/50 hover:bg-rose-500/5"
                        )}
                        onClick={() => choose(opt, i)}
                      >
                        {isSuccessPick && (
                          <motion.span
                            initial={{ x: "-100%" }}
                            animate={{ x: "120%" }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="pointer-events-none absolute inset-y-0 w-1/3 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/35 to-transparent"
                          />
                        )}
                        <motion.span
                          animate={
                            wasKeyTarget && flash === "correct"
                              ? { scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] }
                              : wasKeyTarget && flash === "wrong"
                                ? { scale: [1, 0.9, 1] }
                                : { scale: 1 }
                          }
                          className={cn(
                            "flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-xl border text-[10px] font-bold leading-none",
                            isSuccessPick && "border-emerald-400 bg-emerald-500 text-white shadow shadow-emerald-500/40",
                            isWrongPick && "border-rose-500 bg-rose-500 text-white",
                            !show && "border-border/60 bg-muted/40 text-muted-foreground"
                          )}
                        >
                          <span>{KEY_HINTS[i]}</span>
                          <span className="opacity-70">{LETTER_HINTS[i]}</span>
                        </motion.span>
                        <span className="min-w-0 flex-1 truncate font-medium">{opt}</span>
                        {isSuccessPick && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
                          >
                            <Check className="h-4 w-4" strokeWidth={3} />
                          </motion.span>
                        )}
                        {isWrongPick && <X className="h-4 w-4 shrink-0 text-rose-600" />}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </GameShell>
  );
}
