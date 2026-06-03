"use client";

import { useEffect, useState } from "react";
import { DEFAULT_LAT, seasonalT, vaseMasks } from "@/lib/vase-gradient";

const IMAGES = [1, 2, 3, 4, 5, 6];

/**
 * Sky Vase — a self-contained project object. Stacks the 6 anodised vase photos
 * and crossfades them into one vertical gradient whose shape is set by today's
 * date and the visitor's latitude (see src/lib/vase-gradient.ts).
 *
 * Sized by height: render inside a height-constrained parent and the width
 * follows the 1066×2267 aspect ratio, so it scales against sibling projects.
 */
export function SkyVase() {
  // Deterministic mid-season default → identical on server & client (no
  // hydration mismatch). Refined to the real date/latitude after mount.
  const [masks, setMasks] = useState<string[]>(() => vaseMasks(0.5));

  useEffect(() => {
    let cancelled = false;

    const apply = (lat: number) => {
      if (!cancelled) setMasks(vaseMasks(seasonalT(new Date(), lat)));
    };

    fetch("/api/here")
      .then((r) => r.json())
      .then((d: { lat?: number }) => apply(typeof d.lat === "number" ? d.lat : DEFAULT_LAT))
      .catch(() => apply(DEFAULT_LAT));

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    // Footprint = the vase's reference rectangle (637 × 2267 at x:134), so its
    // wide transparent side padding doesn't skew the spacing. Not clipped: the
    // full image is offset to align that rectangle and overflows into the
    // gutters (the overflow is the transparent padding / thin stems).
    <div className="relative w-[var(--obj-mobile-w)] h-auto aspect-[637/2267] select-none md:h-[var(--obj-desktop-h)] md:w-auto">
      <div
        className="absolute top-0 h-full aspect-[1066/2267]"
        style={{ left: `${(-134 / 637) * 100}%` }}
      >
        {IMAGES.map((n, i) => {
          const mask = masks[i];
          const masked = mask && mask !== "none";
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={n}
              src={`/images/vase_${n}.webp`}
              alt={n === 1 ? "Sky Vase" : ""}
              aria-hidden={n !== 1}
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                zIndex: i, // vase_1 at the back, vase_6 on top
                maskImage: masked ? mask : undefined,
                WebkitMaskImage: masked ? mask : undefined,
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskSize: "100% 100%",
                WebkitMaskSize: "100% 100%",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
