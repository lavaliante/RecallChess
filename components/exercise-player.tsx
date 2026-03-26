"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SoundButton } from "@/components/sound-button";
import { SoundLink } from "@/components/sound-link";
import { SoundToggle } from "@/components/sound-toggle";
import { useSound } from "@/components/sound-provider";
import { ChessboardPanel } from "@/components/chessboard-panel";
import { loadProgress, saveProgress } from "@/lib/progress";
import {
  formatMovePairs,
  getExpectedFenFromMoves,
  normalizeFenForComparison,
} from "@/lib/chess";
import { useRecallBoard } from "@/lib/use-recall-board";
import type { Exercise } from "@/lib/types";

type ExercisePlayerProps = {
  exercise: Exercise;
  nextExerciseId: number | null;
  nextExerciseHref?: string | null;
  timedMemorization?: boolean;
};

type ExerciseStage = "notation" | "recall" | "result";
type ResultView = "notation" | "board" | "solution";

function getMemorizationTimeSeconds(difficulty: string, halfMoves: number): number {
  let seconds = 0;

  if (difficulty === "Beginner") {
    seconds = 4 + 1.0 * halfMoves;
  } else if (difficulty === "Intermediate") {
    seconds = 2 + 0.7 * halfMoves;
  } else if (difficulty === "Advanced") {
    seconds = 1 + 0.45 * halfMoves;
  } else {
    seconds = 4 + 1.0 * halfMoves;
  }

  return Math.max(4, Math.min(20, Math.ceil(seconds)));
}

