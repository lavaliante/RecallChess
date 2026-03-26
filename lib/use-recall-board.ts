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

  const isSelectableSource = useCallback(
    (square: string, piece?: string) => {
      const pendingMove = getPendingMove();

      if (!enabled || !pendingMove || square !== pendingMove.from || !piece) {
        return false;
      }

      return piece.charAt(0) === pendingMove.color;
    },
    [enabled, getPendingMove],
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

        if (selectedSquare === pendingMove.from && square === pendingMove.to) {
          attemptMove(selectedSquare, square);
          return;
        }

        if (isSelectableSource(square, piece)) {
          setSelectedSquare(pendingMove.from);
        }

        return;
      }

      if (isSelectableSource(square, piece)) {
        setSelectedSquare(pendingMove.from);
        return;
      }

      setSelectedSquare(null);
    },
    [attemptMove, enabled, getPendingMove, isSelectableSource, selectedSquare],
  );

  const handlePieceDragBegin = useCallback(
    (_piece: string, sourceSquare: string) => {
      if (!enabled) {
        return;
      }

      const pendingMove = getPendingMove();

      if (pendingMove && sourceSquare === pendingMove.from) {
        setDragSourceSquare(pendingMove.from);
        setSelectedSquare(pendingMove.from);
      }
    },
    [enabled, getPendingMove],
  );

  const handlePieceDragEnd = useCallback(() => {
    setDragSourceSquare(null);
  }, []);

  const isDraggablePiece = useCallback(
    ({ piece, sourceSquare }: DraggablePieceArgs) => {
      return isSelectableSource(sourceSquare, piece);
    },
    [isSelectableSource],
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
