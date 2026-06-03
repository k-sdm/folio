"use client";

import { useRef, type ReactNode } from "react";
import { SkyVase } from "./sky-vase";
import { ArenaFrame } from "./arena-frame";
import { Journey } from "./journey";
import { Stereophones } from "./stereophones";

type Project = {
  key: string;
  label: string;
  node: ReactNode;
  /** Source image pixel size — objects are rendered to scale against this. */
  px: { w: number; h: number };
};

// Left → right. The exported assets are already to scale with each other, so we
// size every object by its real pixel height using one shared scale factor — no
// per-object fudge. Add a project here and it slots into the scrolling row.
const PROJECTS: Project[] = [
  // Vase footprint uses its reference rectangle (637 wide), not the full image
  // width, so the transparent side padding doesn't make the gaps uneven.
  { key: "sky-vase", label: "Sky Vase", node: <SkyVase />, px: { w: 637, h: 2267 } },
  { key: "arena-frame", label: "Arena Frame", node: <ArenaFrame />, px: { w: 833, h: 1178 } },
  { key: "journey", label: "Journey", node: <Journey />, px: { w: 723, h: 1186 } },
  { key: "stereophones", label: "Stereophones", node: <Stereophones />, px: { w: 1580, h: 1798 } },
];

// On-screen height of the tallest object; the rest scale from it by pixel ratio.
const REF_HEIGHT = "min(82vh, 760px)";
const MAX_PX_H = Math.max(...PROJECTS.map((p) => p.px.h));

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
      className="flex items-end gap-16 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ scrollSnapType: "x proximity" }}
    >
      {PROJECTS.map((p) => (
        // Object box: definite height (image px ratio × shared reference) so the
        // project's aspect ratio sets its width; a flex item so it's honoured.
        <div
          key={p.key}
          className="flex shrink-0 items-end"
          style={{
            height: `calc(${REF_HEIGHT} * ${p.px.h / MAX_PX_H})`,
            scrollSnapAlign: "center",
          }}
        >
          {p.node}
        </div>
      ))}
    </div>
  );
}
