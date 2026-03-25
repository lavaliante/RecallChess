import { notFound } from "next/navigation";
import { ExercisePlayer } from "@/components/exercise-player";
import exercises from "@/data/exercises";

type ExercisePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExercisePage({ params }: ExercisePageProps) {
  const { id } = await params;
  const exerciseId = Number(id);
  const exerciseIndex = exercises.findIndex((item) => item.id === exerciseId);

  if (exerciseIndex === -1) {
    notFound();
  }

  const exercise = exercises[exerciseIndex];
  const nextExercise = exercises[exerciseIndex + 1] ?? null;

  return (
    <main className="page-shell">
      <ExercisePlayer
        exercise={exercise}
        nextExerciseId={nextExercise?.id ?? null}
        timedMemorization={false}
      />
    </main>
  );
}
