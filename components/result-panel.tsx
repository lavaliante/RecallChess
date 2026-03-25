import { SoundButton } from "@/components/sound-button";
import { SoundLink } from "@/components/sound-link";

type ResultPanelProps = {
  isCorrect: boolean;
  nextExerciseId: number | null;
  revealExpectedPosition: boolean;
  onRetry: () => void;
  onToggleReveal: () => void;
};

export function ResultPanel({
  isCorrect,
  nextExerciseId,
  revealExpectedPosition,
  onRetry,
  onToggleReveal,
}: ResultPanelProps) {
  return (
    <section className="panel result-panel">
      <h2
        className={`result-title ${isCorrect ? "result-correct" : "result-incorrect"}`}
      >
        {isCorrect ? "Correct" : "Incorrect"}
      </h2>
      <p className="result-copy">
        {isCorrect
          ? "You recreated the final position from memory."
          : "Your final board position did not match the expected result."}
      </p>
      <div className="button-row">
        <SoundButton className="button-secondary" onClick={onRetry} type="button">
          Retry
        </SoundButton>
        {nextExerciseId ? (
          <SoundLink className="button-primary" href={`/exercise/${nextExerciseId}`}>
            Next
          </SoundLink>
        ) : (
          <SoundLink className="button-primary" href="/">
            Back Home
          </SoundLink>
        )}
        <SoundButton className="button-ghost" onClick={onToggleReveal} type="button">
          {revealExpectedPosition ? "Hide Expected Position" : "Reveal Expected Final Position"}
        </SoundButton>
      </div>
    </section>
  );
}
