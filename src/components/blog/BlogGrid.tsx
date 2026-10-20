"use client";

import { useState } from "react";
import ArticleCard from "./ArticleCard";
import type { ArticleSummary, BlogCategory } from "@/lib/blog/types";

interface BlogGridProps {
  articles: ArticleSummary[];
  categories: Array<{ id: BlogCategory; label: string }>;
}

/**
 * Article grid with category filter chips. Every card is in the server HTML;
 * the chips only hide/show them client-side, so crawlers always see all links.
 */
export default function BlogGrid({ articles, categories }: BlogGridProps) {
  const [active, setActive] = useState<BlogCategory | "all">("all");
  const visible = active === "all" ? articles : articles.filter((a) => a.category === active);

  const chips: Array<{ id: BlogCategory | "all"; label: string; count: number }> = [
    { id: "all", label: "All articles", count: articles.length },
    ...categories.map((c) => ({
      id: c.id,
      label: c.label,
      count: articles.filter((a) => a.category === c.id).length,
    })),
  ];

  return (
    <div>
      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        role="group"
        aria-label="Filter articles by category"
      >
        {chips.map((chip) => {
          const selected = active === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setActive(chip.id)}
              className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                selected
                  ? "border-violet-600 bg-violet-600 text-white shadow-sm shadow-violet-600/25"
                  : "border-border bg-card text-muted hover:border-violet-500/50 hover:text-foreground"
              }`}
            >
              {chip.label}
              <span
                className={`text-xs ${selected ? "text-white/80" : "text-muted"}`}
                aria-hidden="true"
              >
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} articles
      </p>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {visible.map((article) => (
          <li key={article.slug}>
            <ArticleCard article={article} />
          </li>
        ))}
      </ul>
    </div>
  );
}
