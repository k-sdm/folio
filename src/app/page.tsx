import { ProjectStage } from "@/components/projects/project-stage";

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        KIRAN SCOTT DE MARTINVILLE
      </h1>

      <section className="mt-12">
        <ProjectStage />
      </section>
    </main>
  );
}
