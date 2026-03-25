export type Exercise = {
  id: number;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  moves: string[];
  pgn?: string;
};

export type StoredProgress = {
  completedIds: number[];
  correctIds: number[];
  lastPlayedId: number | null;
};

export type ProgressSnapshot = StoredProgress & {
  totalExercises: number;
};

export type SessionExerciseSnapshot = {
  id: number;
  title: string;
  category: string;
  difficulty: Exercise["difficulty"];
};

export type SessionHistoryRecord = {
  id: string;
  completedAt: string;
  difficulty: Exercise["difficulty"];
  durationMinutes: 1 | 2 | 5;
  totalExercises: number;
  correct: number;
  wrong: number;
  unfinished: number;
  accuracy: number;
  bestStreak?: number;
  wrongExerciseIds: number[];
  unfinishedExerciseIds: number[];
  wrongExercises?: SessionExerciseSnapshot[];
  unfinishedExercises?: SessionExerciseSnapshot[];
};

export type SessionHistorySummary = {
  totalSessions: number;
  totalExercises: number;
  correct: number;
  wrong: number;
  unfinished: number;
  accuracy: number;
};
