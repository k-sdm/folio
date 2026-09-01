/* eslint-disable @next/next/no-img-element */
import { SiteHeader } from "@/components/site-header";
import caseStudies from "@/data/case-studies.json";

type Size = "large" | "small" | "portrait";
type Media = { mp4?: string; webm?: string; poster?: string; image?: string; size?: Size };
type Run = { t: string; href?: string };
type Block =
  | { type: "text"; text: string; runs?: Run[] }
  | { type: "button"; text: string; href: string }
  | { type: "image"; src: string; size: "large" | "small" }
  | { type: "grid"; images: string[] }
  | ({ type: "video"; ratio?: string } & Media);

// Responsive display width. "portrait" is 60% of the large width — for vertical
// videos that would otherwise be too big.
const mediaWidth = (size?: Size) =>
  size === "portrait"
    ? "w-[48vw] md:w-[39vw]"
    : size === "small"
      ? "w-[80vw] md:w-[40vw]"
      : "w-[80vw] md:w-[65vw]";
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

// Centred KH Teka Light, 100% black. Mobile 14px, desktop 28px.
const TEXT_CLASS =
  "mx-auto max-w-3xl text-center text-[14px] md:text-[28px] font-light leading-snug text-black";

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
              className={`mx-auto block ${mediaWidth(data.hero.size)}`}
            />
          ) : (
            <Video
              media={data.hero}
              className={`mx-auto block ${mediaWidth(data.hero.size)}`}
            />
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
                <p key={i} className={`${TEXT_CLASS} whitespace-pre-line`}>
                  <RichText text={b.text} runs={b.runs} />
                </p>
              );
            // Pill link (black stroke, white fill) that fades to 40% grey on hover.
            if (b.type === "button")
              return (
                <a
                  key={i}
                  href={b.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-full border border-black bg-white px-5 pt-[0.55em] pb-[0.35em] text-[14px] font-light leading-none text-black transition-colors duration-200 hover:border-black/40 hover:text-black/40 md:px-8 md:text-[28px]"
                >
                  {b.text}
                </a>
              );
            if (b.type === "image")
              return (
                <img
                  key={i}
                  src={b.src}
                  alt=""
                  loading="lazy"
                  className={`block ${mediaWidth(b.size)}`}
                />
              );
            if (b.type === "grid") return <Masonry key={i} images={b.images} />;
            const widthClass = mediaWidth(b.size);
            // Optional fixed-ratio box: the box stretches to the width and the
            // whole video is fitted inside it (no cropping; letterboxed if its
            // native ratio differs). Used to frame the orbit clip as 16:9.
            if (b.ratio)
              return (
                <div
                  key={i}
                  className={`relative ${widthClass}`}
                  style={{ aspectRatio: b.ratio.replace("/", " / ") }}
                >
                  <Video media={b} className="absolute inset-0 h-full w-full object-contain" />
                </div>
              );
            return <Video key={i} media={b} className={`block ${widthClass}`} />;
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
