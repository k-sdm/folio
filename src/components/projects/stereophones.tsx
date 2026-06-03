"use client";

import { useEffect, useRef, useState } from "react";
import { ObjectLabel } from "./object-label";

/**
 * Stereophones — a self-contained project object. Shows stereophones.webp and
 * crossfades to a looping orbit.webm on hover (the image fades out as the video
 * fades in, so any baked-in shadows don't stack). The video only plays while
 * hovered and resets when the pointer leaves.
 *
 * Sized by height: width follows the 1580×1798 aspect ratio.
 */
export function Stereophones({ name, year }: { name: string; year: string }) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (hovered) {
      void video.play().catch(() => {});
    } else {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        // ignore if not seekable yet
      }
    }
  }, [hovered]);

  return (
    <div
      className="relative w-[var(--obj-mobile-w)] h-auto aspect-[1580/1798] select-none md:h-[var(--obj-desktop-h)] md:w-auto"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/stereophones.webp"
        alt="Stereophones"
        draggable={false}
        className={`absolute inset-0 z-10 h-full w-full object-contain transition-opacity duration-500 ease-in-out ${
          hovered ? "opacity-0" : "opacity-100"
        }`}
      />

      <video
        ref={videoRef}
        src="/videos/orbit.webm"
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        className={`absolute inset-0 z-20 h-full w-full object-contain transition-opacity duration-500 ease-in-out ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
      />

      <ObjectLabel name={name} year={year} show={hovered} className="bottom-[110%]" />
    </div>
  );
}
