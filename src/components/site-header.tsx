import Link from "next/link";

/**
 * Full-width site header: NAME wordmark (left) + logo (right). Both link to
 * `href` — home links to /about, every other page links back to /.
 *
 * Both vectors share one scale derived from --name-h (NAME 2215×114, logo
 * 134×146). It auto-fits to the available width: mobile fills the row; desktop
 * caps larger (40.5px ≈ +50%) and accounts for the wider md padding.
 */
export function SiteHeader({ href }: { href: string }) {
  const label = href === "/" ? "Home" : "About";
  return (
    <header className="sticky top-0 z-50 flex items-start bg-background px-[9px] py-[9px] md:h-24 md:px-6 md:pt-6 md:pb-0">
      <div className="flex w-full items-start justify-between gap-[9px] md:gap-3 [--name-h:calc((100vw_-_27px)_/_20.61)] md:[--name-h:min(40.5px,calc((100vw_-_108px)_/_21))]">
        <h1 className="shrink-0">
          <Link href={href} className="contents">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/vectors/NAME.svg"
              alt="Kiran Scott de Martinville"
              className="block w-auto"
              style={{ height: "var(--name-h)" }}
            />
          </Link>
        </h1>
        <Link
          href={href}
          aria-label={label}
          className="group block shrink-0"
          style={{ marginTop: "calc(var(--name-h) * -12 / 114)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/vectors/Logo%20-%20Colour.svg"
            alt=""
            aria-hidden
            className="block w-auto md:group-hover:[animation:logo-spin_0.7s_ease-in-out]"
            style={{ height: "calc(var(--name-h) * 146 / 114)" }}
          />
        </Link>
      </div>
    </header>
  );
}
