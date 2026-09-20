import type { Metadata } from "next";
import Link from "next/link";
import type { WithContext, WebApplication, FAQPage, BreadcrumbList } from "@/lib/schema";
import DownloadTool from "@/components/DownloadTool";
import HowItWorks from "@/components/HowItWorks";
import FAQSection from "@/components/FAQSection";
import TrustBadges from "@/components/TrustBadges";
import JsonLd from "@/components/JsonLd";
import { getSeo } from "@/lib/seo";
import { absoluteUrl, getBaseUrl, site } from "@/lib/site";
import { TIKTOK_ENABLED } from "@/lib/features";

export const metadata: Metadata = TIKTOK_ENABLED
  ? {
      title: getSeo("tiktok").title,
      description: getSeo("tiktok").description,
      alternates: { canonical: "/tiktok-video-downloader" },
      openGraph: {
        title: getSeo("tiktok").title,
        description: getSeo("tiktok").description,
        url: absoluteUrl("/tiktok-video-downloader"),
      },
    }
  : {
      title: "TikTok Video Downloader — Temporarily Unavailable",
      description:
        "TikTok downloads are temporarily unavailable while we update TikTok support. Download from YouTube, Instagram or Facebook in the meantime.",
      alternates: { canonical: "/tiktok-video-downloader" },
      robots: { index: false, follow: true },
    };

const seo = getSeo("tiktok");

const TK_FAQ = [
  {
    question: "Can I download TikTok videos without the watermark?",
    answer:
      "Yes. We pull the clean play file TikTok serves to its own web app, not the watermarked share version — so downloads have no username or logo overlay, at original quality.",
  },
  {
    question: "Which TikTok links work?",
    answer:
      "All of them. Paste a full tiktok.com/@user/video/ID link, a short vm.tiktok.com link, or a tiktok.com/t/ share link — we resolve the redirect and find the video automatically.",
  },
  {
    question: "Can I download TikTok audio as MP3?",
    answer:
      "Yes. Choose the Audio tab after fetching a video and pick the MP3 quality tier. The source audio is re-encoded to a clean CBR MP3 on our servers.",
  },
  {
    question: "Do I need a TikTok account to download videos?",
    answer:
      "No. Simply paste a public video link and download it. You don\u2019t need to log in, and we never ask for your account details.",
  },
  {
    question: "Will it work for private TikTok accounts?",
    answer:
      "No. Videos from private accounts can\u2019t be downloaded by anyone but the owner, and we respect that. Only public videos are downloadable.",
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
    mainEntity: TK_FAQ.map((item) => ({
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
        name: "TikTok Video Downloader",
        item: absoluteUrl("/tiktok-video-downloader"),
      },
    ],
  },
];

export default function TiktokPage() {
  if (!TIKTOK_ENABLED) return <TikTokUnavailable />;

  return (
    <>
      <JsonLd data={jsonLd as unknown as Record<string, unknown>[]} />

      <section className="relative overflow-hidden" aria-labelledby="tk-hero">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute -top-32 left-1/2 h-[380px] w-[680px] -translate-x-1/2 rounded-full bg-gradient-to-br from-cyan-500/15 to-teal-500/10 blur-3xl" />
        </div>

        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-12 pt-12 text-center sm:px-6 sm:pb-14 sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-4 py-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-300">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.01-.12z" />
            </svg>
            TikTok Video Downloader
          </span>

          <h1 id="tk-hero" className="mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl">
            {seo.h1 ?? "TikTok Video Downloader"}
          </h1>
          <p className="mt-4 max-w-xl text-balance text-base leading-7 text-muted sm:text-lg">
            {seo.subtitle ??
              "Paste a TikTok link and download the video without the watermark — free, no sign-up, no app to install."}
          </p>

          <div className="mt-8 w-full max-w-2xl">
            <DownloadTool platform="tiktok" />
          </div>
          <div className="mt-5">
            <TrustBadges />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="tk-content">
        <h2 id="tk-content" className="text-xl font-bold tracking-tight sm:text-2xl">
          Download TikTok Videos Without Watermark
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-7 text-muted sm:text-base">
          <p>
            When you share a TikTok through the app, TikTok stamps its username and
            logo onto the video. This tool bypasses that: we fetch the same clean play
            file the TikTok web player uses, so you get the original recording with no
            overlay — at the quality the creator uploaded it in.
          </p>
          <p>
            Paste any TikTok link and it just works: full profile links
            (tiktok.com/@name/video/ID), the short vm.tiktok.com links you get from
            the share button, and tiktok.com/t/ share links are all resolved
            automatically. After a quick preview you can download the MP4 or switch to
            the Audio tab for a clean MP3.
          </p>
          <p>
            Everything runs in your browser with nothing to install. Downloads are
            prepared on a fast server, so even videos on tangling mobile data save
            quickly — and you never need a TikTok account.
          </p>
        </div>
      </section>

      <HowItWorks />

      <FAQSection title="TikTok Video Downloader FAQ" items={TK_FAQ} />
    </>
  );
}

/**
 * Shown while NEXT_PUBLIC_TIKTOK_ENABLED is not "true". Keeps the URL alive
 * (existing bookmarks and search results still resolve) but marks the page
 * noindex via the metadata above and points visitors at the working tools.
 */
function TikTokUnavailable() {
  const links = [
    { href: "/youtube-video-downloader", label: "YouTube downloader" },
    { href: "/instagram-reels-downloader", label: "Instagram downloader" },
    { href: "/facebook-video-downloader", label: "Facebook downloader" },
  ];

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-violet-500/10 text-violet-600">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </span>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
        TikTok downloads are temporarily unavailable
      </h1>
      <p className="mt-4 max-w-xl text-balance text-base leading-7 text-muted sm:text-lg">
        TikTok support is temporarily unavailable &mdash; we&rsquo;re working on it.
        In the meantime, you can download from YouTube, Instagram or Facebook.
      </p>
      <div className="mt-8 grid w-full gap-3 sm:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-violet-500/50"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}