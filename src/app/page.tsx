import { ProjectStage } from "@/components/projects/project-stage";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col px-6 pt-6 pb-10">
      <h1 className="text-2xl font-semibold tracking-tight">
        KIRAN SCOTT DE MARTINVILLE
      </h1>

      {/* Carousel pinned to the bottom of the page */}
      <div className="mt-auto pt-12">
        <ProjectStage />
      </div>
    </main>
  );
}
