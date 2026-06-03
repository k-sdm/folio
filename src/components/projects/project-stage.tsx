"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
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

// Left → right (desktop) / top → bottom (mobile). The exported assets are
// already to scale with each other, so we size every object from its real pixel
// dimensions. Add a project here and it slots into the row.
const PROJECTS: Project[] = [
  // Vase footprint uses its reference rectangle (637 wide), not the full image
  // width, so the transparent side padding doesn't make the gaps uneven.
  { key: "sky-vase", label: "Sky Vase", node: <SkyVase />, px: { w: 637, h: 2267 } },
  { key: "arena-frame", label: "Arena Frame", node: <ArenaFrame />, px: { w: 833, h: 1178 } },
  { key: "journey", label: "Journey", node: <Journey />, px: { w: 723, h: 1186 } },
  { key: "stereophones", label: "Stereophones", node: <Stereophones />, px: { w: 1580, h: 1798 } },
];

// Desktop: the tallest object fills the viewport below the 80px header; the rest
// scale by pixel ratio. Mobile: each object is contained within the viewport box.
const DESKTOP_REF = "calc(100dvh - 80px)";
const MAX_PX_H = Math.max(...PROJECTS.map((p) => p.px.h));
const MOBILE_MAX_H = "68vh";
const MOBILE_MAX_W = "80vw";

export function ProjectStage() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Map vertical wheel/trackpad movement onto horizontal panning (desktop only;
  // on mobile the row is vertical so there's no horizontal overflow to pan).
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
      className="flex h-full flex-col items-center gap-10 overflow-y-auto py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-row md:items-end md:gap-16 md:overflow-x-auto md:overflow-y-hidden md:py-0"
      style={{ scrollSnapType: "x proximity" }}
    >
      {PROJECTS.map((p) => {
        // Mobile: contain within (MOBILE_MAX_W × MOBILE_MAX_H) preserving aspect.
        // Desktop: scale by pixel-height ratio against the reference height.
        const mobileH = `min(${MOBILE_MAX_H}, calc(${MOBILE_MAX_W} * ${p.px.h} / ${p.px.w}))`;
        const desktopH = `calc(${DESKTOP_REF} * ${(p.px.h / MAX_PX_H).toFixed(4)})`;
        return (
          <div
            key={p.key}
            className="flex shrink-0 justify-center"
            style={
              {
                "--obj-mobile-h": mobileH,
                "--obj-desktop-h": desktopH,
                scrollSnapAlign: "center",
              } as CSSProperties
            }
          >
            {p.node}
          </div>
        );
      })}
    </div>
  );
}
