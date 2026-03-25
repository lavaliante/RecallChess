"use client";

import exercises from "@/data/exercises";
import { ExercisePlayer } from "@/components/exercise-player";
import { SoundLink } from "@/components/sound-link";
import { getSessionHistoryRecord } from "@/lib/session-history";
import type { Exercise } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

type ReviewMistakesClientProps = {
  sessionId: string;
  index: number;
};

export function ReviewMistakesClient({ sessionId, index }: ReviewMistakesClientProps) {
  const [wrongExerciseIds, setWrongExerciseIds] = useState<number[] | null>(null);

  useEffect(() => {
    const session = getSessionHistoryRecord(sessionId);
    setWrongExerciseIds(session?.wrongExerciseIds ?? null);
  }, [sessionId]);

  const reviewExercises = useMemo(
    () => (wrongExerciseIds ?? [])
      .map((id) => exercises.find((exercise) => exercise.id === id) ?? null)
      .filter((exercise): exercise is Exercise => exercise !== null),
    [wrongExerciseIds],
  );

  if (wrongExerciseIds === null) {
    return (
      <main className="page-shell">
        <section className="panel empty-state">
          <h3>Session not found</h3>
          <p className="card-copy">This mistake review is unavailable because the session record is missing.</p>
          <SoundLink className="button-primary" href="/history">
            Back to History
          </SoundLink>
        </section>
      </main>
    );
  }

  if (reviewExercises.length === 0) {
    return (
      <main className="page-shell">
        <section className="panel empty-state">
          <h3>No mistakes to review</h3>
          <p className="card-copy">This session did not record any wrong exercises.</p>
          <SoundLink className="button-primary" href={`/history/${sessionId}`}>
            Back to Session Details
          </SoundLink>
        </section>
      </main>
    );
  }

  const safeIndex = Math.min(Math.max(index, 0), reviewExercises.length - 1);
  const exercise = reviewExercises[safeIndex];
  const nextExerciseHref =
    safeIndex < reviewExercises.length - 1
      ? `/review/${sessionId}/${safeIndex + 1}`
      : `/history/${sessionId}`;

  return (
    <main className="page-shell">
      <ExercisePlayer
        exercise={exercise}
        nextExerciseHref={nextExerciseHref}
        nextExerciseId={null}
        timedMemorization={false}
      />
    </main>
  );
}

