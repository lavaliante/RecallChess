import type {
  Exercise,
  SessionExerciseSnapshot,
  SessionHistoryRecord,
  SessionHistorySummary,
} from "@/lib/types";

const STORAGE_KEY = "recallchess-session-history";

function isDifficulty(value: unknown): value is Exercise["difficulty"] {
  return value === "Beginner" || value === "Intermediate" || value === "Advanced";
}

function sanitizeExerciseSnapshot(value: unknown): SessionExerciseSnapshot | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const snapshot = value as Partial<SessionExerciseSnapshot>;

  if (
    typeof snapshot.id !== "number" ||
    typeof snapshot.title !== "string" ||
    typeof snapshot.category !== "string" ||
    !isDifficulty(snapshot.difficulty)
  ) {
    return null;
  }

  return {
    id: snapshot.id,
    title: snapshot.title,
    category: snapshot.category,
    difficulty: snapshot.difficulty,
  };
}

function sanitizeSessionRecord(value: unknown): SessionHistoryRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<SessionHistoryRecord>;

  if (
    typeof record.id !== "string" ||
    typeof record.completedAt !== "string" ||
    !isDifficulty(record.difficulty) ||
    ![1, 2, 5].includes(record.durationMinutes as number) ||
    typeof record.totalExercises !== "number" ||
    typeof record.correct !== "number" ||
    typeof record.wrong !== "number" ||
    typeof record.unfinished !== "number" ||
    typeof record.accuracy !== "number"
  ) {
    return null;
  }

  const wrongExerciseIds = Array.isArray(record.wrongExerciseIds)
    ? record.wrongExerciseIds.filter((item): item is number => typeof item === "number")
    : [];
  const unfinishedExerciseIds = Array.isArray(record.unfinishedExerciseIds)
    ? record.unfinishedExerciseIds.filter((item): item is number => typeof item === "number")
    : [];
  const wrongExercises = Array.isArray(record.wrongExercises)
    ? record.wrongExercises
        .map(sanitizeExerciseSnapshot)
        .filter((item): item is SessionExerciseSnapshot => item !== null)
    : undefined;
  const unfinishedExercises = Array.isArray(record.unfinishedExercises)
    ? record.unfinishedExercises
        .map(sanitizeExerciseSnapshot)
        .filter((item): item is SessionExerciseSnapshot => item !== null)
    : undefined;

  return {
    id: record.id,
    completedAt: record.completedAt,
    difficulty: record.difficulty,
    durationMinutes: record.durationMinutes as 1 | 2 | 5,
    totalExercises: record.totalExercises,
    correct: record.correct,
    wrong: record.wrong,
    unfinished: record.unfinished,
    accuracy: record.accuracy,
    bestStreak: typeof record.bestStreak === "number" ? record.bestStreak : undefined,
    wrongExerciseIds,
    unfinishedExerciseIds,
    wrongExercises,
    unfinishedExercises,
  };
}

export function loadSessionHistory(): SessionHistoryRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsed = JSON.parse(storedValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(sanitizeSessionRecord)
      .filter((item): item is SessionHistoryRecord => item !== null)
      .sort((left, right) => right.completedAt.localeCompare(left.completedAt));
  } catch {
    return [];
  }
}

export function saveSessionHistory(history: SessionHistoryRecord[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function addSessionHistoryRecord(record: SessionHistoryRecord): void {
  const currentHistory = loadSessionHistory().filter((item) => item.id !== record.id);
  saveSessionHistory([record, ...currentHistory].sort((left, right) => right.completedAt.localeCompare(left.completedAt)));
}

export function getSessionHistorySummary(history: SessionHistoryRecord[]): SessionHistorySummary {
  const totals = history.reduce(
    (current, record) => ({
      totalSessions: current.totalSessions + 1,
      totalExercises: current.totalExercises + record.totalExercises,
      correct: current.correct + record.correct,
      wrong: current.wrong + record.wrong,
      unfinished: current.unfinished + record.unfinished,
    }),
    {
      totalSessions: 0,
      totalExercises: 0,
      correct: 0,
      wrong: 0,
      unfinished: 0,
    },
  );

  return {
    ...totals,
    accuracy:
      totals.totalExercises === 0
        ? 0
        : Math.round((totals.correct / totals.totalExercises) * 100),
  };
}

export function getSessionHistoryRecord(sessionId: string): SessionHistoryRecord | null {
  return loadSessionHistory().find((record) => record.id === sessionId) ?? null;
}
