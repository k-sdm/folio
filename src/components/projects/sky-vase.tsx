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
 * reveals today's date (YYMMDD) as a rotated, screen-blended ink-bleed label.
 * Clicking opens skyva.se (linked from ProjectStage).
 */
export function SkyVase({ name, year }: { name: string; year: string }) {
  // Deterministic mid-season default → identical on server & client (no
  // hydration mismatch). Refined to the real date/latitude after mount.
  const [masks, setMasks] = useState<string[]>(() => vaseMasks(0.5));
  const [hovered, setHovered] = useState(false);
  const [date, setDate] = useState("");

  useEffect(() => {
    // Compute the gradient immediately from today's date + a default latitude.
    // (Previously this awaited a /api/here location fetch whose latency caused
    // the gradient to visibly jump after the object had already faded in.)
    const now = new Date();
    setMasks(vaseMasks(seasonalT(now, DEFAULT_LAT)));
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    setDate(`${yy}${mm}${dd}`);
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
        {/* Gradient stack — fades out on hover. */}
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

        {/* Date label — rotated, screen-blended onto the vase, drawn as an
            ink-bleed: the date text is blurred then alpha-thresholded into a
            gooey shape (SVG filter) that masks a vertical gradient fill.
            mix-blend-mode lives on this box (not inside the SVG): the box's
            transform makes a stacking context, so blending composites against
            the vase below rather than the transparent box. */}
        <div
          className={`absolute z-30 transition-opacity duration-500 ease-in-out ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            left: DATE_BOX.left,
            top: DATE_BOX.top,
            width: DATE_BOX.width,
            height: DATE_BOX.height,
            transform: "translate(-50%, -50%) rotate(-90deg)",
            mixBlendMode: "screen",
          }}
        >
          <svg
            viewBox="0 0 1286 242"
            preserveAspectRatio="xMidYMid meet"
            overflow="visible"
            className="h-full w-full overflow-visible"
          >
            <defs>
              {/* Gradient from 991231.svg (across the digits): #525252 → #939393
                  → #525252. userSpaceOnUse so it always maps to the digit band
                  (y 0–242), independent of the oversized fill rect below. */}
              <linearGradient
                id="skyvaseDateGrad"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="0"
                y2="242"
              >
                <stop offset="0%" stopColor="#525252" />
                <stop offset="49.04%" stopColor="#939393" />
                <stop offset="100%" stopColor="#525252" />
              </linearGradient>
              {/* Ink bleed: blur the text, jitter it with fractal-noise
                  displacement (the inky/pixelated edge texture), then push the
                  alpha through a hard threshold so it blooms like wet ink. */}
              <filter
                id="skyvaseInk"
                x="-50%"
                y="-100%"
                width="200%"
                height="320%"
              >
                <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.045"
                  numOctaves="2"
                  seed="7"
                  result="noise"
                />
                <feDisplacementMap
                  in="blur"
                  in2="noise"
                  scale="22"
                  xChannelSelector="R"
                  yChannelSelector="G"
                  result="rough"
                />
                <feColorMatrix
                  in="rough"
                  type="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
                />
              </filter>
              <mask id="skyvaseDateMask">
                <text
                  x="643"
                  y="121"
                  textAnchor="middle"
                  dominantBaseline="central"
                  textLength="1200"
                  lengthAdjust="spacingAndGlyphs"
                  fontWeight={700}
                  fontSize="334"
                  fill="#fff"
                  filter="url(#skyvaseInk)"
                  style={{ fontFamily: "var(--font-kh-teka-mono)" }}
                >
                  {date}
                </text>
              </mask>
            </defs>
            {/* Oversized so the inky bleed past the digit band isn't clipped. */}
            <rect
              x="-120"
              y="-140"
              width="1526"
              height="522"
              fill="url(#skyvaseDateGrad)"
              mask="url(#skyvaseDateMask)"
            />
          </svg>
        </div>
      </div>

      {/* Hover-capture = the reference rectangle only (not the overflow). */}
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
        style={{ bottom: `${(1 - (682 / 2267 - 0.1) - 0.05) * 100}%`, color: "#fff" }}
      />
    </div>
  );
}
