"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAudioVolume } from "@/components/audio-provider";
import { ObjectLabel } from "./object-label";

const MAX_DEG = 160; // knob travel: 0 (silent) → 160 (full volume)
const TOP_GIVE = 52; // rubber-band give past the top (max) limit; bottom is a hard stop
const FADE_MS = 220; // crossfade between the front image and the spin clips

// DOT.webp is 522×522 at x:359 y:1157 within the 1580×1798 image.
const DOT_STYLE: React.CSSProperties = {
  left: `${(359 / 1580) * 100}%`,
  top: `${(1157 / 1798) * 100}%`,
  width: `${(522 / 1580) * 100}%`,
};

type Props = { name: string; year: string };

// Rubber-band a raw knob angle: hard stop at the bottom (0), and past the top
// (MAX) it saturates with give, moving less and less toward +TOP_GIVE.
const rubber = (v: number) => {
  if (v <= 0) return 0; // hard stop — no give at the bottom
  if (v > MAX_DEG) {
    const o = v - MAX_DEG;
    return MAX_DEG + (TOP_GIVE * o) / (o + TOP_GIVE);
  }
  return v;
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Stereophones — the earcup is a volume knob. Hover plays a 2×-speed spin
 * (rotate-fwd.webm) and the side view + DOT (knob) appear; leaving plays the
 * reverse clip (rotate-rev.webm — browsers can't play video backwards) back to
 * the front. The two clips are frame-aligned, so leaving mid-spin hands straight
 * to the reverse from the same frame. The front image (stereophones.webp)
 * crossfades with the clips' first/last frame, which is held underneath until
 * the image has fully resolved. Drag the DOT around its own centre (0–160°,
 * clockwise) to set the music volume — it rubber-bands past the limits and
 * springs back. While the knob is actively turning the side view swaps to
 * stereophones_sides2.webp. Music is owned by AudioProvider so it keeps playing
 * across navigation; the volume persists too. Click (no drag) opens the page.
 */
export function Stereophones({ name, year }: Props) {
  const router = useRouter();
  const { setVolume, getVolume } = useAudioVolume();

  const initDeg = getVolume() * MAX_DEG;
  const [hovered, setHovered] = useState(false);
  const [phase, setPhase] = useState<"front" | "fwd" | "sides" | "rev">("front");
  const [rotation, setRotation] = useState(initDeg);
  const [turning, setTurning] = useState(false);
  const [revHold, setRevHold] = useState(false); // keep rev's last frame during fade

  const fwdVideoRef = useRef<HTMLVideoElement>(null);
  const revVideoRef = useRef<HTMLVideoElement>(null);
  const dotRef = useRef<HTMLImageElement>(null);

  const rotationRef = useRef(initDeg); // displayed angle (rubber-banded)
  const logicalRef = useRef(initDeg); // raw accumulated angle (can exceed limits)
  const draggingRef = useRef(false);
  const draggedRef = useRef(false); // a drag happened → suppress the click
  const hoveredRef = useRef(false);
  const lastAngleRef = useRef(0);
  const centerRef = useRef({ x: 0, y: 0 });
  const turnTimerRef = useRef<number | null>(null);
  const enterTimerRef = useRef<number | null>(null);
  const revHoldTimerRef = useRef<number | null>(null);
  const springRef = useRef<number | null>(null);
  const seekTokenRef = useRef(0);

  // Buffer both clips up front so the first hover/leave plays immediately.
  useEffect(() => {
    fwdVideoRef.current?.load();
    revVideoRef.current?.load();
    return () => {
      [turnTimerRef, enterTimerRef, revHoldTimerRef].forEach((t) => {
        if (t.current) clearTimeout(t.current);
      });
      if (springRef.current) cancelAnimationFrame(springRef.current);
    };
  }, []);

  const applyKnob = (display: number, logical: number) => {
    rotationRef.current = display;
    logicalRef.current = logical;
    setRotation(display);
    setVolume(Math.min(1, Math.max(0, logical / MAX_DEG)));
  };

  // Seek a clip to `target`, then reveal it only once that frame has painted.
  // Until then the previously visible layer stays put, so we never flash the
  // clip's resting frame (e.g. its front-facing first/last frame) before the
  // seek lands — which is what caused the stereophones.webp flash on interrupt.
  const seekThenReveal = (
    video: HTMLVideoElement,
    target: number,
    reveal: () => void,
  ) => {
    const token = ++seekTokenRef.current;
    // Reveal on the next animation frame so the (already-correct or just-seeked)
    // frame has actually composited first.
    const revealNextFrame = () =>
      requestAnimationFrame(() => {
        if (token === seekTokenRef.current) reveal();
      });
    if (Math.abs(video.currentTime - target) <= 0.01) {
      revealNextFrame();
      return;
    }
    let done = false;
    const onSeeked = () => {
      if (done || token !== seekTokenRef.current) return;
      done = true;
      video.removeEventListener("seeked", onSeeked);
      revealNextFrame();
    };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = target;
    // Long safety net only if 'seeked' never fires — never short enough to win
    // the race against a normal seek (which would flash the pre-seek frame).
    window.setTimeout(onSeeked, 500);
  };

  // Hover → spin forward; the front image crossfades out over the held first
  // frame, then the clip plays through to the side view.
  const onEnter = () => {
    hoveredRef.current = true;
    setHovered(true);
    if (phase === "sides" || phase === "fwd") return;
    const fwd = fwdVideoRef.current;
    const rev = revVideoRef.current;
    if (!fwd) {
      setPhase("sides");
      return;
    }
    if (phase === "rev") {
      // Reversing → forward mid-spin: continue from the matching frame. Seek
      // first so we don't flash fwd's resting frame, keeping rev visible until
      // fwd is ready.
      const dur = fwd.duration || 0;
      const target = rev && dur ? Math.max(0, dur - rev.currentTime) : 0;
      rev?.pause();
      if (revHoldTimerRef.current) clearTimeout(revHoldTimerRef.current);
      setRevHold(false);
      // Barely reversed (target at fwd's end): we're already at the side view —
      // go straight there. play() at the very end would reset to 0 and replay
      // the whole forward spin.
      if (dur && target >= dur - 0.02) {
        setPhase("sides");
        return;
      }
      seekThenReveal(fwd, target, () => {
        setPhase("fwd");
        void fwd.play().catch(() => setPhase("sides"));
      });
      return;
    }
    // From the front image: the clip may be resting on its last (side) frame,
    // so seek to frame 0 while the front image still fully covers it; only then
    // reveal (front image starts fading out over the held first frame) and,
    // after the crossfade, play. Without the seek-first the side frame flashes.
    fwd.pause();
    rev?.pause();
    seekThenReveal(fwd, 0, () => {
      if (!hoveredRef.current) return; // pointer already left during the seek
      setPhase("fwd");
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      enterTimerRef.current = window.setTimeout(() => {
        void fwd.play().catch(() => setPhase("sides"));
      }, FADE_MS);
    });
  };

  // Leave → spin backward, then crossfade the front image back in.
  const onLeave = () => {
    hoveredRef.current = false;
    setHovered(false);
    if (draggingRef.current) return; // don't reverse mid knob-drag
    if (phase === "front" || phase === "rev") return;
    if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    const fwd = fwdVideoRef.current;
    const rev = revVideoRef.current;
    if (!rev) {
      setPhase("front");
      return;
    }
    // rev is fwd reversed (rev t ↔ fwd dur − t), so start at the matching frame
    // — seamless whether we leave from "sides" (fwd ended) or mid-"fwd". Seek
    // before revealing so rev's resting (front) frame never flashes; the fwd /
    // sides layer stays visible until rev's target frame is ready.
    const dur = rev.duration || 0;
    const target = Math.max(0, dur - (fwd?.currentTime ?? 0));
    fwd?.pause();
    // Barely entered (target at rev's end): nothing to reverse, and play() at the
    // very end would reset to 0 and replay the whole reverse (flashing the side
    // frame). Go straight back to the front instead.
    if (dur && target >= dur - 0.02) {
      setPhase("front");
      return;
    }
    seekThenReveal(rev, target, () => {
      setPhase("rev");
      void rev.play().catch(() => setPhase("front"));
    });
  };

  const onRevEnded = () => {
    setPhase("front"); // front image crossfades in
    setRevHold(true); // keep rev's last frame underneath until it's in
    // Pre-seek the forward clip back to frame 0 now (it's hidden), so the next
    // hover from the front needs no seek and can't flash its resting side frame.
    if (fwdVideoRef.current) fwdVideoRef.current.currentTime = 0;
    if (revHoldTimerRef.current) clearTimeout(revHoldTimerRef.current);
    revHoldTimerRef.current = window.setTimeout(() => setRevHold(false), FADE_MS + 60);
    // NB: don't reset rev's currentTime here — doing so while it's still
    // opacity-1 (before the setRevHold re-render) flashed the side frame. The
    // leave path always seeks rev before revealing it, so its resting frame
    // doesn't matter.
  };

  // --- DOT rotary drag (around the knob's own centre), with rubber-band ---
  const angleAt = (x: number, y: number) =>
    (Math.atan2(y - centerRef.current.y, x - centerRef.current.x) * 180) / Math.PI;

  const onDotDown = (e: React.PointerEvent) => {
    if (springRef.current) cancelAnimationFrame(springRef.current);
    const r = dotRef.current!.getBoundingClientRect();
    centerRef.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    lastAngleRef.current = angleAt(e.clientX, e.clientY);
    logicalRef.current = rotationRef.current; // resume from the settled angle
    draggingRef.current = true;
    draggedRef.current = false;
    dotRef.current!.setPointerCapture(e.pointerId);
  };

  const onDotMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const a = angleAt(e.clientX, e.clientY);
    let delta = a - lastAngleRef.current;
    delta = ((((delta + 180) % 360) + 360) % 360) - 180; // normalise to (-180,180]
    lastAngleRef.current = a;
    if (Math.abs(delta) > 0.5) {
      draggedRef.current = true;
      // sides2 shows only while the knob is actually moving; revert shortly
      // after it goes still (even if the pointer is still held down).
      setTurning(true);
      if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
      turnTimerRef.current = window.setTimeout(() => setTurning(false), 120);
    }
    // Clamp the raw angle at 0 (hard stop, so dragging back up responds at once)
    // and allow overshoot above MAX for the top rubber-band.
    const logical = Math.max(0, Math.min(MAX_DEG + 300, logicalRef.current + delta));
    applyKnob(rubber(logical), logical);
  };

  const springTo = (target: number) => {
    if (springRef.current) cancelAnimationFrame(springRef.current);
    const start = rotationRef.current;
    const t0 = performance.now();
    const step = (now: number) => {
      const f = Math.min((now - t0) / 280, 1);
      const val = start + (target - start) * easeOut(f);
      rotationRef.current = val;
      setRotation(val);
      if (f < 1) springRef.current = requestAnimationFrame(step);
      else springRef.current = null;
    };
    springRef.current = requestAnimationFrame(step);
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
    // Spring back into range if the knob was pushed past a limit.
    const bound = logicalRef.current > MAX_DEG ? MAX_DEG : null; // only the top springs back
    if (bound !== null) {
      logicalRef.current = bound;
      springTo(bound);
    }
    if (draggedRef.current) {
      setTimeout(() => {
        draggedRef.current = false;
      }, 0);
    }
  };

  const onClick = () => {
    if (draggedRef.current) return; // it was a knob drag, not a click
    router.push("/stereophones");
  };

  return (
    <div
      className="relative w-[var(--obj-mobile-w)] h-auto aspect-[1580/1798] cursor-pointer select-none md:h-[var(--obj-desktop-h)] md:w-auto"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      <video
        ref={fwdVideoRef}
        src="/videos/rotate-fwd-6.webm"
        muted
        playsInline
        preload="auto"
        aria-hidden
        onEnded={() => setPhase("sides")}
        className={`pointer-events-none absolute inset-0 z-10 h-full w-full object-contain ${
          phase === "fwd" ? "opacity-100" : "opacity-0"
        }`}
      />

      <video
        ref={revVideoRef}
        src="/videos/rotate-rev-6.webm"
        muted
        playsInline
        preload="auto"
        aria-hidden
        onEnded={onRevEnded}
        className={`pointer-events-none absolute inset-0 z-10 h-full w-full object-contain ${
          phase === "rev" || revHold ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/stereophones_sides.webp"
        alt=""
        aria-hidden
        draggable={false}
        className={`pointer-events-none absolute inset-0 z-10 h-full w-full object-contain ${
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
        className={`pointer-events-none absolute inset-0 z-10 h-full w-full object-contain ${
          phase === "sides" && turning ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Front image — sits above the clips so it can crossfade over their
          held first/last frame on hover/leave. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/stereophones.webp"
        alt="Stereophones"
        draggable={false}
        style={{ transitionDuration: `${FADE_MS}ms` }}
        className={`pointer-events-none absolute inset-0 z-30 h-full w-full object-contain transition-opacity ease-in-out ${
          phase === "front" ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* DOT knob — drag to rotate (volume). Appears with the side view. */}
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
        style={{
          ...DOT_STYLE,
          transform: `rotate(${rotation}deg)`,
          transitionDuration: `${FADE_MS}ms`,
        }}
        className={`absolute z-40 touch-none cursor-grab transition-opacity ease-in-out active:cursor-grabbing ${
          phase === "sides" ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <ObjectLabel name={name} year={year} show={hovered} className="bottom-[110%]" />
    </div>
  );
}
