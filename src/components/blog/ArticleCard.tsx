import Link from "next/link";
import type { ArticleSummary, BlogCategory } from "@/lib/blog/types";
import { CATEGORY_LABEL } from "@/lib/blog/categories";

export const CATEGORY_BADGE: Record<BlogCategory, string> = {
  youtube: "border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-300",
  instagram: "border-fuchsia-500/30 bg-fuchsia-500/5 text-fuchsia-600 dark:text-fuchsia-300",
  facebook: "border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-300",
  formats: "border-violet-500/30 bg-violet-500/5 text-violet-700 dark:text-violet-300",
  troubleshooting: "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300",
  guides: "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300",
};

export function CategoryBadge({ category }: { category: BlogCategory }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${CATEGORY_BADGE[category]}`}
    >
      {CATEGORY_LABEL[category]}
    </span>
  );
}

function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function ArticleCard({
  article,
  headingLevel = "h2",
}: {
  article: ArticleSummary;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5 sm:p-6">
      <div>
        <CategoryBadge category={article.category} />
      </div>
      <Heading className="mt-4 text-lg font-semibold leading-snug tracking-tight">
        <Link
          href={`/blog/${article.slug}`}
          className="after:absolute after:inset-0 after:rounded-2xl focus:outline-none focus-visible:after:ring-2 focus-visible:after:ring-violet-500 group-hover:text-violet-700 dark:group-hover:text-violet-300"
        >
          {article.title}
        </Link>
      </Heading>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{article.description}</p>
      <p className="mt-auto flex items-center gap-2 pt-5 text-xs text-muted">
        <time dateTime={article.published}>{shortDate(article.published)}</time>
        <span aria-hidden="true">·</span>
        <span>{article.readMinutes} min read</span>
      </p>
    </article>
  );
}
