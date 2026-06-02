"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const VIDEO_COUNT = 9;
const FREEZE_MS = 30_000;

// Frame image is 724 x 1024. The video player is 573 x 950 at (95, 35).
// Expressed as percentages so it scales with the responsive frame image.
const PLAYER_STYLE: React.CSSProperties = {
  left: `${(95 / 724) * 100}%`,
  top: `${(35 / 1024) * 100}%`,
  width: `${(573 / 724) * 100}%`,
  height: `${(950 / 1024) * 100}%`,
};

export function ArenaFrame() {
  const [hovered, setHovered] = useState(false);
  // null until mounted, then a random start index (avoids SSR hydration mismatch)
  const [index, setIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Pick a random starting video once, on the client.
  useEffect(() => {
    setIndex(Math.floor(Math.random() * VIDEO_COUNT) + 1);
  }, []);

  // Drive the freeze → play → freeze → advance sequence whenever the source changes.
  useEffect(() => {
    if (index === null) return;
    const video = videoRef.current;
    if (!video) return;

    clearTimer();

    // Freeze on the first frame, then play through after the freeze window.
    const startSequence = () => {
      clearTimer();
      try {
        video.pause();
        video.currentTime = 0;
      } catch {
        // currentTime may throw if metadata isn't ready; loadeddata guards this
      }
      timerRef.current = setTimeout(() => {
        void video.play().catch(() => {});
      }, FREEZE_MS);
    };

    // On end the video holds its last frame; freeze, then advance to the next video.
    const handleEnded = () => {
      clearTimer();
      timerRef.current = setTimeout(() => {
        setIndex((prev) => ((prev ?? 1) % VIDEO_COUNT) + 1); // 9 -> 1
      }, FREEZE_MS);
    };

    video.addEventListener("loadeddata", startSequence);
    video.addEventListener("ended", handleEnded);
    video.load(); // force the new src to (re)load and fire loadeddata

    return () => {
      video.removeEventListener("loadeddata", startSequence);
      video.removeEventListener("ended", handleEnded);
      clearTimer();
    };
  }, [index, clearTimer]);

  return (
    <div
      className="relative mx-auto aspect-[724/1024] w-full max-w-[360px] select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Base: front of the frame */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/frame_front.webp"
        alt="Arena Frame, front"
        className="absolute inset-0 z-10 h-full w-full object-contain"
        draggable={false}
      />

      {/* Video player sitting in the screen cutout — hidden while hovering */}
      {index !== null && (
        <video
          ref={videoRef}
          src={`/videos/frame_${index}.webm`}
          muted
          playsInline
          preload="auto"
          aria-hidden
          style={PLAYER_STYLE}
          className={`absolute z-20 object-cover transition-opacity duration-500 ease-in-out ${
            hovered ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* Back of the frame — fades in on hover, covering the video */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/frame_back.webp"
        alt="Arena Frame, back"
        className={`absolute inset-0 z-30 h-full w-full object-contain transition-opacity duration-500 ease-in-out ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
        draggable={false}
      />
    </div>
  );
}
