import { PageHeader, Prose, simpleMetadata } from "@/components/page-ui";
import JsonLd from "@/components/JsonLd";
import { getSeo } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";
import { PLATFORM_LIST } from "@/lib/features";

export const metadata = {
  ...simpleMetadata(getSeo("privacy").title, getSeo("privacy").description),
  alternates: { canonical: "/privacy-policy" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Privacy Policy",
  url: absoluteUrl("/privacy-policy"),
  isPartOf: { "@type": "WebSite", name: site.name },
};

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHeader title="Privacy Policy" subtitle="Last updated: October 20, 2026" />
      <PageContent />
    </>
  );
}

function PageContent() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
      <Prose>
        <p>
          This policy explains what information {site.name} ({absoluteUrl("/")}) collects,
          how it is used, which third parties are involved, and the choices you have. The
          site is operated by {site.company}. If you have any questions, email us at{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>

        <h2>What we collect when you use the downloader</h2>
        <p>
          We don&rsquo;t ask you to create an account and we don&rsquo;t ask for your name,
          email address or social media logins. When you paste a link, we process that
          link only to fetch the video or audio you requested from the source platform
          ({PLATFORM_LIST}).
        </p>

        <h2>How long downloaded files are kept</h2>
        <p>
          To deliver a file, our server prepares it in temporary storage. Prepared files
          are kept only long enough for your browser to fetch them, at most about 35
          minutes after the request, and are then deleted automatically. We do not keep
          a library of downloaded videos or audio, and we do not link downloaded files
          to any information about you.
        </p>

        <h2>Technical and security data</h2>
        <p>
          Like any website, our server receives basic request information such as your
          IP address, browser type and the time of each request. We use your IP address
          to apply rate limits, which stop one visitor from overloading the service;
          these rate-limit counters are kept in memory for a few minutes and are not
          stored permanently. Our hosting infrastructure may also keep standard server
          logs for security and troubleshooting. We do not sell this data.
        </p>

        <h2>Analytics: Google Analytics</h2>
        <p>
          We use Google Analytics 4, provided by Google LLC, to understand in aggregate
          how the site is used, for example which pages are visited and which devices
          and browsers people use. Google Analytics collects information such as pages
          viewed, approximate location derived from your IP address, and device and
          browser details. We have turned off Google signals for this property.
        </p>
        <p>
          Google Analytics uses first-party cookies (such as <em>_ga</em> and{" "}
          <em>_ga_&lt;container-id&gt;</em>) to distinguish visitors. You can learn how
          Google uses this information in{" "}
          <Ext href="https://policies.google.com/technologies/partner-sites">
            How Google uses information from sites or apps that use its services
          </Ext>
          . To opt out of Google Analytics on all websites, install the{" "}
          <Ext href="https://tools.google.com/dlpage/gaoptout">
            Google Analytics opt-out browser add-on
          </Ext>
          .
        </p>

        <h2>Advertising and advertising cookies</h2>
        <p>
          {site.name} is free to use and is supported by advertising. We use, or may use,
          the following advertising providers:
        </p>
        <ul>
          <li>
            <strong>Google AdSense</strong>, provided by Google LLC.
          </li>
          <li>
            <strong>Adsterra</strong> (
            <Ext href="https://adsterra.com/privacy-policy/">Adsterra privacy policy</Ext>).
          </li>
        </ul>
        <p>
          Third-party vendors, including Google, use cookies to serve ads based on your
          prior visits to this website or other websites. Google&rsquo;s use of advertising
          cookies enables it and its partners to serve ads to you based on your visits
          to this site and/or other sites on the internet. Other third-party vendors and
          ad networks may also use cookies, web beacons and similar technologies to
          serve and measure ads on this site.
        </p>
        <p>
          <strong>How to opt out of personalised advertising:</strong>
        </p>
        <ul>
          <li>
            Opt out of personalised advertising from Google by visiting{" "}
            <Ext href="https://adssettings.google.com/">Google Ads Settings</Ext>.
          </li>
          <li>
            Opt out of some third-party vendors&rsquo; use of cookies for personalised
            advertising at{" "}
            <Ext href="https://www.aboutads.info/choices/">www.aboutads.info</Ext>.
          </li>
          <li>
            If you are in the European Economic Area or the United Kingdom, you can also
            use{" "}
            <Ext href="https://www.youronlinechoices.eu/">Your Online Choices</Ext>.
          </li>
          <li>
            You can block or delete cookies in your browser settings. Blocking
            advertising cookies means you will still see ads, but they will be less
            relevant to you.
          </li>
        </ul>
        <p>
          More information about how Google uses data in its advertising products is
          available in{" "}
          <Ext href="https://policies.google.com/technologies/ads">Google&rsquo;s advertising policies</Ext>
          .
        </p>

        <h2>Other storage on your device</h2>
        <p>
          We store one preference in your browser&rsquo;s local storage: whether you chose
          the light or dark theme. It never leaves your device.
        </p>

        <h2>Third-party platforms</h2>
        <p>
          To fetch the files you request, our server contacts the source platform
          ({PLATFORM_LIST}). Those requests come from our server, not from your
          browser, and do not include information about you beyond the link you
          pasted. The platforms&rsquo; own privacy policies govern how they handle requests
          to their services.
        </p>

        <h2>Children</h2>
        <p>
          The site is not directed at children under 13, and we do not knowingly
          collect personal information from children.
        </p>

        <h2>Your rights</h2>
        <p>
          Depending on where you live, you may have rights to access, correct or delete
          personal data held about you, or to object to certain processing. Because we
          don&rsquo;t hold accounts or profiles, we usually have nothing that identifies you
          personally. For data collected by Google Analytics or by advertising partners,
          use the opt-out options above or contact those providers directly. For anything
          else, email <a href={`mailto:${site.email}`}>{site.email}</a> and we will
          respond.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          If we change how data is handled, for example by adding or removing an
          advertising or analytics provider, we will update this page and the date at
          the top.
        </p>

        <h2>Contact</h2>
        <p>
          {site.company} &middot; <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
      </Prose>
    </div>
  );
}
