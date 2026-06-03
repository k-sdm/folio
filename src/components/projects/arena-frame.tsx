"use client";

import { useEffect, useRef, useState } from "react";
import { useArenaFrame } from "@/components/arena-frame-provider";

// Frame image is 833 x 1178. The video player is 573 x 950 at (149, 35).
// Expressed as percentages so it scales with the responsive frame image.
const SLOT_STYLE: React.CSSProperties = {
  left: `${(149 / 833) * 100}%`,
  top: `${(35 / 1178) * 100}%`,
  width: `${(573 / 833) * 100}%`,
  height: `${(950 / 1178) * 100}%`,
};

/**
 * Arena Frame — a self-contained project object. Front/back frame photos swap
 * on hover; the playing video (owned by ArenaFrameProvider so it persists across
 * navigation) is glued over the screen-cutout slot registered here.
 *
 * Sized by height: render inside a height-constrained parent and the width
 * follows the 724×1024 aspect ratio.
 */
export function ArenaFrame() {
  const { setSlot, setHovered } = useArenaFrame();
  const slotRef = useRef<HTMLDivElement>(null);
  const [hovered, setHoveredState] = useState(false);

  // Tell the provider where to glue its persistent video while this page is shown.
  useEffect(() => {
    setSlot(slotRef.current);
    return () => setSlot(null);
  }, [setSlot]);

  const onEnter = () => {
    setHoveredState(true);
    setHovered(true);
  };
  const onLeave = () => {
    setHoveredState(false);
    setHovered(false);
  };

  return (
    <div
      className="relative h-full w-auto aspect-[833/1178] select-none"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Base: front of the frame — fades out on hover so its shadow doesn't
          stack with the back image's shadow (crossfade, not overlay). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/frame_front.webp"
        alt="Arena Frame, front"
        className={`absolute inset-0 z-10 h-full w-full object-contain transition-opacity duration-500 ease-in-out ${
          hovered ? "opacity-0" : "opacity-100"
        }`}
        draggable={false}
      />

      {/* Slot the provider's persistent video is positioned over */}
      <div ref={slotRef} aria-hidden className="absolute" style={SLOT_STYLE} />

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
