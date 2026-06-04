"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ObjectLabel } from "./object-label";

const MAX_DEG = 160; // knob travel: 0 (silent) → 160 (full volume)

// DOT.webp is 522×522 at x:359 y:1157 within the 1580×1798 image.
const DOT_STYLE: React.CSSProperties = {
  left: `${(359 / 1580) * 100}%`,
  top: `${(1157 / 1798) * 100}%`,
  width: `${(522 / 1580) * 100}%`,
};

type Props = { name: string; year: string; tracks?: string[] };

/**
 * Stereophones — the earcup is a volume knob. Hover plays rotate.webm (a 2×-speed
 * spin), then the side view + DOT (knob) fade in. On leave it plays the spin in
 * reverse (rotate-rev.webm, the same clip reversed — browsers can't play video
 * backwards) and returns to the front view. The two clips are frame-aligned, so a
 * mid-spin enter/leave hands off seamlessly. Drag the DOT around its own centre
 * (clockwise 0–160°) to set the music volume; while the knob is actively turning
 * the side view swaps to stereophones_sides2.webp. A track from /music plays in the
 * background (random order). Click (without dragging) opens the project page.
 */
export function Stereophones({ name, year, tracks = [] }: Props) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [phase, setPhase] = useState<"front" | "fwd" | "sides" | "rev">("front");
  const [rotation, setRotation] = useState(0);
  const [turning, setTurning] = useState(false);

  const fwdVideoRef = useRef<HTMLVideoElement>(null);
  const revVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const dotRef = useRef<HTMLImageElement>(null);

  const rotationRef = useRef(0);
  const draggingRef = useRef(false);
  const draggedRef = useRef(false); // a drag happened → suppress the click
  const lastAngleRef = useRef(0);
  const centerRef = useRef({ x: 0, y: 0 });
  const trackRef = useRef(0);
  const turnTimerRef = useRef<number | null>(null);

  // --- background audio (only mounted here, i.e. only on the home page) ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;

    trackRef.current = Math.floor(Math.random() * tracks.length); // random start
    audio.src = tracks[trackRef.current];
    audio.volume = rotationRef.current / MAX_DEG;

    const onEnded = () => {
      if (tracks.length > 1) {
        let n = trackRef.current;
        while (n === trackRef.current) n = Math.floor(Math.random() * tracks.length);
        trackRef.current = n;
      }
      audio.src = tracks[trackRef.current];
      audio.volume = rotationRef.current / MAX_DEG;
      void audio.play().catch(() => {});
    };
    audio.addEventListener("ended", onEnded);

    // Autoplay needs a user gesture — start on the first one anywhere.
    const start = () => void audio.play().catch(() => {});
    window.addEventListener("pointerdown", start, { once: true });
    window.addEventListener("keydown", start, { once: true });

    return () => {
      audio.removeEventListener("ended", onEnded);
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
      audio.pause();
    };
  }, [tracks]);

  const setRotationAndVolume = (deg: number) => {
    const clamped = Math.min(MAX_DEG, Math.max(0, deg));
    rotationRef.current = clamped;
    setRotation(clamped);
    if (audioRef.current) audioRef.current.volume = clamped / MAX_DEG;
  };

  // Buffer both clips up front so the first hover/leave plays immediately.
  useEffect(() => {
    fwdVideoRef.current?.load();
    revVideoRef.current?.load();
  }, []);

  // Hover → spin forward; the side view fades in when it ends.
  const onEnter = () => {
    setHovered(true);
    if (phase === "sides" || phase === "fwd") return;
    const fwd = fwdVideoRef.current;
    const rev = revVideoRef.current;
    if (!fwd) {
      setPhase("sides");
      return;
    }
    // Coming out of a reverse mid-spin: continue forward from the same frame.
    if (phase === "rev" && rev && fwd.duration) {
      fwd.currentTime = Math.max(0, fwd.duration - rev.currentTime);
    } else {
      fwd.currentTime = 0;
    }
    rev?.pause();
    setPhase("fwd");
    void fwd.play().catch(() => setPhase("sides"));
  };

  // Leave → spin backward, then return to the front view.
  const onLeave = () => {
    setHovered(false);
    if (draggingRef.current) return; // don't reverse mid knob-drag
    if (phase === "front" || phase === "rev") return;
    const fwd = fwdVideoRef.current;
    const rev = revVideoRef.current;
    if (!rev) {
      setPhase("front");
      return;
    }
    // Reverse starts at the frame matching the current forward position
    // (rev is fwd reversed, so rev t ↔ fwd dur − t). From "sides" that's 0.
    rev.currentTime = Math.max(0, (rev.duration || 0) - (fwd?.currentTime ?? 0));
    fwd?.pause();
    setPhase("rev");
    void rev.play().catch(() => setPhase("front"));
  };

  // --- DOT rotary drag (around the knob's own centre) ---
  const angleAt = (x: number, y: number) =>
    (Math.atan2(y - centerRef.current.y, x - centerRef.current.x) * 180) / Math.PI;

  const onDotDown = (e: React.PointerEvent) => {
    const r = dotRef.current!.getBoundingClientRect();
    centerRef.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    lastAngleRef.current = angleAt(e.clientX, e.clientY);
    draggingRef.current = true;
    draggedRef.current = false;
    dotRef.current!.setPointerCapture(e.pointerId);
  };

  const onDotMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const a = angleAt(e.clientX, e.clientY);
    let delta = a - lastAngleRef.current;
    delta = ((((delta + 180) % 360) + 360) % 360) - 180; // normalise to (-180,180]
    if (Math.abs(delta) > 0.5) {
      draggedRef.current = true;
      // sides2 shows only while the knob is actually moving; revert shortly
      // after it goes still (even if the pointer is still held down).
      setTurning(true);
      if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
      turnTimerRef.current = window.setTimeout(() => setTurning(false), 120);
    }
    lastAngleRef.current = a;
    setRotationAndVolume(rotationRef.current + delta);
  };

  const onDotUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
    setTurning(false);
    try {
      dotRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    if (draggedRef.current) {
      // keep flag true through the click that may follow, then clear it
      setTimeout(() => {
        draggedRef.current = false;
      }, 0);
    }
  };

  const onClick = () => {
    if (draggedRef.current) return; // it was a knob drag, not a click
    router.push("/stereophones");
  };

  const fade = "transition-opacity duration-500 ease-in-out";

  return (
    <div
      className="relative w-[var(--obj-mobile-w)] h-auto aspect-[1580/1798] cursor-pointer select-none md:h-[var(--obj-desktop-h)] md:w-auto"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/stereophones.webp"
        alt="Stereophones"
        draggable={false}
        className={`absolute inset-0 z-10 h-full w-full object-contain ${
          phase === "front" ? "opacity-100" : "opacity-0"
        }`}
      />

      <video
        ref={fwdVideoRef}
        src="/videos/rotate-fwd.webm"
        muted
        playsInline
        preload="auto"
        aria-hidden
        onEnded={() => setPhase("sides")}
        className={`absolute inset-0 z-10 h-full w-full object-contain ${
          phase === "fwd" ? "opacity-100" : "opacity-0"
        }`}
      />

      <video
        ref={revVideoRef}
        src="/videos/rotate-rev.webm"
        muted
        playsInline
        preload="auto"
        aria-hidden
        onEnded={() => setPhase("front")}
        className={`absolute inset-0 z-10 h-full w-full object-contain ${
          phase === "rev" ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/stereophones_sides.webp"
        alt=""
        aria-hidden
        draggable={false}
        className={`absolute inset-0 z-10 h-full w-full object-contain ${
          phase === "sides" ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Stacked on top of the side view; shown (no fade) only while the knob
          is actively turning. When still it's hidden and sides.webp reads. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/stereophones_sides2.webp"
        alt=""
        aria-hidden
        draggable={false}
        className={`absolute inset-0 z-10 h-full w-full object-contain ${
          phase === "sides" && turning ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* DOT knob — drag to rotate (volume). Fades in with the side view. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={dotRef}
        src="/images/DOT.webp"
        alt=""
        aria-hidden
        draggable={false}
        onPointerDown={onDotDown}
        onPointerMove={onDotMove}
        onPointerUp={onDotUp}
        style={{ ...DOT_STYLE, transform: `rotate(${rotation}deg)` }}
        className={`absolute z-20 touch-none cursor-grab active:cursor-grabbing ${fade} ${
          phase === "sides" ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <audio ref={audioRef} preload="auto" />

      <ObjectLabel name={name} year={year} show={hovered} className="bottom-[110%]" />
    </div>
  );
}
