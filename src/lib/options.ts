import type { QualityOption } from "./types";
import type { RawFormat, RawVideoInfo } from "./ytdlp";
import type { Platform } from "./detection";

const TARGET_HEIGHTS = [360, 480, 720, 1080];

/** MP3 output tiers offered in audio mode, from most honest/cheapest to best. */
const AUDIO_TIERS = [
  { kbps: 128, label: "Standard" },
  { kbps: 192, label: "High" },
  { kbps: 320, label: "Best" },
] as const;

/** Human label for each requested tier — assigned from the target, never from
 * the raw (often off-standard, e.g. 818/872) pixel height of the encode. */
const TIER_LABEL: Record<number, string> = {
  360: "360p",
  480: "480p",
  720: "720p HD",
  1080: "1080p HD",
};

/** Real filesize (or filesize_approx) reported by yt-dlp; null when unknown. */
function sizeOf(f: RawFormat): number | null {
  return f.filesize ?? f.filesize_approx ?? null;
}

/**
 * Best available size estimate for a single stream.
 * 1. yt-dlp's reported `filesize`/`filesize_approx` when present (source of truth).
 * 2. Bitrate × duration from live per-format `tbr`/`vbr`/`abr` data as a last resort.
 */
function estimateSize(f: RawFormat, duration: number | null): number | null {
  const exact = sizeOf(f);
  if (exact) return exact;

  if (duration != null && duration > 0) {
    // Rate is reported in kb/s → bits/s = rate * 1000 → bytes = bits / 8.
    const rate = f.tbr ?? f.vbr ?? f.abr;
    if (rate) return Math.round((rate * 1000 * duration) / 8);
  }
  return null;
}

function codecFamily(vcodec: string | undefined): string {
  const v = (vcodec ?? "").toLowerCase();
  if (v.startsWith("avc")) return "avc";
  if (v.startsWith("av1") || v.startsWith("av01")) return "av1";
  if (v.startsWith("vp9") || v.startsWith("vp09")) return "vp9";
  return v.split(".")[0] ?? "";
}

/**
 * Authoritative byte size of a video stream with no real filesize of its
 * own, taken from a same-height sibling format that DOES carry yt-dlp's
 * reported filesize.
 *
 * YouTube serves the SAME underlying encode both as a direct HTTPS DASH
 * stream (→ exact `filesize`) and as a segmented HLS stream (→ no size and
 * an inflated advertised `tbr`). A converted download of either variant is
 * byte-for-byte the same content, so the sibling's real filesize is the
 * most accurate figure to report before download. Prefers the sibling that
 * matches the chosen format's codec family and framerate; falls back to
 * any same-height sibling, and finally to a bitrate estimate.
 */
function siblingSizedBytes(
  video: RawFormat,
  formats: RawFormat[],
): number | null {
  const h = video.height;
  if (!h) return null;

  const siblings = formats.filter(
    (f) =>
      f.height === h &&
      f.vcodec &&
      f.vcodec !== "none" &&
      f.format_id !== video.format_id,
  );
  if (siblings.length === 0) return null;

  const withSize = siblings.filter((f) => sizeOf(f) != null);
  if (withSize.length === 0) return null;

  const family = codecFamily(video.vcodec);
  const fps = video.fps;
  const best = [...withSize].sort((a, b) => {
    const rank = (f: RawFormat) => {
      let r = 0;
      if (codecFamily(f.vcodec) === family) r += 2;
      if (f.fps === fps) r += 1;
      return r;
    };
    return rank(b) - rank(a) || (b.vbr ?? 0) - (a.vbr ?? 0);
  });
  return sizeOf(best[0]);
}

/**
 * Best standalone audio stream for merging. Prefer highest-bitrate
 * m4a/mp4 (AAC), then best pure-audio format overall. Matches the
 * `+ba[ext=m4a]` download expression so reported size == final size.
 */
function bestAudio(formats: RawFormat[]): RawFormat | undefined {
  const standalone = formats.filter(
    (f) => f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none"),
  );
  const m4a = standalone.filter((f) => f.ext === "m4a" || f.ext === "mp4");
  const pool = m4a.length ? m4a : standalone;
  const byBitrate = (a: RawFormat, b: RawFormat) =>
    (b.abr ?? b.tbr ?? 0) - (a.abr ?? a.tbr ?? 0);
  return [...pool].sort(byBitrate)[0];
}

/**
 * Perceptual quality rank for the codec family. H.264 (avc) is the most
 * compatible, best-understood encode for MP4 output; AV1 and VP9 are more
 * bitrate-efficient so a same-height same-bitrate fallback only applies
 * when H.264 is missing or lower-bitrate.
 */
