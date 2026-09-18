import type { Metadata } from "next";
import Link from "next/link";
import DownloadTool from "@/components/DownloadTool";
import HowItWorks from "@/components/HowItWorks";
import WhyChooseUs from "@/components/WhyChooseUs";
import FAQSection from "@/components/FAQSection";
import TrustBadges from "@/components/TrustBadges";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
import { getHomeSeo } from "@/lib/seo";
import { absoluteUrl, getBaseUrl, site, siteDescription } from "@/lib/site";
import { TIKTOK_ENABLED, PLATFORM_LIST } from "@/lib/features";

export const metadata: Metadata = {
  title: getHomeSeo().title,
  description: getHomeSeo().description,
  alternates: { canonical: "/" },
  openGraph: {
    title: getHomeSeo().title,
    description: getHomeSeo().description,
    url: absoluteUrl("/"),
  },
};

const seo = getHomeSeo();

const HOME_FAQ = [
  {
    question: "Is it really free to download videos?",
    answer:
      "Yes. There are no hidden fees, no trial limits and no premium paywall. You can download as many videos and reels as you need, completely free.",
  },
  {
    question: "How do I download a YouTube video in 1080p HD?",
    answer:
      "Paste your YouTube link, wait a second for the video preview, then tap the 1080p HD button. If the video offers 1080p, it will be prepared and downloaded as an MP4 automatically.",
  },
  {
    question: "How do I download an Instagram Reel without a watermark?",
    answer:
      "Copy the link of the reel you want and paste it above. We fetch the original file directly from Instagram, so reels download in good quality without the watermark overlay.",
  },
  ...(TIKTOK_ENABLED
    ? [
        {
          question: "Can I download TikTok videos without the watermark?",
          answer:
            "Yes. Paste any TikTok link — including short vm.tiktok.com links — and we grab the clean, original play file that TikTok serves to its web app, so your download has no username or logo overlay.",
        },
      ]
    : []),
  {
    question: "Can I download Facebook videos?",
    answer:
      "Yes. Paste any public Facebook video link — watch links, page videos, reels or short fb.watch links — and download the original MP4. Videos the owner restricts to signed-in viewers can\u2019t be downloaded.",
  },
  {
    question: "Will it work on my phone?",
    answer:
      "Yes. The whole tool is mobile-first and works in any modern browser — Chrome, Safari, Firefox and Edge. There is no app to install.",
  },
  {
    question: `Is downloading ${PLATFORM_LIST} content legal?`,
    answer:
      "Downloading is fine when you have the right to save the content — for example your own videos or content with an open license. Always respect the creator\u2019s rights and the platform\u2019s terms.",
  },
  {
    question: "Why are other downloader sites full of fake buttons?",
    answer:
      "Many sites make money per fake click instead of actually helping you. Every button here really works — that trust is the whole point of this tool, and it\u2019s the only way to keep people coming back.",
  },
];

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: site.name,
  url: getBaseUrl(),
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  description: siteDescription,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  publisher: {
    "@type": "Organization",
    name: site.name,
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={[webAppSchema, faqSchema]} />

      {/* Hero */}
      <section className="relative overflow-hidden" aria-labelledby="hero-title">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        >
          <div className="absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_55%,rgba(0,0,0,0.03))] dark:bg-[radial-gradient(ellipse_at_top,transparent_55%,rgba(255,255,255,0.03))]" />
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-12 pt-8 text-center sm:px-6 sm:pb-14 sm:pt-12">
          <p className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/5 px-4 py-1.5 text-xs font-medium text-violet-700 dark:text-violet-300">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Free · No sign-up · No watermark
          </p>

          <h1
            id="hero-title"
            className="mt-6 text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl"
          >
            {seo.h1 ?? "Download Any YouTube Video, Instagram Reel, TikTok or Facebook Video, Free"}
          </h1>

          <p className="mt-5 max-w-xl text-balance text-base leading-7 text-muted sm:text-lg">
            {seo.subtitle ??
              "Paste a link and download in seconds — up to 1080p HD, no sign-up, no watermarks, no fake download buttons."}
          </p>

          <div className="mt-8 w-full max-w-2xl">
            <DownloadTool variant="hero" />
          </div>

          <div className="mt-6">
            <TrustBadges />
          </div>
        </div>
      </section>

      {/* Ad zone — below the fold, clearly separated from the tool. */}
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <AdSlot slot="home-leaderboard" />
      </div>

      {/* How it works */}
      <HowItWorks />

      {/* Why choose us */}
      <WhyChooseUs />

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="tools">
        <div className="text-center">
          <h2 id="tools" className="text-2xl font-bold tracking-tight sm:text-3xl">
            What do you want to download?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            {TIKTOK_ENABLED ? "Four" : "Three"} dedicated tools, one fast engine underneath.
          </p>
        </div>

        <div
          className={`mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6 ${
            TIKTOK_ENABLED ? "lg:grid-cols-4" : "lg:grid-cols-3"
          }`}
        >
          <Link
            href="/youtube-video-downloader"
            className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-violet-500/50 sm:p-7"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-red-500/10 text-red-500">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                <path d="M23 7.2s-.23-1.63-.94-2.35c-.9-.94-1.9-.9-2.36-.95C16.6 3.7 12 3.7 12 3.7h-.02c-6.02 0-9.7.35-9.7 1.2 0 0 0 0 0 0 0 .85-.26 2.3-.26 2.3S1.76 9.13 1.76 11.05v1.9C1.76 14.87 2 16.8 2 16.8s.24 1.45.94 2.35c.9.94 2.12.92 2.66 1.02 1.94.19 6.4.23 6.4.23s4.6.04 7.66-.24c.46-.05 1.46-.09 2.36-1.03.7-.9.94-2.32.94-2.32s.24-1.93.24-3.85v-1.9c0-1.92-.24-3.84-.24-3.84zm-13.6 6.7V9.02l5.66 3.28-5.66 3.6z" />
              </svg>
            </span>
            <h3 className="mt-4 text-lg font-semibold group-hover:underline">
              YouTube Video Downloader
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Download any YouTube video as MP4 — 360p, 480p, 720p or 1080p HD.
              Works for regular videos and Shorts.
            </p>
          </Link>

          <Link
            href="/instagram-reels-downloader"
            className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-fuchsia-500/50 sm:p-7"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-amber-400 via-pink-500 to-fuchsia-600 text-white">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <h3 className="mt-4 text-lg font-semibold group-hover:underline">
              Instagram Reel Downloader
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Save Instagram Reels and posts as MP4 in HD — no watermark, no
              account needed.
            </p>
          </Link>

          {TIKTOK_ENABLED && (
            <Link
              href="/tiktok-video-downloader"
              className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-cyan-500/50 sm:p-7"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 text-white">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.01-.12z" />
                </svg>
              </span>
              <h3 className="mt-4 text-lg font-semibold group-hover:underline">
                TikTok Video Downloader
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Save TikTok videos as MP4 without the watermark — no app, no
                sign-up, works from any link type.
              </p>
            </Link>
          )}

          <Link
            href="/facebook-video-downloader"
            className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-blue-500/50 sm:p-7"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </span>
            <h3 className="mt-4 text-lg font-semibold group-hover:underline">
              Facebook Video Downloader
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Save public Facebook videos and reels as MP4 — watch links,
              page videos and fb.watch shorts all work.
            </p>
          </Link>
        </div>
      </section>

      {/* Ad zone — between sections */}
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <AdSlot slot="home-in-article" />
      </div>

      <FAQSection items={HOME_FAQ} />
    </>
  );
}