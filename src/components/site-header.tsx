import Link from "next/link";
import type { CSSProperties } from "react";

// Both vectors share one scale (NAME 2215×114, logo 134×146) derived from
// --name-h; auto-fits so they fill the width on mobile and cap on desktop.
const HEADER_STYLE = {
  "--name-h": "min(27px, calc((100vw - 72px) / 21))",
} as CSSProperties;

/**
 * Full-width site header: NAME wordmark (left) + logo (right). Both link to
 * `href` — home links to /about, every other page links back to /.
 */
export function SiteHeader({ href }: { href: string }) {
  const label = href === "/" ? "Home" : "About";
  return (
    <header className="sticky top-0 z-50 flex h-20 items-center bg-background px-6">
      <div
        className="flex w-full items-start justify-between gap-3"
        style={HEADER_STYLE}
      >
        <h1 className="shrink-0">
          <Link href={href} className="contents">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/vectors/NAME.svg"
              alt="Kiran Scott de Martinville"
              className="block w-auto"
              style={{ height: "var(--name-h)" }}
            />
          </Link>
        </h1>
        <Link href={href} aria-label={label} className="contents">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/vectors/Logo%20-%20Colour.svg"
            alt=""
            aria-hidden
            className="block w-auto shrink-0"
            style={{
              height: "calc(var(--name-h) * 146 / 114)",
              marginTop: "calc(var(--name-h) * -12 / 114)",
            }}
          />
        </Link>
      </div>
    </header>
  );
}
