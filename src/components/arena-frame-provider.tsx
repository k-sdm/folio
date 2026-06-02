"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const VIDEO_COUNT = 9;
const FREEZE_MS = 18_000;

type ArenaFrameCtx = {
  /** Register the on-page element the video should be glued over (null = none). */
  setSlot: (el: HTMLElement | null) => void;
  /** Hide the video while the frame's back image is shown. */
  setHovered: (hovered: boolean) => void;
};

const Ctx = createContext<ArenaFrameCtx | null>(null);

export function useArenaFrame() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useArenaFrame must be used within <ArenaFrameProvider>");
  }
  return ctx;
}

/**
 * Owns the Arena Frame video. It lives here, in the root layout, so it is never
 * unmounted by page navigation — the current video and playback position carry
 * over between pages. The video is positioned with `fixed` and kept glued over
 * whatever slot the current page registers.
 */
export function ArenaFrameProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const hoveredRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSlotCb = useCallback((el: HTMLElement | null) => setSlot(el), []);
  const setHovered = useCallback((h: boolean) => {
    hoveredRef.current = h;
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Random starting video, chosen on the client to avoid hydration mismatch.
  useEffect(() => {
    setIndex(Math.floor(Math.random() * VIDEO_COUNT) + 1);
  }, []);

  // freeze first frame → play → freeze last frame → advance (9 → 1).
  useEffect(() => {
    if (index === null || !videoEl) return;
    clearTimer();

    const startSequence = () => {
      clearTimer();
      try {
        videoEl.pause();
        videoEl.currentTime = 0;
      } catch {
        // currentTime can throw before metadata loads; loadeddata guards this
      }
      timerRef.current = setTimeout(() => {
        void videoEl.play().catch(() => {});
      }, FREEZE_MS);
    };

    const handleEnded = () => {
      clearTimer();
      timerRef.current = setTimeout(() => {
        setIndex((prev) => ((prev ?? 1) % VIDEO_COUNT) + 1);
      }, FREEZE_MS);
    };

    videoEl.addEventListener("loadeddata", startSequence);
    videoEl.addEventListener("ended", handleEnded);
    videoEl.load(); // (re)load the new src and fire loadeddata

    return () => {
      videoEl.removeEventListener("loadeddata", startSequence);
      videoEl.removeEventListener("ended", handleEnded);
      clearTimer();
    };
  }, [index, videoEl, clearTimer]);

  // Glue the persistent video over the current page's slot, every frame.
  useEffect(() => {
    if (!videoEl) return;
    if (!slot) {
      videoEl.style.opacity = "0"; // no slot on this page → hidden, keeps playing
      return;
    }
    let raf = 0;
    const tick = () => {
      const r = slot.getBoundingClientRect();
      videoEl.style.transform = `translate(${r.left}px, ${r.top}px)`;
      videoEl.style.width = `${r.width}px`;
      videoEl.style.height = `${r.height}px`;
      videoEl.style.opacity = hoveredRef.current ? "0" : "1";
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [slot, videoEl]);

  return (
    <Ctx.Provider value={{ setSlot: setSlotCb, setHovered }}>
      {children}
      {index !== null && (
        <video
          ref={setVideoEl}
          src={`/videos/frame_${index}.webm`}
          muted
          playsInline
          preload="auto"
          aria-hidden
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            opacity: 0,
            objectFit: "cover",
            pointerEvents: "none",
            zIndex: 40,
            transition: "opacity 500ms ease-in-out",
            willChange: "transform",
          }}
        />
      )}
    </Ctx.Provider>
  );
}
