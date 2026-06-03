"use client";

import { useEffect, useState } from "react";
import { DEFAULT_LAT, seasonalT, vaseMasks } from "@/lib/vase-gradient";
import { ObjectLabel } from "./object-label";

const IMAGES = [1, 2, 3, 4, 5, 6];

// Date label box within the 1066 × 2267 image: 1286 × 242, rotated -90° and
// centred on the vase reference rectangle (x:134 w:637, full height). All as %.
const DATE_BOX = {
  left: `${((134 + 637 / 2) / 1066) * 100}%`, // 42.45% — rect horizontal centre
  top: `${((762 + 1286 / 2) / 2267) * 100}%`, // design y:762 reference
  width: `${(1286 / 1066) * 100}%`, // 120.638%
  height: `${(242 / 2267) * 100}%`, // 10.675%
};

/**
 * Sky Vase — a self-contained project object. Stacks the 6 anodised vase photos
 * and crossfades them into one vertical gradient whose shape is set by today's
 * date and the visitor's latitude (see src/lib/vase-gradient.ts).
 *
 * Hovering the vase (its reference rectangle) crossfades to vase_hover.webp and
 * reveals today's date (YYMMDD) as a rotated, screen-blended label.
 */
export function SkyVase({ name, year }: { name: string; year: string }) {
  // Deterministic mid-season default → identical on server & client (no
  // hydration mismatch). Refined to the real date/latitude after mount.
  const [masks, setMasks] = useState<string[]>(() => vaseMasks(0.5));
  const [hovered, setHovered] = useState(false);
  const [date, setDate] = useState("");

  useEffect(() => {
    let cancelled = false;

    const apply = (lat: number) => {
      if (!cancelled) setMasks(vaseMasks(seasonalT(new Date(), lat)));
    };

    fetch("/api/here")
      .then((r) => r.json())
      .then((d: { lat?: number }) => apply(typeof d.lat === "number" ? d.lat : DEFAULT_LAT))
      .catch(() => apply(DEFAULT_LAT));

    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    setDate(`${yy}${mm}${dd}`);

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    // Footprint = the vase's reference rectangle (637 × 2267 at x:134), so its
    // wide transparent side padding doesn't skew the spacing.
    <div className="relative w-[var(--obj-mobile-w)] h-auto aspect-[637/2267] select-none md:h-[var(--obj-desktop-h)] md:w-auto">
      {/* Full image, offset to align the reference rectangle; overflows into the
          gutters (transparent padding). pointer-events-none so only the capture
          layer below (= the rectangle) triggers hover. isolate keeps the date's
          screen blend mixing with the vase only. */}
      <div
        className="pointer-events-none absolute top-0 h-full aspect-[1066/2267] isolate"
        style={{ left: `${(-134 / 637) * 100}%` }}
      >
        {/* Gradient stack — fades out on hover */}
        <div
          className={`absolute inset-0 z-10 transition-opacity duration-500 ease-in-out ${
            hovered ? "opacity-0" : "opacity-100"
          }`}
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

        {/* Hover image — fades in over the gradient */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/vase_hover.webp"
          alt=""
          aria-hidden
          draggable={false}
          className={`absolute inset-0 z-20 h-full w-full object-cover transition-opacity duration-500 ease-in-out ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Date label — rotated, screen-blended, fades in on hover */}
        <div
          className={`absolute z-30 flex items-center justify-center transition-opacity duration-500 ease-in-out ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            left: DATE_BOX.left,
            top: DATE_BOX.top,
            width: DATE_BOX.width,
            height: DATE_BOX.height,
            transform: "translate(-50%, -50%) rotate(-90deg)",
            containerType: "size",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-kh-teka-mono)",
              fontWeight: 700,
              color: "#B8B8B8",
              mixBlendMode: "screen",
              fontSize: "138cqh",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {date}
          </span>
        </div>
      </div>

      {/* Hover-capture = the reference rectangle only (not the overflow) */}
      <div
        className="absolute inset-0"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      {/* 10% above the hover content top (alpha row 682 / 2267), then net
          moved down 5%. */}
      <ObjectLabel
        name={name}
        year={year}
        show={hovered}
        style={{ bottom: `${(1 - (682 / 2267 - 0.1) - 0.05) * 100}%` }}
      />
    </div>
  );
}
