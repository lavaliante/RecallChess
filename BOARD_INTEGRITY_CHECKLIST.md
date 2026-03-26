# Board Integrity Checklist

Use this whenever board interaction changes.

## Automated

Run:

```powershell
npm run test:board
npm run build
```

`test:board` verifies:
- legal move keeps displayed FEN aligned with `chess.js`
- illegal move leaves both states unchanged
- reset returns the board to the initial position
- retry-style reset clears move history cleanly
- exercise transition starts from a fresh board
- scripted promotions use the expected promotion piece

## Manual Browser Pass

Check these in both an individual exercise and a timed session.

### Desktop
- make the correct first move and confirm the piece moves once
- try a legal but wrong move and confirm the piece snaps back immediately
- try dragging an opponent piece and confirm it cannot be moved
- press `Reset` and confirm the board returns to the starting position
- finish incorrectly, press `Retry`, and confirm the board starts clean
- go to the next exercise and confirm the board starts from move 1 with no leftover state

### Mobile / Touch
- confirm the board shows tap-first interaction guidance
- tap the correct source piece, then tap the target square, and confirm the move executes once
- tap the wrong piece and confirm nothing moves
- tap the correct piece, then a wrong target square, and confirm no board drift or random move happens
- attempt small accidental drags and confirm pieces do not enter confusing drag states
- confirm illegal moves never leave the piece stranded between squares
- verify notation -> recall, result -> retry/next, reset, and session transitions all leave the board in a valid state

## Dev Guard

In development, the shared recall-board hook throws if the rendered FEN ever differs from the internal `chess.js` FEN. That guard lives in `lib/use-recall-board.ts`.
