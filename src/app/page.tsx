import { readdirSync } from "fs";
import { join } from "path";
import { ProjectStage } from "@/components/projects/project-stage";
import { SiteHeader } from "@/components/site-header";

// Read /public/music at build time so new mp3s are picked up on rebuild.
function getTracks(): string[] {
  try {
    return readdirSync(join(process.cwd(), "public", "music"))
      .filter((f) => f.toLowerCase().endsWith(".mp3"))
      .sort()
      .map((f) => `/music/${encodeURIComponent(f)}`);
  } catch {
    return [];
  }
}

export default function Home() {
  const tracks = getTracks();
  return (
    <div className="flex h-dvh flex-col">
      {/* On home, the header links to the about page */}
      <SiteHeader href="/about" />

      {/* Project stage fills the rest of the page */}
      <main className="min-h-0 flex-1 px-6 md:px-12">
        <ProjectStage tracks={tracks} />
      </main>
    </div>
  );
}
