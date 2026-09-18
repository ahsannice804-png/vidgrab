export type Platform = "youtube" | "instagram" | "tiktok" | "facebook";

export interface DetectionResult {
  platform: Platform;
  id: string;
  url: string;
}

const YOUTUBE_YOUTU_BE = /^https?:\/\/(?:www\.)?youtu\.be\/([\w-]{11})\/?(?:[?#].*)?$/i;

const YOUTUBE_HOST =
  /^https?:\/\/(?:(?:www|m|music)\.)?(?:youtube\.com|youtube-nocookie\.com)\//i;

// Path-style IDs (shorts/embed/live/v) must tolerate everything real-world
// share links append after the ID: a trailing slash and a query string
// (YouTube's mobile app Shorts shares use ?si=..., web uses ?feature=share).
// The watch branch keeps its own query scanning up to v=.
const YOUTUBE_WATCH =
  /^https?:\/\/(?:(?:www|m|music)\.)?(?:youtube\.com|youtube-nocookie\.com)\/(?:watch\/?\?[^#]*\bv=([\w-]{11})|(?:shorts|embed|live|v)\/([\w-]{11}))(?:[/?#&].*)?$/i;

const INSTAGRAM_HOST = /^https?:\/\/(?:(?:www|m)\.)?instagram\.com\//i;

const INSTAGRAM_MEDIA =
  /^https?:\/\/(?:(?:www|m)\.)?instagram\.com\/(?:reel|reels|p|tv)\/([\w-]+)\/?(?:embed\/?)?(?:[?#].*)?$/i;

const TIKTOK_HOST = /^https?:\/\/(?:(?:www|vm|vt|m)\.)?tiktok\.com\//i;

const TIKTOK_VIDEO =
  /^https?:\/\/(?:(?:www|m)\.)?tiktok\.com\/@([\w.-]+)\/(video|photo)\/(\d+)/i;

const TIKTOK_SHORT = /^https?:\/\/(?:vm|vt)\.tiktok\.com\/[\w.-]+/i;

const TIKTOK_T = /^https?:\/\/(?:(?:www|m)\.)?tiktok\.com\/t\/[\w.-]+/i;

const FACEBOOK_HOST =
  /^https?:\/\/(?:(?:www|m|mobile)\.)?(?:facebook\.com|fb\.com)\//i;

const FB_WATCH_HOST = /^https?:\/\/fb\.watch\//i;

const FACEBOOK_WATCH =
  /^https?:\/\/(?:(?:www|m|mobile)\.)?facebook\.com\/watch\/?\?(?:[^#]*&)?v=(\d+)/i;

const FACEBOOK_VIDEO_PHP =
  /^https?:\/\/(?:(?:www|m|mobile)\.)?facebook\.com\/video\.php\/?\?(?:[^#]*&)?v=(\d+)/i;

const FACEBOOK_PHOTO_PHP =
  /^https?:\/\/(?:(?:www|m|mobile)\.)?facebook\.com\/photo\.php\/?\?(?:[^#]*&)?v=(\d+)/i;

const FACEBOOK_REEL =
  /^https?:\/\/(?:(?:www|m|mobile)\.)?facebook\.com\/reel\/([^/?#\s]+)/i;

const FACEBOOK_VIDEOS =
  /^https?:\/\/(?:(?:www|m|mobile)\.)?facebook\.com\/[^/?#\s]+\/videos\/([^/?#\s]+)/i;

const FACEBOOK_SHARE =
  /^https?:\/\/(?:(?:www|m|mobile)\.)?(?:facebook\.com|fb\.com)\/share\/([vr])\/([^/?#\s]+)/i;

const FACEBOOK_STORY_PHP = /^https?:\/\/(?:(?:www|m|mobile)\.)?facebook\.com\/story\.php\/?\?/i;

export const YOUTUBE_RE = YOUTUBE_HOST;
export const INSTAGRAM_RE = INSTAGRAM_HOST;
export const TIKTOK_RE = TIKTOK_HOST;
export const FACEBOOK_RE = FACEBOOK_HOST;

function parseYouTube(raw: string): DetectionResult | null {
  const trimmed = raw.trim();
  if (!YOUTUBE_HOST.test(trimmed) && !YOUTUBE_YOUTU_BE.test(trimmed)) return null;

  let id: string | undefined;
  const m1 = trimmed.match(YOUTUBE_WATCH);
  if (m1) id = m1[1] ?? m1[2];
  if (!id) {
    const m2 = trimmed.match(YOUTUBE_YOUTU_BE);
    if (m2) id = m2[1];
  }
  if (!id) return null;

  return {
    platform: "youtube",
    id,
    url: `https://www.youtube.com/watch?v=${id}`,
  };
}

function parseInstagram(raw: string): DetectionResult | null {
  const trimmed = raw.trim();
  if (!INSTAGRAM_HOST.test(trimmed)) return null;
  const m = trimmed.match(INSTAGRAM_MEDIA);
  if (!m) return null;
  return {
    platform: "instagram",
    id: m[1],
    url: `https://www.instagram.com/reel/${m[1]}/`,
  };
}

function parseTikTok(raw: string): DetectionResult | null {
  const trimmed = raw.trim();
  if (!TIKTOK_HOST.test(trimmed)) return null;

  let id: string | undefined;
  let url = trimmed;

  // Full tiktok.com/@user/video|photo/ID links (www, m or bare host) → canonical.
  const m = trimmed.match(TIKTOK_VIDEO);
  if (m) {
    id = m[3];
    url = `https://www.tiktok.com/@${m[1]}/${m[2]}/${m[3]}`;
  }

  // vm./vt. short codes and tiktok.com/t/ short codes → leave the link to be
  // resolved server-side (the redirect target is followed by the download
  // engine's short-link resolver before yt-dlp runs).
  if (!id) {
    if (!TIKTOK_SHORT.test(trimmed) && !TIKTOK_T.test(trimmed)) return null;
    id = trimmed.replace(/\/$/, "").split("/").pop() ?? "unknown";
  }

  return {
    platform: "tiktok",
    id,
    url,
  };
}

/**
 * Best-effort normalization of the FINAL URL a TikTok short link redirects to.
 *
 * When the redirect target is a real video/photo page we return the canonical
 * `https://www.tiktok.com/@user/video/ID` URL so yt-dlp is always handed the
 * primary format its extractor is built against. When the short link is dead,
 * logged-out, or redirects somewhere that isn't a video (homepage/login), we
 * return null and the caller falls back to the original link — letting yt-dlp
 * produce (and our error classifier surface) the honest failure instead of
 * silently claiming the video was removed.
 */
export function canonicalizeTikTokFinalUrl(finalUrl: string): string | null {
  try {
    const u = new URL(finalUrl);
    const host = u.hostname.toLowerCase();
    if (host !== "tiktok.com" && host !== "www.tiktok.com" && host !== "m.tiktok.com" && host !== "vm.tiktok.com" && host !== "vt.tiktok.com") {
      return null;
    }
    const m = u.pathname.match(/^\/@([\w.-]*)\/(video|photo)\/(\d+)/);
    if (!m) return null;
    // TikTok's redirect chain often drops the username (`/@/video/ID`), which
    // yt-dlp still accepts; keep whichever form the redirect provided.
    return `https://www.tiktok.com/@${m[1]}/${m[2]}/${m[3]}`;
  } catch {
    return null;
  }
}

function parseFacebook(raw: string): DetectionResult | null {
  const trimmed = raw.trim();
  if (!FACEBOOK_HOST.test(trimmed) && !FB_WATCH_HOST.test(trimmed)) return null;

  let id: string | undefined;
  let url: string | undefined;

  // facebook.com/watch?v=ID, video.php?v=ID and photo.php?v=ID → canonical watch URL
  const m1 = trimmed.match(FACEBOOK_WATCH);
  const m2 = trimmed.match(FACEBOOK_VIDEO_PHP);
  const m3 = trimmed.match(FACEBOOK_PHOTO_PHP);
  if (m1 || m2 || m3) {
    id = m1?.[1] ?? m2?.[1] ?? m3?.[1];
    url = `https://www.facebook.com/watch/?v=${id}`;
  }

  if (!id) {
    const share = trimmed.match(FACEBOOK_SHARE);
    if (share) {
      // facebook.com/share/v|r/ID — the newer "Share" button links generated by
      // the app/website. Like fb.watch links below, these redirect server-side
      // to the canonical video/reel, and the download engine resolves the page
      // to the real video. Keep the untouched link so the redirect is followed.
      id = `${share[1]}/${share[2]}`;
      url = trimmed;
    }
  }

  if (!id) {
    const reel = trimmed.match(FACEBOOK_REEL);
    if (reel) {
      id = reel[1];
      url = `https://www.facebook.com/reel/${id}`;
    }
  }

  if (!id) {
    const videos = trimmed.match(FACEBOOK_VIDEOS);
    if (videos) {
      // facebook.com/[page]/videos/[id] — keep the original URL so any sub-paths
      // (e.g. the trailing `/` or query string) are preserved for the extractor.
      id = videos[1];
      url = trimmed;
    }
  }

  if (!id) {
    // facebook.com/story.php?story_fbid=ID&id=USER — video posts shared via the
    // "Share" sheet. Keep the original URL; the extractor parses the fbid.
    const story = trimmed.match(FACEBOOK_STORY_PHP);
    const storyFbid = trimmed.match(/story_fbid=(\d+)/i);
    if (story && storyFbid) {
      id = storyFbid[1];
      url = trimmed;
    }
  }

  // fb.watch short links redirect to the real video. The download engine
  // resolves the redirect itself, so we hand it the untouched short link rather
  // than guessing.
  if (!id) {
    if (!FB_WATCH_HOST.test(trimmed)) return null;
    id = trimmed.replace(/\/+$/, "").split("/").pop() ?? "unknown";
    url = trimmed;
  }

  if (!id) return null;
  return { platform: "facebook", id, url: url! };
}

/**
 * Detects whether a pasted link is a YouTube video, an Instagram Reel/post,
 * a TikTok video, or a Facebook video. Returns null when we cannot
 * confidently classify the URL.
 */
export function detectPlatform(raw: string): DetectionResult | null {
  if (!raw || typeof raw !== "string") return null;
  const parsed =
    parseYouTube(raw) ??
    parseInstagram(raw) ??
    parseTikTok(raw) ??
    parseFacebook(raw);
  if (!parsed) return null;
  if (typeof URL !== "undefined") {
    try {
      const u = new URL(raw.trim());
      if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    } catch {
      return null;
    }
  }
  return parsed;
}

export const VIDEO_ID_LABEL: Record<Platform, string> = {
  youtube: "YouTube video",
  instagram: "Instagram Reel or post",
  tiktok: "TikTok video",
  facebook: "Facebook video",
};