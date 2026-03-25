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
