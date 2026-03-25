import { SoundButton } from "@/components/sound-button";

type NotationPanelProps = {
  formattedMoves: string[];
  isRecallMode: boolean;
  onStartRecall: () => void;
};

export function NotationPanel({
  formattedMoves,
  isRecallMode,
  onStartRecall,
}: NotationPanelProps) {
  return (
    <section className="panel">
      <div className="section-heading">
        <h2>Notation</h2>
        <p>Study the line, then hide it and replay the sequence from memory.</p>
      </div>

      {isRecallMode ? (
        <div className="notation-hidden">
          <strong>Recall mode is active.</strong>
          <span className="notation-muted">
            The move list is hidden until you retry the exercise.
          </span>
        </div>
      ) : (
        <>
          <ol className="notation-list">
            {formattedMoves.map((movePair) => (
              <li key={movePair}>{movePair}</li>
            ))}
          </ol>
          <div className="button-row">
            <SoundButton className="button-primary" onClick={onStartRecall} type="button">
              Start Recall
            </SoundButton>
          </div>
        </>
      )}
    </section>
  );
}