export function ExercisePlayer({
  exercise,
  nextExerciseId,
  nextExerciseHref = null,
  timedMemorization = true,
}: ExercisePlayerProps) {
  const router = useRouter();
  const { playMove, playSuccess, playError } = useSound();
  const formattedMoves = useMemo(() => formatMovePairs(exercise.moves), [exercise.moves]);
  const expectedFen = useMemo(
    () => getExpectedFenFromMoves(exercise.moves),
    [exercise.moves],
  );
  const memorizationSeconds = useMemo(
    () => getMemorizationTimeSeconds(exercise.difficulty, exercise.moves.length),
    [exercise.difficulty, exercise.moves.length],
  );

  const [stage, setStage] = useState<ExerciseStage>("notation");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [resultView, setResultView] = useState<ResultView>("board");
  const [countdownSeconds, setCountdownSeconds] = useState(memorizationSeconds);

  const {
    currentFen,
    customSquareStyles,
    handleDrop,
    handlePieceDragBegin,
    handlePieceDragEnd,
    handleSquareClick,
    isDraggablePiece,
    onPromotionCheck,
    resetBoard,
  } = useRecallBoard({
    moves: exercise.moves,
    enabled: stage === "recall",
    onLegalMove: playMove,
  });

  useEffect(() => {
    setStage("notation");
    setIsCorrect(null);
    setResultView("board");
    setCountdownSeconds(memorizationSeconds);

    const progress = loadProgress();
    saveProgress({
      completedIds: progress.completedIds,
      correctIds: progress.correctIds,
      lastPlayedId: exercise.id,
    });
  }, [exercise.id, memorizationSeconds]);

  useEffect(() => {
    if (!timedMemorization || stage !== "notation") {
      return;
    }

    if (countdownSeconds <= 0) {
      setStage("recall");
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCountdownSeconds((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [countdownSeconds, stage, timedMemorization]);

  const startRecallMode = () => {
    setStage("recall");
    setIsCorrect(null);
    setResultView("board");
    setCountdownSeconds(0);
  };

  const checkResult = () => {
    const didMatch =
      normalizeFenForComparison(currentFen) ===
      normalizeFenForComparison(expectedFen);

    setIsCorrect(didMatch);
    setStage("result");
    setResultView("board");

    if (didMatch) {
      playSuccess();
    } else {
      playError();
    }

    const progress = loadProgress();
    const completedIds = Array.from(new Set([...progress.completedIds, exercise.id]));
    const correctIds = didMatch
      ? Array.from(new Set([...progress.correctIds, exercise.id]))
      : progress.correctIds.filter((id) => id !== exercise.id);

    saveProgress({
      completedIds,
      correctIds,
      lastPlayedId: exercise.id,
    });
  };

  const handlePrimaryAction = () => {
    if (stage === "notation") {
      startRecallMode();
      return;
    }

    if (stage === "recall") {
      checkResult();
      return;
    }

    if (isCorrect) {
      if (nextExerciseHref) {
        router.push(nextExerciseHref);
        return;
      }

      router.push(nextExerciseId ? `/exercise/${nextExerciseId}` : "/exercises");
      return;
    }

    resetBoard();
    setStage("notation");
    setIsCorrect(null);
    setResultView("board");
    setCountdownSeconds(memorizationSeconds);
  };

  const handleReset = () => {
    resetBoard();
    setIsCorrect(null);
    setResultView("board");

    if (stage === "result") {
      setStage("recall");
    }
  };

  const handleStatusClick = (view: ResultView) => {
    if (stage === "result") {
      setResultView(view);
    }
  };

  const primaryLabel =
    stage === "notation" ? "Recall" : stage === "recall" ? "Check" : isCorrect ? "Next" : "Retry";

  const statusItems = [
    {
      key: "notation",
      label: "Notation",
      active: stage === "notation" || (stage === "result" && resultView === "notation"),
      done: stage !== "notation",
      clickable: stage === "result",
      onClick: () => handleStatusClick("notation"),
    },
    {
      key: "board",
      label: "Board",
      active: stage === "recall" || (stage === "result" && resultView === "board"),
      done: stage === "result" && resultView === "solution",
      clickable: stage === "result",
      onClick: () => handleStatusClick("board"),
    },
    {
      key: "solution",
      label: "Solution",
      active: stage === "result" && resultView === "solution",
      done: false,
      clickable: stage === "result",
      onClick: () => handleStatusClick("solution"),
    },
  ];

  const isNotationView = stage === "notation" || (stage === "result" && resultView === "notation");
  const isSolutionTab = stage === "result" && resultView === "solution";
  const displayedFen = isSolutionTab ? expectedFen : currentFen;
  const displayedBoardId = isSolutionTab ? `solution-${exercise.id}` : `exercise-${exercise.id}`;
  const boardStyle = isSolutionTab
    ? {
        filter: "grayscale(0.55) saturate(0.75) brightness(0.96)",
        opacity: 0.88,
      }
    : undefined;

  return (
    <div className="exercise-flow">
      <section className="panel exercise-header exercise-header-single">
        <div className="button-row exercise-topbar">
          <SoundLink href="/" className="button-ghost">
            Home
          </SoundLink>
          <SoundToggle />
        </div>
      </section>

      <section className="panel exercise-main-panel">
        <div className="training-meta-bar">
          <div className="exercise-status-strip" aria-label="Exercise views">
            {statusItems.map((item) => (
              <button
                aria-pressed={item.active}
                className={`status-pill${item.active ? " active" : ""}${item.done ? " done" : ""}${item.clickable ? " interactive" : ""}`}
                disabled={!item.clickable}
                key={item.key}
                onClick={item.onClick}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>

          {stage === "notation" ? (
            timedMemorization ? (
              <div className="countdown-row training-meta-side">
                <span className="badge timer-badge">Memorize {countdownSeconds}s</span>
              </div>
            ) : (
              <div className="countdown-row training-meta-side">
                <span className="badge timer-badge">Untimed</span>
              </div>
            )
          ) : null}
        </div>

        {isNotationView ? (
          <>
            <div className="training-stage notation-stage">
              <div className="stage-box-content">
                <div className="exercise-panel-heading in-box">
                  <p className="eyebrow">{exercise.category}</p>
                  <h1>{exercise.title}</h1>
                  <div className="exercise-meta-row">
                    <span className="badge">{exercise.difficulty}</span>
                    <span className="badge">{exercise.moves.length} SAN moves</span>
                  </div>
                </div>
                <div className="notation-lines">
                  {formattedMoves.map((movePair) => (
                    <div className="notation-line" key={movePair}>
                      {movePair}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {stage === "result" && isCorrect !== null ? (
              <div className={`result-banner ${isCorrect ? "success" : "error"}`}>
                {isCorrect ? "Correct" : "Incorrect - try again"}
              </div>
            ) : null}
            <div className={`training-stage board-stage${isSolutionTab ? " solution-stage" : ""}`}>
              <div className="stage-box-content board-box-content">
                <ChessboardPanel
                  boardId={displayedBoardId}
                  position={displayedFen}
                  onDrop={handleDrop}
                  onSquareClick={handleSquareClick}
                  onPieceDragBegin={handlePieceDragBegin}
                  onPieceDragEnd={handlePieceDragEnd}
                  onPromotionCheck={onPromotionCheck}
                  arePiecesDraggable={stage === "recall"}
                  isDraggablePiece={isDraggablePiece}
                  customBoardStyle={boardStyle}
                  customSquareStyles={isSolutionTab ? undefined : customSquareStyles}
                />
              </div>
            </div>
          </>
        )}

        <div className="training-actions training-actions-fixed">
          <SoundButton
            className="button-primary training-primary"
            onClick={handlePrimaryAction}
            type="button"
          >
            {primaryLabel}
          </SoundButton>
          {stage === "recall" ? (
            <SoundButton className="button-secondary" onClick={handleReset} type="button">
              Reset
            </SoundButton>
          ) : null}
        </div>
      </section>
    </div>
  );
}
