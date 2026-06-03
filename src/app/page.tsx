import { ProjectStage } from "@/components/projects/project-stage";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col px-6 pt-6">
      <h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/vectors/NAME.svg"
          alt="Kiran Scott de Martinville"
          className="block h-auto w-full max-w-[520px]"
        />
      </h1>

      {/* Fill the rest of the viewport so the tallest object (the vase) reaches
          up to the wordmark; the carousel sits on the bottom. */}
      <div className="min-h-0 flex-1">
        <ProjectStage />
      </div>
    </main>
  );
}
