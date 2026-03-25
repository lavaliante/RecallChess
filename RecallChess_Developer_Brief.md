# RecallChess — Developer Brief for Codex

Build a **web-based MVP** called **RecallChess**.

## Product goal
RecallChess is a chess memory trainer.

The user sees a short sequence of chess moves in **standard algebraic notation**, studies it, then clicks **Start Recall**. The notation is hidden, and the user must **replay the moves from memory on a chessboard** starting from the standard initial position.

After the user finishes, the app checks whether the **final board position** matches the expected position.

This is a **KISS MVP**. Keep it minimal, clean, and functional.

---

## Core gameplay loop
1. User opens the app
2. User selects an exercise
3. User sees the move notation
4. User studies the notation
5. User clicks **Start Recall**
6. Notation becomes hidden
7. User replays the move sequence from memory on the chessboard
8. User clicks **Check**
9. App compares the final board state with the expected final position
10. App shows **Correct** or **Incorrect**
11. User can **Retry** or go to **Next Exercise**

---

## MVP scope

### Include
- Web app only
- Standard chess starting position only
- Short move sequences in notation
- Hide/show notation flow
- Replay moves on interactive chessboard
- Illegal moves blocked
- Check final position
- Result screen
- Retry and Next actions
- Small exercise dataset stored locally
- Local progress tracking only

### Exclude
- Login/accounts
- Backend/database
- Multiplayer
- Chess engine analysis
- Timers
- Daily challenge
- Monetization
- Leaderboards
- Audio
- Animation of moves
- AI features
- Custom exercise creation
- Custom positions
- Full PGN import

---

## Tech stack
Use the simplest stable stack.

### Recommended
- **Next.js**
- **TypeScript**
- **React**
- **chess.js** for chess rules and move validation
- **react-chessboard** for the board UI
- local JSON file for exercises
- `localStorage` for progress

If needed, plain React is acceptable, but Next.js is preferred.

---

## UI / UX requirements
Keep the interface minimal and uncluttered.

### General
- Responsive layout
- Works on desktop and mobile browser
- Clean typography
- No fancy animations
- Focus on usability

### Home screen
Show:
- App title: RecallChess
- Short description
- Start button
- Exercise list or pack list

### Exercise screen
Show:
- Exercise title
- Category
- Difficulty
- Notation area
- Start Recall button
- Chessboard
- Reset button
- Check button

Behavior:
- Before Start Recall: notation visible
- After Start Recall: notation hidden
- Board starts from standard initial position
- User can move pieces normally
- Illegal moves must be rejected

### Result screen
Show:
- Correct or Incorrect
- Optional message
- Retry button
- Next button
- Reveal expected final position button

---

## Functional requirements

### 1. Exercise loading
Load exercises from a local JSON file.

Each exercise should contain:
- `id`
- `title`
- `category`
- `difficulty`
- `moves` as an array of SAN moves
- optionally `pgn`

### Example structure
```json
[
  {
    "id": 1,
    "title": "Italian Game 1",
    "category": "Openings",
    "difficulty": "Beginner",
    "moves": ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"]
  },
  {
    "id": 2,
    "title": "Ruy Lopez 1",
    "category": "Openings",
    "difficulty": "Beginner",
    "moves": ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"]
  }
]
```

### 2. Expected final position
For each exercise, compute the expected final position by applying the move list to a `chess.js` game starting from the initial position.

Use FEN for comparison.

Important:
- Compare only the board position as needed for MVP
- If easier, compare full FEN
- If full FEN causes mismatch due to move counters, compare normalized board state only

Preferred:
- compare piece placement + side to move + castling + en passant if practical
- but keep implementation simple and robust

### 3. Recall flow
When the exercise page opens:
- board is in initial position
- notation is visible
- user cannot yet “win” without pressing Start Recall

When user clicks **Start Recall**:
- set a state like `isRecallMode = true`
- hide the notation area
- allow user to begin replaying moves

### 4. Board interaction
The board should allow legal move input only.

Behavior:
- Use `chess.js` to validate all moves
- If move is illegal, reject it
- User continues until they think they are done

### 5. Check action
When user clicks **Check**:
- read current board state
- compare it to expected final position
- show Correct if matching
- otherwise show Incorrect

