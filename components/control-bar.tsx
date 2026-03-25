import { SoundButton } from "@/components/sound-button";

type ControlBarProps = {
  canCheck: boolean;
  hasStarted: boolean;
  onReset: () => void;
  onCheck: () => void;
  onRetry: () => void;
};

export function ControlBar({
  canCheck,
  hasStarted,
  onReset,
  onCheck,
  onRetry,
}: ControlBarProps) {
  return (
    <div className="action-grid">
      <div className="button-row">
        <SoundButton className="button-secondary" onClick={onReset} type="button">
          Reset
        </SoundButton>
        <SoundButton
          className="button-primary"
          disabled={!canCheck}
          onClick={onCheck}
          type="button"
        >
          Check
        </SoundButton>
      </div>
      <div className="button-row">
        <SoundButton className="button-ghost" onClick={onRetry} type="button">
          Retry
        </SoundButton>
        {!hasStarted ? (
          <span className="notation-muted">
            Start recall before checking your final position.
          </span>
        ) : null}
      </div>
    </div>
  );
}
