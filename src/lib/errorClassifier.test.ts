import test from "node:test";
import assert from "node:assert/strict";

import { classifyYtDlpError } from "./errorClassifier.ts";

interface Case {
  label: string;
  stderr: string;
  code: string;
}

const CASES: Case[] = [
  // Privacy
  { label: "private video", stderr: "ERROR: Private video. Sign in if you've been granted access", code: "PRIVATE" },

  // Login required
  { label: "facebook login wall", stderr: "ERROR: [facebook] You must log in to continue", code: "LOGIN_REQUIRED" },
  { label: "login to view", stderr: "ERROR: [instagram] You need to log in to view this", code: "LOGIN_REQUIRED" },
  { label: "tiktok login redirect", stderr: "ERROR: [TikTok] TikTok is requiring login for access to this content. Use --cookies-from-browser", code: "LOGIN_REQUIRED" },
  { label: "registered users only", stderr: "ERROR: [TikTok] This video is only available for registered users", code: "LOGIN_REQUIRED" },

  // Age / bot / region
  { label: "youtube bot check", stderr: "ERROR: [youtube] Sign in to confirm you're not a bot", code: "RESTRICTED" },
  { label: "age restricted", stderr: "ERROR: [youtube] This video is age-restricted", code: "RESTRICTED" },

  // Deleted / not found
  { label: "post not found", stderr: "ERROR: [instagram] Post not found", code: "NOT_FOUND" },
  { label: "expired share link", stderr: "ERROR: The link you followed may have expired", code: "NOT_FOUND" },
  { label: "insta unavailable page", stderr: "ERROR: [instagram] Sorry, this page isn't available", code: "NOT_FOUND" },

  // Network / transport
  { label: "http 503", stderr: "ERROR: Unable to download webpage: HTTP Error 503: Service Unavailable", code: "NETWORK_ERROR" },
  { label: "dns failure", stderr: "ERROR: Unable to download webpage: <urlopen error [Errno -3] Temporary failure in name resolution>", code: "NETWORK_ERROR" },
  { label: "connection refused", stderr: "ERROR: Unable to connect: Connection refused", code: "NETWORK_ERROR" },
  { label: "socket timeout", stderr: "ERROR: socket timed out while reading data", code: "NETWORK_ERROR" },

  // Rate limited
  { label: "http 429", stderr: "ERROR: Unable to download webpage: HTTP Error 429: Too Many Requests", code: "RATE_LIMITED" },
  { label: "rate limit text", stderr: "ERROR: rate limited, try again later", code: "RATE_LIMITED" },

  // Extractor / processing
  { label: "unable to extract", stderr: "ERROR: [tiktok] Unable to extract video data", code: "EXTRACTOR_ERROR" },
  { label: "tiktok feed failure", stderr: "ERROR: [TikTok] Unable to find video in the feed. This might be a private video", code: "EXTRACTOR_ERROR" },
  { label: "tiktok status code", stderr: "ERROR: [TikTok] Video not available, status code 10204", code: "EXTRACTOR_ERROR" },
  { label: "no video formats", stderr: "ERROR: [tiktok] No video formats found", code: "EXTRACTOR_ERROR" },
  { label: "unsupported url", stderr: "ERROR: Unsupported URL: https://www.tiktok.com/@u/video/1", code: "UNSUPPORTED_PLATFORM" },

  // Extractor outdated (platform changed its page — needs a yt-dlp update)
  {
    label: "tiktok unexpected webpage response",
    stderr:
      "ERROR: [TikTok] 7683866088190332163: Unexpected response from webpage request; please report this issue on https://github.com/yt-dlp/yt-dlp/issues, filling out the appropriate issue template. Confirm you are on the latest version using yt-dlp -U",
    code: "EXTRACTOR_OUTDATED",
  },
  {
    label: "yt-dlp page-structure break (non-TikTok)",
    stderr:
      "ERROR: [youtube] Unexpected response from webpage request; please report this issue on https://github.com/yt-dlp/yt-dlp/issues?q=",
    code: "EXTRACTOR_OUTDATED",
  },
  {
    label: "ig login wall is NOT extractor-outdated",
    stderr:
      "ERROR: [Instagram] C1Bf4tOPVqv: Instagram sent an empty media response. Check if this post is accessible in your browser without being logged-in. If it is not, then use --cookies-from-browser or --cookies for the authentication. See https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp for how to manually pass cookies. Otherwise, if the post is accessible in browser without being logged-in, please report this issue on https://github.com/yt-dlp/yt-dlp/issues?q=",
    code: "EXTRACTOR_ERROR",
  },

  {
    label: "youtube nsig extraction failed",
    stderr:
      "ERROR: [youtube] dQw4w9WgXcQ: nsig extraction failed: You may experience throttling for some formats. Please report this issue on https://github.com/yt-dlp/yt-dlp/issues",
    code: "EXTRACTOR_OUTDATED",
  },
  {
    label: "youtube bare error 429",
    stderr: "ERROR: [youtube] dQw4w9WgXcQ: Error 429: The request could not be fulfilled (blocked)",
    code: "NETWORK_ERROR",
  },
  { label: "youtube throttled", stderr: "ERROR: [youtube] dQw4w9WgXcQ: YouTube said: Throttled", code: "NETWORK_ERROR" },

  // Genuine platform unavailability
  { label: "video unavailable", stderr: "ERROR: [tiktok] Video unavailable", code: "UNAVAILABLE" },
  { label: "this video is unavailable", stderr: "ERROR: This video is unavailable", code: "UNAVAILABLE" },
  { label: "removed", stderr: "ERROR: This video has been removed", code: "UNAVAILABLE" },
  { label: "temporarily unavailable", stderr: "ERROR: [instagram] Video is temporarily unavailable", code: "UNAVAILABLE" },
];

for (const c of CASES) {
  test(`classify: ${c.label}`, () => {
    const result = classifyYtDlpError({ stderr: c.stderr, exitCode: 1 });
    assert.equal(result.code, c.code, `stderr: ${c.stderr}`);
    assert.ok(result.reason.length > 0);
  });
}

test("classify: fallback is never UNAVAILABLE or NOT_FOUND", () => {
  const result = classifyYtDlpError({
    stderr: "ERROR: [tiktok] some brand new failure mode we have never seen",
    exitCode: 1,
  });
  assert.equal(result.code, "EXTRACTOR_ERROR");
});

test("classify: empty stderr is INTERNAL, not a video claim", () => {
  const result = classifyYtDlpError({ stderr: "", exitCode: 1 });
  assert.equal(result.code, "INTERNAL");
});

test("classify: reason is the last meaningful stderr line", () => {
  const result = classifyYtDlpError({
    stderr: "WARNING: something\n[download] 42%\nERROR: Video unavailable",
    exitCode: 1,
  });
  assert.equal(result.code, "UNAVAILABLE");
  assert.equal(result.reason, "ERROR: Video unavailable");
});

test("classify: network failure wins over embedded 'unavailable' text", () => {
  const result = classifyYtDlpError({
    stderr: "ERROR: Unable to download webpage: HTTP Error 502: Bad Gateway\nService temporarily unavailable",
    exitCode: 1,
  });
  assert.equal(result.code, "NETWORK_ERROR");
});