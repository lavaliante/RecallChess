"use client";

import { SoundButton } from "@/components/sound-button";
import { useSound } from "@/components/sound-provider";

export function SoundToggle() {
  const { muted, toggleMuted } = useSound();

  return (
    <SoundButton className="button-ghost" onClick={toggleMuted} type="button">
      {muted ? "Unmute Sound" : "Mute Sound"}
    </SoundButton>
  );
}
