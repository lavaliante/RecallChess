"use client";

import { useEffect, useState } from "react";
import type { ProgressSnapshot } from "@/lib/types";
import { loadProgress } from "@/lib/progress";

type ProgressSummaryProps = {
  progress: ProgressSnapshot;
  compact?: boolean;
};

export function ProgressSummary({ progress, compact = false }: ProgressSummaryProps) {
  const [liveProgress, setLiveProgress] = useState(progress);

  useEffect(() => {
    setLiveProgress(loadProgress(progress.totalExercises));
  }, [progress.totalExercises]);

  return (
    <section className={`progress-card${compact ? " compact" : ""}`}>
      <div>
        <span className="progress-stats">Completed</span>
        <strong>{liveProgress.completedIds.length}</strong>
      </div>
      <div>
        <span className="progress-stats">Correct</span>
        <strong>{liveProgress.correctIds.length}</strong>
      </div>
      <div>
        <span className="progress-stats">Total Exercises</span>
        <strong>{liveProgress.totalExercises}</strong>
      </div>
    </section>
  );
}
