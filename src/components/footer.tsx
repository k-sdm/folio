export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-black/5 dark:border-white/10">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-8 text-sm text-foreground/60">
        <p>© {year} Kiran Scott</p>
        <a
          href="https://github.com/k-sdm"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