function codecScore(vcodec: string | undefined): number {
  const v = (vcodec ?? "").toLowerCase();
  if (v.startsWith("avc")) return 30;
  if (v.startsWith("av01") || v.startsWith("av1")) return 20;
  if (v.startsWith("vp9") || v.startsWith("vp09")) return 10;
  return 0;
}

/**
 * Favors segmented HLS over a direct HTTPS DASH URL. YouTube serves the SAME
 * encode through both, but aggressively throttles many direct-DASH formats
 * (measured 2.5-4x slower than the identical HLS copy on the same link), so
 * we prefer the HLS variant for speed and let sibling-size anchoring keep the
 * reported file size accurate.
 */
function isHls(f: RawFormat): boolean {
  const p = (f.protocol ?? "").toLowerCase();
  return p.startsWith("m3u8");
}

/** Finds the highest-quality video format for a target height.
 *
 * YouTube serves MULTIPLE encodes at the same resolution: low-bitrate
 * "legacy" formats that carry a real `filesize`, and higher-bitrate
 * "enhanced" HLS formats that report no filesize and an inflated advertised
 * `tbr`. Downloads of the two variants of the same height deliver
 * byte-equivalent content, so the variant with the best real-world download
 * speed is preferred (segmented HLS downloads unthrottled and 2.5-4x faster
 * than direct-DASH on throttled links). Size is then anchored to a same-height
 * sibling that carries a real filesize. Among equally-fast variants the one
 * with the authoritative real filesize is preferred; where a height has no
 * sized format at all, we fall back to the highest-advertised enhanced
 * variant (sized via its same-height sibling).
 */
function pickBestVideo(
  formats: RawFormat[],
  targetHeight: number,
  duration: number | null,
): RawFormat | undefined {
  const candidates = formats
    .filter((f) => f.height && f.height > 0 && f.vcodec && f.vcodec !== "none")
    .filter((f) => (f.fps ?? 0) >= 1)
    .filter((f) => f.ext !== "mhtml")
    .filter((f) => f.height! <= targetHeight);

  const effectiveBitrate = (f: RawFormat): number => {
    const real = sizeOf(f);
    if (real && duration && duration > 0) return (real * 8) / duration / 1000; // true kbps
    return f.vbr ?? f.tbr ?? 0;
  };

  return (
    candidates
      .map((f) => ({
        f,
        hasRealSize: sizeOf(f) != null,
        bits: effectiveBitrate(f),
        codec: codecScore(f.vcodec),
        hls: isHls(f),
      }))
      .sort(
        (a, b) =>
          b.f.height! - a.f.height! || // nearest resolution to target first
          Number(b.hls) - Number(a.hls) || // fast segmented HLS > throttled direct-DASH
          Number(b.hasRealSize) - Number(a.hasRealSize) || // authoritative size over size-less
          b.bits - a.bits || // highest real (or advertised) bitrate of the group
          b.codec - a.codec || // H.264 > AV1 > VP9 when bitrate is equal
          (b.f.fps ?? 0) - (a.f.fps ?? 0),
      )[0]?.f
  );
}

/**
 * Finds a single pre-muxed (video+audio) stream for a target height — the
 * "progressive" format. For ≤360p YouTube serves format 18 (MP4): one HTTP
 * stream, no separate audio, no ffmpeg merge, and — unlike many throttled
 * DASH formats — it downloads at full speed. This is the fastest possible
 * path for low resolutions, which is what most long downloads request.
 */
function pickCombinedStream(
  formats: RawFormat[],
  targetHeight: number,
  duration: number | null,
): RawFormat | undefined {
  const effectiveBitrate = (f: RawFormat): number => {
    const real = sizeOf(f);
    if (real && duration && duration > 0) return (real * 8) / duration / 1000;
    return f.tbr ?? f.vbr ?? 0;
  };
  const byContainer = (f: RawFormat): number => (f.ext === "mp4" ? 2 : f.ext === "webm" ? 1 : 0);

  return (
    formats
      .filter((f) => f.height && f.height > 0 && f.height! <= targetHeight)
      .filter((f) => f.vcodec && f.vcodec !== "none")
      .filter((f) => f.acodec && f.acodec !== "none")
      .filter((f) => (f.fps ?? 0) >= 1)
      .filter((f) => f.ext !== "mhtml")
      .map((f) => ({
        f,
        bits: effectiveBitrate(f),
        codec: codecScore(f.vcodec),
        cont: byContainer(f),
      }))
      .sort(
        (a, b) =>
          b.f.height! - a.f.height! || // nearest resolution to target first
          b.cont - a.cont || // prefer an already-MP4 muxed stream
          b.bits - a.bits || // highest real (or advertised) bitrate
          b.codec - a.codec, // H.264 > AV1 > VP9 when bitrate is equal
      )[0]?.f
  );
}

