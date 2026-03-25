import { redirect } from "next/navigation";
import { SessionTrainer } from "@/components/session-trainer";
import exercises from "@/data/exercises";
import type { Exercise } from "@/lib/types";

type SessionPageProps = {
  searchParams: Promise<{
    difficulty?: string;
    duration?: string;
  }>;
};

const VALID_DIFFICULTIES: Exercise["difficulty"][] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];
const VALID_DURATIONS = [1, 2, 5] as const;

export default async function SessionPage({ searchParams }: SessionPageProps) {
  const { difficulty, duration } = await searchParams;
  const parsedDuration = Number(duration);

  if (
    !VALID_DIFFICULTIES.includes(difficulty as Exercise["difficulty"]) ||
    !VALID_DURATIONS.includes(parsedDuration as (typeof VALID_DURATIONS)[number])
  ) {
    redirect("/");
  }

  const filteredExercises = exercises.filter(
    (exercise) => exercise.difficulty === difficulty,
  );

  if (filteredExercises.length === 0) {
    redirect("/");
  }

  return (
    <main className="page-shell">
      <SessionTrainer
        difficulty={difficulty as Exercise["difficulty"]}
        durationMinutes={parsedDuration as 1 | 2 | 5}
        exercises={filteredExercises}
      />
    </main>
  );
}
