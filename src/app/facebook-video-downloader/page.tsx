import type { Metadata } from "next";
import type { WithContext, WebApplication, FAQPage, BreadcrumbList } from "@/lib/schema";
import DownloadTool from "@/components/DownloadTool";
import HowItWorks from "@/components/HowItWorks";
import FAQSection from "@/components/FAQSection";
import TrustBadges from "@/components/TrustBadges";
import JsonLd from "@/components/JsonLd";
import { getSeo } from "@/lib/seo";
import { absoluteUrl, getBaseUrl, site } from "@/lib/site";

export const metadata: Metadata = {
  title: getSeo("facebook").title,
  description: getSeo("facebook").description,
  alternates: { canonical: "/facebook-video-downloader" },
  openGraph: {
    title: getSeo("facebook").title,
    description: getSeo("facebook").description,
    url: absoluteUrl("/facebook-video-downloader"),
  },
};

const seo = getSeo("facebook");

const FB_FAQ = [
  {
    question: "Which Facebook links work?",
    answer:
      "All common public video links: facebook.com/watch/?v=ID, facebook.com/[page]/videos/ID, facebook.com/reel/ID, video.php links and the short fb.watch links from the share button. m.facebook.com and mobile variants work too.",
  },
  {
    question: "Do I need a Facebook account to download videos?",
    answer:
      "No. Simply paste a public video link and download it. You don\u2019t need to log in, and we never ask for your account details. Some videos are restricted by their owner to signed-in viewers — those can\u2019t be downloaded.",
  },
  {
    question: "Will it work for private Facebook videos?",
    answer:
      "No. Videos marked private are only visible to the people the owner chooses, and we respect that. Only public videos are downloadable.",
  },
  {
    question: "Can I download Facebook video audio as MP3?",
    answer:
      "Yes. Choose the Audio tab after fetching a video and pick the MP3 quality tier. The source audio is re-encoded to a clean CBR MP3 on our servers.",
  },
  {
    question: "Can I download from Facebook on my phone?",
    answer:
      "Yes. Paste the link on your phone — including the short fb.watch link you get from the share button — and the MP4 downloads straight to your device.",
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
    mainEntity: FB_FAQ.map((item) => ({
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
        name: "Facebook Video Downloader",
        item: absoluteUrl("/facebook-video-downloader"),
      },
    ],
  },
];

export default function FacebookPage() {
  return (
    <>
      <JsonLd data={jsonLd as unknown as Record<string, unknown>[]} />

      <section className="relative overflow-hidden" aria-labelledby="fb-hero">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute -top-32 left-1/2 h-[380px] w-[680px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-500/15 to-sky-500/10 blur-3xl" />
        </div>

        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-12 pt-12 text-center sm:px-6 sm:pb-14 sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/5 px-4 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-300">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
            Facebook Video Downloader
          </span>

          <h1 id="fb-hero" className="mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl">
            {seo.h1 ?? "Facebook Video Downloader"}
          </h1>
          <p className="mt-4 max-w-xl text-balance text-base leading-7 text-muted sm:text-lg">
            {seo.subtitle ??
              "Paste a Facebook video link and save it as MP4 in seconds — free, no sign-up, no app to install."}
          </p>

          <div className="mt-8 w-full max-w-2xl">
            <DownloadTool platform="facebook" />
          </div>
          <div className="mt-5">
            <TrustBadges />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="fb-content">
        <h2 id="fb-content" className="text-xl font-bold tracking-tight sm:text-2xl">
          Save Facebook Videos as MP4
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-7 text-muted sm:text-base">
          <p>
            Facebook videos can be awkward to keep — they vanish as pages shuffle
            their feeds, and the app gives you no way to save one cleanly. Paste the
            link above and get the original MP4, ready to keep or share offline.
          </p>
          <p>
            Every common link type just works: watch links (facebook.com/watch/?v=ID),
            page video links (facebook.com/[page]/videos/ID), reels, video.php links
            and the short <code className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">fb.watch</code> links
            you get from the share button — including the m.facebook.com mobile variants.
            We resolve the redirects automatically.
          </p>
          <p>
            Facebook usually offers a few real resolutions (SD and HD, sometimes
            UHD), and we only show the ones that actually exist for the video with
            their real file sizes. Downloads are prepared on our servers, so even
            longer videos save fast on mobile data.
          </p>
        </div>
      </section>

      <HowItWorks />

      <FAQSection title="Facebook Video Downloader FAQ" items={FB_FAQ} />
    </>
  );
}