function resolveYouTube(
  info: RawVideoInfo,
): QualityOption[] {
  const formats = info.formats ?? [];
  if (formats.length === 0) return [];

  const options: QualityOption[] = [];
  let lastHeight = 0;
  const duration = typeof info.duration === "number" ? info.duration : null;

  for (const targetH of TARGET_HEIGHTS) {
    // 360p first tries YouTube's single-file progressive format: half the
    // HTTP streams, no merge, no throttling — then falls back to DASH split.
    const video =
      targetH <= 360
        ? pickCombinedStream(formats, targetH, duration) ?? pickBestVideo(formats, targetH, duration)
        : pickBestVideo(formats, targetH, duration);
    if (!video || !video.height) continue;
    if (video.height <= lastHeight) continue;

const needsMerge = !video.acodec || video.acodec === "none";
  let size = estimateSize(video, duration);
  let audioFormatId: string | undefined;
  let audioSize: number | null = null;
  let altFormatId: string | undefined;

  if (needsMerge) {
    const audio = bestAudio(formats);
    if (audio) {
      audioFormatId = audio.format_id;
      audioSize = estimateSize(audio, duration);
      if (video.filesize == null && video.filesize_approx == null) {
        // Chosen stream has no real filesize (e.g. HLS): anchor the size on
        // the authoritative filesize of a same-height sibling of the same
        // encode, so the reported number matches the real merged output.
        const anchor = siblingSizedBytes(video, formats);
        if (anchor != null) {
          size = anchor;
        }
      }
      if (size != null && audioSize != null) size += audioSize;

      // Keep a same-height sibling of the OTHER stream kind (e.g. the DASH
      // copy when we picked the HLS copy of the same encode) so the server can
      // speed-probe both variants per job and pick whichever downloads fastest
      // right now (YouTube's throttling fluctuates by the minute).
      const sibling = formats
        .filter(
          (f) =>
            f.height === video.height &&
            f.vcodec &&
            f.vcodec !== "none" &&
            (f.fps ?? 0) >= 1 &&
            f.ext !== "mhtml" &&
            f.format_id !== video.format_id &&
            isHls(f) !== isHls(video as RawFormat),
        )
        .sort((a, b) => {
          const score = (f: RawFormat) =>
            (sizeOf(f) != null ? 2 : 0) + codecScore(f.vcodec) + (f.fps === video.fps ? 1 : 0);
          return score(b) - score(a);
        })[0];
      if (sibling?.format_id) altFormatId = sibling.format_id;
    }
  }

    const label = TIER_LABEL[targetH] ?? `${video.height}p`;
    const videoBitrate = video.vbr ?? video.tbr ?? 0;

    options.push({
      label,
      height: video.height,
      sizeBytes: size,
      needsMerge,
      formatId: video.format_id,
      audioFormatId,
      altFormatId,
      bitrateKbps: videoBitrate > 0 ? videoBitrate : undefined,
    });

    lastHeight = video.height;
  }

  return options;
}

function resolveInstagram(info: RawVideoInfo): QualityOption[] {
  const duration = typeof info.duration === "number" ? info.duration : null;
  const allFormats = info.formats ?? [];

  // A post/reel typically exposes one progressive encode. Deduplicate the raw
  // formats so repeated entries for the same stream (same format_id) never
  // surface as identical cards.
  const seenFormats = new Set<string>();
  const formats = allFormats
    .filter((f) => f.height && f.height > 0 && f.vcodec && f.vcodec !== "none")
    .filter((f) => {
      if (f.format_id && seenFormats.has(f.format_id)) return false;
      if (f.format_id) seenFormats.add(f.format_id);
      return true;
    });

  if (formats.length === 0) {
    const size =
      info.requested_formats?.reduce(
        (sum, f) => {
          const s = estimateSize(f, duration);
          return s ? sum + s : sum;
        },
        0,
      ) ?? estimateSize(info as unknown as RawFormat, duration) ?? null;

    return [
      {
        label: "Best Quality",
        height: info.height ?? 720,
        sizeBytes: size,
        needsMerge: false,
        formatId: undefined,
      },
    ];
  }

  // Instagram offers a single progressive stream, so resolve to exactly ONE
  // download option: the highest-resolution, highest-bitrate variant. Even when
  // yt-dlp reports multiple near-identical encodes (same height, different
  // codec/format_id), only one card should reach the UI.
  const best = [...formats].sort((a, b) => {
    const byHeight = (b.height ?? 0) - (a.height ?? 0);
    return byHeight !== 0 ? byHeight : (b.vbr ?? b.tbr ?? 0) - (a.vbr ?? a.tbr ?? 0);
  })[0];
  if (!best) return [];

  const h = best.height ?? 720;
  return [
    {
      label: h >= 1080 ? "1080p HD" : h >= 720 ? "720p HD" : h >= 480 ? "480p" : "360p",
      height: h,
      sizeBytes: estimateSize(best, duration),
      needsMerge: false,
      formatId: best.format_id,
      bitrateKbps: best.vbr ?? best.tbr ?? undefined,
    },
  ];
}

