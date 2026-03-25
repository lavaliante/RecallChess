"use client";

import { useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";

type ChessboardPanelProps = {
  boardId: string;
  position: string;
  onDrop: (sourceSquare: string, targetSquare: string) => boolean;
  arePiecesDraggable: boolean;
};

export function ChessboardPanel({
  boardId,
  position,
  onDrop,
  arePiecesDraggable,
}: ChessboardPanelProps) {
  const boardWrapperRef = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState(320);

  useEffect(() => {
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
  }, []);

  return (
    <section className="panel board-card">
      <div className="section-heading">
        <h2>Board</h2>
        <p>Replay the full move sequence from the standard starting position.</p>
      </div>
      <div className="board-wrapper" ref={boardWrapperRef}>
        <Chessboard
          id={boardId}
          position={position}
          onPieceDrop={onDrop}
          arePiecesDraggable={arePiecesDraggable}
          boardWidth={boardWidth}
          customDarkSquareStyle={{ backgroundColor: "#9b7d59" }}
          customLightSquareStyle={{ backgroundColor: "#f2dfc4" }}
        />
      </div>
    </section>
  );
}
