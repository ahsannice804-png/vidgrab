import seoConfig from "../../config/seo.json";
import { TIKTOK_ENABLED } from "./features";

export type SeoPage = keyof typeof seoConfig;

export interface PageSeo {
  title: string;
  description: string;
  h1?: string;
  subtitle?: string;
}

/**
 * Editable SEO layer.
 * Tweak any title / description / H1 in /config/seo.json and rebuild the
 * site to publish — no developer needed for content changes.
 */
export function getSeo(page: SeoPage): PageSeo {
  return seoConfig[page] as PageSeo;
}

/**
 * Home SEO with the disabled-platform copy swapped in while TikTok is off.
 * When NEXT_PUBLIC_TIKTOK_ENABLED=true this is exactly config/seo.json["home"].
 */
export function getHomeSeo(): PageSeo {
  const base = getSeo("home");
  if (TIKTOK_ENABLED) return base;
  return {
    ...base,
    title: "Free Video Downloader - YouTube, Instagram & Facebook 1080p MP4",
    description:
      "Download YouTube videos in 360p, 480p, 720p or 1080p HD, save Instagram Reels and save Facebook videos as MP4. Free, fast, no sign-up, no watermark.",
    h1: "Download Any YouTube Video, Instagram Reel or Facebook Video, Free",
  };
}