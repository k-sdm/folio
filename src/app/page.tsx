import { ProjectStage } from "@/components/projects/project-stage";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col">
      {/* On home, the header links to the about page */}
      <SiteHeader href="/about" />

      {/* Project stage fills the rest of the page */}
      <main className="min-h-0 flex-1 px-6 md:px-12">
        <ProjectStage />
      </main>
    </div>
  );
}