### 6. Reset action
Reset should:
- restore the board to the standard initial position
- preserve the current exercise
- keep recall mode active if already started

### 7. Retry action
Retry should:
- return to the same exercise
- show notation again
- reset board
- require user to click Start Recall again

### 8. Next action
Next should:
- load the next exercise in the dataset
- reset all state appropriately

### 9. Reveal expected final position
On result screen or in a modal/panel:
- show the correct final board position
- simplest approach: show a second read-only board using the expected FEN

### 10. Local progress
Use `localStorage` to store:
- completed exercise IDs
- correct exercise IDs
- last played exercise ID

Do not overbuild this.

---

## Suggested app structure

### Pages
- `/` — Home
- `/exercise/[id]` — Exercise page

### Components
- `Header`
- `ExerciseCard` or exercise list item
- `NotationPanel`
- `ChessBoardPanel`
- `ControlBar`
- `ResultPanel`
- `ProgressSummary`

### Utilities
- `loadExercises`
- `getExpectedFenFromMoves`
- `normalizeFenForComparison` or equivalent
- `saveProgress`
- `loadProgress`

---

## State model

### Exercise page state
Use simple React state.

Suggested state:
- `exercise`
- `isRecallMode`
- `isComplete`
- `isCorrect`
- `currentFen`
- `expectedFen`
- `showExpectedPosition`

You may also keep a `Chess` instance in state or derive from state carefully.

---

## Implementation details

### Exercise initialization
When the exercise loads:
- create a new `Chess()` instance
- set current game to initial position
- compute expected final position from exercise moves
- display notation

### User move handling
On each legal move:
- update the active `Chess()` instance
- update board FEN in state

### FEN comparison
Be careful with comparison.

If full FEN comparison is too strict, implement a helper to compare only:
- piece placement
- side to move
- castling rights
- en passant target

Ignore halfmove and fullmove counters for MVP.

### Notation display
Before recall:
- show the moves cleanly
- format move pairs nicely

Example:
- `1. e4 e5`
- `2. Nf3 Nc6`
- `3. Bc4 Bc5`

After recall starts:
- hide the notation completely

---

## Dataset requirements
Create an initial dataset of **20 exercises**.

### Categories
- Italian Game
- Ruy Lopez
- Queen’s Gambit
- London System
- Sicilian Defense
- Caro-Kann

### Difficulty
Use:
- Beginner
- Intermediate

### Exercise guidelines
- Short sequences only
- Mostly 3 to 6 ply pairs max
- Keep them legal and clean
- Prefer recognizable opening patterns
- Avoid weird edge cases for V1

---

## Acceptance criteria

### Core functionality
- User can open the app and choose an exercise
- User can read notation before recall
- User can click Start Recall and the notation hides
- User can replay moves on the board
- Illegal moves are blocked
- User can click Check
- App correctly determines whether the final position matches
- User can Retry
- User can go to Next
- User can reveal the expected final board

### Stability
- No crashes during normal use
- Board resets correctly
- Exercise switching works correctly
- Progress persists in localStorage

### UX
- App is understandable without explanation
- Layout is clean and responsive
- Mobile browser use is acceptable

---

## Non-goals
Do not add:
- authentication
- server-side storage
- advanced scoring
- hints
- move-by-move validation
- engine evaluation
- animations
- sound effects
- theme customizer
- dark/light toggle unless trivial

---

## Coding style requirements
- Use TypeScript
- Keep components small and readable
- Add comments only where helpful
- Avoid overengineering
- Keep logic straightforward
- Prefer clarity over abstraction
- Use sensible file names and folder structure

---

## Deliverables
Build:
1. a working web MVP
2. local exercise dataset with 20 exercises
3. responsive interface
4. local progress persistence

Also provide:
- short README with setup instructions
- notes on architecture
- any known limitations

---

## Nice-to-have only if easy
Only include these if they are very easy and do not slow MVP development:
- progress summary on home screen
- simple exercise completion markers
- keyboard-friendly controls
- subtle success/failure styling

---

## Final instruction
Prioritize the **smallest complete playable product**.

The app should feel like:
- open
- choose exercise
- memorize notation
- replay moves
- check result

Do not expand beyond that unless required for basic usability.
