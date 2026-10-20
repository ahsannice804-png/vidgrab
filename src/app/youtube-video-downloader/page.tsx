import type { Metadata } from "next";
import Link from "next/link";
import type { WithContext, WebApplication, FAQPage, BreadcrumbList } from "@/lib/schema";
import DownloadTool from "@/components/DownloadTool";
import HowItWorks from "@/components/HowItWorks";
import FAQSection from "@/components/FAQSection";
import TrustBadges from "@/components/TrustBadges";
import JsonLd from "@/components/JsonLd";
import AdBanner300x250 from "@/components/ads/AdBanner300x250";
import ToolGuide from "@/components/ToolGuide";
import RelatedGuides from "@/components/blog/RelatedGuides";
import { getSeo } from "@/lib/seo";
import { absoluteUrl, getBaseUrl, site } from "@/lib/site";

export const metadata: Metadata = {
  title: getSeo("youtube").title,
  description: getSeo("youtube").description,
  alternates: { canonical: "/youtube-video-downloader" },
  openGraph: {
    title: getSeo("youtube").title,
    description: getSeo("youtube").description,
    url: absoluteUrl("/youtube-video-downloader"),
  },
};

const seo = getSeo("youtube");

const YT_FAQ = [
  {
    question: "Which YouTube video qualities can I download?",
    answer:
      "You can choose between 360p, 480p, 720p HD and 1080p HD — but only when that quality actually exists for the video. We never show a quality the video can\u2019t deliver.",
  },
  {
    question: "Does this work for YouTube Shorts?",
    answer:
      "Yes. Shorts are ordinary videos, so paste the link of any Short and download it just like a regular video — the highest available quality in that range is offered.",
  },
  {
    question: "Why can\u2019t I download age-restricted or private videos?",
    answer:
      "Private videos belong to the uploader only, and age-restricted videos require a signed-in account. To respect owners\u2019 and YouTube\u2019s rules, we don\u2019t download those.",
  },
  {
    question: "How long does a 1080p download take?",
    answer:
      "Preparation usually takes a few seconds for most videos and a bit longer for long or high-bitrate ones. While it works, you\u2019ll see live progress instead of a frozen page.",
  },
  {
    question: "Can I download music videos as MP4?",
    answer:
      "Yes — every video downloads as MP4 with its audio, so music videos play on any device, TV or media player without extra conversion.",
  },
  {
    question: "Can I save only the audio as MP3?",
    answer:
      "Yes. Switch to the Audio tab after pasting the link. Standard (128 kbps) is always offered; High (192 kbps) and Best (320 kbps) appear only when the video\u2019s own audio can genuinely support them.",
  },
  {
    question: "Can I paste a YouTube playlist link?",
    answer:
      "Playlist links aren\u2019t accepted, and a watch link that includes a playlist downloads only that one video. Paste each video\u2019s link separately.",
  },
  {
    question: "Do you keep a copy of the videos I download?",
    answer:
      "No. Files are prepared in temporary storage so your browser can fetch them, then deleted automatically, after about half an hour at most.",
  },
];

const jsonLd: Array<WithContext<WebApplication | FAQPage | BreadcrumbList>> = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: site.name,
    url: getBaseUrl(),
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    description: seo.description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: site.name },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: YT_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: getBaseUrl() },
      {
        "@type": "ListItem",
        position: 2,
        name: "YouTube Video Downloader",
        item: absoluteUrl("/youtube-video-downloader"),
      },
    ],
  },
];

