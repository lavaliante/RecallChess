"use client";

import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { useSound } from "@/components/sound-provider";

type SoundLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export function SoundLink({ onClick, ...props }: SoundLinkProps) {
  const { playClick } = useSound();

  return (
    <Link
      {...props}
      onClick={(event) => {
        playClick();
        onClick?.(event);
      }}
    />
  );
}
