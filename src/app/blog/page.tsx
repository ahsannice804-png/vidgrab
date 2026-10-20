import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import BlogGrid from "@/components/blog/BlogGrid";
import { CATEGORIES, getAllArticles, toSummary } from "@/lib/blog";
import { getSeo } from "@/lib/seo";
import { absoluteUrl, getBaseUrl, site } from "@/lib/site";

const seo = getSeo("blog");

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: seo.title,
    description: seo.description,
    url: absoluteUrl("/blog"),
  },
};

export default function BlogIndexPage() {
  const articles = getAllArticles();
  const summaries = articles.map(toSummary);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: `${site.name} Blog`,
      url: absoluteUrl("/blog"),
      description: seo.description,
      publisher: { "@type": "Organization", name: site.company, email: site.email },
      blogPost: articles.map((a) => ({
        "@type": "BlogPosting",
        headline: a.title,
        url: absoluteUrl(`/blog/${a.slug}`),
        datePublished: a.published,
        dateModified: a.updated,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: getBaseUrl() },
        { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className="relative overflow-hidden" aria-labelledby="blog-title">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute -top-32 left-1/2 h-[380px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-500/15 to-indigo-500/10 blur-3xl" />
        </div>
        <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pb-12 sm:pt-16">
          <p className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/5 px-4 py-1.5 text-xs font-medium text-violet-700 dark:text-violet-300">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14zM20 17v4H6.5A2.5 2.5 0 0 1 4 18.5" />
            </svg>
            Blog · {articles.length} guides
          </p>
          <h1
            id="blog-title"
            className="mt-5 max-w-3xl text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl"
          >
            {seo.h1}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            {seo.subtitle}
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <BlogGrid articles={summaries} categories={CATEGORIES} />
      </div>
    </>
  );
}
