import { SiteHeader } from "@/components/site-header";

export default function About() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header links back to home */}
      <SiteHeader href="/" />
      <main className="flex-1 px-6 py-10">
        <div className="max-w-2xl space-y-4 text-foreground/80">
          <h2 className="text-2xl font-medium tracking-tight text-foreground">
            About
          </h2>
          <p>Placeholder about copy — edit in src/app/about/page.tsx.</p>
        </div>
      </main>
    </div>
  );
}
