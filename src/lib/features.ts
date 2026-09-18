/**
 * Global feature flags — the single switch for showing or hiding a platform.
 *
 * `TIKTOK_ENABLED` controls every user-facing mention of TikTok: the nav link,
 * the homepage tool card and FAQ, the input placeholder, the
 * /tiktok-video-downloader page and the sitemap. TikTok's download support is
 * NOT removed — the yt-dlp engine, URL detection regex and API handling are all
 * untouched — so flipping this one value is the only change needed to restore
 * or hide the TikTok UI.
 *
 * Default is `false` because the upstream yt-dlp TikTok extractor is
 * temporarily broken (yt-dlp issue #17604).
 *
 * To re-enable, set `NEXT_PUBLIC_TIKTOK_ENABLED=true` (in the environment,
 * .env.local, or the Docker build args) and rebuild. The `NEXT_PUBLIC_` prefix
 * is required because parts of the UI (nav, download input) run in the browser.
 */
export const TIKTOK_ENABLED = process.env.NEXT_PUBLIC_TIKTOK_ENABLED === "true";

/** Shown when a TikTok link is pasted while TikTok is disabled. */
export const TIKTOK_DISABLED_MESSAGE =
  "TikTok support is temporarily unavailable — we're working on it. Try YouTube, Instagram, or Facebook in the meantime.";

/** "YouTube, Instagram, TikTok or Facebook" / "YouTube, Instagram or Facebook". */
export const PLATFORM_LIST = TIKTOK_ENABLED
  ? "YouTube, Instagram, TikTok or Facebook"
  : "YouTube, Instagram or Facebook";
