import { NextRequest, NextResponse } from "next/server";
import { detectPlatform } from "@/lib/detection";
import { getClientIp, createRateLimiter } from "@/lib/rateLimit";
import { createJob } from "@/lib/jobs";
import { getVideoInfo, YtDlpError } from "@/lib/ytdlp";
import { buildQualityOptions, formatExpression } from "@/lib/options";
import { sanitizeFilename } from "@/lib/format";
import { ERROR_MESSAGES } from "@/lib/errorCodes";
import type { DownloadResult, QualityOption } from "@/lib/types";

const rl = createRateLimiter({ windowMs: 10 * 60_000, max: 8 });

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

  const rec = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const rawUrl = rec.url;
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

  const requestedPlatform = rec.platform;
  if (typeof requestedPlatform === "string" && requestedPlatform !== parsed.platform) {
    return NextResponse.json(
      { ok: false, code: "WRONG_PLATFORM", message: ERROR_MESSAGES.WRONG_PLATFORM },
      { status: 400 },
    );
  }

  try {
    const mode = rec.mode === "audio" ? "audio" : "video";
    // Fast path: the client already fetched metadata and knows the exact format
    // it wants, so we build the yt-dlp expression directly and skip re-running
    // getVideoInfo (which costs several seconds before the job even starts).
    const clientFormatId = typeof rec.formatId === "string" ? rec.formatId.trim() : "";
    let fmtExpression: string;
    let audioKbps: number | undefined;

    if (mode === "audio") {
      // Client picked one of the honest tiers produced from real metadata
      // (buildAudioOptions only emits tiers whose bitrate the source carries).
      audioKbps =
        typeof rec.audioKbps === "number" &&
        [128, 192, 320].includes(rec.audioKbps)
          ? rec.audioKbps
          : 128;
      const option: QualityOption = {
        label: typeof rec.label === "string" ? rec.label : "Standard",
        height: 0,
        sizeBytes: typeof rec.sizeBytes === "number" ? rec.sizeBytes : null,
        needsMerge: false,
        mode: "audio",
        outputExt: "mp3",
        bitrateKbps: audioKbps,
      };
      fmtExpression = formatExpression(parsed.platform, option);
    } else if (clientFormatId) {
      const option: QualityOption = {
        label: typeof rec.label === "string" ? rec.label : "video",
        height: typeof rec.height === "number" ? rec.height : 1080,
        sizeBytes: null,
        needsMerge: rec.needsMerge === true,
        formatId: clientFormatId,
        altFormatId: typeof rec.altFormatId === "string" ? rec.altFormatId.trim() : undefined,
      };
      fmtExpression = formatExpression(parsed.platform, option);
    } else {
      const info = await getVideoInfo(parsed.url);
      const options = buildQualityOptions(parsed.platform, info);
      const optionIndex =
        typeof rec.optionIndex === "number" && Number.isInteger(rec.optionIndex)
          ? rec.optionIndex
          : 0;
      const option: QualityOption | undefined = options[optionIndex] ?? options[0];

      if (!option) {
        console.error(
          "[download:error]",
          JSON.stringify({
            url: parsed.url,
            code: "EXTRACTOR_ERROR",
            note: "no quality options produced from extracted metadata",
          }),
        );
        return NextResponse.json(
          { ok: false, code: "EXTRACTOR_ERROR", message: ERROR_MESSAGES.EXTRACTOR_ERROR },
          { status: 502 },
        );
      }
      fmtExpression = formatExpression(parsed.platform, option);
    }

    const filename = sanitizeFilename(
      (typeof rec.title === "string" && rec.title.trim()) ? rec.title : mode === "audio" ? "audio" : "video",
      mode === "audio" ? "audio" : "video",
    );

    const job = createJob({
      platform: parsed.platform,
      url: parsed.url,
      formatExpression: fmtExpression,
      filename,
      expectedSizeBytes:
        typeof rec.sizeBytes === "number" && rec.sizeBytes > 0 ? rec.sizeBytes : undefined,
      mode,
      audioKbps,
    });

    const result: DownloadResult = {
      ok: true,
      jobId: job.id,
      token: job.token,
      status: job.status,
    };
    return NextResponse.json(result, { status: 202 });
  } catch (err) {
    if (err instanceof YtDlpError) {
      const message = ERROR_MESSAGES[err.code] ?? ERROR_MESSAGES.INTERNAL;
      return NextResponse.json({ ok: false, code: err.code, message }, { status: err.code === "RATE_LIMITED" ? 429 : 502 });
    }
    return NextResponse.json(
      { ok: false, code: "INTERNAL", message: ERROR_MESSAGES.INTERNAL },
      { status: 500 },
    );
  }
}