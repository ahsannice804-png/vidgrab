import Link from "next/link";
import { PageHeader, simpleMetadata } from "@/components/page-ui";
import JsonLd from "@/components/JsonLd";
import { getSeo } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";

export const metadata = simpleMetadata(getSeo("contact").title, getSeo("contact").description);

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Us",
  url: absoluteUrl("/contact"),
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHeader title="Get in touch" subtitle="We answer questions, bug reports and partnership ideas quickly." />
      <div className="mx-auto w-full max-w-3xl px-4 pb-20 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold">Email</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Official contact maintained by {site.company}. We typically reply
              within one business day.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-600/25 transition-colors hover:brightness-110"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4L12 13 2 4" />
              </svg>
              Email us
            </a>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold">Report a problem</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Paste a link that fails and tell us which video
              </li>
              <li className="flex items-start gap-2">
                <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Describe what you expected versus what happened
              </li>
              <li className="flex items-start gap-2">
                <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Mention the device and browser if relevant
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted">
              Screenshots and error messages are extremely helpful.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold">About this project</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {site.name} was built because most existing downloader sites were slow,
            full of fake buttons, and impossible to trust. We wanted a simple tool that
            loads fast, feels safe to use, and works consistently on every device.
          </p>
          <p className="mt-3">
            <Link href="/about" className="text-sm font-medium text-violet-600 underline-offset-2 hover:underline">
              Read more about the project →
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}