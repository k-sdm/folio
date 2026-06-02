import { ArenaFrame } from "@/components/arena-frame";

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        KIRAN SCOTT DE MARTINVILLE
      </h1>

      <section className="mt-12">
        <h2 className="mb-4 text-sm font-mono uppercase tracking-widest text-foreground/50">
          Arena Frame
        </h2>
        <ArenaFrame />
      </section>
    </main>
  );
}
