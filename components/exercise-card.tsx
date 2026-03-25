import { SoundLink } from "@/components/sound-link";
import type { Exercise } from "@/lib/types";

type ExerciseCardProps = {
  exercise: Exercise;
};

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <article className="exercise-card panel">
      <div className="badge-row">
        <span className="badge">{exercise.category}</span>
        <span className="badge">{exercise.difficulty}</span>
      </div>
      <div>
        <h3>{exercise.title}</h3>
        <p className="card-copy">{exercise.moves.length} half-moves to recall.</p>
      </div>

      <SoundLink className="button-primary" href={`/exercise/${exercise.id}`}>
        Play Exercise
      </SoundLink>
    </article>
  );
}

