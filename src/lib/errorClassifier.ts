// Canonical set of user-facing failure buckets. Every failure that can reach a
// user (API routes and download jobs) must resolve to exactly one of these so
// the message a user sees always reflects the real cause — never a catch-all.
export type ApiErrorCode =
  | "INVALID_URL"
  | "UNSUPPORTED_PLATFORM"
  | "WRONG_PLATFORM"
  | "PRIVATE"
  | "LOGIN_REQUIRED"
  | "RESTRICTED"
  | "UNAVAILABLE"
  | "NOT_FOUND"
  | "TIMEOUT"
  | "TOOLS_MISSING"
  | "DOWNLOAD_FAILED"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "EXTRACTOR_ERROR"
  | "EXTRACTOR_OUTDATED"
  | "INTERNAL";

export interface YtDlpFailureInput {
  /** Raw combined stderr produced by yt-dlp (never empty for a real failure). */
  stderr: string;
  /** Process exit code; null when the process was killed externally. */
  exitCode: number | null;
}

export interface YtDlpFailureClassification {
  /** The user-facing bucket this failure belongs to. */
  code: ApiErrorCode;
  /** A short, human-readable line describing the actual underlying error. */
  reason: string;
}

function lastErrorLine(stderr: string): string {
  const lines = stderr
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines[lines.length - 1] ?? "Unknown error";
}

