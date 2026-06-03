"use client";

import { useEffect, useState } from "react";

const VARIANTS = [1, 2, 3];

/**
 * Journey — a self-contained project object. Picks a random JOURNEY_x.webp on
 * load and crossfades to JOURNEY_hover.webp on hover. The base fades out as the
 * hover fades in (not an overlay) so any baked-in shadows don't stack.
 *
 * Sized by height: width follows the 723×1186 aspect ratio.
 */
export function Journey() {
  // Random variant chosen on the client → no SSR hydration mismatch.
  const [index, setIndex] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setIndex(VARIANTS[Math.floor(Math.random() * VARIANTS.length)]);
  }, []);

  return (
    <div
      className="relative w-[var(--obj-mobile-w)] h-auto aspect-[723/1186] select-none md:h-[var(--obj-desktop-h)] md:w-auto"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Random base variant */}
      {index !== null && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/images/JOURNEY_${index}.webp`}
          alt="Journey"
          draggable={false}
          className={`absolute inset-0 z-10 h-full w-full object-contain transition-opacity duration-500 ease-in-out ${
            hovered ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* Hover image — fades in over the base */}
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
    </div>
  );
}
