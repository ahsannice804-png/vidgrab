import type { Metadata } from "next";
import type { WithContext, WebApplication, FAQPage, BreadcrumbList } from "@/lib/schema";
import DownloadTool from "@/components/DownloadTool";
import HowItWorks from "@/components/HowItWorks";
import FAQSection from "@/components/FAQSection";
import TrustBadges from "@/components/TrustBadges";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
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

      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <AdSlot slot="youtube-leaderboard" />
      </div>

      {/* SEO content */}
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="yt-content">
        <h2 id="yt-content" className="text-xl font-bold tracking-tight sm:text-2xl">
          Download YouTube Videos in 360p, 720p or 1080p HD
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-7 text-muted sm:text-base">
          <p>
            YouTube downloads are usually saved as MP4 automatically. When a video
            keeps its highest-quality picture and sound in separate tracks (common for
            1080p), we merge them on our servers with ffmpeg so you still get one clean
            MP4 file — no extra converter needed.
          </p>
          <p>
            Unlike most downloader sites, the sizes you see next to each quality are
            real estimates taken from the actual file, so you know what you&rsquo;re waiting
            for before you start. And because we prepare files on a fast server, your
            phone or laptop doesn\u2019t have to grind through the download.
          </p>
          <p>
            The tool also works for YouTube Shorts, embedded watch links (youtu.be) and
            music videos. Just paste any normal YouTube URL — a preview with the title
            and duration appears before you choose a quality.
          </p>
        </div>
      </section>

      <HowItWorks />

      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <AdSlot slot="youtube-in-article" />
      </div>

      <FAQSection title="YouTube Downloader FAQ" items={YT_FAQ} />
    </>
  );
}