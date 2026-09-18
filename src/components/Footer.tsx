import Link from "next/link";
import Logo from "./Logo";
import { site, siteDescription } from "@/lib/site";
import { TIKTOK_ENABLED } from "@/lib/features";

const PRODUCT = [
  { href: "/youtube-video-downloader", label: "YouTube Video Downloader" },
  { href: "/instagram-reels-downloader", label: "Instagram Reel Downloader" },
  ...(TIKTOK_ENABLED
    ? [{ href: "/tiktok-video-downloader", label: "TikTok Video Downloader" }]
    : []),
  { href: "/facebook-video-downloader", label: "Facebook Video Downloader" },
];

const COMPANY = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

const LEGAL = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto w-full max-w-6xl px-4 pb-5 pt-7 sm:px-6 sm:pb-12 sm:pt-14">
        <div>
          <Logo />
          <p className="mt-2 max-w-xs text-[13px] leading-5 text-muted sm:mt-4 sm:text-sm sm:leading-6">
            {siteDescription}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 sm:mt-8 sm:grid-cols-3 sm:gap-8">
          <nav aria-label="Tools">
            <h2 className="text-[13px] font-semibold tracking-wide">Tools</h2>
            <ul className="mt-2 space-y-1">
              {PRODUCT.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-[13px] leading-snug text-muted transition-colors hover:text-foreground sm:text-sm">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h2 className="text-[13px] font-semibold tracking-wide">Company</h2>
            <ul className="mt-2 space-y-1">
              {COMPANY.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-[13px] leading-snug text-muted transition-colors hover:text-foreground sm:text-sm">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal" className="col-span-2 sm:col-span-1">
            <h2 className="text-[13px] font-semibold tracking-wide">Legal</h2>
            <ul className="mt-2 space-y-1">
              {LEGAL.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-[13px] leading-snug text-muted transition-colors hover:text-foreground sm:text-sm">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-5 border-t border-border pt-3.5 text-xs leading-5 text-muted sm:mt-12 sm:pt-6">
          <p>
            © {year} {site.name}. All rights reserved. Powered by{" "}
            <a href={`mailto:${site.email}`} className="font-medium text-foreground underline underline-offset-2 transition-colors hover:text-violet-600">
              {site.company}
            </a>
            {" "}· <a href={`mailto:${site.email}`} className="underline underline-offset-2 transition-colors hover:text-violet-600">{site.email}</a>
          </p>
          <p className="mt-1.5 max-w-3xl sm:mt-2">
            Download only content you have the right to save. {site.name} does
            not host any videos and simply helps you fetch files that the
            source platform publicly exposes.{" "}
            {TIKTOK_ENABLED
              ? "YouTube, Instagram, TikTok, Facebook"
              : "YouTube, Instagram, Facebook"}{" "}
            and all logos are trademarks of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}