export default function YoutubePage() {
  return (
    <>
      <JsonLd data={jsonLd as unknown as Record<string, unknown>[]} />

      <section className="relative overflow-hidden" aria-labelledby="yt-hero">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute -top-32 left-1/2 h-[380px] w-[680px] -translate-x-1/2 rounded-full bg-gradient-to-br from-red-500/15 to-violet-500/10 blur-3xl" />
        </div>

        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-12 pt-12 text-center sm:px-6 sm:pb-14 sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/5 px-4 py-1.5 text-xs font-medium text-red-600 dark:text-red-300">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
              <path d="M23 7.2s-.23-1.63-.94-2.35c-.9-.94-1.9-.9-2.36-.95C16.6 3.7 12 3.7 12 3.7h-.02c-6.02 0-9.7.35-9.7 1.2 0 0 0 0 0 0 0 .85-.26 2.3-.26 2.3S1.76 9.13 1.76 11.05v1.9C1.76 14.87 2 16.8 2 16.8s.24 1.45.94 2.35c.9.94 2.12.92 2.66 1.02 1.94.19 6.4.23 6.4.23s4.6.04 7.66-.24c.46-.05 1.46-.09 2.36-1.03.7-.9.94-2.32.94-2.32s.24-1.93.24-3.85v-1.9c0-1.92-.24-3.84-.24-3.84zm-13.6 6.7V9.02l5.66 3.28-5.66 3.6z" />
            </svg>
            YouTube Video Downloader
          </span>

          <h1 id="yt-hero" className="mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl">
            {seo.h1 ?? "YouTube Video Downloader"}
          </h1>
          <p className="mt-4 max-w-xl text-balance text-base leading-7 text-muted sm:text-lg">
            {seo.subtitle ??
              "Paste a YouTube link and download any video in the quality you want — from 360p up to 1080p HD."}
          </p>

          <div className="mt-8 w-full max-w-2xl">
            <DownloadTool platform="youtube" />
          </div>
          <div className="mt-5">
            <TrustBadges />
          </div>
        </div>
      </section>

      {/* Guide content */}
      <ToolGuide labelledBy="yt-content">
        <h2 id="yt-content">How the YouTube downloader works</h2>
        <p>
          When you paste a link, we ask YouTube for the list of versions it has stored
          for that video, the same list its own player chooses from. Every quality
          button you see comes from that list, with a file size taken from YouTube&rsquo;s
          own data where it&rsquo;s available. Nothing is upscaled: if a video was uploaded
          at 720p, you won&rsquo;t see a 1080p button for it.
        </p>
        <p>
          YouTube keeps its higher-quality picture and sound as two separate streams.
          When you pick 720p or 1080p, our server fetches both and joins them into one
          MP4 with FFmpeg, without re-compressing the picture, so you get a single file
          that plays on any phone, laptop or TV. At 360p YouTube usually has a ready-made
          file with sound included, which is why low quality starts almost instantly.
          If you want the background to the merge step, our guide on{" "}
          <Link href="/blog/how-video-downloaders-work">how video downloaders work</Link>{" "}
          explains it in plain terms.
        </p>

        <h2>Supported YouTube links</h2>
        <p>Any link to a single video works, including the ones the mobile app copies:</p>
        <ul>
          <li><code>youtube.com/watch?v=&hellip;</code> from a desktop browser</li>
          <li><code>youtu.be/&hellip;</code> short links, with or without <code>?si=</code> on the end</li>
          <li><code>youtube.com/shorts/&hellip;</code> for Shorts</li>
          <li><code>m.youtube.com</code> and <code>music.youtube.com</code> links</li>
          <li><code>youtube.com/live/&hellip;</code> and <code>/embed/&hellip;</code> links, once the video is a finished upload</li>
        </ul>
        <p>
          Channel pages and playlist links don&rsquo;t point at one video, so they aren&rsquo;t
          accepted. A <code>watch?v=&hellip;&amp;list=&hellip;</code> link downloads only the video it
          names. To save a series, work through it one link at a time, as described in{" "}
          <Link href="/blog/youtube-playlist-download-guide">our playlist guide</Link>.
        </p>

        <h2>Which quality should you choose?</h2>
        <p>
          The options run from 360p up to 1080p HD, depending on what the video has.
          For a phone, 480p or 720p looks sharp and saves space. For a laptop, 720p is
          comfortable, and 1080p is worth it for tutorials with small on-screen text.
          For a TV, take 1080p. Long talks and podcasts rarely need more than 480p.
          Each step up roughly doubles the file size, so the size shown on the button
          is worth a glance before a long download. There&rsquo;s a fuller comparison in{" "}
          <Link href="/blog/video-quality-360p-720p-1080p">360p vs 720p vs 1080p</Link>.
        </p>
        <h3>MP3 audio</h3>
        <p>
          Switch to the <strong>Audio</strong> tab to save the sound as an MP3. You&rsquo;ll see
          Standard (128 kbps), High (192 kbps) and Best (320 kbps), but only the tiers
          the video&rsquo;s own audio can genuinely support. Most YouTube audio sits around
          128 to 160 kbps, so a 320 kbps option only appears when it would actually mean
          something. 128 kbps is plenty for speech; 192 kbps is a good choice for music.
        </p>

        <h2>Troubleshooting</h2>
        <ul>
          <li>
            <strong>&ldquo;Private&rdquo; or &ldquo;requires login&rdquo;:</strong> the uploader limited who can
            watch it. We don&rsquo;t sign in to accounts, so these can&rsquo;t be downloaded.
          </li>
          <li>
            <strong>&ldquo;Age-restricted or region-locked&rdquo;:</strong> YouTube only serves the video to
            signed-in adults, or only in certain countries.
          </li>
          <li>
            <strong>&ldquo;Unavailable&rdquo;:</strong> the video was removed, or a livestream replay is
            still processing. Try again once it plays like a normal video.
          </li>
          <li>
            <strong>Slow on long videos:</strong> pick a lower quality, keep the tab open, and
            save the file soon after it&rsquo;s ready; prepared files are deleted after
            about half an hour.
          </li>
        </ul>
        <p>
          Every error message is explained in{" "}
          <Link href="/blog/why-video-downloads-fail">why video downloads fail</Link>. Please
          only download videos you have the right to save: your own uploads, videos the
          creator offers for download, or openly licensed content.
        </p>
      </ToolGuide>

      <AdBanner300x250 />

      <HowItWorks />

      <FAQSection title="YouTube Downloader FAQ" items={YT_FAQ} />

      <RelatedGuides
        slugs={[
          "download-youtube-videos-iphone-android-pc",
          "download-youtube-shorts",
          "youtube-to-mp3-guide",
          "download-long-youtube-videos",
          "youtube-playlist-download-guide",
          "video-quality-360p-720p-1080p",
        ]}
        title="YouTube guides"
      />
    </>
  );
}