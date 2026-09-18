import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Keep the binary-carrying dependencies external in route handlers so their
  // bundled binaries stay resolvable from node_modules inside the serverless
  // function (bundling their JS would break the resolved binary paths).
  serverExternalPackages: ["@ffmpeg-installer/ffmpeg", "yt-dlp-exec"],
  // Guarantee the platform binaries are included in the route handlers' file
  // traces so they ship inside the Vercel Serverless Function artifact.
  outputFileTracingIncludes: {
    "/api/**/*": [
      "./node_modules/yt-dlp-exec/bin/**/*",
      "./node_modules/@ffmpeg-installer/**/*",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // YouTube video thumbnails
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "i9.ytimg.com" },
      { protocol: "https", hostname: "youtube.com" },
      // Instagram / Facebook CDN media (thumbnails + previews)
      { protocol: "https", hostname: "cdninstagram.com" },
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
      // TikTok CDN media (thumbnails use rotating region/number subdomains
      // like p16-common-sign, p16-sign-va, p19-sign, etc.)
      { protocol: "https", hostname: "**.tiktokcdn.com" },
      { protocol: "https", hostname: "**.tiktokcdn-us.com" },
    ],
  },
};

export default nextConfig;