import type { CSSProperties } from "react";

/**
 * Hover label shown inside a project object's bounding box: name top-left, year
 * top-right. KH Teka Light (the site font's 300 weight) at 60% black. Horizontal
 * padding keeps the name/year inset (more compact); vertical placement is set by
 * the caller via `className`/`style`.
 */
export function ObjectLabel({
  name,
  year,
  show,
  className = "",
  style,
}: {
  name: string;
  year: string;
  show: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      style={style}
      className={`pointer-events-none absolute inset-x-0 z-40 flex justify-between px-5 text-[28px] font-light leading-none text-black/60 transition-opacity duration-500 ease-in-out ${
        show ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      <span>{name}</span>
      <span>{year}</span>
    </div>
  );
}
