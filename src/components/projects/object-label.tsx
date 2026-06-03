/**
 * Hover label shown inside a project object's bounding box: name top-left, year
 * top-right. KH Teka Light (the site font's 300 weight) at 60% black.
 */
export function ObjectLabel({
  name,
  year,
  show,
}: {
  name: string;
  year: string;
  show: boolean;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-0 z-40 flex justify-between text-sm font-light text-black/60 transition-opacity duration-500 ease-in-out ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <span>{name}</span>
      <span>{year}</span>
    </div>
  );
}
