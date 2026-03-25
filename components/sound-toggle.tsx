"use client";

import { SoundButton } from "@/components/sound-button";
import { useSound } from "@/components/sound-provider";

export function SoundToggle() {
  const { muted, toggleMuted } = useSound();
  const label = muted ? "Unmute sound" : "Mute sound";

  return (
    <SoundButton
      aria-label={label}
      className="button-ghost sound-toggle-button"
      onClick={toggleMuted}
      title={label}
      type="button"
    >
      {muted ? (
        <svg aria-hidden="true" className="sound-toggle-icon" viewBox="0 0 24 24">
          <path
            d="M5 9h4l5-4v14l-5-4H5z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <path
            d="M17 9l4 6M21 9l-4 6"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      ) : (
        <svg aria-hidden="true" className="sound-toggle-icon" viewBox="0 0 24 24">
          <path
            d="M5 9h4l5-4v14l-5-4H5z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <path
            d="M17 9.5a4.5 4.5 0 0 1 0 5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
          <path
            d="M19.5 7a8 8 0 0 1 0 10"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      )}
      <span className="sr-only">{label}</span>
    </SoundButton>
  );
}
