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
  {
    question: "Why does a public-looking Facebook video say it requires login?",
    answer:
      "Its audience is limited \u2014 for example Friends, a private group or a Page with age or country limits. Facebook only shows it to signed-in viewers who are allowed to see it, so it can\u2019t be downloaded publicly.",
  },
  {
    question: "Can I download Facebook live videos?",
    answer:
      "Not while they\u2019re live. Once the broadcast ends and Facebook finishes processing the replay, paste the replay\u2019s link and download it like any other video.",
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

      <ToolGuide labelledBy="fb-content">
        <h2 id="fb-content">How the Facebook video downloader works</h2>
        <p>
          Facebook hands out a confusing number of link formats for the same video.
          When you paste one, we first follow any redirect, so short <code>fb.watch</code>{" "}
          and <code>/share/v/</code> links resolve to the real video, then ask Facebook
          which versions it has stored. Facebook usually keeps a standard-definition
          and an HD copy, and sometimes a higher one. You&rsquo;ll see a button for each
          resolution that genuinely exists, with its real file size, and nothing else.
        </p>
        <p>
          The download is prepared on our server and delivered as an MP4, which plays
          on every phone, computer and TV. Prefer just the sound? The{" "}
          <strong>Audio</strong> tab turns the video&rsquo;s soundtrack into an MP3.
        </p>

        <h2>Supported Facebook links</h2>
        <ul>
          <li><code>fb.watch/&hellip;</code> short links from the Share button</li>
          <li><code>facebook.com/share/v/&hellip;</code> and <code>/share/r/&hellip;</code> links from newer app versions</li>
          <li><code>facebook.com/watch/?v=&hellip;</code> from the Video tab</li>
          <li><code>facebook.com/PageName/videos/&hellip;</code> for videos on Pages</li>
          <li><code>facebook.com/reel/&hellip;</code> for Reels</li>
          <li>Older <code>video.php?v=&hellip;</code> links, plus <code>m.facebook.com</code> mobile versions of all of the above</li>
        </ul>
        <p>
          Links to a news feed, a group, a profile or a Page&rsquo;s main page don&rsquo;t point
          at one video, so they won&rsquo;t work. Open the video itself so it plays on its
          own, then copy that link. Every format is explained in{" "}
          <Link href="/blog/download-facebook-videos-fb-watch">
            our guide to fb.watch and share links
          </Link>
          .
        </p>

        <h2>Choosing a quality</h2>
        <p>
          SD is fine on a phone and keeps files small. HD is worth it for a laptop, a
          TV, or anything you plan to edit. If only one option appears, that&rsquo;s the
          only version Facebook has, which is common for older uploads and videos that
          have been re-shared many times. For audio, 128 kbps suits speech and 192 kbps
          suits music; higher options only appear when the original sound supports
          them.
        </p>

        <h2>Why some Facebook videos can&rsquo;t be downloaded</h2>
        <p>
          Every Facebook post has an audience. Public videos on Pages and profiles work.
          Videos shared with <strong>Friends</strong>, posted in a{" "}
          <strong>private group</strong>, or set to <strong>Only me</strong> are only
          shown to signed-in viewers who are allowed to see them. Our tool works like a
          logged-out visitor and never asks for your Facebook login, so those videos
          return a &ldquo;requires login&rdquo; message. That&rsquo;s the uploader&rsquo;s privacy
          setting doing its job.{" "}
          <Link href="/blog/facebook-video-private-login-explained">
            Private groups and login-only videos explained
          </Link>{" "}
          covers what you can do instead, like asking the uploader for the original
          file.
        </p>

        <h3>Saving on a phone</h3>
        <p>
          Copy the link with <strong>Share &gt; Copy link</strong> in the Facebook app, then
          open this page in Safari or Chrome yourself rather than through a link inside
          Facebook. On iPhone the file goes to Files &gt; Downloads; open it and choose
          Save Video to add it to Photos. On Android it lands in the Download folder,
          and Reels look right in any gallery app because they keep their vertical shape.
        </p>

        <h2>Troubleshooting</h2>
        <ul>
          <li>
            <strong>The preview shows the wrong video:</strong> the link pointed to a post,
            not the video. Tap the video so it opens full-screen, then copy again.
          </li>
          <li>
            <strong>Nothing downloads on your phone:</strong> you may be in Facebook&rsquo;s
            built-in browser. Open Safari or Chrome directly.
          </li>
          <li>
            <strong>A live video fails:</strong> wait until the broadcast ends and the
            replay finishes processing.
          </li>
          <li>
            <strong>&ldquo;Unavailable&rdquo;:</strong> the video was deleted, its audience changed, or
            it&rsquo;s blocked in our server&rsquo;s region.
          </li>
        </ul>
        <p>
          Please download only videos you have the right to save. If the video is
          your own, Facebook&rsquo;s <strong>Download video</strong> option in the post menu
          gives you the file directly.
        </p>
      </ToolGuide>

      <AdBanner300x250 />

      <HowItWorks />

      <FAQSection title="Facebook Video Downloader FAQ" items={FB_FAQ} />

      <RelatedGuides
        slugs={[
          "download-facebook-videos-fb-watch",
          "download-facebook-reels",
          "facebook-video-private-login-explained",
        ]}
        title="Facebook guides"
      />
    </>
  );
}