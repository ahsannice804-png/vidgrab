// The ApiErrorCode union is the single source of truth defined in
// errorClassifier.ts (so the classifier can be imported standalone by tests).
// This module re-exports it and owns the user-facing copy.
import type { ApiErrorCode } from "./errorClassifier";
import { TIKTOK_ENABLED } from "./features";

export type { ApiErrorCode };

export const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  INVALID_URL: TIKTOK_ENABLED
    ? "That doesn\u2019t look like a valid link. Please paste a full YouTube, Instagram, TikTok or Facebook URL."
    : "That doesn\u2019t look like a valid link. Please paste a full YouTube, Instagram or Facebook URL.",
  UNSUPPORTED_PLATFORM: TIKTOK_ENABLED
    ? "We currently support YouTube videos, Instagram Reels/posts, TikTok videos and Facebook videos."
    : "We currently support YouTube videos, Instagram Reels/posts and Facebook videos.",
  WRONG_PLATFORM:
    "This link belongs to a different platform. Paste the correct link for the page you\u2019re on.",
  PRIVATE: "This video is private — only the owner can access it.",
  LOGIN_REQUIRED:
    "This video requires login access and can\u2019t be downloaded.",
  RESTRICTED:
    "This video is age-restricted or region-locked, so we can\u2019t download it.",
  UNAVAILABLE:
    "This video is unavailable right now. It may have been removed or is still processing.",
  NOT_FOUND:
    "We couldn\u2019t find this content. It may have been deleted or the link is incomplete.",
  TIMEOUT:
    "The request took too long. Please try again — servers may be busy right now.",
  TOOLS_MISSING:
    "The download engine isn\u2019t ready yet. Please try again in a few minutes.",
  DOWNLOAD_FAILED:
    "The download failed. Please try again, or pick a different quality.",
  RATE_LIMITED:
    "You\u2019ve made a few requests too quickly. Please wait a moment and try again.",
  NETWORK_ERROR:
    "We couldn\u2019t reach the video\u2019s servers right now. This is usually temporary — please try again in a moment.",
  EXTRACTOR_ERROR:
    "We couldn\u2019t process this video right now. Please try again, or try pasting the link in a different format.",
  EXTRACTOR_OUTDATED:
    "This platform\u2019s downloader needs an update \u2014 please try again later or contact support.",
  INTERNAL: "Something went wrong on our side. Please try again in a moment.",
};