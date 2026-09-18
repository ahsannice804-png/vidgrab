import { NextRequest, NextResponse } from "next/server";
import { detectPlatform } from "@/lib/detection";
import { getClientIp, createRateLimiter } from "@/lib/rateLimit";
import { getVideoInfo } from "@/lib/ytdlp";
import { buildAudioOptions, buildQualityOptions } from "@/lib/options";
import { ERROR_MESSAGES } from "@/lib/errorCodes";
import type { InfoSuccess } from "@/lib/types";
import { YtDlpError } from "@/lib/ytdlp";

const rl = createRateLimiter({ windowMs: 60_000, max: 20 });

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limiter = rl(ip);

  if (!limiter.allowed) {
    return NextResponse.json(
      { ok: false, code: "RATE_LIMITED", message: ERROR_MESSAGES.RATE_LIMITED, retryAfter: limiter.retryAfterSec },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: "INVALID_URL", message: ERROR_MESSAGES.INVALID_URL }, { status: 400 });
  }

  const rawUrl = typeof body === "object" && body !== null ? (body as Record<string, unknown>).url : undefined;
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    return NextResponse.json({ ok: false, code: "INVALID_URL", message: ERROR_MESSAGES.INVALID_URL }, { status: 400 });
  }

  const parsed = detectPlatform(rawUrl);
  if (!parsed) {
    return NextResponse.json(
      { ok: false, code: "UNSUPPORTED_PLATFORM", message: ERROR_MESSAGES.UNSUPPORTED_PLATFORM },
      { status: 400 },
    );
  }

  try {
    const info = await getVideoInfo(parsed.url);

    const title = (info.title ?? "Untitled") as string;
    const options = buildQualityOptions(parsed.platform, info);
    const audioOptions = buildAudioOptions(parsed.platform, info);

    const result: InfoSuccess = {
      ok: true,
      platform: parsed.platform,
      video: {
        id: info.id ?? parsed.id,
        title,
        thumbnail:
          info.thumbnail ??
          info.thumbnails?.slice(-1)?.[0]?.url ??
          null,
        duration: typeof info.duration === "number" ? info.duration : null,
        uploader: (info.uploader ?? info.channel ?? null) as string | null,
        views: typeof info.view_count === "number" ? info.view_count : null,
        url: (info.webpage_url ?? parsed.url) as string,
      },
      options,
      audioOptions,
    };

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof YtDlpError) {
      const message =
        ERROR_MESSAGES[err.code] ??
        ERROR_MESSAGES.INTERNAL;
      return NextResponse.json({ ok: false, code: err.code, message }, { status: err.code === "RATE_LIMITED" ? 429 : err.code === "INVALID_URL" ? 400 : 502 });
    }
    return NextResponse.json(
      { ok: false, code: "INTERNAL", message: ERROR_MESSAGES.INTERNAL },
      { status: 500 },
    );
  }
}