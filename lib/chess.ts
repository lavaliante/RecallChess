import { Chess, type Color, type PieceSymbol, type Square } from "chess.js";

export const INITIAL_FEN = new Chess().fen();

export type ExpectedMove = {
  color: Color;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  promotion?: PieceSymbol;
  san: string;
  fenAfter: string;
};

export function getExpectedFenFromMoves(moves: string[]): string {
  const chess = new Chess();

  for (const move of moves) {
    chess.move(move);
  }

  return chess.fen();
}

export function normalizeFenForComparison(fen: string): string {
  return fen.split(" ").slice(0, 4).join(" ");
}

export function formatMovePairs(moves: string[]): string[] {
  const pairs: string[] = [];

  for (let index = 0; index < moves.length; index += 2) {
    const moveNumber = Math.floor(index / 2) + 1;
    const whiteMove = moves[index];
    const blackMove = moves[index + 1] ?? "";
    pairs.push(`${moveNumber}. ${whiteMove}${blackMove ? ` ${blackMove}` : ""}`);
  }

  return pairs;
}

export function getExpectedMoveSequence(moves: string[]): ExpectedMove[] {
  const chess = new Chess();

  return moves.map((moveSan) => {
    const move = chess.move(moveSan, { strict: true });

    return {
      color: move.color,
      from: move.from,
      to: move.to,
      piece: move.piece,
      promotion: move.promotion,
      san: move.san,
      fenAfter: chess.fen(),
    };
  });
}

export function applyExpectedMoveAttempt(
  chess: Chess,
  expectedMoves: ExpectedMove[],
  sourceSquare: string,
  targetSquare: string,
): boolean {
  const pendingMove = expectedMoves[chess.history().length];
  const piece = chess.get(sourceSquare as Square);
  const isPromotionMove =
    piece?.type === "p" && (targetSquare.endsWith("1") || targetSquare.endsWith("8"));
  const promotion =
    pendingMove &&
    sourceSquare === pendingMove.from &&
    targetSquare === pendingMove.to
      ? pendingMove.promotion
      : isPromotionMove
        ? "q"
        : undefined;

  try {
    const move = chess.move({
      from: sourceSquare,
      to: targetSquare,
      ...(promotion ? { promotion } : {}),
    });

    return Boolean(move);
  } catch {
    return false;
  }
}
