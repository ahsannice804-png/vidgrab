import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/site";
import { TIKTOK_ENABLED } from "@/lib/features";
import { getAllArticles } from "@/lib/blog";

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
  // Articles carry their real edit date so crawlers only revisit changed ones.
  const posts = getAllArticles();
  const articles: MetadataRoute.Sitemap = posts.map((a) => ({
    url: `${base}/blog/${a.slug}`,
    lastModified: new Date(`${a.updated}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  const latestArticle = posts.reduce<Date>((latest, a) => {
    const d = new Date(`${a.updated}T00:00:00Z`);
    return d > latest ? d : latest;
  }, new Date(0));
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
    { url: `${base}/blog`, lastModified: latestArticle, changeFrequency: "weekly", priority: 0.8 },
    ...articles,
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