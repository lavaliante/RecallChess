"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SoundButton } from "@/components/sound-button";
import { SoundLink } from "@/components/sound-link";
import { SoundToggle } from "@/components/sound-toggle";
import type { Exercise } from "@/lib/types";

type SessionLauncherProps = {
  availableDifficulties: Exercise["difficulty"][];
};

const DIFFICULTIES: Exercise["difficulty"][] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];
const DURATIONS = [1, 2, 5] as const;

export function SessionLauncher({ availableDifficulties }: SessionLauncherProps) {
  const router = useRouter();
  const defaultDifficulty = DIFFICULTIES.find((difficulty) =>
    availableDifficulties.includes(difficulty),
  );
  const [difficulty, setDifficulty] = useState<Exercise["difficulty"]>(
    defaultDifficulty ?? "Beginner",
  );
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>(2);

  const startSession = () => {
    router.push(`/session?difficulty=${difficulty}&duration=${duration}`);
  };

  return (
    <section className="hero-card quick-start-card session-launcher-card">
      <div className="button-row quick-start-topbar session-launcher-topbar">
        <SoundToggle />
      </div>

      <div className="session-launcher-title">
        <p className="eyebrow">Chess Memory Trainer</p>
        <h1>RecallChess</h1>
        <p className="hero-copy quick-start-copy">
          Choose a difficulty, pick a clock, and solve as many move-recall puzzles as
          you can before time runs out.
        </p>
      </div>

      <div className="session-option-block">
        <p className="session-option-label">Difficulty</p>
        <div className="option-grid option-grid-three">
          {DIFFICULTIES.map((item) => {
            const available = availableDifficulties.includes(item);

            return available ? (
              <SoundButton
                className={`option-button${difficulty === item ? " selected" : ""}`}
                key={item}
                onClick={() => setDifficulty(item)}
                type="button"
              >
                {item}
              </SoundButton>
            ) : (
              <SoundButton className="option-button is-disabled" disabled key={item}>
                {item}
              </SoundButton>
            );
          })}
        </div>
      </div>

      <div className="session-option-block">
        <p className="session-option-label">Session Duration</p>
        <div className="option-grid option-grid-three">
          {DURATIONS.map((item) => (
            <SoundButton
              className={`option-button${duration === item ? " selected" : ""}`}
              key={item}
              onClick={() => setDuration(item)}
              type="button"
            >
              {item} min
            </SoundButton>
          ))}
        </div>
      </div>

      <div className="session-launcher-actions">
        <SoundButton className="button-primary difficulty-button" onClick={startSession} type="button">
          Start Session
        </SoundButton>
        <SoundLink className="button-secondary difficulty-button" href="/history">
          History
        </SoundLink>
        <SoundLink className="secondary-link" href="/exercises">
          Exercise library
        </SoundLink>
      </div>
    </section>
  );
}
