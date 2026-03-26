"use client";

import { useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";

type InlineBoardStyle = Record<string, string | number>;

type ChessboardPanelProps = {
  boardId: string;
  position: string;
  onDrop?: (sourceSquare: string, targetSquare: string) => boolean;
  onSquareClick?: (square: string, piece?: string) => void;
  onPieceDragBegin?: (piece: string, sourceSquare: string) => void;
  onPieceDragEnd?: (piece: string, sourceSquare: string) => void;
  onPromotionCheck?: (sourceSquare: string, targetSquare: string, piece: string) => boolean;
  arePiecesDraggable: boolean;
  isDraggablePiece?: (args: { piece: string; sourceSquare: string }) => boolean;
  customBoardStyle?: InlineBoardStyle;
  customSquareStyles?: Record<string, InlineBoardStyle>;
};

export function ChessboardPanel({
  boardId,
  position,
  onDrop,
  onSquareClick,
  onPieceDragBegin,
  onPieceDragEnd,
  onPromotionCheck,
  arePiecesDraggable,
  isDraggablePiece,
  customBoardStyle,
  customSquareStyles,
}: ChessboardPanelProps) {
  const boardWrapperRef = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState(320);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const updatePointerMode = () => {
      setIsCoarsePointer(mediaQuery.matches);
    };

    updatePointerMode();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updatePointerMode);
      return () => mediaQuery.removeEventListener("change", updatePointerMode);
    }

    mediaQuery.addListener(updatePointerMode);
    return () => mediaQuery.removeListener(updatePointerMode);
  }, []);

  useEffect(() => {
    const element = boardWrapperRef.current;

    if (!element) {
      return;
    }

    const updateBoardWidth = () => {
      const horizontalPadding = isCoarsePointer ? 8 : 0;
      const availableWidth = Math.max(element.offsetWidth - horizontalPadding, 260);
      setBoardWidth(Math.min(availableWidth, 560));
    };

    updateBoardWidth();

    const observer = new ResizeObserver(updateBoardWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, [isCoarsePointer]);

  const mobileTapOnly = isCoarsePointer;
  const boardInteractionLabel = mobileTapOnly ? "Tap piece, then tap target square" : "Drag or tap to move";

  return (
    <div className="board-shell">
      <div className="board-wrapper" ref={boardWrapperRef}>
        <Chessboard
          id={boardId}
          position={position}
          onPieceDrop={onDrop}
          onSquareClick={onSquareClick}
          onPieceDragBegin={onPieceDragBegin}
          onPieceDragEnd={onPieceDragEnd}
          onPromotionCheck={onPromotionCheck}
          arePiecesDraggable={arePiecesDraggable && !mobileTapOnly}
          arePremovesAllowed={false}
          isDraggablePiece={isDraggablePiece}
          boardWidth={boardWidth}
          animationDuration={mobileTapOnly ? 120 : 180}
          dropOffBoardAction="snapback"
          snapToCursor={!mobileTapOnly}
          customBoardStyle={customBoardStyle}
          customSquareStyles={customSquareStyles}
          customDarkSquareStyle={{ backgroundColor: "#9b7d59" }}
          customLightSquareStyle={{ backgroundColor: "#f2dfc4" }}
        />
      </div>
      <p className="board-interaction-note" aria-live="polite">
        {boardInteractionLabel}
      </p>
    </div>
  );
}
