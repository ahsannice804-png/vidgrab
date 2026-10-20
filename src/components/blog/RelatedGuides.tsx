import Link from "next/link";
import ArticleCard from "./ArticleCard";
import { getArticlesBySlugs, toSummary } from "@/lib/blog";

interface RelatedGuidesProps {
  slugs: string[];
  title?: string;
  intro?: string;
}

/** "Related guides" block used on tool pages to link into the blog. */
export default function RelatedGuides({
  slugs,
  title = "Related guides",
  intro = "Step-by-step help written for the problems people actually run into.",
}: RelatedGuidesProps) {
  const articles = getArticlesBySlugs(slugs);
  if (articles.length === 0) return null;
  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16"
      aria-labelledby="related-guides"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="related-guides" className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 max-w-xl text-muted">{intro}</p>
        </div>
        <Link
          href="/blog"
          className="text-sm font-semibold text-violet-600 underline-offset-4 hover:underline dark:text-violet-400"
        >
          All articles →
        </Link>
      </div>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {articles.map((article) => (
          <li key={article.slug}>
            <ArticleCard article={toSummary(article)} headingLevel="h3" />
          </li>
        ))}
      </ul>
    </section>
  );
}
