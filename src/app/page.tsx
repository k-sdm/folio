import { ProjectStage } from "@/components/projects/project-stage";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col">
      {/* Full-width header */}
      <header className="border-b border-black/10 px-6 py-6">
        <h1>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/vectors/NAME.svg"
            alt="Kiran Scott de Martinville"
            className="block h-auto w-full max-w-[520px]"
          />
        </h1>
      </header>

      {/* Project stage fills the rest of the page */}
      <main className="min-h-0 flex-1 px-6">
        <ProjectStage />
      </main>
    </div>
  );
}
