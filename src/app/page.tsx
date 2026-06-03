import { ProjectStage } from "@/components/projects/project-stage";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col">
      {/* Full-width header — fixed height (h-20 = 80px) so the stage below can
          fill the exact remaining viewport height. */}
      <header className="flex h-20 items-center border-b border-black/10 px-6">
        <h1 className="w-full">
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
