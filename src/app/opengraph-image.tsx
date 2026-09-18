import { ImageResponse } from "next/og";
import { getHomeSeo } from "@/lib/seo";
import { site, siteTagline } from "@/lib/site";
import { TIKTOK_ENABLED } from "@/lib/features";

export const alt = TIKTOK_ENABLED
  ? `${site.name} — free YouTube, Instagram, TikTok & Facebook downloader`
  : `${site.name} — free YouTube, Instagram & Facebook downloader`;
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default async function OpenGraphImage() {
  const seo = getHomeSeo();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #6d28d9 100%)",
          color: "#fff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #8b5cf6, #4f46e5)",
              fontSize: 30,
            }}
          >
            ⬇
          </div>
          <div style={{ fontSize: 34, fontWeight: 700 }}>{site.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              alignSelf: "flex-start",
              padding: "10px 22px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.35)",
              fontSize: 24,
            }}
          >
            Free · No sign-up · No watermark
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: 880,
            }}
          >
            {seo.h1}
          </div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.85)", maxWidth: 820 }}>
            {seo.subtitle}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 22, color: "rgba(255,255,255,0.7)" }}>
          {siteTagline}
        </div>
      </div>
    ),
    size,
  );
}