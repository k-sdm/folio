import { ProjectStage } from "@/components/projects/project-stage";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col px-6 pt-6">
      <h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/vectors/NAME.svg"
          alt="Kiran Scott de Martinville"
          className="h-auto w-full max-w-[520px]"
        />
      </h1>

      {/* Carousel pinned to the bottom of the page */}
      <div className="mt-auto pt-12">
        <ProjectStage />
      </div>
    </main>
  );
}
