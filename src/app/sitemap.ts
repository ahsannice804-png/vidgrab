import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/site";
import { TIKTOK_ENABLED } from "@/lib/features";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();
  const now = new Date();
  const tiktok: MetadataRoute.Sitemap = TIKTOK_ENABLED
    ? [
        {
          url: `${base}/tiktok-video-downloader`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.9,
        },
      ]
    : [];
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${base}/youtube-video-downloader`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/instagram-reels-downloader`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...tiktok,
    {
      url: `${base}/facebook-video-downloader`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    {
      url: `${base}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/terms-of-service`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}