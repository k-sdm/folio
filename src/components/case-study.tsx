/* eslint-disable @next/next/no-img-element */
import { SiteHeader } from "@/components/site-header";
import caseStudies from "@/data/case-studies.json";

type Media = { mp4?: string; webm?: string; poster?: string; image?: string };
type Run = { t: string; href?: string };
type Block =
  | { type: "text"; text: string; runs?: Run[] }
  | { type: "image"; src: string; size: "large" | "small" }
  | { type: "grid"; images: string[] }
  | ({ type: "video"; size?: "large" | "small" } & Media);
type ProjectData = {
  name: string;
  credit: string;
  creditRuns?: Run[];
  hero: Media | null;
  blocks: Block[];
  process: string[];
};

// Render plain text, or rich runs with inline links (underlined, new tab).
function RichText({ text, runs }: { text: string; runs?: Run[] }) {
  if (!runs) return <>{text}</>;
  return (
    <>
      {runs.map((r, i) =>
        r.href ? (
          <a
            key={i}
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            {r.t}
          </a>
        ) : (
          <span key={i}>{r.t}</span>
        ),
      )}
    </>
  );
}

const DATA = caseStudies as unknown as Record<string, ProjectData>;

function Video({ media, className }: { media: Media; className?: string }) {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      poster={media.poster}
      className={className}
    >
      {media.webm && <source src={media.webm} type="video/webm" />}
      {media.mp4 && <source src={media.mp4} type="video/mp4" />}
    </video>
  );
}

// Centred KH Teka Light, 100% black. Mobile 14px, desktop 42px.
const TEXT_CLASS =
  "mx-auto max-w-3xl text-center text-[14px] md:text-[42px] font-light leading-snug text-black";

// Masonry grid: 80vw mobile / 65vw desktop, 2 → 3 columns.
function Masonry({ images }: { images: string[] }) {
  return (
    <div className="mx-auto w-[80vw] columns-2 gap-3 [&>img]:mb-3 md:w-[65vw] md:columns-3 md:gap-6 md:[&>img]:mb-6">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          loading="lazy"
          className="block w-full break-inside-avoid"
        />
      ))}
    </div>
  );
}

export function CaseStudy({ id }: { id: keyof typeof caseStudies }) {
  const data = DATA[id];
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader href="/" />
      <main className="px-6 pb-32 md:px-12 md:pb-64">
        {data.hero &&
          (data.hero.image ? (
            <img
              src={data.hero.image}
              alt=""
              className="mx-auto block w-[80vw] md:w-[65vw]"
            />
          ) : (
            <Video media={data.hero} className="mx-auto block w-[80vw] md:w-[65vw]" />
          ))}

        {(data.credit || data.creditRuns) && (
          <p className={`${TEXT_CLASS} mt-12 md:mt-24`}>
            <RichText text={data.credit} runs={data.creditRuns} />
          </p>
        )}

        <div className="mt-16 flex flex-col items-center gap-12 md:mt-32 md:gap-24">
          {data.blocks.map((b, i) => {
            if (b.type === "text")
              return (
                <p key={i} className={TEXT_CLASS}>
                  <RichText text={b.text} runs={b.runs} />
                </p>
              );
            if (b.type === "image")
              return (
                <img
                  key={i}
                  src={b.src}
                  alt=""
                  loading="lazy"
                  className={`block w-[80vw] ${b.size === "small" ? "md:w-[40vw]" : "md:w-[65vw]"}`}
                />
              );
            if (b.type === "grid") return <Masonry key={i} images={b.images} />;
            return (
              <Video
                key={i}
                media={b}
                className={`block w-[80vw] ${b.size === "small" ? "md:w-[40vw]" : "md:w-[65vw]"}`}
              />
            );
          })}
        </div>

        {data.process.length > 0 && (
          <div className="mt-20 md:mt-40">
            <Masonry images={data.process} />
          </div>
        )}
      </main>
    </div>
  );
}
