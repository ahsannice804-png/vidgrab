import { PageHeader, Prose, simpleMetadata } from "@/components/page-ui";
import JsonLd from "@/components/JsonLd";
import { getSeo } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";
import { PLATFORM_LIST } from "@/lib/features";

export const metadata = simpleMetadata(getSeo("privacy").title, getSeo("privacy").description);

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Privacy Policy",
  url: absoluteUrl("/privacy-policy"),
  isPartOf: { "@type": "WebSite", name: site.name },
};

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHeader title="Privacy Policy" subtitle="Last updated: September 20, 2026" />
      <PageContent />
    </>
  );
}

function PageContent() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
      <Prose>
        <h2>What we collect</h2>
        <p>
          We collect as little as possible. When you use the downloader, we process the
          link you paste solely to fetch the video or reel you requested. Completed
          files are held briefly on our servers only long enough to stream them to you
          (typically a few minutes, at most 35 minutes), after which they are
          automatically deleted — we do not retain, host or store the videos you
          download, and we do not create user accounts.
        </p>

        <h2>Technical data</h2>
        <p>
          To protect the service from abuse, our servers record basic request data such
          as your IP address, browser type and the time of the request. This data is
          used only for rate-limiting and security monitoring and is not sold or shared
          with third parties for advertising.
        </p>

        <h2>Analytics</h2>
        <p>
          We use Google Analytics 4, provided by Google LLC, to understand in aggregate
          how the site is used — for example which pages are most popular and which
          browsers and devices visitors use. It records IP addresses (anonymized before
          storage), browser and device information, and the pages you visit on this
          site. We have disabled Google signals and advertising reporting, and this data
          is not used for marketing, advertising or to track individual visitors across
          the web.
        </p>
        <p>
          Google Analytics uses first-party cookies (<em>_ga</em> and{" "}
          <em>_ga_&lt;container-id&gt;</em>) to distinguish visitors and report
          anonymous usage statistics. Google&rsquo;s own handling of this data is
          described in{" "}
          <a
            href="https://policies.google.com/privacy"
            className="text-violet-600 underline underline-offset-2 hover:text-violet-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google&rsquo;s Privacy Policy
          </a>
          . To opt out of Google Analytics throughout the web, you can install the{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            className="text-violet-600 underline underline-offset-2 hover:text-violet-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Analytics opt-out browser add-on
          </a>
          .
        </p>

        <h2>Cookies</h2>
        <p>
          We use one local storage preference to remember your dark/light theme choice.
          Google Analytics may set the first-party cookies described above to measure
          site usage; we do not place advertising or cross-site tracking cookies. If we
          add advertising in the future, this policy will be updated first, and any ad
          network cookies will be described here.
        </p>

        <h2>Third-party services</h2>
        <p>
          The downloader depends on publicly exposed media endpoints of the source
          platforms (for example {PLATFORM_LIST}) to fetch the files you
          request, and we use Google Analytics as described above to measure site
          usage. Please review those platforms&rsquo; and Google&rsquo;s own privacy
          policies for how they handle requests to their services.
        </p>

        <h2>Your rights</h2>
        <p>
          Because we hold essentially no personal data, there is usually nothing to
          request or delete. {site.company} operates this site; if you have
          questions about this policy, contact us at{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          If we ever change how data is handled, this page will be updated and the date
          above revised. We encourage you to check back occasionally.
        </p>
      </Prose>
    </div>
  );
}