/**
 * Real audible bitrate of a standalone audio stream. Prefers the value derived
 * from yt-dlp's reported filesize (source of truth: real bytes ÷ duration),
 * falling back to the advertised abr/tbr when there is no filesize.
 */
function audioRealKbps(f: RawFormat, duration: number | null): number {
  const exact = sizeOf(f);
  if (exact && duration && duration > 0) return (exact * 8) / duration / 1000;
  return f.abr ?? f.tbr ?? 0;
}

/**
 * All audio-only (MP3) download options for a YouTube video.
 *
 * Sizing is exact by construction: every tier is encoded as MP3 with libmp3lame
 * in CBR at the tier's bitrate, and a CBR MP3 frame stream is bitrate ×
 * duration ± one frame of padding, so `kbps * 1000 * duration / 8` matches the
 * real file within a couple of KB. The only uncertainty is source quality:
 * a tier is ONLY offered when the best source audio genuinely carries ~90%+ of
 * that bitrate, so we never dangle a fake 320kbps offer below a 128kbps track.
 * Standard (128kbps) is always achievable by transcoding and stays available.
 */
function resolveYouTubeAudio(info: RawVideoInfo): QualityOption[] {
  const formats = info.formats ?? [];
  if (formats.length === 0) return [];
  const duration = typeof info.duration === "number" ? info.duration : null;

  const standalone = formats.filter(
    (f) => f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none"),
  );
  const srcKbps = standalone.reduce(
    (max, f) => Math.max(max, audioRealKbps(f, duration)),
    0,
  );

  const options: QualityOption[] = [];
  for (const tier of AUDIO_TIERS) {
    // Translating always yields a real 128kbps MP3, so Standard is never fake.
    // Higher tiers require a source audio track that carries close to that rate.
    const offered =
      tier.kbps === 128 ? standalone.length > 0 : srcKbps >= tier.kbps * 0.9;
    if (!offered) continue;

    const size =
      duration && duration > 0
        ? Math.round((tier.kbps * 1000 * duration) / 8)
        : null;

    options.push({
      label: `${tier.label} Quality`,
      height: 0,
      mode: "audio",
      outputExt: "mp3",
      sizeBytes: size,
      needsMerge: false,
      bitrateKbps: tier.kbps,
    });
  }
  return options;
}

/**
 * Quality options for Facebook videos. Facebook usually delivers one or a few
 * muxed (video+audio) encodes per resolution — typically SD (480p), HD (720p)
 * and sometimes UHD (1080p). We deduplicate by format_id, pick the best
 * variant per distinct height (highest real bitrate, then codec preference),
 * and surface ONE honest card per resolution that actually exists — ascending
 * like the YouTube tiers. Nothing is fabricated.
 */
