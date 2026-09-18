import test from "node:test";
import assert from "node:assert/strict";

import { canonicalizeTikTokFinalUrl, detectPlatform } from "./detection.ts";

interface Case {
  url: string;
  platform: "youtube" | "instagram" | "tiktok" | "facebook" | null;
  id?: string;
  canonical?: string;
}

const YT = "dQw4w9WgXcQ";

const CASES: Case[] = [
  // ---- YouTube (every known real-world format) ---------------------------
  { url: `https://www.youtube.com/watch?v=${YT}`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://youtube.com/watch?v=${YT}`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://m.youtube.com/watch?v=${YT}`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://music.youtube.com/watch?v=${YT}`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://youtu.be/${YT}`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://www.youtube.com/shorts/${YT}`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://youtube.com/shorts/${YT}`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://m.youtube.com/shorts/${YT}`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://www.youtube.com/shorts/${YT}/`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://youtube.com/shorts/${YT}?si=abc123`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://www.youtube.com/shorts/${YT}?feature=share`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://m.youtube.com/shorts/${YT}/?si=abc123`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://music.youtube.com/shorts/${YT}`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://www.youtube.com/live/${YT}`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://www.youtube.com/live/${YT}?feature=share`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://www.youtube.com/live/${YT}/`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://www.youtube.com/embed/${YT}`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://www.youtube.com/embed/${YT}?start=5`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://www.youtube-nocookie.com/embed/${YT}`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://www.youtube.com/watch?v=${YT}&t=42s&feature=share`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://www.youtube.com/watch/?v=${YT}`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://youtu.be/${YT}/`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },
  { url: `https://youtu.be/${YT}?t=5`, platform: "youtube", id: YT, canonical: `https://www.youtube.com/watch?v=${YT}` },

  // ---- Instagram ---------------------------------------------------------
  { url: "https://www.instagram.com/p/CabcDEF123/", platform: "instagram", id: "CabcDEF123", canonical: "https://www.instagram.com/reel/CabcDEF123/" },
  { url: "https://instagram.com/reel/CabcDEF123/", platform: "instagram", id: "CabcDEF123", canonical: "https://www.instagram.com/reel/CabcDEF123/" },
  { url: "https://m.instagram.com/reels/CabcDEF123", platform: "instagram", id: "CabcDEF123", canonical: "https://www.instagram.com/reel/CabcDEF123/" },
  { url: "https://www.instagram.com/tv/CabcDEF123/", platform: "instagram", id: "CabcDEF123", canonical: "https://www.instagram.com/reel/CabcDEF123/" },
  { url: "https://www.instagram.com/reel/CabcDEF123/?utm_source=ig_web_copy_link", platform: "instagram", id: "CabcDEF123", canonical: "https://www.instagram.com/reel/CabcDEF123/" },
  { url: "https://www.instagram.com/reels/CabcDEF123", platform: "instagram", id: "CabcDEF123", canonical: "https://www.instagram.com/reel/CabcDEF123/" },
  { url: "https://www.instagram.com/reels/CabcDEF123/?igsh=abc", platform: "instagram", id: "CabcDEF123", canonical: "https://www.instagram.com/reel/CabcDEF123/" },
  { url: "https://www.instagram.com/reel/CabcDEF123/embed/", platform: "instagram", id: "CabcDEF123", canonical: "https://www.instagram.com/reel/CabcDEF123/" },

  // ---- TikTok ------------------------------------------------------------
  { url: "https://www.tiktok.com/@scout2015/video/6718335390845095173", platform: "tiktok", id: "6718335390845095173", canonical: "https://www.tiktok.com/@scout2015/video/6718335390845095173" },
  { url: "https://tiktok.com/@scout2015/video/6718335390845095173", platform: "tiktok", id: "6718335390845095173", canonical: "https://www.tiktok.com/@scout2015/video/6718335390845095173" },
  { url: "https://m.tiktok.com/@scout2015/video/6718335390845095173", platform: "tiktok", id: "6718335390845095173", canonical: "https://www.tiktok.com/@scout2015/video/6718335390845095173" },
  { url: "https://www.tiktok.com/@scout2015/photo/6718335390845095173", platform: "tiktok", id: "6718335390845095173", canonical: "https://www.tiktok.com/@scout2015/photo/6718335390845095173" },
  { url: "https://vm.tiktok.com/ZMabcdef/", platform: "tiktok", id: "ZMabcdef", canonical: "https://vm.tiktok.com/ZMabcdef/" },
  { url: "https://vt.tiktok.com/ZSqsekA3N/", platform: "tiktok", id: "ZSqsekA3N", canonical: "https://vt.tiktok.com/ZSqsekA3N/" },
  { url: "https://www.tiktok.com/t/ZTabcdef/", platform: "tiktok", id: "ZTabcdef", canonical: "https://www.tiktok.com/t/ZTabcdef/" },
  { url: "https://m.tiktok.com/t/ZTabcdef/", platform: "tiktok", id: "ZTabcdef", canonical: "https://m.tiktok.com/t/ZTabcdef/" },

  // ---- Facebook ----------------------------------------------------------
  { url: "https://www.facebook.com/watch/?v=1234567890", platform: "facebook", id: "1234567890", canonical: "https://www.facebook.com/watch/?v=1234567890" },
  { url: "https://www.facebook.com/watch?v=1234567890", platform: "facebook", id: "1234567890", canonical: "https://www.facebook.com/watch/?v=1234567890" },
  { url: "https://m.facebook.com/watch/?v=1234567890", platform: "facebook", id: "1234567890", canonical: "https://www.facebook.com/watch/?v=1234567890" },
  { url: "https://www.facebook.com/video.php?v=1234567890", platform: "facebook", id: "1234567890", canonical: "https://www.facebook.com/watch/?v=1234567890" },
  { url: "https://www.facebook.com/photo.php?v=1234567890", platform: "facebook", id: "1234567890", canonical: "https://www.facebook.com/watch/?v=1234567890" },
  { url: "https://www.facebook.com/reel/1234567890", platform: "facebook", id: "1234567890", canonical: "https://www.facebook.com/reel/1234567890" },
  { url: "https://www.facebook.com/somepage/videos/1234567890/", platform: "facebook", id: "1234567890", canonical: "https://www.facebook.com/somepage/videos/1234567890/" },
  { url: "https://www.facebook.com/share/v/ABCdef123/", platform: "facebook", id: "v/ABCdef123", canonical: "https://www.facebook.com/share/v/ABCdef123/" },
  { url: "https://www.facebook.com/share/r/ABCdef123/", platform: "facebook", id: "r/ABCdef123", canonical: "https://www.facebook.com/share/r/ABCdef123/" },
  { url: "https://fb.watch/abcDEF/", platform: "facebook", id: "abcDEF", canonical: "https://fb.watch/abcDEF/" },
  { url: "https://www.facebook.com/story.php?story_fbid=1234567890&id=987654321", platform: "facebook", id: "1234567890", canonical: "https://www.facebook.com/story.php?story_fbid=1234567890&id=987654321" },

  // ---- Malformed / unsupported (must NOT be classified) ------------------
  { url: "", platform: null },
  { url: "not a url", platform: null },
  { url: "ftp://youtube.com/watch?v=" + YT, platform: null },
  { url: "https://example.com/watch?v=" + YT, platform: null },
  { url: "https://www.youtube.com/@somechannel", platform: null },
  { url: "https://vm.tiktok.com/", platform: null },
  { url: "https://www.tiktok.com/@user", platform: null },
  { url: "https://www.tiktok.com/foryou", platform: null },
  { url: "https://www.instagram.com/explore/tags/cats/", platform: null },
  { url: "https://www.facebook.com/somepage", platform: null },
  { url: "javascript:alert(1)", platform: null },
];

for (const c of CASES) {
  test(`detectPlatform(${JSON.stringify(c.url)})`, () => {
    const result = detectPlatform(c.url);
    if (c.platform === null) {
      assert.equal(result, null, `expected no detection for ${c.url}`);
      return;
    }
    assert.ok(result, `expected a detection for ${c.url}`);
    assert.equal(result.platform, c.platform);
    if (c.id !== undefined) assert.equal(result.id, c.id);
    if (c.canonical !== undefined) assert.equal(result.url, c.canonical);
  });
}

test("canonicalizeTikTokFinalUrl normalizes redirect targets", () => {
  assert.equal(
    canonicalizeTikTokFinalUrl("https://www.tiktok.com/@user/video/123?lang=en&is_copy_url=1"),
    "https://www.tiktok.com/@user/video/123",
  );
  assert.equal(
    canonicalizeTikTokFinalUrl("https://m.tiktok.com/@user/photo/123"),
    "https://www.tiktok.com/@user/photo/123",
  );
  assert.equal(
    canonicalizeTikTokFinalUrl("https://www.tiktok.com/@/video/7686107004850490638?_r=1&_t=ZS-99"),
    "https://www.tiktok.com/@/video/7686107004850490638",
  );
  assert.equal(canonicalizeTikTokFinalUrl("https://www.tiktok.com/foryou"), null);
  assert.equal(
    canonicalizeTikTokFinalUrl("https://www.tiktok.com/login?redirect_url=%2F%40user%2Fvideo%2F123"),
    null,
  );
  assert.equal(canonicalizeTikTokFinalUrl("https://www.tiktok.com/"), null);
  assert.equal(canonicalizeTikTokFinalUrl("https://example.com/@user/video/123"), null);
  assert.equal(canonicalizeTikTokFinalUrl("not a url"), null);
});