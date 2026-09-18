import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/tmp/"],
    },
    sitemap: `${getBaseUrl()}/sitemap.xml`,
    host: getBaseUrl().replace(/^https?:\/\//, ""),
  };
}