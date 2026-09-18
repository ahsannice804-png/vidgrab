import { NextRequest, NextResponse } from "next/server";
import { getDirectUrl } from "@/lib/ytdlp";
import { YtDlpError } from "@/lib/ytdlp";
import { detectPlatform } from "@/lib/detection";
import { formatExpression } from "@/lib/options";
import { getClientIp, createRateLimiter } from "@/lib/rateLimit";
import type { QualityOption } from "@/lib/types";

const rl = createRateLimiter({ windowMs: 60_000, max: 20 });

const ERROR_MESSAGES: Record<string, string> = {
  UNAVAILABLE: "This video is unavailable or the format is not supported.",
  PRIVATE: "This video is private.",
  LOGIN_REQUIRED: "This video requires login access.",
  RESTRICTED: "This video is restricted.",
  NOT_FOUND: "Video not found.",
  TIMEOUT: "Request timed out. Try again.",
  TOOLS_MISSING: "Download engine not available.",
  NETWORK_ERROR: "Couldn't reach the video's servers right now. Please try again.",
  EXTRACTOR_ERROR: "Couldn't process this video right now. Please try again.",
  INTERNAL: "Something went wrong.",
  UNSUPPORTED_PLATFORM: "This platform is not supported.",
  RATE_LIMITED: "Too many requests. Please try again shortly.",
};

interface DirectUrlRequest {
  url?: unknown;
  platform?: unknown;
  formatId?: unknown;
  needsMerge?: unknown;
  height?: unknown;
  label?: unknown;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limiter = rl(ip);

  if (!limiter.allowed) {
    return NextResponse.json(
      { ok: false, code: "RATE_LIMITED", message: ERROR_MESSAGES.RATE_LIMITED, retryAfter: limiter.retryAfterSec },
      { status: 429 },
    );
  }

  try {
    const rawBody: unknown = await request.json();
    const body: DirectUrlRequest = isRecord(rawBody) ? rawBody : {};
    const rawUrl = typeof body.url === "string" ? body.url.trim() : "";

    if (!rawUrl) {
      return NextResponse.json(
        { ok: false, code: "INVALID_URL", message: "Please enter a valid URL." },
        { status: 400 },
      );
    }

    const parsed = detectPlatform(rawUrl);
    if (!parsed) {
      return NextResponse.json(
        { ok: false, code: "UNSUPPORTED_PLATFORM", message: ERROR_MESSAGES.UNSUPPORTED_PLATFORM },
        { status: 400 },
      );
    }

    // Build a QualityOption-like object from client-provided fields
    const option: QualityOption = {
      label: typeof body.label === "string" ? body.label : "video",
      height: typeof body.height === "number" ? body.height : 1080,
      sizeBytes: null,
      needsMerge: body.needsMerge === true,
      formatId: typeof body.formatId === "string" ? body.formatId : undefined,
    };

    const fmtExpression = formatExpression(parsed.platform, option);
    const result = await getDirectUrl(parsed.url, fmtExpression);

    return NextResponse.json({
      ok: true,
      urls: result.urls,
      isCombined: result.isCombined,
      platform: parsed.platform,
    });
  } catch (err) {
    if (err instanceof YtDlpError) {
      const message = ERROR_MESSAGES[err.code] ?? ERROR_MESSAGES.INTERNAL;
      return NextResponse.json({ ok: false, code: err.code, message }, { status: 502 });
    }
    return NextResponse.json(
      { ok: false, code: "INTERNAL", message: ERROR_MESSAGES.INTERNAL },
      { status: 500 },
    );
  }
}
