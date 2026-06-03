/* eslint-disable @next/next/no-img-element */
import { SiteHeader } from "@/components/site-header";
import caseStudies from "@/data/case-studies.json";

type Media = { mp4?: string; webm?: string; poster?: string };
type Block =
  | { type: "text"; text: string }
  | { type: "image"; src: string }
  | ({ type: "video" } & Media);
type ProjectData = {
  name: string;
  credit: string;
  hero: Media | null;
  blocks: Block[];
  process: string[];
};

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

// Centred KH Teka Light, 28px, 100% black — same size as the object labels.
const TEXT_CLASS =
  "mx-auto max-w-2xl text-center text-[28px] font-light leading-snug text-black";

export function CaseStudy({ id }: { id: keyof typeof caseStudies }) {
  const data = DATA[id];
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader href="/" />
      <main className="px-6 pb-32">
        {data.hero && (
          <Video media={data.hero} className="mx-auto block w-full max-w-5xl" />
        )}

        <p className={`${TEXT_CLASS} mt-12`}>{data.credit}</p>

        <div className="mx-auto mt-16 flex max-w-5xl flex-col items-stretch gap-12">
          {data.blocks.map((b, i) => {
            if (b.type === "text") return <p key={i} className={TEXT_CLASS}>{b.text}</p>;
            if (b.type === "image")
              return (
                <img
                  key={i}
                  src={b.src}
                  alt=""
                  loading="lazy"
                  className="mx-auto block w-full max-w-4xl"
                />
              );
            return <Video key={i} media={b} className="mx-auto block w-full max-w-4xl" />;
          })}
        </div>

        {data.process.length > 0 && (
          <div className="mx-auto mt-20 max-w-5xl columns-2 gap-3 md:columns-3 [&>img]:mb-3">
            {data.process.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                loading="lazy"
                className="block w-full break-inside-avoid"
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
