"use client";

import { useEffect, useState } from "react";
import { ObjectLabel } from "./object-label";

const LEVELS = [1, 2, 3];
const STEP_MS = 10 * 60 * 1000; // 10 minutes

// Module-level so the timer is consistent across client-side navigation: the
// level is derived from elapsed time since first view, not since this mount.
// (Resets on a full page reload, which is fine.)
let journeyStart: number | null = null;

/**
 * Journey — a self-contained project object. Starts on JOURNEY_1.webp and
 * crossfades to JOURNEY_2 after 10 minutes on the site, then JOURNEY_3 after
 * another 10. On hover it crossfades to JOURNEY_hover.webp (the base fades out
 * as the hover fades in, so any baked-in shadows don't stack).
 *
 * Sized by width on mobile, height on desktop (see ProjectStage).
 */
export function Journey({ name, year }: { name: string; year: string }) {
  // Start from the level the elapsed time implies (avoids a level-1 flash when
  // returning to home). journeyStart is null on the server / first paint → 1.
  const [level, setLevel] = useState(() => {
    if (journeyStart === null) return 1;
    const elapsed = Date.now() - journeyStart;
    return elapsed >= STEP_MS * 2 ? 3 : elapsed >= STEP_MS ? 2 : 1;
  });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (journeyStart === null) journeyStart = Date.now();
    const elapsed = Date.now() - journeyStart;
    setLevel(elapsed >= STEP_MS * 2 ? 3 : elapsed >= STEP_MS ? 2 : 1);

    const timers: ReturnType<typeof setTimeout>[] = [];
    if (elapsed < STEP_MS) {
      timers.push(setTimeout(() => setLevel(2), STEP_MS - elapsed));
    }
    if (elapsed < STEP_MS * 2) {
      timers.push(setTimeout(() => setLevel(3), STEP_MS * 2 - elapsed));
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="relative w-[var(--obj-mobile-w)] h-auto aspect-[723/1186] select-none md:h-[var(--obj-desktop-h)] md:w-auto"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Time-based base variants — only the current level is shown (and only
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
