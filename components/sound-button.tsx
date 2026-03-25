"use client";

import type { ButtonHTMLAttributes } from "react";
import { useSound } from "@/components/sound-provider";

type SoundButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function SoundButton({
  onClick,
  disabled,
  type = "button",
  ...props
}: SoundButtonProps) {
  const { playClick } = useSound();

  return (
    <button
      {...props}
      disabled={disabled}
      type={type}
      onClick={(event) => {
        if (!disabled) {
          playClick();
        }
        onClick?.(event);
      }}
    />
  );
}
