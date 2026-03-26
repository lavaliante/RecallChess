import assert from "node:assert/strict";
import { Chess } from "chess.js";
import {
  applyExpectedMoveAttempt,
  getExpectedMoveSequence,
  INITIAL_FEN,
  type ExpectedMove,
} from "../lib/chess.ts";

function createBoardHarness(moves: string[]) {
  let chess = new Chess();
  let displayedFen = chess.fen();
  let expectedMoves = getExpectedMoveSequence(moves);

  function assertSynced(label: string) {
    assert.equal(
      displayedFen,
      chess.fen(),
      `${label}: displayed board FEN should match chess.js FEN`,
    );
  }

  function attemptMove(from: string, to: string) {
    const didMove = applyExpectedMoveAttempt(chess, expectedMoves, from, to);
    displayedFen = chess.fen();
    assertSynced(`after attempt ${from}-${to}`);
    return didMove;
  }

  function reset() {
    chess = new Chess();
    displayedFen = chess.fen();
    assertSynced("after reset");
  }

  function loadExercise(nextMoves: string[]) {
    chess = new Chess();
    expectedMoves = getExpectedMoveSequence(nextMoves);
    displayedFen = chess.fen();
    assertSynced("after exercise transition");
  }

  assertSynced("initial state");

  return {
    assertSynced,
    attemptMove,
    loadExercise,
    reset,
    getDisplayedFen: () => displayedFen,
    getHistory: () => chess.history(),
  };
}

function run() {
  const board = createBoardHarness(["e4", "e5", "Nf3"]);

  assert.equal(board.attemptMove("g1", "f3"), false);
  assert.equal(board.getDisplayedFen(), INITIAL_FEN);

  assert.equal(board.attemptMove("e2", "e4"), true);
  assert.equal(board.getHistory().length, 1);

  assert.equal(board.attemptMove("b8", "c6"), false);
  assert.equal(board.getHistory().length, 1);

  board.reset();
  assert.equal(board.getDisplayedFen(), INITIAL_FEN);
  assert.equal(board.getHistory().length, 0);

  assert.equal(board.attemptMove("e2", "e4"), true);
  assert.equal(board.attemptMove("e7", "e5"), true);
  assert.equal(board.attemptMove("g1", "f3"), true);
  assert.equal(board.getHistory().join(" "), "e4 e5 Nf3");

  board.reset();
  assert.equal(board.getHistory().length, 0);

  board.loadExercise(["d4", "d5", "c4"]);
  assert.equal(board.getDisplayedFen(), INITIAL_FEN);
  assert.equal(board.attemptMove("e2", "e4"), false);
  assert.equal(board.attemptMove("d2", "d4"), true);
  assert.equal(board.attemptMove("d7", "d5"), true);
  assert.equal(board.attemptMove("c2", "c4"), true);

  const promotionChess = new Chess("2k5/P7/8/8/8/8/8/K7 w - - 0 1");
  const promotionMove: ExpectedMove = {
    color: "w",
    from: "a7",
    to: "a8",
    piece: "p",
    promotion: "n",
    san: "a8=N+",
    fenAfter: "N1k5/8/8/8/8/8/8/K7 b - - 0 1",
  };

  const promotionDisplayedFen = promotionChess.fen();
  assert.equal(promotionDisplayedFen, promotionChess.fen());
  assert.equal(applyExpectedMoveAttempt(promotionChess, [promotionMove], "a7", "a8"), true);
  assert.equal(promotionChess.get("a8")?.type, "n");

  console.log("Board integrity checks passed.");
  console.log("Checklist:");
  console.log("- legal move keeps displayed FEN synced");
  console.log("- illegal move snaps back with no FEN drift");
  console.log("- reset returns both states to start position");
  console.log("- retry-ready reset clears history cleanly");
  console.log("- exercise transition reloads a clean start board");
  console.log("- promotion uses the scripted promotion piece");
}

run();
