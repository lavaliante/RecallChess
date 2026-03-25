import type { Exercise, ProgressSnapshot, StoredProgress } from "@/lib/types";

const STORAGE_KEY = "recallchess-progress";

const emptyProgress: StoredProgress = {
  completedIds: [],
  correctIds: [],
  lastPlayedId: null,
};

export function loadProgress(totalExercises = 0): ProgressSnapshot {
  if (typeof window === "undefined") {
    return { ...emptyProgress, totalExercises };
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return { ...emptyProgress, totalExercises };
    }

    const parsed = JSON.parse(storedValue) as Partial<StoredProgress>;

    return {
      completedIds: Array.isArray(parsed.completedIds) ? parsed.completedIds : [],
      correctIds: Array.isArray(parsed.correctIds) ? parsed.correctIds : [],
      lastPlayedId:
        typeof parsed.lastPlayedId === "number" ? parsed.lastPlayedId : null,
      totalExercises,
    };
  } catch {
    return { ...emptyProgress, totalExercises };
  }
}

export function saveProgress(progress: StoredProgress): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function getExerciseProgressSnapshot(
  exercises: Exercise[],
): ProgressSnapshot {
  return {
    ...emptyProgress,
    totalExercises: exercises.length,
  };
}
