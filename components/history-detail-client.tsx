"use client";

import { useEffect, useMemo, useState } from "react";
import { SoundLink } from "@/components/sound-link";
import { SoundToggle } from "@/components/sound-toggle";
import { getSessionHistoryRecord } from "@/lib/session-history";
import type { SessionExerciseSnapshot, SessionHistoryRecord } from "@/lib/types";

type HistoryDetailClientProps = {
  sessionId: string;
};

function formatCompletedAt(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

function renderExerciseList(title: string, items: SessionExerciseSnapshot[]) {
  return (
    <section className="panel history-detail-list">
      <h2>{title}</h2>
      {items.length > 0 ? (
        <div className="history-exercise-list">
          {items.map((exercise) => (
            <article className="history-exercise-item" key={`${title}-${exercise.id}`}>
              <div>
                <strong>{exercise.title}</strong>
                <p className="card-copy">
                  #{exercise.id} · {exercise.category} · {exercise.difficulty}
                </p>
              </div>
              <SoundLink className="button-ghost" href={`/exercise/${exercise.id}`}>
                Open
              </SoundLink>
            </article>
          ))}
        </div>
      ) : (
        <p className="card-copy">None.</p>
      )}
    </section>
  );
}

export function HistoryDetailClient({ sessionId }: HistoryDetailClientProps) {
  const [session, setSession] = useState<SessionHistoryRecord | null>(null);

  useEffect(() => {
    setSession(getSessionHistoryRecord(sessionId));
  }, [sessionId]);

  const wrongExercises = useMemo(() => session?.wrongExercises ?? [], [session]);
  const unfinishedExercises = useMemo(() => session?.unfinishedExercises ?? [], [session]);

  if (!session) {
    return (
      <main className="page-shell">
        <section className="panel empty-state">
          <h3>Session not found</h3>
          <p className="card-copy">This local session record is missing or may have been cleared.</p>
          <SoundLink className="button-primary" href="/history">
            Back to History
          </SoundLink>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="hero-card browse-header">
        <div className="button-row browse-topbar">
          <SoundLink className="button-ghost" href="/history">
            Back to History
          </SoundLink>
          <div className="button-row">
            {wrongExercises.length > 0 ? (
              <SoundLink className="button-primary" href={`/review/${session.id}/0`}>
                Review
              </SoundLink>
            ) : null}
            <SoundToggle />
          </div>
        </div>
        <p className="eyebrow">Session Details</p>
        <h1>{formatCompletedAt(session.completedAt)}</h1>
        <div className="session-summary-meta">
          <span className="badge">{session.difficulty}</span>
          <span className="badge">{session.durationMinutes} min</span>
          <span className="badge">Shown {session.totalExercises}</span>
          <span className="badge">Accuracy {session.accuracy}%</span>
        </div>
      </section>

      <section className="summary-grid history-summary-grid">
        <div>
          <span className="progress-stats">Correct</span>
          <strong>{session.correct}</strong>
        </div>
        <div>
          <span className="progress-stats">Wrong</span>
          <strong>{session.wrong}</strong>
        </div>
        <div>
          <span className="progress-stats">Unfinished</span>
          <strong>{session.unfinished}</strong>
        </div>
        <div>
          <span className="progress-stats">Best Streak</span>
          <strong>{session.bestStreak ?? 0}</strong>
        </div>
      </section>

      <div className="history-detail-grid">
        {renderExerciseList("Wrong Exercises", wrongExercises)}
        {renderExerciseList("Unfinished Exercises", unfinishedExercises)}
      </div>
    </main>
  );
}