// Classification order is significant: more specific matches must come first so
// a single stderr blob (which often contains several yt-dlp lines) is mapped to
// the most accurate bucket.
//
// Notable ordering rule: the NETWORK_ERROR matchers run BEFORE the
// UNAVAILABLE matchers. An "HTTP Error 5xx / couldn't connect / timed out"
// failure must never be reported to the user as "this video was removed" —
// those are opposite problems with opposite fixes.
const MATCHERS: Array<{ re: RegExp; code: ApiErrorCode }> = [
  // --- TikTok feed/API failures (must precede the generic privacy/login
  // rules): this message is TikTok-extractor-specific and ambiguous — it can
  // mean private, login-required, or simply that the API/bot-check blocked the
  // request. It is NOT proof the video was removed or is private, so it is
  // reported as a processing failure instead.
  { re: /unable to find video in (?:the )?feed/i, code: "EXTRACTOR_ERROR" },

  // --- Content is private -------------------------------------------------
  { re: /private video/i, code: "PRIVATE" },
  { re: /this video is private/i, code: "PRIVATE" },
  { re: /is private\./i, code: "PRIVATE" },

  // --- A logged-in session is required (before RESTRICTED so Facebook's
  // "you must log in to continue" isn't reported as age/region restricted) ---
  { re: /you must log ?in to continue/i, code: "LOGIN_REQUIRED" },
  { re: /need to log ?in first/i, code: "LOGIN_REQUIRED" },
  { re: /would need to be logged ?in/i, code: "LOGIN_REQUIRED" },
  { re: /please log ?in/i, code: "LOGIN_REQUIRED" },
  { re: /log ?in to continue/i, code: "LOGIN_REQUIRED" },
  { re: /log(?:ged)? ?in to view/i, code: "LOGIN_REQUIRED" },
  { re: /You may have blocked or restricted this/i, code: "LOGIN_REQUIRED" },
  // TikTok emits this (via raise_login_required) when its redirect lands on
  // /login — which is how datacenter IPs are bot-blocked. It is not proof the
  // video was removed.
  { re: /requiring login/i, code: "LOGIN_REQUIRED" },
  { re: /only available for (?:registered|logged[- ]?in) users/i, code: "LOGIN_REQUIRED" },

  // --- Age gates / bot verification / geo blocks ---------------------------
  { re: /login is required/i, code: "RESTRICTED" },
  { re: /sign in to confirm/i, code: "RESTRICTED" },
  { re: /confirm you(?:['\u2019])?re not a bot/i, code: "RESTRICTED" },
  { re: /confirm you are not a robot/i, code: "RESTRICTED" },
  { re: /age.?restricted/i, code: "RESTRICTED" },
  { re: /not made this video available/i, code: "RESTRICTED" },
  { re: /this content is not available/i, code: "RESTRICTED" },

  // --- The extractor itself is outdated (a platform changed its page) -------
  // TikTok (and others) alter their page structure/challenge faster than
  // yt-dlp is updated. "Unexpected response from webpage request" is raised by
  // yt-dlp's own TikTok JS-challenge solver when it no longer understands the
  // page — a different failure than the video being private/deleted, and not
  // something retrying can fix. Deliberately NOT keyed on the generic "please
  // report this issue on github.com/yt-dlp" phrase, which also appears in
  // login-wall/access errors (e.g. Instagram) that are not version problems.
  {
    re: /unexpected response from (?:the )?webpage request/i,
    code: "EXTRACTOR_OUTDATED",
  },

  // --- The content genuinely no longer exists (deleted/moved/broken) -------
  { re: /post not found/i, code: "NOT_FOUND" },
  { re: /page not found|page doesn.t exist/i, code: "NOT_FOUND" },
  { re: /sorry, this (?:page|content|post) isn.t available/i, code: "NOT_FOUND" },
  { re: /doesn.t exist/i, code: "NOT_FOUND" },
  { re: /the link you followed may have expired/i, code: "NOT_FOUND" },
  { re: /couldn.t find|could not find|couldnt find/i, code: "NOT_FOUND" },

  // --- Transport / network failures (temporary, recoverable) --------------
  { re: /HTTP Error 429|too many requests|rate.?limit(?:ing|ed)?/i, code: "RATE_LIMITED" },
  { re: /HTTP Error (4\d\d|5\d\d)/i, code: "NETWORK_ERROR" },
  { re: /temporary failure in name resolution|name or service not known|getaddrinfo|ENOTFOUND|ECONNREFUSED|ECONNRESET|EAI_AGAIN|ETIMEDOUT/i, code: "NETWORK_ERROR" },
  { re: /socket hang up/i, code: "NETWORK_ERROR" },
  { re: /unable to download webpage/i, code: "NETWORK_ERROR" },
  { re: /unable to contact/i, code: "NETWORK_ERROR" },
  { re: /connection (?:aborted|reset|refused|closed)/i, code: "NETWORK_ERROR" },
  { re: /network (?:is |could not be )?unreachable/i, code: "NETWORK_ERROR" },
  { re: /ssl (?:handshake|certificate|self.signed)/i, code: "NETWORK_ERROR" },
  { re: /socket timed ?out|timed ?out during/i, code: "NETWORK_ERROR" },
  { re: /temporarily blocked/i, code: "UNAVAILABLE" },

  // --- The extractor ran but couldn't produce a stream ---------------------
  { re: /unable to extract/i, code: "EXTRACTOR_ERROR" },
  // TikTok's status-code failure from the video API (bot-blocking, transient
  // API errors). Explicitly not UNAVAILABLE.
  { re: /video not available, status code/i, code: "EXTRACTOR_ERROR" },
  { re: /extractor (?:failed|raised|unsupported)/i, code: "EXTRACTOR_ERROR" },
  { re: /no suitable extractor/i, code: "UNSUPPORTED_PLATFORM" },
  { re: /unsupported url/i, code: "UNSUPPORTED_PLATFORM" },
  { re: /no video formats/i, code: "EXTRACTOR_ERROR" },
  { re: /no matching formats/i, code: "EXTRACTOR_ERROR" },
  { re: /cannot download (?:a )?video/i, code: "EXTRACTOR_ERROR" },
  { re: /malformed/i, code: "EXTRACTOR_ERROR" },
  { re: /playlists are not supported/i, code: "UNSUPPORTED_PLATFORM" },

  // --- The platform itself reports the video as unavailable/removed --------
  { re: /this video is unavailable/i, code: "UNAVAILABLE" },
  { re: /video unavailable/i, code: "UNAVAILABLE" },
  { re: /unavailable videos are hidden/i, code: "UNAVAILABLE" },
  { re: /has been removed|no longer available|temporarily unavailable/i, code: "UNAVAILABLE" },
];

export function classifyYtDlpError(input: YtDlpFailureInput): YtDlpFailureClassification {
  const { stderr, exitCode } = input;

  if (!stderr || stderr.trim().length === 0) {
    // A nonzero exit with zero output tells us nothing except "the engine
    // failed on our side"; claiming the video is unavailable would be a lie.
    return { code: "INTERNAL", reason: "Unknown error" };
  }

  const reason = lastErrorLine(stderr);
  for (const matcher of MATCHERS) {
    if (matcher.re.test(stderr)) {
      return { code: matcher.code, reason };
    }
  }

  // Reached only when yt-dlp failed with no recognizable signature. This is a
  // processing/extractor failure, NOT proof the video was removed — so it maps
  // to EXTRACTOR_ERROR, never UNAVAILABLE.
  return {
    code: exitCode === 0 ? "INTERNAL" : "EXTRACTOR_ERROR",
    reason,
  };
}