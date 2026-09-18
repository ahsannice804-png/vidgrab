import Link from "next/link";
import { PageHeader, simpleMetadata } from "@/components/page-ui";
import JsonLd from "@/components/JsonLd";
import WhyChooseUs from "@/components/WhyChooseUs";
import { getSeo } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";

export const metadata = simpleMetadata(getSeo("about").title, getSeo("about").description);

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Us",
  url: absoluteUrl("/about"),
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHeader title="Why we built this" subtitle={`The story behind ${site.name} — and the choices we made building it.`} />

      <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
        <div className="space-y-6 text-sm leading-7 text-muted sm:text-base">
          <p className="first-letter:text-2xl first-letter:font-bold first-letter:text-foreground">
            Most online video downloaders are terrible. They load slow, hit you with
            fake download buttons, and make you wonder whether clicking anything will
            give you a virus. We got tired of it too, so we built {site.name} — a tool
            that does exactly what the box says, fast and without drama.
          </p>
          <p>
            The tool was built with real open-source plumbing under the hood:{" "}
            <a href="https://nextjs.org/" className="text-violet-600" target="_blank" rel="noopener noreferrer">
              Next.js
            </a>{" "}
            for speed and SEO, a transparent server-side download engine, and nothing
            that phones home. There are no analytics tracking your every click, no
            accounts to create, and no data collected beyond what is strictly needed to
            deliver the file.
          </p>
          <p>
            We also wanted to prove that a free tool doesn&rsquo;t have to be a
            scam. Every button on the page really works. If you see a size next to a
            quality option, it&rsquo;s a real estimate, not a fiction meant to get a click.
            Trust is the only thing keeping you on the page, and it&rsquo;s the only thing
            worth optimizing for.
          </p>
        </div>
      </div>

      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-8">
          <h2 className="text-xl font-bold tracking-tight">Built by Xast Solutions</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-muted sm:text-base">
            <p>
              Video Downloader is developed by{" "}
              <span className="font-medium text-foreground">Xast Solutions</span>, a
              software house that builds practical, useful web tools and provides
              software development services.
            </p>
            <p>
              For support, feedback or business inquiries, email us at{" "}
              <a href={`mailto:${site.email}`} className="text-violet-600 underline underline-offset-2 hover:text-violet-700">
                {site.email}
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <WhyChooseUs />

      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-xl font-bold tracking-tight">The technology underneath</h2>
        <div className="mt-5 space-y-4 text-sm leading-7 text-muted sm:text-base">
          <p>
            Behind the clean UI sits a fast Node.js backend, an industry-standard
            download engine (<code className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">yt-dlp</code>),
            and an FFmpeg merge layer that stitches separate video and audio tracks into
            a clean MP4 when needed. Requests are rate-limited per IP so one visitor
            can&rsquo;t hog the whole server.
          </p>
          <p>
            The frontend is built with React and Tailwind, rendered on the server for
            search engines, and fully responsive from 375px phones up to ultrawide
            displays. Static pages load fast, and the only network request is the one
            that actually matters — getting you the video.
          </p>
          <p>
            We take the abuse risk seriously: URLs are validated strictly, downloads are
            prepared in a sandboxed temporary directory, and every file is served
            through a one-time link that expires quickly. There is no attack surface
            left open.
          </p>
        </div>
      </div>

      <section className="mx-auto w-full max-w-3xl px-4 pb-20 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-lg font-bold">Found a problem? Have an idea?</h2>
          <p className="mt-2 text-sm text-muted">
            We improve this tool based on what users tell us. If something isn&rsquo;t
            working, we genuinely want to hear about it.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-600/25 transition-colors hover:brightness-110"
            >
              Contact us
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-card"
            >
              Try the downloader
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}