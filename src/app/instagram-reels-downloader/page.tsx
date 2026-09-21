import type { Metadata } from "next";
import type { WithContext, WebApplication, FAQPage, BreadcrumbList } from "@/lib/schema";
import DownloadTool from "@/components/DownloadTool";
import HowItWorks from "@/components/HowItWorks";
import FAQSection from "@/components/FAQSection";
import TrustBadges from "@/components/TrustBadges";
import JsonLd from "@/components/JsonLd";
import AdBanner300x250 from "@/components/ads/AdBanner300x250";
import { getSeo } from "@/lib/seo";
import { absoluteUrl, getBaseUrl, site } from "@/lib/site";

export const metadata: Metadata = {
  title: getSeo("instagram").title,
  description: getSeo("instagram").description,
  alternates: { canonical: "/instagram-reels-downloader" },
  openGraph: {
    title: getSeo("instagram").title,
    description: getSeo("instagram").description,
    url: absoluteUrl("/instagram-reels-downloader"),
  },
};

const seo = getSeo("instagram");

const IG_FAQ = [
  {
    question: "Can I download Instagram Reels without a watermark?",
    answer:
      "Yes. We fetch the original reel file directly from Instagram, so you get the clean video — no watermark overlay, no screen-recording quality loss.",
  },
  {
    question: "Do I need an Instagram account to download reels?",
    answer:
      "No. Simply paste a public reel or post link and download it. You don\u2019t need to log in, and we never ask for your account details.",
  },
  {
    question: "Will it work for private Instagram accounts?",
    answer:
      "No. Private accounts restrict access to their content, and we respect that. Only public reels and posts can be downloaded by anyone.",
  },
  {
    question: "Can I download from Instagram on my phone?",
    answer:
      "Yes. Paste the link on your phone and the MP4 downloads straight to your device — iPhone and Android both work in the browser.",
  },
  {
    question: "How do I copy an Instagram Reel link?",
    answer:
      "Open the reel in the Instagram app, tap the share icon, then choose \u201cCopy link.\u201d On desktop, click the \u2026 menu and select \u201cCopy link.\u201d",
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
    mainEntity: IG_FAQ.map((item) => ({
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
        name: "Instagram Reel Downloader",
        item: absoluteUrl("/instagram-reels-downloader"),
      },
    ],
  },
];

export default function InstagramPage() {
  return (
    <>
      <JsonLd data={jsonLd as unknown as Record<string, unknown>[]} />

      <section className="relative overflow-hidden" aria-labelledby="ig-hero">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute -top-32 left-1/2 h-[380px] w-[680px] -translate-x-1/2 rounded-full bg-gradient-to-br from-fuchsia-500/15 to-amber-400/10 blur-3xl" />
        </div>

        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-12 pt-12 text-center sm:px-6 sm:pb-14 sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/5 px-4 py-1.5 text-xs font-medium text-fuchsia-600 dark:text-fuchsia-300">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
            </svg>
            Instagram Reel Downloader
          </span>

          <h1 id="ig-hero" className="mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl">
            {seo.h1 ?? "Instagram Reel Downloader"}
          </h1>
          <p className="mt-4 max-w-xl text-balance text-base leading-7 text-muted sm:text-lg">
            {seo.subtitle ??
              "Paste an Instagram Reel or post link and save it as an MP4 in seconds — free, no sign-up, no watermark."}
          </p>

          <div className="mt-8 w-full max-w-2xl">
            <DownloadTool platform="instagram" />
          </div>
          <div className="mt-5">
            <TrustBadges />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="ig-content">
        <h2 id="ig-content" className="text-xl font-bold tracking-tight sm:text-2xl">
          Save Instagram Reels as MP4, No Watermark
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-7 text-muted sm:text-base">
          <p>
            Reels disappear from your feed — but they don\u2019t have to disappear from
            your device. Paste the reel link above and get the original MP4, ready to
            keep forever or edit offline.
          </p>
          <p>
            The tool also works for regular Instagram posts (&ldquo;photo and video&rdquo; posts).
            Reels usually have a single best quality, and when more than one is
            available we list each one with its real file size, just like the YouTube
            tool.
          </p>
          <p>
            Everything runs in your browser with no app to install, and because saves
            are powered by our servers, even long reels download quickly on mobile data.
          </p>
        </div>
      </section>

      <AdBanner300x250 />

      <HowItWorks />

      <FAQSection title="Instagram Reel Downloader FAQ" items={IG_FAQ} />
    </>
  );
}