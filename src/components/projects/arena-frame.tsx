"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ObjectLabel } from "./object-label";

const VIDEO_COUNT = 8;
const FREEZE_MS = 18_000;

// Module-level so the video index survives client-side navigation: returning to
// home resumes the same video rather than picking a new random one. (Resets on a
// full page reload, which is fine.)
let savedIndex: number | null = null;

// Frame image is 833 x 1178. The video player is 573 x 950 at (149, 35).
// Expressed as percentages so it tracks the responsive frame image exactly.
const SLOT_STYLE: React.CSSProperties = {
  left: `${(149 / 833) * 100}%`,
  top: `${(35 / 1178) * 100}%`,
  width: `${(573 / 833) * 100}%`,
  height: `${(950 / 1178) * 100}%`,
};

/**
 * Arena Frame — a self-contained project object. Front/back frame photos
 * crossfade on hover; the video lives in the screen-cutout slot, inside the
 * frame, so it moves natively with frame_front (perfect alignment while the
 * stage scrolls / overscrolls) and is clipped by the scroll container (it goes
 * behind the header rather than floating over it).
 *
 * The video cycles frame_1..frame_8.webm: random start, freeze the first frame
 * for 18s, play, freeze the last frame for 18s, then advance (8 → 1).
 */
export function ArenaFrame({ name, year }: { name: string; year: string }) {
  const [hovered, setHovered] = useState(false);
  // Resume the persisted video if we have one; otherwise default to frame 1 so
  // the <video> is in the first (server) render and the browser starts loading
  // it immediately. A random start frame is chosen on mount (below).
  const [index, setIndex] = useState<number>(savedIndex ?? 1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Pick a random start only when nothing was persisted (first visit).
  useEffect(() => {
    if (savedIndex === null) setIndex(Math.floor(Math.random() * VIDEO_COUNT) + 1);
  }, []);

  // Keep the persisted index in sync so navigating away & back resumes it.
  useEffect(() => {
    savedIndex = index;
  }, [index]);

  // freeze first frame → play → freeze last frame → advance (8 → 1).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    clearTimer();

    const startSequence = () => {
      clearTimer();
      try {
        video.pause();
        video.currentTime = 0;
      } catch {
        // currentTime can throw before metadata loads; loadeddata guards this
      }
      timerRef.current = setTimeout(() => {
        void video.play().catch(() => {});
      }, FREEZE_MS);
    };

    const handleEnded = () => {
      clearTimer();
      timerRef.current = setTimeout(() => {
        setIndex((prev) => (prev % VIDEO_COUNT) + 1);
      }, FREEZE_MS);
    };

    video.addEventListener("loadeddata", startSequence);
    video.addEventListener("ended", handleEnded);
    video.load(); // (re)load the new src and fire loadeddata

    return () => {
      video.removeEventListener("loadeddata", startSequence);
      video.removeEventListener("ended", handleEnded);
      clearTimer();
    };
  }, [index, clearTimer]);

  return (
    <div
      className="relative w-[var(--obj-mobile-w)] h-auto aspect-[833/1178] select-none md:h-[var(--obj-desktop-h)] md:w-auto"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Base: front of the frame — fades out on hover so its shadow doesn't
          stack with the back image's shadow. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/frame_front.webp"
        alt="Arena Frame, front"
        draggable={false}
        className={`absolute inset-0 z-10 h-full w-full object-contain transition-opacity duration-500 ease-in-out ${
          hovered ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Video in the screen cutout — hidden while hovering */}
      <video
        ref={videoRef}
        src={`/videos/frame_${index}.webm`}
        muted
        playsInline
        preload="auto"
        aria-hidden
        style={SLOT_STYLE}
        className={`absolute z-20 object-cover transition-opacity duration-500 ease-in-out ${
          hovered ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Back of the frame — fades in on hover, covering the video */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/frame_back.webp"
        alt="Arena Frame, back"
        draggable={false}
        className={`absolute inset-0 z-30 h-full w-full object-contain transition-opacity duration-500 ease-in-out ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
      />

      <ObjectLabel
        name={name}
        year={year}
        show={hovered}
        className="bottom-[110%]"
        padX="md:px-[calc(1.25rem_+_5%)]"
      />
    </div>
  );
}