function resolveFacebook(info: RawVideoInfo): QualityOption[] {
  const duration = typeof info.duration === "number" ? info.duration : null;
  const allFormats = info.formats ?? [];

  const seenFormats = new Set<string>();
  const formats = allFormats
    .filter((f) => f.height && f.height > 0 && f.vcodec && f.vcodec !== "none")
    .filter((f) => {
      if (f.format_id && seenFormats.has(f.format_id)) return false;
      if (f.format_id) seenFormats.add(f.format_id);
      return true;
    })
    .filter((f) => f.ext !== "mhtml");

  if (formats.length === 0) {
    // No per-height formats exposed (e.g. a direct HLS src stream with a
    // height reported only on the info object): fall back to a single card.
    const size =
      info.requested_formats?.reduce(
        (sum, f) => {
          const s = estimateSize(f, duration);
          return s ? sum + s : sum;
        },
        0,
      ) ?? estimateSize(info as unknown as RawFormat, duration) ?? null;
    return [
      {
        label: "Best Quality",
        height: info.height ?? 720,
        sizeBytes: size,
        needsMerge: false,
        formatId: undefined,
      },
    ];
  }

  const byHeight = new Map<number, RawFormat>();
  for (const f of formats) {
    const h = f.height!;
    const current = byHeight.get(h);
    if (!current) {
      byHeight.set(h, f);
      continue;
    }
    const rank = (cand: RawFormat) => ({
      bits: cand.vbr ?? cand.tbr ?? 0,
      codec: codecScore(cand.vcodec),
      fps: cand.fps ?? 0,
    });
    const a = rank(current);
    const b = rank(f);
    if (
      b.bits !== a.bits
        ? b.bits > a.bits
        : b.codec !== a.codec
          ? b.codec > a.codec
          : b.fps > a.fps
    ) {
      byHeight.set(h, f);
    }
  }

  return [...byHeight.entries()]
    .sort(([a], [b]) => a - b)
    .map(([h, video]) => ({
      label: TIER_LABEL[h] ?? `${h}p`,
      height: h,
      sizeBytes: estimateSize(video, duration),
      // Facebook exposes both muxed encodes (no height, filtered out above)
      // and DASH video-only streams. Cards built from DASH video formats carry
      // no audio, so we request +ba at download time and merge with ffmpeg.
      needsMerge: !video.acodec || video.acodec === "none",
      formatId: video.format_id,
      bitrateKbps: (video.vbr ?? video.tbr ?? 0) > 0 ? video.vbr ?? video.tbr ?? 0 : undefined,
    }));
}

/**
 * Audio-quality options for the given platform. Instagram media is served as a
 * single muxed stream with no standalone audio track, so we surface no MP3
 * tiers there rather than faking one.
 */
export function buildAudioOptions(
  platform: Platform,
  info: RawVideoInfo,
): QualityOption[] {
  if (platform === "youtube" || platform === "tiktok" || platform === "facebook") return resolveYouTubeAudio(info);
  return [];
}

/**
 * Given raw yt-dlp JSON metadata, compute the list of quality options to
 * show in the UI for the given platform.
 */
export function buildQualityOptions(
  platform: Platform,
  info: RawVideoInfo,
): QualityOption[] {
  if (platform === "instagram" || platform === "tiktok") return resolveInstagram(info);
  if (platform === "facebook") return resolveFacebook(info);
  return resolveYouTube(info);
}

/**
 * Returns the yt-dlp format expression to use at download time.
 */
export function audioFormatExpression(option: QualityOption): string {
  // Audio mode always produces an MP3 re-encoded server-side with ffmpeg at the
  // tier's CBR bitrate, so yt-dlp only needs to fetch the best source audio
  // stream as-is (raw m4a/webm; never re-encoded yet). The `best` fallback
  // covers the rare video with no standalone audio track — the combined stream
  // is downloaded and its audio extracted during conversion instead.
  return option.formatId
    ? option.formatId
    : "ba[ext=m4a]/ba/best/b";
}

export function formatExpression(
  platform: Platform,
  option: QualityOption,
): string {
  if (option.mode === "audio") return audioFormatExpression(option);
  if (platform === "instagram" || platform === "tiktok") {
    // Instagram/TikTok streams are single muxed files — the format id alone is
    // the whole video.
    return option.formatId
      ? option.formatId
      : "bv*[ext=mp4]+ba[ext=m4a]/best[ext=mp4]/b/best";
  }
  if (platform === "facebook") {
    if (!option.formatId) {
      return "bv*[ext=mp4]+ba[ext=m4a]/best[ext=mp4]/b/best";
    }
    // Facebook mixes muxed encodes and DASH video-only streams. `needsMerge`
    // flags the video-only ones: append the best audio and let yt-dlp merge.
    return option.needsMerge
      ? `${option.formatId}+ba[ext=m4a]/best[ext=mp4]/b/best`
      : `${option.formatId}/best[ext=mp4]/b/best`;
  }
  const h = option.height;
  const fallback = `bv*[height<=${h}][ext=mp4]+ba[ext=m4a]/b[height<=${h}][ext=mp4]/b[height<=${h}]`;
  if (option.formatId) {
    if (option.needsMerge && option.altFormatId && option.altFormatId !== option.formatId) {
      // Two copies of the same-height encode (e.g. HLS + DASH): offer both as
      // the primary choice; at download time the server speed-probes them and
      // uses whichever is faster right now.
      return `${option.formatId}/${option.altFormatId}+ba[ext=m4a]/${fallback}`;
    }
    return option.needsMerge
      ? `${option.formatId}+ba[ext=m4a]/${fallback}`
      : `${option.formatId}/${fallback}`;
  }
  return fallback;
}