import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import ArticleCard, { CategoryBadge } from "@/components/blog/ArticleCard";
import ReadingProgress from "@/components/blog/ReadingProgress";
import ToolCta from "@/components/blog/ToolCta";
import { ArticleBody } from "@/lib/blog/markdown";
import { extractToc } from "@/lib/blog/text";
import {
  CATEGORY_LABEL,
  formatDate,
  getAllArticles,
  getArticle,
  getRelated,
  toSummary,
} from "@/lib/blog";
import { absoluteUrl, getBaseUrl, site } from "@/lib/site";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(props: ArticlePageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const article = getArticle(slug);
  if (!article) return {};
  const url = absoluteUrl(`/blog/${article.slug}`);
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/blog/${article.slug}` },
    authors: [{ name: site.company, url: absoluteUrl("/about") }],
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: article.description,
      siteName: site.name,
      publishedTime: article.published,
      modifiedTime: article.updated,
      authors: [site.company],
      section: CATEGORY_LABEL[article.category],
      images: [{ url: absoluteUrl(site.defaultOgImage), width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [absoluteUrl(site.defaultOgImage)],
    },
  };
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export default async function ArticlePage(props: ArticlePageProps) {
  const { slug } = await props.params;
  const article = getArticle(slug);
  if (!article) notFound();

  const summary = toSummary(article);
  const toc = extractToc(article.body);
  const related = getRelated(article, 3);
  const url = absoluteUrl(`/blog/${article.slug}`);
  const author = { "@type": "Organization", name: site.company, url: absoluteUrl("/about") };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.description,
      datePublished: article.published,
      dateModified: article.updated,
      author,
      publisher: { ...author, email: site.email },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      url,
      image: absoluteUrl(site.defaultOgImage),
      articleSection: CATEGORY_LABEL[article.category],
      inLanguage: site.language,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: getBaseUrl() },
        { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: article.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ];

  const tocList = (
    <ol className="space-y-2 text-sm">
      {toc.map((entry, i) => (
        <li key={entry.id} className="flex gap-2.5">
          <span className="w-5 shrink-0 text-right font-mono text-xs leading-6 text-muted">
            {i + 1}.
          </span>
          <a
            href={`#${entry.id}`}
            className="leading-6 text-muted transition-colors hover:text-violet-600 dark:hover:text-violet-400"
          >
            {entry.text}
          </a>
        </li>
      ))}
      <li className="flex gap-2.5">
        <span className="w-5 shrink-0 text-right font-mono text-xs leading-6 text-muted">
          {toc.length + 1}.
        </span>
        <a href="#faq" className="leading-6 text-muted transition-colors hover:text-violet-600 dark:hover:text-violet-400">
          Frequently asked questions
        </a>
      </li>
    </ol>
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <ReadingProgress targetId="article" />

      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-[720px] xl:mx-0 xl:max-w-none">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
            <li>
              <Link href="/" className="hover:text-foreground">Home</Link>
            </li>
            <li className="flex items-center gap-1.5">
              <Chevron />
              <Link href="/blog" className="hover:text-foreground">Blog</Link>
            </li>
            <li className="flex min-w-0 items-center gap-1.5">
              <Chevron />
              <span aria-current="page" className="truncate text-foreground/80">
                {article.title}
              </span>
            </li>
          </ol>
        </nav>

        <div className="mt-8 xl:grid xl:grid-cols-[minmax(0,720px)_1fr] xl:gap-16">
          <article id="article" className="mx-auto w-full max-w-[720px] xl:mx-0">
            <header>
              <CategoryBadge category={article.category} />
              <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.15] tracking-tight sm:text-[2.6rem]">
                {article.title}
              </h1>
              <p className="mt-4 text-lg leading-8 text-muted">{article.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-border py-4 text-sm text-muted">
                <span className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white" aria-hidden="true">
                    XS
                  </span>
                  <span>
                    By <Link href="/about" className="font-medium text-foreground hover:underline">{site.company}</Link>
                  </span>
                </span>
                <span aria-hidden="true" className="hidden sm:inline">·</span>
                <span>
                  Published <time dateTime={article.published}>{formatDate(article.published)}</time>
                </span>
                {article.updated !== article.published && (
                  <>
                    <span aria-hidden="true" className="hidden sm:inline">·</span>
                    <span>
                      Updated <time dateTime={article.updated}>{formatDate(article.updated)}</time>
                    </span>
                  </>
                )}
                <span aria-hidden="true" className="hidden sm:inline">·</span>
                <span>{summary.readMinutes} min read</span>
              </div>
            </header>

            {toc.length > 0 && (
              <details className="group mt-8 rounded-2xl border border-border bg-card p-5 xl:hidden" open>
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold [&::-webkit-details-marker]:hidden">
                  On this page
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <nav aria-label="Table of contents" className="mt-4">
                  {tocList}
                </nav>
              </details>
            )}

            <ArticleBody markdown={article.body} />

            <ToolCta tool={article.tool} />

            <section className="mt-14" aria-labelledby="faq">
              <h2 id="faq" className="scroll-mt-24 text-2xl font-bold tracking-tight sm:text-[1.7rem]">
                Frequently asked questions
              </h2>
              <div className="mt-6 space-y-3">
                {article.faq.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-2xl border border-border bg-card px-5 py-4"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold [&::-webkit-details-marker]:hidden">
                      {item.question}
                      <span
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-muted transition-transform group-open:rotate-45"
                        aria-hidden="true"
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </summary>
                    <p className="mt-3 text-[16px] leading-7 text-muted">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </article>

          {toc.length > 0 && (
            <aside className="hidden xl:block" aria-label="Table of contents">
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">On this page</p>
                <nav className="mt-4">{tocList}</nav>
              </div>
            </aside>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-border bg-card/40" aria-labelledby="related-articles">
          <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <h2 id="related-articles" className="text-2xl font-bold tracking-tight">
                Related articles
              </h2>
              <Link href="/blog" className="text-sm font-semibold text-violet-600 underline-offset-4 hover:underline dark:text-violet-400">
                All articles →
              </Link>
            </div>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {related.map((a) => (
                <li key={a.slug}>
                  <ArticleCard article={toSummary(a)} headingLevel="h3" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
