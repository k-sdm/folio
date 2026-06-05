"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SkyVase } from "./sky-vase";
import { ArenaFrame } from "./arena-frame";
import { Journey } from "./journey";
import { Stereophones } from "./stereophones";

type ObjectProps = { name: string; year: string };

type Project = {
  key: string;
  name: string;
  year: string;
  Component: (props: ObjectProps) => React.ReactNode;
  /** Click target. external → new tab; otherwise an in-app route. Omit = no link. */
  href?: string;
  external?: boolean;
  /** Source image pixel size — objects are rendered to scale against this. */
  px: { w: number; h: number };
};

// Left → right (desktop) / top → bottom (mobile). The exported assets are
// already to scale with each other, so we size every object from its real pixel
// dimensions. Add a project here and it slots into the row.
const PROJECTS: Project[] = [
  // Vase footprint uses its reference rectangle (637 wide), not the full image
  // width, so the transparent side padding doesn't make the gaps uneven.
  // Sky Vase is unlinked for now (skyva.se not released yet).
  { key: "sky-vase", name: "Sky Vase", year: "2026", Component: SkyVase, px: { w: 637, h: 2267 } },
  { key: "arena-frame", name: "Arena Frame", year: "2026", Component: ArenaFrame, href: "/arena-frame", px: { w: 833, h: 1178 } },
  { key: "journey", name: "Journey", year: "2024", Component: Journey, href: "/journey", px: { w: 723, h: 1186 } },
  // Stereophones handles its own navigation (knob drag vs. click), so no link.
  { key: "stereophones", name: "Stereophones", year: "2023", Component: Stereophones, px: { w: 1580, h: 1798 } },
];

// Desktop: the tallest object fills the viewport below the 96px header.
// Mobile: stereophones spans the full content width (page has px-6 = 48px) and
// every object scales from that one factor, so relative sizes are preserved.
const DESKTOP_REF = "calc(100dvh - 96px)";
const MAX_PX_H = Math.max(...PROJECTS.map((p) => p.px.h));
const MOBILE_BASELINE_PX_W =
  PROJECTS.find((p) => p.key === "stereophones")?.px.w ??
  Math.max(...PROJECTS.map((p) => p.px.w));

export function ProjectStage() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fade each object in sequentially on first load. Besides looking nice, it
  // hides the Sky Vase gradient "jump" when it recalculates from the visitor's
  // detected date/location after mount.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Map vertical wheel/trackpad movement onto horizontal panning. Uses a native
  // non-passive listener so preventDefault() works (React's onWheel is passive,
  // so it can't claim the gesture). No-ops when there's no horizontal overflow
  // (mobile vertical layout / wide desktop), leaving native scrolling intact.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={scrollRef}
      className="flex h-full flex-col items-center gap-10 overflow-y-auto pt-2 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-row md:items-end md:gap-16 md:overflow-x-auto md:overflow-y-hidden md:py-0 md:pl-[calc((100dvh_-_96px)_*_134_/_2267)]"
      style={{ scrollSnapType: "x proximity" }}
    >
      {PROJECTS.map((p, idx) => {
        // Mobile: scale by pixel-width ratio against stereophones-at-full-width.
        // Desktop: scale by pixel-height ratio against the reference height.
        const mobileW = `calc((100vw - 48px) * ${p.px.w} / ${MOBILE_BASELINE_PX_W})`;
        const desktopH = `calc(${DESKTOP_REF} * ${(p.px.h / MAX_PX_H).toFixed(4)})`;
        const node = <p.Component name={p.name} year={p.year} />;
        return (
          <div
            key={p.key}
            className={`flex shrink-0 justify-center transition-opacity duration-500 ease-out ${
              p.href ? "cursor-pointer" : ""
            } ${shown ? "opacity-100" : "opacity-0"}`}
            style={
              {
                "--obj-mobile-w": mobileW,
                "--obj-desktop-h": desktopH,
                scrollSnapAlign: "center",
                transitionDelay: shown ? `${idx * 150}ms` : "0ms",
              } as CSSProperties
            }
          >
            {!p.href ? (
              node
            ) : p.external ? (
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="contents"
              >
                {node}
              </a>
            ) : (
              <Link href={p.href} className="contents">
                {node}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
