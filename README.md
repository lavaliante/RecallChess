# RecallChess

RecallChess is a minimal chess memory trainer MVP. You study a short SAN move list, start recall mode to hide the notation, replay the line from memory on a chessboard, and then check whether your final position matches the expected one.

## Stack

- Next.js
- React
- TypeScript
- `chess.js` for rules and final-position calculation
- `react-chessboard` for the board UI
- Local JSON dataset for exercises
- `localStorage` for progress

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open `http://localhost:3000`.

## Build

```bash
npm run build
npm run start
```

## Architecture Notes

- `app/` contains the home page and exercise route.
- `components/` keeps the UI small and focused: notation, board, controls, result state, exercise cards, and sound helpers.
- `components/sound-provider.tsx` contains the minimal sound system. It is ready to prefer `/public/sounds` files later and currently falls back to generated Web Audio tones.
- `data/exercises.json` stores the 20 local exercises.
- `lib/chess.ts` handles move formatting, expected FEN generation, and normalized FEN comparison.
- `lib/progress.ts` stores completed, correct, and last-played exercise data in `localStorage`.

## Known Limitations

- Promotion always defaults to a queen for simplicity.
- Progress only updates in the current browser because storage is local only.
- The app checks the final position only; it does not verify whether the user reproduced the exact move order.
- No audio files are included yet, so sounds are currently generated in code.
