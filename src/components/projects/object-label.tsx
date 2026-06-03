import type { CSSProperties } from "react";

/**
 * Hover label shown above a project object: name top-left, year top-right.
 * KH Teka Light at 60% black (14px mobile, 21px desktop). Desktop: sized to the
 * object's bounding box. Mobile: spans the page content width so it hugs the
 * screen edges instead of being constrained to the (narrow) object.
 */
export function ObjectLabel({
  name,
  year,
  show,
  className = "",
  style,
  padX = "md:px-5",
}: {
  name: string;
  year: string;
  show: boolean;
  className?: string;
  style?: CSSProperties;
  /** Desktop horizontal padding (Tailwind class). */
  padX?: string;
}) {
  return (
    <div
      aria-hidden
      style={style}
      className={`pointer-events-none absolute z-40 flex justify-between text-[14px] font-light leading-none text-black/60 transition-opacity duration-500 ease-in-out left-1/2 w-[calc(100vw-3rem)] -translate-x-1/2 px-0 md:left-0 md:right-0 md:w-auto md:translate-x-0 md:text-[21px] ${padX} ${
        show ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      <span>{name}</span>
      <span>{year}</span>
    </div>
  );
}
