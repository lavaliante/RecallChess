"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type SoundName = "click" | "move" | "success" | "error";

type SoundContextValue = {
  muted: boolean;
  toggleMuted: () => void;
  playClick: () => void;
  playMove: () => void;
  playSuccess: () => void;
  playError: () => void;
};

type BrowserWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

const STORAGE_KEY = "recallchess-muted";

const SOUND_FILES: Record<SoundName, string[]> = {
  click: ["/sounds/click.mp3", "/sounds/click.wav"],
  move: ["/sounds/move.mp3", "/sounds/move.wav"],
  success: ["/sounds/success.mp3", "/sounds/success.wav"],
  error: ["/sounds/error.mp3", "/sounds/error.wav"],
};

const SoundContext = createContext<SoundContextValue | null>(null);

function createClickSound(context: AudioContext) {
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(880, now);
  oscillator.frequency.exponentialRampToValueAtTime(660, now + 0.06);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.03, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.08);
}

function createMoveSound(context: AudioContext) {
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(420, now);
  oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.12);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.045, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.14);
}

function createSuccessSound(context: AudioContext) {
  const now = context.currentTime;
  const gain = context.createGain();
  gain.connect(context.destination);

  const first = context.createOscillator();
  first.type = "sine";
  first.frequency.setValueAtTime(523.25, now);
  first.connect(gain);

  const second = context.createOscillator();
  second.type = "sine";
  second.frequency.setValueAtTime(659.25, now + 0.08);
  second.connect(gain);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.04, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

  first.start(now);
  first.stop(now + 0.12);
  second.start(now + 0.08);
  second.stop(now + 0.24);
}

function createErrorSound(context: AudioContext) {
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(260, now);
  oscillator.frequency.exponentialRampToValueAtTime(180, now + 0.18);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.03, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.2);
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioCacheRef = useRef<Partial<Record<SoundName, HTMLAudioElement | null>>>({});

  useEffect(() => {
    const savedMuted = window.localStorage.getItem(STORAGE_KEY);
    setMuted(savedMuted === "true");
  }, []);

  const ensureAudioContext = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const browserWindow = window as BrowserWindow;
    const AudioContextClass = browserWindow.AudioContext || browserWindow.webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    if (audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, []);

  const getAudioElement = useCallback((soundName: SoundName) => {
    const cached = audioCacheRef.current[soundName];
    if (cached !== undefined) {
      return cached;
    }

    for (const path of SOUND_FILES[soundName]) {
      const audio = new Audio(path);
      audio.preload = "auto";
      audioCacheRef.current[soundName] = audio;
      return audio;
    }

    audioCacheRef.current[soundName] = null;
    return null;
  }, []);

  const playSynth = useCallback(
    (soundName: SoundName) => {
      const context = ensureAudioContext();
      if (!context) {
        return;
      }

      if (soundName === "click") {
        createClickSound(context);
        return;
      }

      if (soundName === "move") {
        createMoveSound(context);
        return;
      }

      if (soundName === "success") {
        createSuccessSound(context);
        return;
      }

      createErrorSound(context);
    },
    [ensureAudioContext],
  );

  const playSound = useCallback(
    (soundName: SoundName) => {
      if (muted || typeof window === "undefined") {
        return;
      }

      const audio = getAudioElement(soundName);

      if (audio) {
        audio.currentTime = 0;
        void audio.play().catch(() => {
          playSynth(soundName);
        });
        return;
      }

      playSynth(soundName);
    },
    [getAudioElement, muted, playSynth],
  );

  const toggleMuted = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      muted,
      toggleMuted,
      playClick: () => playSound("click"),
      playMove: () => playSound("move"),
      playSuccess: () => playSound("success"),
      playError: () => playSound("error"),
    }),
    [muted, playSound, toggleMuted],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);

  if (!context) {
    throw new Error("useSound must be used within SoundProvider.");
  }

  return context;
}
