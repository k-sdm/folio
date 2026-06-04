"use client";

import { useState } from "react";
import { ObjectLabel } from "./object-label";

const LEVELS = [1, 2, 3];

// Hover-unhover cycles to advance the variant: 5 → JOURNEY_2, 10 → JOURNEY_3.
// Stored on `window` so the count survives client-side navigation (same window)
// and resets on a full refresh (new window). A module-level var could be reset
// if the route chunk re-initialises on navigation, so window is more reliable.
const KEY = "__journeyHoverCount";
const readCount = (): number =>
  typeof window === "undefined"
    ? 0
    : ((window as unknown as Record<string, number>)[KEY] ?? 0);

const levelFor = (count: number) => (count >= 10 ? 3 : count >= 5 ? 2 : 1);

/**
 * Journey — a self-contained project object. Starts on JOURNEY_1.webp and
 * advances to JOURNEY_2 after 5 hover-unhover cycles, then JOURNEY_3 after 5
 * more. On hover it crossfades to JOURNEY_hover.webp (the base fades out as the
 * hover fades in, so any baked-in shadows don't stack).
 *
 * Sized by width on mobile, height on desktop (see ProjectStage).
 */
export function Journey({ name, year }: { name: string; year: string }) {
  // Init from the persisted count so it's consistent across navigation.
  const [count, setCount] = useState(readCount);
  const [hovered, setHovered] = useState(false);
  const level = levelFor(count);

  return (
    <div
      className="relative w-[var(--obj-mobile-w)] h-auto aspect-[723/1186] select-none md:h-[var(--obj-desktop-h)] md:w-auto"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        const next = Math.min(readCount() + 1, 10);
        (window as unknown as Record<string, number>)[KEY] = next;
        setCount(next);
      }}
    >
      {/* Hover-count base variants — only the current level is shown (and only
          while not hovering); changing level crossfades between them. */}
      {LEVELS.map((n) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={n}
          src={`/images/JOURNEY_${n}.webp`}
          alt={n === 1 ? "Journey" : ""}
          aria-hidden={n !== 1}
          draggable={false}
          className={`absolute inset-0 z-10 h-full w-full object-contain transition-opacity duration-500 ease-in-out ${
            level === n && !hovered ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Hover image — fades in over whichever base variant is active */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/JOURNEY_hover.webp"
        alt=""
        aria-hidden
        draggable={false}
        className={`absolute inset-0 z-20 h-full w-full object-contain transition-opacity duration-500 ease-in-out ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
      />

      <ObjectLabel name={name} year={year} show={hovered} className="bottom-[110%]" />
    </div>
  );
}
