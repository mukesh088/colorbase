"use client";

import type { GamesSuiteMode } from "@/lib/suite-modes";
import { Game2048 } from "./game-2048";
import { GameWordle } from "./game-wordle";
import { GameHangman } from "./game-hangman";
import { GameSudoku } from "./game-sudoku";
import { GameWordSearch } from "./game-word-search";
import { GameSlidingPuzzle } from "./game-sliding-puzzle";
import { GameWaterSort } from "./game-water-sort";
import { GameMaze } from "./game-maze";
import { GameFlagsQuiz } from "./game-flags-quiz";
import { GameCapitalQuiz } from "./game-capital-quiz";

export function GamesSuiteTool({ mode }: { mode: GamesSuiteMode }) {
  switch (mode) {
    case "2048":
      return <Game2048 />;
    case "wordle":
      return <GameWordle />;
    case "hangman":
      return <GameHangman />;
    case "sudoku":
      return <GameSudoku />;
    case "word-search":
      return <GameWordSearch />;
    case "sliding-puzzle":
      return <GameSlidingPuzzle />;
    case "water-sort":
      return <GameWaterSort />;
    case "maze":
      return <GameMaze />;
    case "flags-quiz":
      return <GameFlagsQuiz />;
    case "capital-quiz":
      return <GameCapitalQuiz />;
    default:
      return <Game2048 />;
  }
}
