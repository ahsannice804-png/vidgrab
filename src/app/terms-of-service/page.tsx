import Link from "next/link";
import { PageHeader, Prose, simpleMetadata } from "@/components/page-ui";
import JsonLd from "@/components/JsonLd";
import { getSeo } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";

export const metadata = simpleMetadata(getSeo("terms").title, getSeo("terms").description);

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Terms of Service",
  url: absoluteUrl("/terms-of-service"),
  isPartOf: { "@type": "WebSite", name: site.name },
};

export default function TermsPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHeader title="Terms of Service" subtitle="Last updated: September 17, 2026" />
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <Prose>
          <h2>1. The service</h2>
          <p>
            {site.name} is a free online tool that helps you download publicly available
            media from supported platforms. We do not host, own or store any of the
            files you download through the service.
          </p>

          <h2>2. Acceptable use</h2>
          <p>You agree to use the service only for lawful purposes and only for content:</p>
          <ul>
            <li>that you own, or</li>
            <li>that you have the right or permission to save, or</li>
            <li>that is licensed for free use (such as open-license or public-domain content).</li>
          </ul>
          <p>
            The service is intended for personal, non-commercial use. You are solely
            responsible for how you use downloaded files. We are not liable for any
            misuse of the service or for content downloaded through it.
          </p>

          <h2>3. No warranties</h2>
          <p>
            The service is provided “as is” and “as available” without warranties of any
            kind, express or implied. While we work hard to keep it fast and reliable,
            we do not guarantee uninterrupted availability, and availability of any
            specific video depends on the source platform.
          </p>

          <h2>4. Limitation of liability</h2>
          <p>
            {site.name} is operated by {site.company}. To the maximum extent
            permitted by law, {site.company} is not liable for any indirect,
            incidental or consequential damages arising from your use of the
            service.
          </p>

          <h2>5. Rate limits and abuse</h2>
          <p>
            To keep the service free and fast for everyone, we enforce reasonable rate
            limits per visitor. Automated scraping, bulk downloading or any attempt to
            disrupt the service may result in temporary or permanent blocking.
          </p>

          <h2>6. Intellectual property</h2>
          <p>
            The {site.name} name, logo and website design are the property of {site.company}. All platform
            names and logos (such as YouTube, Instagram, TikTok and Facebook) belong to their
            respective owners and are used only to describe compatibility.
          </p>

          <h2>7. Copyright and takedowns</h2>
          <p>
            All downloaded media remains the property of its original owner, creator or
            copyright holder. {site.name} does not host, own, redistribute or store any
            of the content that passes through the service — it only converts and
            delivers publicly accessible links that you provide. Your use of
            downloaded files must respect the rights of the content owner.
          </p>
          <p>
            If you believe the service is being used to download content in violation
            of your copyright, please email us at{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a> with the exact URL(s)
            involved and your ownership details. We will review each request promptly
            and, where appropriate, take reasonable steps to block the offending
            content.
          </p>

          <h2>8. Changes</h2>
          <p>
            We may update these terms from time to time. Continued use of the service
            after changes are posted means you accept the updated terms.
          </p>

          <h2>9. Contact</h2>
          <p>
            Questions about these terms? Reach us at{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a> or via the{" "}
            <Link href="/contact">contact page</Link>.
          </p>
        </Prose>
      </div>
    </>
  );
}