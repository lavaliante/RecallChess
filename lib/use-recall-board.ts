"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess, type Square } from "chess.js";
import {
  applyExpectedMoveAttempt,
  getExpectedMoveSequence,
  INITIAL_FEN,
  type ExpectedMove,
} from "@/lib/chess";

type UseRecallBoardOptions = {
  moves: string[];
  enabled: boolean;
  onLegalMove?: () => void;
};

type DraggablePieceArgs = {
  piece: string;
  sourceSquare: string;
};

type InlineBoardStyle = Record<string, string | number>;

export function useRecallBoard({
  moves,
  enabled,
  onLegalMove,
}: UseRecallBoardOptions) {
  const chessRef = useRef(new Chess());
  const [position, setPosition] = useState(INITIAL_FEN);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [dragSourceSquare, setDragSourceSquare] = useState<Square | null>(null);
  const expectedMoves = useMemo(() => getExpectedMoveSequence(moves), [moves]);

  const syncPosition = useCallback(() => {
    setPosition(chessRef.current.fen());
  }, []);

  const resetBoard = useCallback(() => {
    chessRef.current = new Chess();
    syncPosition();
    setSelectedSquare(null);
    setDragSourceSquare(null);
  }, [syncPosition]);

  useEffect(() => {
    resetBoard();
  }, [moves, resetBoard]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    const internalFen = chessRef.current.fen();

    if (position !== internalFen) {
      throw new Error(
        `Recall board desynced: rendered FEN "${position}" does not match chess.js FEN "${internalFen}".`,
      );
    }
  }, [position]);

  const getPendingMove = useCallback((): ExpectedMove | null => {
    return expectedMoves[chessRef.current.history().length] ?? null;
  }, [expectedMoves]);

  const canMoveFromSquare = useCallback(
    (square: string, piece?: string) => {
      if (!enabled || !piece) {
        return false;
      }

      const squarePiece = chessRef.current.get(square as Square);

      if (!squarePiece || squarePiece.color !== chessRef.current.turn()) {
        return false;
      }

      return chessRef.current.moves({ square: square as Square, verbose: true }).length > 0;
    },
    [enabled],
  );

  const attemptMove = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (!enabled) {
        return false;
      }

      const didMove = applyExpectedMoveAttempt(
        chessRef.current,
        expectedMoves,
        sourceSquare,
        targetSquare,
      );

      if (!didMove) {
        syncPosition();
        return false;
      }

      syncPosition();
      setSelectedSquare(null);
      setDragSourceSquare(null);
      onLegalMove?.();
      return true;
    },
    [enabled, expectedMoves, onLegalMove, syncPosition],
  );

  const handleDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      const didMove = attemptMove(sourceSquare, targetSquare);

      if (!didMove) {
        setDragSourceSquare(null);
      }

      return didMove;
    },
    [attemptMove],
  );

  const handleSquareClick = useCallback(
    (square: string, piece?: string) => {
      if (!enabled) {
        setSelectedSquare(null);
        return;
      }

      const pendingMove = getPendingMove();

      if (!pendingMove) {
        setSelectedSquare(null);
        return;
      }

      if (selectedSquare) {
        if (selectedSquare === square) {
          setSelectedSquare(null);
          return;
        }

        if (attemptMove(selectedSquare, square)) {
          return;
        }

        if (canMoveFromSquare(square, piece)) {
          setSelectedSquare(square as Square);
          return;
        }

        setSelectedSquare(null);
        return;
      }

      if (canMoveFromSquare(square, piece)) {
        setSelectedSquare(square as Square);
        return;
      }

      setSelectedSquare(null);
    },
    [attemptMove, canMoveFromSquare, enabled, getPendingMove, selectedSquare],
  );

  const handlePieceDragBegin = useCallback(
    (piece: string, sourceSquare: string) => {
      if (!enabled) {
        return;
      }

      if (canMoveFromSquare(sourceSquare, piece)) {
        setDragSourceSquare(sourceSquare as Square);
        setSelectedSquare(sourceSquare as Square);
      }
    },
    [canMoveFromSquare, enabled],
  );

  const handlePieceDragEnd = useCallback(() => {
    setDragSourceSquare(null);
  }, []);

  const isDraggablePiece = useCallback(
    ({ piece, sourceSquare }: DraggablePieceArgs) => {
      return canMoveFromSquare(sourceSquare, piece);
    },
    [canMoveFromSquare],
  );

  const pendingMove = getPendingMove();
  const focusedSource = dragSourceSquare ?? selectedSquare;
  const customSquareStyles = useMemo<Record<string, InlineBoardStyle>>(() => {
    if (!enabled || !pendingMove || focusedSource !== pendingMove.from) {
      return {};
    }

    return {
      [pendingMove.from]: {
        boxShadow: "inset 0 0 0 4px rgba(34, 84, 61, 0.58)",
      },
      [pendingMove.to]: {
        boxShadow: "inset 0 0 0 4px rgba(212, 167, 44, 0.35)",
      },
    };
  }, [enabled, focusedSource, pendingMove]);

  return {
    currentFen: position,
    customSquareStyles,
    expectedMoves,
    handleDrop,
    handlePieceDragBegin,
    handlePieceDragEnd,
    handleSquareClick,
    isDraggablePiece,
    onPromotionCheck: () => false,
    pendingMove,
    resetBoard,
    selectedSquare,
  };
}
