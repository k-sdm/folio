import type { ReactNode } from "react";
import { SkyVase } from "./sky-vase";
import { ArenaFrame } from "./arena-frame";

type Project = {
  key: string;
  label: string;
  node: ReactNode;
  /** Height relative to the stage, so projects scale against each other. */
  scale: number;
};

// Left → right. Each project is a self-contained object; `scale` sets its size
// relative to the others. This is the seed for a future horizontal-scroll
// gallery — add projects here and they slot into the row.
const PROJECTS: Project[] = [
  { key: "sky-vase", label: "Sky Vase", node: <SkyVase />, scale: 1 },
  { key: "arena-frame", label: "Arena Frame", node: <ArenaFrame />, scale: 0.95 },
];

export function ProjectStage() {
  return (
    <div
      className="flex items-end gap-12 overflow-x-auto pb-2"
      style={{ height: "min(74vh, 660px)" }}
    >
      {PROJECTS.map((p) => (
        <div
          key={p.key}
          className="flex h-full shrink-0 flex-col items-center justify-end"
        >
          <div className="flex min-h-0 flex-1 items-end">
            <div style={{ height: `${p.scale * 100}%` }}>{p.node}</div>
          </div>
          <span className="mt-3 font-mono text-xs uppercase tracking-widest text-foreground/50">
            {p.label}
          </span>
        </div>
      ))}
    </div>
  );
}
