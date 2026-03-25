import { SoundLink } from "@/components/sound-link";
import type { Exercise } from "@/lib/types";

type ExerciseCardProps = {
  exercise: Exercise;
  onCategoryClick?: (category: string) => void;
};

export function ExerciseCard({ exercise, onCategoryClick }: ExerciseCardProps) {
  return (
    <article className="exercise-card panel">
      <div className="badge-row">
        {onCategoryClick ? (
          <button
            className="badge badge-button"
            onClick={() => onCategoryClick(exercise.category)}
            type="button"
          >
            {exercise.category}
          </button>
        ) : (
          <span className="badge">{exercise.category}</span>
        )}
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
