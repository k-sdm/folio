"use client";

import { useRef, type ReactNode } from "react";
import { SkyVase } from "./sky-vase";
import { ArenaFrame } from "./arena-frame";

type Project = {
  key: string;
  label: string;
  node: ReactNode;
  /** Object height relative to the others (1 = full stage height). */
  scale: number;
};

// Left → right. Each project is a self-contained object sized by height; `scale`
// sets its size relative to the others (Arena Frame = 50% of Sky Vase). Add a
// project here and it slots into the horizontally-scrolling row.
const PROJECTS: Project[] = [
  { key: "sky-vase", label: "Sky Vase", node: <SkyVase />, scale: 1 },
  { key: "arena-frame", label: "Arena Frame", node: <ArenaFrame />, scale: 0.5 },
];

// Tallest object's height; every object is BASE * its own scale, so they share
// a single reference and stay proportional to each other.
const BASE_HEIGHT = "min(70vh, 600px)";

export function ProjectStage() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Map vertical wheel/trackpad movement onto horizontal panning.
  const onWheel = (e: React.WheelEvent) => {
    const el = scrollRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
    }
  };

  return (
    <div
      ref={scrollRef}
      onWheel={onWheel}
      className="flex items-end gap-16 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ scrollSnapType: "x proximity" }}
    >
      {PROJECTS.map((p) => (
        <div
          key={p.key}
          className="flex shrink-0 flex-col items-center"
          style={{ scrollSnapAlign: "center" }}
        >
          {/* Object box: definite height (so the project's aspect ratio sets its
              width), and a flex item so that aspect ratio is honoured. */}
          <div
            className="flex items-end"
            style={{ height: `calc(${BASE_HEIGHT} * ${p.scale})` }}
          >
            {p.node}
          </div>
          <span className="mt-4 font-mono text-xs uppercase tracking-widest text-foreground/50">
            {p.label}
          </span>
        </div>
      ))}
    </div>
  );
}
