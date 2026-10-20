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
  {
    question: "Can I download Instagram Stories or Highlights?",
    answer:
      "No. The tool supports Reels and video posts from public accounts. Stories, Highlights and profile links aren\u2019t supported.",
  },
  {
    question: "Can I save a Reel\u2019s audio as MP3 here?",
    answer:
      "Not directly \u2014 Instagram videos are saved as MP4. You can convert the MP4 to MP3 afterwards with a free tool like VLC or Audacity, or use Instagram\u2019s own Save audio feature to reuse a sound inside the app.",
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
            <TrustBadges mp3={false} />
          </div>
        </div>
      </section>

      <ToolGuide labelledBy="ig-content">
        <h2 id="ig-content">How the Instagram Reel downloader works</h2>
        <p>
          A Reel in the Instagram app isn&rsquo;t a video with a logo painted on it. The
          app plays a plain video file and draws the username, caption and buttons on
          top while you watch. When you paste a link here, we fetch that same file, the
          one Instagram serves to its own player, and hand it to you as an MP4. That&rsquo;s
          why the download has no watermark: there was never one in the file.
        </p>
        <p>
          The bouncing logo you may have seen elsewhere comes from Instagram&rsquo;s own
          <strong> Download</strong> option, which stamps the Instagram logo and the
          creator&rsquo;s handle onto the export so reposts stay credited.{" "}
          <Link href="/blog/save-instagram-reels-without-watermark">
            Saving Reels without a watermark
          </Link>{" "}
          explains the difference between saving, downloading and screen recording.
        </p>

        <h2>Supported Instagram links</h2>
        <ul>
          <li><code>instagram.com/reel/&hellip;</code> and <code>instagram.com/reels/&hellip;</code> for Reels</li>
          <li><code>instagram.com/p/&hellip;</code> for video posts in the feed and grid</li>
          <li><code>instagram.com/tv/&hellip;</code> for older long-form videos</li>
          <li>Links copied from the app, including the <code>?igsh=</code> tracking code on the end</li>
        </ul>
        <p>
          Profile links, Stories and Highlights aren&rsquo;t supported, and neither is
          anything from a private account. To get the right link, tap the paper-plane
          share icon on the Reel and choose <strong>Copy link</strong>; on a computer, use
          the <strong>&hellip;</strong> menu on the post. Our{" "}
          <Link href="/blog/copy-video-link-guide">link-copying guide</Link> shows where
          the option sits on each platform.
        </p>

        <h2>What quality to expect</h2>
        <p>
          Instagram usually keeps one playback version of each Reel, so you&rsquo;ll normally
          see a single best-quality option rather than a list. That version is the
          compressed copy Instagram serves to every viewer, which looks good on a phone
          and acceptable on a laptop. It can&rsquo;t be sharper than what Instagram stores.
          If the Reel is yours, the original export in your camera roll or editing app
          will always be better than any download.
        </p>
        <p>
          This tool saves Instagram videos as MP4 only. If you&rsquo;re after the sound,{" "}
          <Link href="/blog/instagram-reel-audio-mp3">saving Reel audio as MP3</Link>{" "}
          covers Instagram&rsquo;s own Save audio feature and how to convert the MP4 on
          your phone or computer.
        </p>

        <h3>Reels, posts and older videos</h3>
        <p>
          Reels and single-video posts are the most reliable. Carousel posts that mix
          several photos and videos can be hit-and-miss, because the tool is built
          around one video per link. Older Reels were often stored at a lower
          resolution than recent ones, so a Reel from a few years ago may look softer
          than you remember. That&rsquo;s the version Instagram still has, not something the
          download changed.
        </p>

        <h2>Troubleshooting</h2>
        <ul>
          <li>
            <strong>Nothing happens when you tap download on a phone:</strong> you&rsquo;re
            probably inside Instagram&rsquo;s built-in browser. Open Safari or Chrome
            yourself and paste the link there.
          </li>
          <li>
            <strong>&ldquo;Requires login&rdquo; or &ldquo;private&rdquo;:</strong> the account is private or the
            post is restricted. We never ask for your Instagram login, and you shouldn&rsquo;t
            give it to any site that does.
          </li>
          <li>
            <strong>&ldquo;Not a valid link&rdquo;:</strong> you copied a profile or extra text along with
            the link. Copy it again from the Reel&rsquo;s share sheet.
          </li>
          <li>
            <strong>Can&rsquo;t find the file:</strong> on iPhone it&rsquo;s in Files &gt; Downloads until
            you choose Save Video; on Android it&rsquo;s in the Download folder.
          </li>
        </ul>
        <p>
          The full phone walkthrough is in{" "}
          <Link href="/blog/download-instagram-videos-mobile">
            downloading Instagram videos on iPhone and Android
          </Link>
          . Please only save Reels you have the right to keep, and credit the creator
          if you share one.
        </p>
      </ToolGuide>

      <AdBanner300x250 />

      <HowItWorks />

      <FAQSection title="Instagram Reel Downloader FAQ" items={IG_FAQ} />

      <RelatedGuides
        slugs={[
          "save-instagram-reels-without-watermark",
          "download-instagram-videos-mobile",
          "instagram-reel-audio-mp3",
        ]}
        title="Instagram guides"
      />
    </>
  );
}