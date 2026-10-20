export type BlogCategory =
  | "youtube"
  | "instagram"
  | "facebook"
  | "formats"
  | "troubleshooting"
  | "guides";

/** Tool pages an article can point readers to in its "Try the tool" box. */
export type ToolPath =
  | "/"
  | "/youtube-video-downloader"
  | "/instagram-reels-downloader"
  | "/facebook-video-downloader";

export interface ArticleFaq {
  question: string;
  answer: string;
}

/**
 * One blog article, stored as a typed TS module under src/content/blog.
 *
 * `body` is a small Markdown dialect rendered by src/lib/blog/markdown.tsx:
 * `##`/`###` headings, paragraphs, `-` lists, `1.` lists (rendered as styled
 * steps), `| tables |`, callouts (`> [!TIP]`, `> [!NOTE]`, `> [!WARNING]`)
 * and inline **bold**, *italic*, `code` and [links](/path).
 */
export interface Article {
  slug: string;
  title: string;
  /** Meta description, ~140-160 characters. */
  description: string;
  category: BlogCategory;
  /** ISO date (YYYY-MM-DD) the article went live on the site. */
  published: string;
  /** ISO date of the last meaningful edit. */
  updated: string;
  tool: ToolPath;
  /** Slugs shown in the "Related articles" block (first three are used). */
  related: string[];
  body: string;
  faq: ArticleFaq[];
}

export interface ArticleSummary {
  slug: string;
  title: string;
  description: string;
  category: BlogCategory;
  published: string;
  updated: string;
  readMinutes: number;
}
