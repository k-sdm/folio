"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

type AudioContextValue = {
  /** Set music volume, 0–1 (clamped). */
  setVolume: (v: number) => void;
  /** Current music volume, 0–1. */
  getVolume: () => number;
};

const AudioCtx = createContext<AudioContextValue>({
  setVolume: () => {},
  getVolume: () => 0,
});

export const useAudioVolume = () => useContext(AudioCtx);

/**
 * Mounts the background music <audio> once in the root layout so it keeps
 * playing across client-side navigation (the layout doesn't unmount between
 * pages). Plays a random track, then a random next one on end. Autoplay needs
 * a user gesture, so it starts on the first pointer/keydown anywhere. The
 * Stereophones knob sets the volume through this context; the volume persists
 * even after navigating away from the home page.
 */
export function AudioProvider({
  tracks,
  children,
}: {
  tracks: string[];
  children: ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef(0);
  const volumeRef = useRef(0); // starts silent — the knob turns it up

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;

    // Desktop only: the volume knob is a hover/drag interaction, so disable the
    // music feature entirely on touch/mobile (otherwise any tap starts it).
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    trackRef.current = Math.floor(Math.random() * tracks.length); // random start
    audio.src = tracks[trackRef.current];
    audio.volume = volumeRef.current;

    const onEnded = () => {
      if (tracks.length > 1) {
        let n = trackRef.current;
        while (n === trackRef.current) n = Math.floor(Math.random() * tracks.length);
        trackRef.current = n;
      }
      audio.src = tracks[trackRef.current];
      audio.volume = volumeRef.current;
      void audio.play().catch(() => {});
    };
    audio.addEventListener("ended", onEnded);

    const start = () => void audio.play().catch(() => {});
    window.addEventListener("pointerdown", start, { once: true });
    window.addEventListener("keydown", start, { once: true });

    return () => {
      audio.removeEventListener("ended", onEnded);
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, [tracks]);

  const setVolume = (v: number) => {
    const clamped = Math.min(1, Math.max(0, v));
    volumeRef.current = clamped;
    if (audioRef.current) audioRef.current.volume = clamped;
  };
  const getVolume = () => volumeRef.current;

  return (
    <AudioCtx.Provider value={{ setVolume, getVolume }}>
      {children}
      <audio ref={audioRef} preload="auto" />
    </AudioCtx.Provider>
  );
}
