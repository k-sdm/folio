import { projects } from "@/data/projects";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6">
      {/* Hero */}
      <section className="py-24 sm:py-32">
        <p className="mb-4 font-mono text-sm text-foreground/50">Hello, I&apos;m</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Kiran Scott
        </h1>
        <p className="mt-6 max-w-xl text-lg text-foreground/70">
          A one-line intro about who you are and what you do. Edit this in{" "}
          <code className="font-mono text-sm">src/app/page.tsx</code>.
        </p>
        <div className="mt-8 flex gap-4">
          <a
            href="/#projects"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            View work
          </a>
          <a
            href="/#contact"
            className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-foreground/5 dark:border-white/15"
          >
            Get in touch
          </a>
        </div>
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-20 border-t border-black/5 py-16 dark:border-white/10">
        <h2 className="text-sm font-mono uppercase tracking-widest text-foreground/50">
          About
        </h2>
        <div className="mt-6 space-y-4 text-foreground/80">
          <p>
            Write a couple of paragraphs about yourself here — your background,
            what you&apos;re working on, and what you care about.
          </p>
          <p>
            This is a starting skeleton. Replace the placeholder text and add
            sections as you go.
          </p>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="scroll-mt-20 border-t border-black/5 py-16 dark:border-white/10">
        <h2 className="text-sm font-mono uppercase tracking-widest text-foreground/50">
          Projects
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <a
              key={project.title}
              href={project.href ?? "#"}
              target={project.href ? "_blank" : undefined}
              rel={project.href ? "noopener noreferrer" : undefined}
              className="group rounded-xl border border-black/10 p-5 transition-colors hover:bg-foreground/[0.03] dark:border-white/15"
            >
              <h3 className="font-medium">{project.title}</h3>
              <p className="mt-2 text-sm text-foreground/70">
                {project.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-foreground/5 px-2.5 py-1 font-mono text-xs text-foreground/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-20 border-t border-black/5 py-16 dark:border-white/10">
        <h2 className="text-sm font-mono uppercase tracking-widest text-foreground/50">
          Contact
        </h2>
        <p className="mt-6 text-foreground/80">
          The best way to reach me is by email.
        </p>
        <a
          href="mailto:kiranscottdem@gmail.com"
          className="mt-4 inline-block font-medium underline underline-offset-4 hover:text-foreground/70"
        >
          kiranscottdem@gmail.com
        </a>
      </section>
    </div>
  );
}
