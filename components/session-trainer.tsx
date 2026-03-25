"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { SoundButton } from "@/components/sound-button";
import { SoundLink } from "@/components/sound-link";
import { SoundToggle } from "@/components/sound-toggle";
import { useSound } from "@/components/sound-provider";
import {
  formatMovePairs,
  getExpectedFenFromMoves,
  normalizeFenForComparison,
} from "@/lib/chess";
import { addSessionHistoryRecord } from "@/lib/session-history";
import type { Exercise, SessionExerciseSnapshot } from "@/lib/types";

type SessionTrainerProps = {
  difficulty: Exercise["difficulty"];
  durationMinutes: 1 | 2 | 5;
  exercises: Exercise[];
};

type ExerciseStage = "notation" | "recall" | "result";
type SessionSummary = {
  attempted: number;
  correct: number;
  wrong: number;
  unfinished: number;
  bestStreak: number;
  currentStreak: number;
  totalMoveCount: number;
};

const INITIAL_FEN = new Chess().fen();
const RESULT_DELAY_MS = 1200;

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

function formatSessionClock(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function shuffleExercises(list: Exercise[]): Exercise[] {
  const next = [...list];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function toExerciseSnapshot(exercise: Exercise): SessionExerciseSnapshot {
  return {
    id: exercise.id,
    title: exercise.title,
    category: exercise.category,
    difficulty: exercise.difficulty,
  };
}

export function SessionTrainer({
  difficulty,
  durationMinutes,
  exercises,
}: SessionTrainerProps) {
  const { playMove, playSuccess, playError } = useSound();
  const durationSeconds = durationMinutes * 60;
  const shuffledExercises = useMemo(() => shuffleExercises(exercises), [exercises]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const currentExercise = shuffledExercises[currentExerciseIndex];
  const [stage, setStage] = useState<ExerciseStage>("notation");
  const [game, setGame] = useState(() => new Chess());
  const [currentFen, setCurrentFen] = useState(INITIAL_FEN);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState<boolean | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [notationSecondsLeft, setNotationSecondsLeft] = useState(() =>
    getMemorizationTimeSeconds(currentExercise.difficulty, currentExercise.moves.length),
  );
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState(durationSeconds);
  const [summary, setSummary] = useState<SessionSummary>({
    attempted: 0,
    correct: 0,
    wrong: 0,
    unfinished: 0,
    bestStreak: 0,
    currentStreak: 0,
    totalMoveCount: 0,
  });
  const [sessionEnded, setSessionEnded] = useState(false);
  const [endedBecausePoolFinished, setEndedBecausePoolFinished] = useState(false);
  const boardWrapperRef = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState(320);
  const sessionDeadlineRef = useRef<number | null>(null);
  const currentExerciseRef = useRef(currentExercise);
  const currentExerciseCheckedRef = useRef(false);
  const sessionEndedRef = useRef(false);
  const sessionSavedRef = useRef(false);
  const resultTimeoutRef = useRef<number | null>(null);
  const summaryRef = useRef(summary);
  const wrongExercisesRef = useRef<SessionExerciseSnapshot[]>([]);
  const unfinishedExercisesRef = useRef<SessionExerciseSnapshot[]>([]);

  const formattedMoves = useMemo(
    () => formatMovePairs(currentExercise.moves),
    [currentExercise.moves],
  );
  const expectedFen = useMemo(
    () => getExpectedFenFromMoves(currentExercise.moves),
    [currentExercise.moves],
  );

  useEffect(() => {
    currentExerciseRef.current = currentExercise;
  }, [currentExercise]);

  useEffect(() => {
    summaryRef.current = summary;
  }, [summary]);

  useEffect(() => {
    sessionDeadlineRef.current = Date.now() + durationSeconds * 1000;
  }, [durationSeconds]);

  const loadExerciseByIndex = useCallback(
    (exerciseIndex: number) => {
      const exercise = shuffledExercises[exerciseIndex];
      const freshGame = new Chess();
      currentExerciseRef.current = exercise;
      currentExerciseCheckedRef.current = false;
      setCurrentExerciseIndex(exerciseIndex);
      setGame(freshGame);
      setCurrentFen(freshGame.fen());
      setStage("notation");
      setIsCurrentCorrect(null);
      setSelectedSquare(null);
      setNotationSecondsLeft(
        getMemorizationTimeSeconds(exercise.difficulty, exercise.moves.length),
      );
    },
    [shuffledExercises],
  );

  const finishExercise = useCallback((outcome: "correct" | "wrong" | "unfinished") => {
    currentExerciseCheckedRef.current = true;

    if (outcome === "wrong") {
      wrongExercisesRef.current = [
        ...wrongExercisesRef.current,
        toExerciseSnapshot(currentExerciseRef.current),
      ];
    }

    if (outcome === "unfinished") {
      unfinishedExercisesRef.current = [
        ...unfinishedExercisesRef.current,
        toExerciseSnapshot(currentExerciseRef.current),
      ];
    }

    setSummary((current) => {
      const attempted = current.attempted + 1;
      const correct = current.correct + (outcome === "correct" ? 1 : 0);
      const wrong = current.wrong + (outcome === "wrong" ? 1 : 0);
      const unfinished = current.unfinished + (outcome === "unfinished" ? 1 : 0);
      const nextStreak = outcome === "correct" ? current.currentStreak + 1 : 0;
      const nextSummary = {
        attempted,
        correct,
        wrong,
        unfinished,
        currentStreak: nextStreak,
        bestStreak: Math.max(current.bestStreak, nextStreak),
        totalMoveCount: current.totalMoveCount + currentExerciseRef.current.moves.length,
      };

      summaryRef.current = nextSummary;
      return nextSummary;
    });
  }, []);

  const endSession = useCallback(
    (markCurrentAsUnfinished: boolean, becausePoolFinished = false) => {
      if (sessionEndedRef.current) {
        return;
      }

      sessionEndedRef.current = true;
      setSessionEnded(true);
      setEndedBecausePoolFinished(becausePoolFinished);

      if (!becausePoolFinished) {
        setSessionSecondsLeft(0);
      }

      if (resultTimeoutRef.current) {
        window.clearTimeout(resultTimeoutRef.current);
        resultTimeoutRef.current = null;
      }

      if (markCurrentAsUnfinished && !currentExerciseCheckedRef.current) {
        finishExercise("unfinished");
      }
    },
    [finishExercise],
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const deadline = sessionDeadlineRef.current;

      if (!deadline || sessionEndedRef.current) {
        return;
      }

      const remainingMs = deadline - Date.now();
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
      setSessionSecondsLeft(remainingSeconds);

      if (remainingMs <= 0) {
        endSession(true);
      }
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [endSession]);

  useEffect(() => {
    if (sessionEnded || stage !== "notation") {
      return;
    }

    if (notationSecondsLeft <= 0) {
      setStage("recall");
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setNotationSecondsLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [notationSecondsLeft, sessionEnded, stage]);

  useEffect(() => {
    if (sessionEnded || stage === "notation") {
      return;
    }

    const element = boardWrapperRef.current;

    if (!element) {
      return;
    }

    const updateBoardWidth = () => {
      setBoardWidth(Math.min(element.offsetWidth, 560));
    };

    updateBoardWidth();

    const observer = new ResizeObserver(updateBoardWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, [currentExercise.id, sessionEnded, stage]);

  useEffect(() => {
    if (sessionEnded || stage !== "result") {
      return;
    }

    resultTimeoutRef.current = window.setTimeout(() => {
      if (sessionEndedRef.current) {
        return;
      }

      const nextExerciseIndex = currentExerciseIndex + 1;

      if (nextExerciseIndex >= shuffledExercises.length) {
        endSession(false, true);
        return;
      }

      loadExerciseByIndex(nextExerciseIndex);
    }, RESULT_DELAY_MS);

    return () => {
      if (resultTimeoutRef.current) {
        window.clearTimeout(resultTimeoutRef.current);
        resultTimeoutRef.current = null;
      }
    };
  }, [currentExerciseIndex, endSession, loadExerciseByIndex, sessionEnded, shuffledExercises.length, stage]);

  useEffect(() => {
    if (!sessionEnded || sessionSavedRef.current) {
      return;
    }

    const finalSummary = summaryRef.current;
    const totalExercises = finalSummary.attempted;

    addSessionHistoryRecord({
      id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      completedAt: new Date().toISOString(),
      difficulty,
      durationMinutes,
      totalExercises,
      correct: finalSummary.correct,
      wrong: finalSummary.wrong,
      unfinished: finalSummary.unfinished,
      accuracy: totalExercises === 0 ? 0 : Math.round((finalSummary.correct / totalExercises) * 100),
      bestStreak: finalSummary.bestStreak,
      wrongExerciseIds: wrongExercisesRef.current.map((exercise) => exercise.id),
      unfinishedExerciseIds: unfinishedExercisesRef.current.map((exercise) => exercise.id),
      wrongExercises: wrongExercisesRef.current,
      unfinishedExercises: unfinishedExercisesRef.current,
    });

    sessionSavedRef.current = true;
  }, [difficulty, durationMinutes, sessionEnded]);

  useEffect(() => {
    return () => {
      if (resultTimeoutRef.current) {
        window.clearTimeout(resultTimeoutRef.current);
      }
    };
  }, []);

  const isOwnPieceSquare = (piece?: string) => {
    if (!piece) {
      return false;
    }

    return piece.charAt(0) === game.turn();
  };

  const tryMove = (sourceSquare: string, targetSquare: string) => {
    const nextGame = new Chess(game.fen());
    const move = nextGame.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (!move) {
      return false;
    }

    setGame(nextGame);
    setCurrentFen(nextGame.fen());
    setSelectedSquare(null);
    playMove();
    return true;
  };

  const handleDrop = (sourceSquare: string, targetSquare: string) => {
    if (sessionEnded || stage !== "recall") {
      return false;
    }

    return tryMove(sourceSquare, targetSquare);
  };

  const handleSquareClick = (square: string, piece?: string) => {
    if (sessionEnded || stage !== "recall") {
      return;
    }

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }

      if (tryMove(selectedSquare, square)) {
        return;
      }
    }

    if (isOwnPieceSquare(piece)) {
      setSelectedSquare(square);
      return;
    }

    setSelectedSquare(null);
  };

  const startRecallEarly = () => {
    setStage("recall");
    setSelectedSquare(null);
  };

  const resetBoard = () => {
    const freshGame = new Chess();
    setGame(freshGame);
    setCurrentFen(freshGame.fen());
    setSelectedSquare(null);
  };

  const checkResult = () => {
    const didMatch =
      normalizeFenForComparison(currentFen) ===
      normalizeFenForComparison(expectedFen);

    setIsCurrentCorrect(didMatch);
    setStage("result");
    setSelectedSquare(null);
    finishExercise(didMatch ? "correct" : "wrong");

    if (didMatch) {
      playSuccess();
    } else {
      playError();
    }
  };

  const accuracy =
    summary.attempted === 0 ? 0 : Math.round((summary.correct / summary.attempted) * 100);
  const averageMoveCount =
    summary.attempted === 0 ? 0 : summary.totalMoveCount / summary.attempted;
  const stageIndex = stage === "notation" ? 0 : stage === "recall" ? 1 : 2;
  const customSquareStyles =
    stage === "recall" && selectedSquare
      ? {
          [selectedSquare]: {
            boxShadow: "inset 0 0 0 4px rgba(34, 84, 61, 0.55)",
          },
        }
      : undefined;

  if (sessionEnded) {
    return (
      <div className="exercise-flow">
        <section className="panel exercise-header exercise-header-single">
          <div className="button-row exercise-topbar">
            <SoundLink href="/" className="button-ghost">
              Back Home
            </SoundLink>
            <SoundToggle />
          </div>
        </section>

        <section className="panel session-summary-panel">
          <p className="eyebrow">Session Complete</p>
          <h1>Training Summary</h1>
          <div className="session-summary-meta">
            <span className="badge">{difficulty}</span>
            <span className="badge">{durationMinutes} min</span>
            <span className="badge">Accuracy {accuracy}%</span>
            {endedBecausePoolFinished ? <span className="badge">All exercises used</span> : null}
          </div>

          <div className="summary-grid">
            <div>
              <span className="progress-stats">Exercises Attempted</span>
              <strong>{summary.attempted}</strong>
            </div>
            <div>
              <span className="progress-stats">Correct</span>
              <strong>{summary.correct}</strong>
            </div>
            <div>
              <span className="progress-stats">Wrong</span>
              <strong>{summary.wrong}</strong>
            </div>
            <div>
              <span className="progress-stats">Unfinished</span>
              <strong>{summary.unfinished}</strong>
            </div>
            <div>
              <span className="progress-stats">Best Streak</span>
              <strong>{summary.bestStreak}</strong>
            </div>
            <div>
              <span className="progress-stats">Average Move Count</span>
              <strong>{averageMoveCount.toFixed(1)}</strong>
            </div>
          </div>

          <div className="session-launcher-actions">
            <SoundLink className="button-primary difficulty-button" href="/">
              Start Another Session
            </SoundLink>
            <SoundLink className="button-secondary difficulty-button" href="/history">
              View History
            </SoundLink>
            <SoundLink className="button-ghost difficulty-button" href="/exercises">
              Browse Exercise Library
            </SoundLink>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="exercise-flow">
      <section className="panel exercise-header exercise-header-single">
        <div className="button-row exercise-topbar session-topbar">
          <SoundLink href="/" className="button-ghost">
            End Session
          </SoundLink>
          <div className="session-hud">
            <span className="badge">{difficulty}</span>
            <span className="badge">{durationMinutes} min session</span>
            <span className="badge session-clock">{formatSessionClock(sessionSecondsLeft)}</span>
            <span className="badge">{currentExerciseIndex + 1}/{shuffledExercises.length}</span>
          </div>
          <SoundToggle />
        </div>
      </section>

      <section className="panel exercise-main-panel">
        <div className="exercise-status-strip" aria-hidden="true">
          {[
            { label: "Notation", active: stageIndex === 0, done: stageIndex > 0 },
            { label: "Recall", active: stageIndex === 1, done: stageIndex > 1 },
            { label: "Result", active: stageIndex === 2, done: false },
          ].map((item) => (
            <span
              className={`status-pill${item.active ? " active" : ""}${item.done ? " done" : ""}`}
              key={item.label}
            >
              {item.label}
            </span>
          ))}
        </div>

        <div className="session-progress-strip">
          <span className="badge">Attempted {summary.attempted}</span>
          <span className="badge success">Correct {summary.correct}</span>
          <span className="badge warning">Wrong {summary.wrong}</span>
        </div>

        {stage === "notation" ? (
          <>
            <div className="countdown-row">
              <span className="badge timer-badge">Memorize for {notationSecondsLeft}s</span>
            </div>
            <div className="training-stage notation-stage">
              <div className="stage-box-content">
                <div className="exercise-panel-heading in-box">
                  <p className="eyebrow">{currentExercise.category}</p>
                  <h1>{currentExercise.title}</h1>
                  <div className="exercise-meta-row">
                    <span className="badge">{currentExercise.moves.length} SAN moves</span>
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
            {stage === "result" && isCurrentCorrect !== null ? (
              <div className={`result-banner compact ${isCurrentCorrect ? "success" : "error"}`}>
                {isCurrentCorrect ? "Correct" : "Incorrect"}
              </div>
            ) : null}
            <div className="training-stage board-stage">
              <div className="stage-box-content board-box-content">
                <div className="board-wrapper" ref={boardWrapperRef}>
                  <Chessboard
                    id={`session-${currentExercise.id}`}
                    position={currentFen}
                    onPieceDrop={handleDrop}
                    onSquareClick={handleSquareClick}
                    arePiecesDraggable={stage === "recall"}
                    boardWidth={boardWidth}
                    customSquareStyles={customSquareStyles}
                    customDarkSquareStyle={{ backgroundColor: "#9b7d59" }}
                    customLightSquareStyle={{ backgroundColor: "#f2dfc4" }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <div className="training-actions training-actions-fixed">
          {stage === "notation" ? (
            <SoundButton
              className="button-primary training-primary"
              onClick={startRecallEarly}
              type="button"
            >
              Start Recall
            </SoundButton>
          ) : null}
          {stage === "recall" ? (
            <>
              <SoundButton
                className="button-primary training-primary"
                onClick={checkResult}
                type="button"
              >
                Check
              </SoundButton>
              <SoundButton className="button-secondary" onClick={resetBoard} type="button">
                Reset
              </SoundButton>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
