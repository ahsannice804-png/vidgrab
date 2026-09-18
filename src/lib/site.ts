import siteConfig from "../../config/site.json";
import { TIKTOK_ENABLED } from "./features";

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  email: string;
  company: string;
  defaultOgImage: string;
  language: string;
  locale: string;
}

export const site = siteConfig as SiteConfig;

/**
 * Same copy as config/site.json, but with TikTok dropped while it is disabled
 * so every surface (footer, schema, OG image) reads as a three-platform tool.
 * Set NEXT_PUBLIC_TIKTOK_ENABLED=true to restore the configured copy.
 */
export const siteTagline = TIKTOK_ENABLED
  ? site.tagline
  : "Fast, free YouTube, Instagram & Facebook video downloader";

export const siteDescription = TIKTOK_ENABLED
  ? site.description
  : "Download YouTube videos in up to 1080p HD, save Instagram Reels and Facebook videos as MP4, free and without registration.";

/**
 * Absolute base URL used for canonical URLs, sitemap, robots and Open Graph.
 * Set BASE_URL in the environment (e.g. https://yourdomain.com) — required for
 * a correct sitemap and canonical tags in production.
 */
export function getBaseUrl(): string {
  return (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

export function absoluteUrl(path = "/"): string {
  return `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}