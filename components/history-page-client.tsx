"use client";

import { useEffect, useMemo, useState } from "react";
import { SoundLink } from "@/components/sound-link";
import { SoundToggle } from "@/components/sound-toggle";
import { loadSessionHistory, getSessionHistorySummary } from "@/lib/session-history";
import type { SessionHistoryRecord } from "@/lib/types";

function formatCompletedAt(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

export function HistoryPageClient() {
  const [history, setHistory] = useState<SessionHistoryRecord[]>([]);

  useEffect(() => {
    setHistory(loadSessionHistory());
  }, []);

  const summary = useMemo(() => getSessionHistorySummary(history), [history]);

  return (
    <main className="page-shell">
      <section className="hero-card browse-header">
        <div className="button-row browse-topbar">
          <SoundLink className="button-ghost" href="/">
            Back Home
          </SoundLink>
          <div className="button-row">
            <SoundLink className="button-secondary" href="/exercises">
              Library
            </SoundLink>
            <SoundToggle />
          </div>
        </div>
        <p className="eyebrow">Session History</p>
        <h1>Past Sessions</h1>
        <p className="hero-copy">
          Review completed timed sessions, inspect mistakes, and jump back into failed lines.
        </p>
      </section>

      <section className="summary-grid history-summary-grid">
        <div>
          <span className="progress-stats">Total Sessions</span>
          <strong>{summary.totalSessions}</strong>
        </div>
        <div>
          <span className="progress-stats">Exercises Attempted</span>
          <strong>{summary.totalExercises}</strong>
        </div>
        <div>
          <span className="progress-stats">Overall Correct</span>
          <strong>{summary.correct}</strong>
        </div>
        <div>
          <span className="progress-stats">Overall Wrong</span>
          <strong>{summary.wrong}</strong>
        </div>
        <div>
          <span className="progress-stats">Overall Unfinished</span>
          <strong>{summary.unfinished}</strong>
        </div>
        <div>
          <span className="progress-stats">Overall Accuracy</span>
          <strong>{summary.accuracy}%</strong>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Saved Sessions</h2>
          <p>Newest sessions appear first.</p>
        </div>

        {history.length > 0 ? (
          <div className="history-list">
            {history.map((session) => (
              <article className="panel history-card" key={session.id}>
                <div className="history-card-top">
                  <div>
                    <h3>{formatCompletedAt(session.completedAt)}</h3>
                    <p className="card-copy">
                      {session.difficulty} · {session.durationMinutes} min · {session.totalExercises} shown
                    </p>
                  </div>
                  <span className="badge">{session.accuracy}% accuracy</span>
                </div>
                <div className="badge-row">
                  <span className="badge success">Correct {session.correct}</span>
                  <span className="badge warning">Wrong {session.wrong}</span>
                  <span className="badge">Unfinished {session.unfinished}</span>
                  {typeof session.bestStreak === "number" ? (
                    <span className="badge">Best streak {session.bestStreak}</span>
                  ) : null}
                </div>
                <div className="history-actions">
                  <SoundLink className="button-ghost" href={`/history/${session.id}`}>
                    Details
                  </SoundLink>
                  {session.wrongExerciseIds.length > 0 ? (
                    <SoundLink className="button-primary" href={`/review/${session.id}/0`}>
                      Review Mistakes
                    </SoundLink>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="panel empty-state">
            <h3>No saved sessions yet</h3>
            <p className="card-copy">Complete a timed training session and it will appear here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
