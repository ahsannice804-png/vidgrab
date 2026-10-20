import { ARTICLES } from "@/content/blog";
import type { Article, ArticleSummary, ToolPath } from "./types";
import { countWords, readingMinutes } from "./text";

export type { Article, ArticleSummary, BlogCategory, ToolPath } from "./types";

export { CATEGORIES, CATEGORY_LABEL } from "./categories";

export const TOOL_LABEL: Record<ToolPath, string> = {
  "/": "Video Downloader",
  "/youtube-video-downloader": "YouTube Video Downloader",
  "/instagram-reels-downloader": "Instagram Reel Downloader",
  "/facebook-video-downloader": "Facebook Video Downloader",
};

/** Newest first; ties keep the order they are listed in src/content/blog. */
const SORTED: Article[] = [...ARTICLES].sort((a, b) =>
  b.published.localeCompare(a.published),
);

const BY_SLUG = new Map(SORTED.map((a) => [a.slug, a]));

export function getAllArticles(): Article[] {
  return SORTED;
}

export function getArticle(slug: string): Article | undefined {
  return BY_SLUG.get(slug);
}

export function articleWordCount(article: Article): number {
  return countWords(article.body);
}

export function toSummary(article: Article): ArticleSummary {
  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    category: article.category,
    published: article.published,
    updated: article.updated,
    readMinutes: readingMinutes(articleWordCount(article)),
  };
}

/** Up to `limit` related articles: the hand-picked ones first, then same category. */
export function getRelated(article: Article, limit = 3): Article[] {
  const picked = article.related
    .map((slug) => BY_SLUG.get(slug))
    .filter((a): a is Article => Boolean(a) && a!.slug !== article.slug);
  const fill = SORTED.filter(
    (a) =>
      a.category === article.category &&
      a.slug !== article.slug &&
      !picked.includes(a),
  );
  return [...picked, ...fill].slice(0, limit);
}

export function getArticlesBySlugs(slugs: string[]): Article[] {
  return slugs.map((s) => BY_SLUG.get(s)).filter((a): a is Article => Boolean(a));
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
