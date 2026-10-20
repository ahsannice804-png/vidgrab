import Link from "next/link";
import { PageHeader, simpleMetadata } from "@/components/page-ui";
import JsonLd from "@/components/JsonLd";
import WhyChooseUs from "@/components/WhyChooseUs";
import { getSeo } from "@/lib/seo";
import { absoluteUrl, getBaseUrl, site } from "@/lib/site";
import { PLATFORM_LIST } from "@/lib/features";

export const metadata = {
  ...simpleMetadata(getSeo("about").title, getSeo("about").description),
  alternates: { canonical: "/about" },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${site.name}`,
    url: absoluteUrl("/about"),
    mainEntity: {
      "@type": "Organization",
      name: site.company,
      email: site.email,
      url: getBaseUrl(),
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: getBaseUrl() },
      { "@type": "ListItem", position: 2, name: "About", item: absoluteUrl("/about") },
    ],
  },
];

const h2 = "text-xl font-bold tracking-tight sm:text-2xl";
const body = "mt-4 space-y-4 text-[15px] leading-7 text-muted sm:text-base";
const link = "font-medium text-violet-600 underline underline-offset-2 hover:text-violet-700 dark:text-violet-400";

export default function AboutPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHeader
        title={`About ${site.name}`}
        subtitle={`What the site does, how it works, what it can't do, and who runs it.`}
      />

      <div className="mx-auto w-full max-w-3xl space-y-14 px-4 pb-6 pt-10 sm:px-6">
        <section aria-labelledby="what">
          <h2 id="what" className={h2}>What this site does</h2>
          <div className={body}>
            <p>
              {site.name} is a free web tool for saving videos from {PLATFORM_LIST} as
              files you can keep. You paste a link to a single video, the tool shows
              you the qualities that video actually has, from 360p up to 1080p HD,
              with real file sizes, and you download the one you want as an MP4. For
              YouTube and Facebook videos you can also save just the sound as an MP3.
            </p>
            <p>
              It runs in any modern browser on a phone or computer. There&rsquo;s no
              app to install, no browser extension and no account to create.
            </p>
          </div>
        </section>

        <section aria-labelledby="why">
          <h2 id="why" className={h2}>Why it exists</h2>
          <div className={body}>
            <p>
              Search for a video downloader and you&rsquo;ll find plenty of sites covered in
              fake &ldquo;Download&rdquo; buttons, pop-ups that pretend to be the tool, and
              quality lists that offer &ldquo;4K&rdquo; for a video that was uploaded at 480p.
              We wanted a downloader where the buttons on the page are the tool, and
              where the options and sizes shown are the real ones.
            </p>
            <p>
              We also write <Link href="/blog" className={link}>guides</Link> for the
              questions people actually run into: how to find a downloaded file on an
              iPhone, why a Facebook video says it needs a login, which quality is worth
              the storage. They&rsquo;re written to be useful on their own, whether or not
              you use the tool.
            </p>
          </div>
        </section>

        <section aria-labelledby="how">
          <h2 id="how" className={h2}>How it works</h2>
          <div className={body}>
            <p>
              When you paste a link, our server asks the platform for the list of
              versions it has stored for that video, the same list its own player
              chooses from. Under the hood we use{" "}
              <a href="https://github.com/yt-dlp/yt-dlp" className={link} target="_blank" rel="noopener noreferrer">
                yt-dlp
              </a>
              , a widely used open-source download engine, and{" "}
              <a href="https://ffmpeg.org/" className={link} target="_blank" rel="noopener noreferrer">
                FFmpeg
              </a>{" "}
              for media processing.
            </p>
            <p>
              YouTube stores its higher qualities as separate picture and sound
              streams, so for those we fetch both and merge them into one MP4 on the
              server. MP3 downloads are converted on the server too. The finished file
              is kept in temporary storage only long enough for your browser to fetch
              it, at most about 35 minutes, and is then deleted automatically. We
              don&rsquo;t build a library of downloaded videos. Requests are rate-limited
              per visitor so the shared server stays usable for everyone. The longer
              technical explanation is in{" "}
              <Link href="/blog/how-video-downloaders-work" className={link}>
                how video downloaders work
              </Link>
              .
            </p>
          </div>
        </section>

        <section aria-labelledby="limits">
          <h2 id="limits" className={h2}>Honest limits</h2>
          <div className={body}>
            <p>We&rsquo;d rather tell you up front what the tool can&rsquo;t do:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                It only fetches videos that a logged-out visitor can watch. Private
                videos, friends-only Facebook posts, private Instagram accounts, private
                groups, and members-only or age-restricted YouTube videos aren&rsquo;t
                available, because we never sign in to anyone&rsquo;s account.
              </li>
              <li>Some videos are blocked in the country our server runs in.</li>
              <li>Downloads go up to 1080p. There&rsquo;s no 4K option.</li>
              <li>
                It works one video at a time. Playlists, channels, Stories and
                Highlights aren&rsquo;t supported.
              </li>
              <li>
                Instagram videos are saved as MP4 only; MP3 is available for YouTube and
                Facebook.
              </li>
              <li>
                Platforms change how they deliver video from time to time. When that
                happens, some downloads can fail until the engine is updated.
              </li>
            </ul>
            <p>
              The site is free to use and is supported by advertising. How ads and
              analytics use cookies is explained in our{" "}
              <Link href="/privacy-policy" className={link}>Privacy Policy</Link>.
            </p>
          </div>
        </section>

        <section aria-labelledby="rights">
          <h2 id="rights" className={h2}>Respecting creators</h2>
          <div className={body}>
            <p>
              A download tool makes copying easy; it doesn&rsquo;t change who owns a video.
              Please use {site.name} for your own videos, videos the creator has said you
              may download, and openly licensed or public-domain material. Our{" "}
              <Link href="/terms-of-service" className={link}>Terms of Service</Link>{" "}
              explain how rights holders can contact us, and{" "}
              <Link href="/blog/is-downloading-videos-legal" className={link}>
                is it legal to download videos?
              </Link>{" "}
              gives a balanced overview of the rules.
            </p>
          </div>
        </section>

        <section aria-labelledby="who" className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 id="who" className={h2}>Who runs it</h2>
          <div className={body}>
            <p>
              {site.name} is built and operated by{" "}
              <span className="font-medium text-foreground">{site.company}</span>, a
              software company that builds practical web tools and provides software
              development services. The guides on this site are written and maintained
              by the same team.
            </p>
            <p>
              For support, bug reports, feedback, copyright notices or business
              enquiries, email{" "}
              <a href={`mailto:${site.email}`} className={link}>
                {site.email}
              </a>
              .
            </p>
          </div>
        </section>
      </div>

      <WhyChooseUs />

      <section className="mx-auto w-full max-w-3xl px-4 pb-20 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-lg font-bold">Found a problem? Have an idea?</h2>
          <p className="mt-2 text-sm text-muted">
            We improve this tool based on what users tell us. If a link fails, send it
            to us with the message you saw.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-600/25 transition-colors hover:brightness-110"
            >
              Contact us
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-card"
            >
              Try the downloader
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
