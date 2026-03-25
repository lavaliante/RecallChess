import { Chess } from "chess.js";

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
