import type { CSSProperties } from "react";
import { ProjectStage } from "@/components/projects/project-stage";

// Both vectors share one scale (relative sizes preserved): everything derives
// from --name-h (the NAME wordmark's rendered height). NAME is 2215×114, logo
// is 134×146. The scale auto-fits so NAME + logo fill the width on mobile and
// cap out on desktop (NAME ≈ 524px wide at 27px tall).
const HEADER_STYLE = {
  "--name-h": "min(27px, calc((100vw - 72px) / 21))",
} as CSSProperties;

export default function Home() {
  return (
    <div className="flex h-dvh flex-col">
      {/* Full-width header — fixed height (h-20 = 80px) so the stage below fills
          the exact remaining viewport height. */}
      <header className="flex h-20 items-center px-6">
        <div
          className="flex w-full items-start justify-between gap-3"
          style={HEADER_STYLE}
        >
          <h1 className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/vectors/NAME.svg"
              alt="Kiran Scott de Martinville"
              className="block w-auto"
              style={{ height: "var(--name-h)" }}
            />
          </h1>
          {/* Logo: same scale as the text; nudged down 7 relative units. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/vectors/Logo%20-%20Colour.svg"
            alt=""
            aria-hidden
            className="block w-auto shrink-0"
            style={{
              height: "calc(var(--name-h) * 146 / 114)",
              marginTop: "calc(var(--name-h) * -7 / 114)",
            }}
          />
        </div>
      </header>

      {/* Project stage fills the rest of the page */}
      <main className="min-h-0 flex-1 px-6">
        <ProjectStage />
      </main>
    </div>
  );
}
