import { SiteHeader } from "@/components/site-header";

// Same styling/size as project body text: KH Teka Light, 100% black,
// 14px mobile / 28px desktop.
const TEXT = "text-[14px] md:text-[28px] font-light leading-snug text-black";

const LINKS = [
  { label: "ig", href: "https://www.instagram.com/kiran.sdm/" },
  { label: "x", href: "https://x.com/kiransdm" },
  { label: "are.na", href: "https://www.are.na/kiran-scott-de-martinville/" },
  { label: "contact", href: "mailto:kiran@k-sdm.com" },
];

export default function About() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header links back to home */}
      <SiteHeader href="/" />
      <main className="flex flex-1 flex-col px-6 md:px-12">
        {/* Bio, centred on the page */}
        <div className="flex flex-1 items-center justify-center">
          <p className={`${TEXT} mx-auto max-w-3xl text-center md:w-[60vw] md:max-w-none`}>
            Industrial designer and technologist working with startups, studios
            and companies to build new hardware products. I prototype physical
            interactions, design desirable objects and play with embedded
            intelligence, operating as a conduit between the creative and
            technical sides of your world.
          </p>
        </div>

        {/* Links, near the bottom centre */}
        <div
          className={`${TEXT} flex flex-wrap items-center justify-center gap-x-8 gap-y-1 pb-10 md:pb-16`}
        >
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("mailto:") ? undefined : "_blank"}
              rel={l.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
              className="underline underline-offset-4"
            >
              {l.label}
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
