import { SiteHeader } from "@/components/site-header";

/**
 * Placeholder project page shell. Keeps the header consistent (links back to
 * home); body content per project is TBD.
 */
export function ProjectPage({ name, year }: { name: string; year: string }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader href="/" />
      <main className="flex-1 px-6 py-10">
        <h2 className="text-2xl font-medium tracking-tight">{name}</h2>
        <p className="mt-1 text-foreground/50">{year}</p>
      </main>
    </div>
  );
}
