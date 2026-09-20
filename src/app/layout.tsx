import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getHomeSeo } from "@/lib/seo";
import { absoluteUrl, getBaseUrl, site, siteTagline } from "@/lib/site";
import { TIKTOK_ENABLED } from "@/lib/features";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const homeSeo = getHomeSeo();
const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: homeSeo.title,
    template: `%s | ${site.name}`,
  },
  description: homeSeo.description,
  applicationName: site.name,
  category: "web",
  keywords: [
    "video downloader",
    "free video downloader",
    "online video downloader",
    "video downloader online",
    "youtube video downloader",
    "youtube to mp4",
    "download youtube videos",
    "youtube video downloader 1080p",
    "instagram reels downloader",
    "insta reel downloader",
    "save instagram reels",
    ...(TIKTOK_ENABLED
      ? [
          "tiktok video downloader",
          "tiktok no watermark",
          "download tiktok videos",
        ]
      : []),
    "facebook video downloader",
    "download facebook videos",
    "fb video downloader",
    "download youtube video 1080p",
    "download reels no watermark",
    "mp4 video downloader",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  openGraph: {
    type: "website",
    locale: site.locale,
    url: baseUrl,
    siteName: site.name,
    title: homeSeo.title,
    description: homeSeo.description,
    images: [
      {
        url: absoluteUrl(site.defaultOgImage),
        width: 1200,
        height: 630,
        alt: siteTagline,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: homeSeo.title,
    description: homeSeo.description,
    images: [absoluteUrl(site.defaultOgImage)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#6d28d9",
  width: "device-width",
  initialScale: 1,
};

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})();`;

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-2NWD8CDYX7";

const GA_INIT_SCRIPT = `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true, allow_google_signals: false });`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={site.language}
      data-scroll-behavior="smooth"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="monetag" content="fd283c7d6929c7fb1134be3f10527b5a" />
        <script src="https://quge5.com/88/tag.min.js" data-zone="283486" async data-cfasync="false" />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-violet-600 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <Script
          id="google-analytics"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: GA_INIT_SCRIPT }}
        />
      </body>
    </html>
  );
}