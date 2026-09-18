import { spawn } from "node:child_process";

import { chmodSync, copyFileSync, existsSync, promises as fs } from "node:fs";

import { createRequire } from "node:module";

import os from "node:os";

import path from "node:path";

import type { ApiErrorCode } from "./errorCodes";

import { classifyYtDlpError } from "./errorClassifier";

import { canonicalizeTikTokFinalUrl, detectPlatform } from "./detection";



export class YtDlpError extends Error {

  constructor(

    public code: ApiErrorCode,

    message: string,

  ) {

    super(message);

    this.name = "YtDlpError";

  }

}



export interface RawFormat {

  format_id?: string;

  height?: number;

  width?: number;

  ext?: string;

  protocol?: string;

  vcodec?: string;

  acodec?: string;

  filesize?: number | null;

  filesize_approx?: number | null;

  tbr?: number | null;

  vbr?: number | null;

  abr?: number | null;

  fps?: number;

  container?: string;

  dynamic_range?: string;

  format_note?: string;

}



export interface RawVideoInfo {

  id?: string;

  title?: string;

  thumbnail?: string;

  thumbnails?: Array<{ url?: string }>;

  duration?: number;

  uploader?: string;

  uploader_id?: string;

  channel?: string;

  view_count?: number;

  webpage_url?: string;

  url?: string;

  ext?: string;

  width?: number;

  height?: number;

  acodec?: string;

  vcodec?: string;

  formats?: RawFormat[];

  requested_formats?: RawFormat[];

  _type?: string;

  entries?: unknown[];

}



/**

 * `createRequire` lets us lazily resolve the binary paths shipped inside

 * `node_modules` without importing them at module load time (a missing binary

 * must never prevent the info/direct-url routes from starting). Both packages

 * are listed in `serverExternalPackages` in `next.config.ts` so Next keeps

 * them external and they stay resolvable from the real `node_modules` inside

 * the serverless function at runtime.

 */

const nodeRequire = createRequire(import.meta.url);



let ytDlpBundlePath: string | null | undefined;

let ffmpegBundlePath: string | null | undefined;



/**

 * Absolute path to the yt-dlp binary shipped by the `yt-dlp-exec` dependency

 * (downloaded into `node_modules/yt-dlp-exec/bin` during install). Returns

 * null when it isn't available so callers can fall back to PATH.

 */

function bundledYtDlp(): string | null {

  if (ytDlpBundlePath === undefined) {

    try {

      const { YOUTUBE_DL_PATH } = nodeRequire("yt-dlp-exec/src/constants") as {

        YOUTUBE_DL_PATH?: string;

      };

      ytDlpBundlePath = YOUTUBE_DL_PATH && existsSync(YOUTUBE_DL_PATH) ? YOUTUBE_DL_PATH : null;

    } catch {

      ytDlpBundlePath = null;

    }

  }

  return ytDlpBundlePath;

}



/**

 * Absolute path to the platform-native ffmpeg binary shipped by the

 * `@ffmpeg-installer/ffmpeg` dependency (`node_modules/@ffmpeg-installer/<os-arch>/`).

 * Returns null when it isn't available so callers can fall back to PATH.

 */

function bundledFfmpeg(): string | null {

  if (ffmpegBundlePath === undefined) {

    try {

      const { path: ffmpegPath } = nodeRequire("@ffmpeg-installer/ffmpeg") as {

        path?: string;

      };

      ffmpegBundlePath = ffmpegPath && existsSync(ffmpegPath) ? ffmpegPath : null;

    } catch {

      ffmpegBundlePath = null;

    }

  }

  return ffmpegBundlePath;

}



/**

 * Serverless filesystems (Vercel) often strip executable permissions from

 * packaged node_modules. When running on Vercel, copy the binary into the

 * OS temp dir (the only writable location) with a fresh 0755 chmod so

 * child_process can actually execute it. The copy is skipped entirely

 * outside Vercel, where binaries run from their installed location.

 */

const IS_VERCEL = process.env.VERCEL === "1";



function prepareBinary(source: string, destName: string): string {

  if (!IS_VERCEL) return source;

  const dest = path.join("/tmp", destName);

  try {

    if (!existsSync(dest)) {

      copyFileSync(source, dest);

    }

    chmodSync(dest, 0o755);

  } catch {

    return source;

  }

  return dest;

}



/**

 *
 * Absolute path of the pinned yt-dlp nightly that the Docker image installs
 *
 * (`Dockerfile` → `ARG YTDLP_VERSION`). Production/Linux containers hard-pick
 *
 * this file so a stale `YTDLP_PATH` Railway env var or the stale binary in
 *
 * `node_modules/yt-dlp-exec` can never shadow the nightly at runtime.
 *
 */

const DOCKER_YTDLP_PATH = "/usr/local/bin/yt-dlp";



const IS_PRODUCTION_LINUX =

  process.env.NODE_ENV === "production" && process.platform === "linux";



let ytDlpBinaryLogged = false;

/**

 *
 * Logs the resolved yt-dlp binary path and its `--version` the first time the
 *
 * engine runs, so the exact binary doing the TikTok extraction is visible in
 *
 * the server logs. Best-effort: a probe failure never affects the spawn.
 *
 */

async function logYtDlpBinaryOnce(bin: string): Promise<void> {

  if (ytDlpBinaryLogged) return;

  ytDlpBinaryLogged = true;

  console.log(`[ytdlp:path] resolved yt-dlp binary: ${bin}`);

  try {

    const output = await new Promise<string>((resolve) => {

      let out = "";

      let err = "";

      const child = spawn(/* turbopackIgnore: true */ bin, ["--version"], {

        stdio: ["ignore", "pipe", "pipe"],

        windowsHide: true,

      });

      const timer = setTimeout(() => child.kill("SIGKILL"), 15_000);

      child.stdout.on("data", (chunk: Buffer) => (out += chunk.toString()));

      child.stderr.on("data", (chunk: Buffer) => (err += chunk.toString()));

      const finish = () => {

        clearTimeout(timer);

        resolve((out || err).trim());

      };

      child.on("error", finish);

      child.on("close", finish);

    });

    const firstLine = output.split(/\r?\n/, 1)[0];

    if (firstLine) console.log(`[ytdlp:path] yt-dlp version: ${firstLine}`);

  } catch {

    // never let the version probe interfere with the real extraction

  }

}



/**

 *
 * Resolves the yt-dlp executable to spawn, in priority order:
 *
 *   1. production Linux (Railway/Docker): `/usr/local/bin/yt-dlp` — the
 *
 *      pinned nightly baked into the image, hard-prioritized so nothing
 *
 *      else can shadow it.
 *
 *   2. explicit `YTDLP_PATH` env override (local dev / custom deploys)
 *
 *   3. the yt-dlp binary bundled by `yt-dlp-exec` (Vercel Serverless)
 *
 *   4. `yt-dlp` on PATH
 *
 *
 *
 * On Vercel the resolved binary is staged to `/tmp/yt-dlp` with +x first.
 *
 */

function getBin(): string {

  if (IS_PRODUCTION_LINUX && existsSync(DOCKER_YTDLP_PATH)) {

    const bin = prepareBinary(DOCKER_YTDLP_PATH, "yt-dlp");

    void logYtDlpBinaryOnce(bin);

    return bin;

  }

  const envPath = process.env.YTDLP_PATH?.trim();

  if (envPath && !existsSync(envPath)) {

    console.warn(

      `[ytdlp:path] YTDLP_PATH is set to "${envPath}" but the file does not exist; falling back to the bundled/PATH yt-dlp.`,

    );

  }

  const source = envPath || bundledYtDlp() || "yt-dlp";

  const bin = prepareBinary(source, "yt-dlp");

  void logYtDlpBinaryOnce(bin);

  return bin;

}



/**

 * Resolves the ffmpeg executable to spawn, in priority order:

 *   1. explicit `FFMPEG_PATH` env override (local dev)

 *   2. the platform ffmpeg binary bundled by `@ffmpeg-installer/ffmpeg`

 *   3. `ffmpeg` on PATH

 *

 * On Vercel the resolved binary is staged to `/tmp/ffmpeg` with +x first.

 */

function getFfmpegBin(): string {

  const source = process.env.FFMPEG_PATH?.trim() || bundledFfmpeg() || "ffmpeg";

  return prepareBinary(source, "ffmpeg");

}



export function hasFfmpeg(): boolean {

  return !(process.env.NO_FFMPEG === "1");

}



// Cache the resolved cookies flags across calls in the same process. `undefined`
// means "not resolved yet"; a cached `[]` or `["--cookies", path]` avoids
// re-writing the temp file on every yt-dlp spawn.
let ytCookiesFlags: string[] | undefined;

/**
 * Resolves the optional yt-dlp cookies file used to bypass YouTube's bot
 * detection (datacenter IPs are frequently flagged "age-restricted"/"restricted"
 * even for public videos).
 *
 * Two sources, in priority order:
 *   1. `YOUTUBE_COOKIES_PATH`      – absolute path to a cookies.txt file baked
 *      into the image / mounted into the container (checked with existsSync).
 *   2. `YOUTUBE_COOKIES_CONTENT`   – the raw Netscape-format cookies.txt
 *      content, written once per process to a private 0600 temp file. Preferred
 *      on Railway/Vercel, where the OS temp dir is the only writable location.
 *
 * When neither is configured (or both fail) it returns `[]`, so every yt-dlp
 * call behaves exactly as before and Instagram downloads are unaffected.
 * Cookie data itself is never logged or echoed into error output.
 */
async function resolveYtCookiesFlags(): Promise<string[]> {

  if (ytCookiesFlags !== undefined) return ytCookiesFlags;

  const content = process.env.YOUTUBE_COOKIES_CONTENT;

  try {

    const cookiePath = process.env.YOUTUBE_COOKIES_PATH?.trim();

    if (cookiePath) {

      if (existsSync(cookiePath)) {

        ytCookiesFlags = ["--cookies", cookiePath];

        return ytCookiesFlags;

      }

      console.warn("[cookies] YOUTUBE_COOKIES_PATH is set but the file was not found; continuing without cookies.");

    }

  } catch {

    // treat any path-resolution error as "no cookies configured"

  }

  if (content && content.trim().length > 0) {

    try {

      const dest = path.join(os.tmpdir(), `yt-cookies-${process.pid}.txt`);

      await fs.writeFile(dest, `${content.replace(/\r\n/g, "\n")}\n`, { mode: 0o600 });

      ytCookiesFlags = ["--cookies", dest];

      return ytCookiesFlags;

    } catch {

      console.warn("[cookies] Could not write the cookies content to a temp file; continuing without cookies.");

    }

  }

  ytCookiesFlags = [];

  return ytCookiesFlags;

}



// Cache the resolved Facebook cookies flags across calls in the same process.
// Lives completely separately from the YouTube flags above: Facebook needs its
// own logged-in session, and the two must never be mixed.
let facebookCookiesFlags: string[] | undefined;

/**
 * Resolves the optional yt-dlp cookies file used to fetch Facebook videos
 * (Facebook frequently demands a logged-in session even for public videos).
 *
 * Two sources, in priority order:
 *   1. `FACEBOOK_COOKIES_PATH`      – absolute path to a cookies.txt file baked
 *      into the image / mounted into the container (checked with existsSync).
 *   2. `FACEBOOK_COOKIES_CONTENT`   – the raw Netscape-format cookies.txt
 *      content, written once per process to a private 0600 temp file. Preferred
 *      on Railway/Vercel, where the OS temp dir is the only writable location.
 *
 * When neither is configured (or both fail) it returns `[]`, so every yt-dlp
 * call behaves exactly as before and no other platform is affected. Facebook
 * cookie data itself is never logged or echoed into error output.
 */
async function resolveFacebookCookiesFlags(): Promise<string[]> {

  if (facebookCookiesFlags !== undefined) return facebookCookiesFlags;

  const content = process.env.FACEBOOK_COOKIES_CONTENT;

  try {

    const cookiePath = process.env.FACEBOOK_COOKIES_PATH?.trim();

    if (cookiePath) {

      if (existsSync(cookiePath)) {

        facebookCookiesFlags = ["--cookies", cookiePath];

        return facebookCookiesFlags;

      }

      console.warn("[cookies] FACEBOOK_COOKIES_PATH is set but the file was not found; continuing without cookies.");

    }

  } catch {

    // treat any path-resolution error as "no cookies configured"

  }

  if (content && content.trim().length > 0) {

    try {

      const dest = path.join(os.tmpdir(), `fb-cookies-${process.pid}.txt`);

      await fs.writeFile(dest, `${content.replace(/\r\n/g, "\n")}\n`, { mode: 0o600 });

      facebookCookiesFlags = ["--cookies", dest];

      return facebookCookiesFlags;

    } catch {

      console.warn("[cookies] Could not write the Facebook cookies content to a temp file; continuing without cookies.");

    }

  }

  facebookCookiesFlags = [];

  return facebookCookiesFlags;

}

/**
 * Resolves which cookie set (if any) applies to a given URL. Facebook cookies
 * are used ONLY for facebook.com / fb.watch requests, YouTube cookies ONLY for
 * YouTube requests, and every other platform runs without cookies — so the two
 * login sessions never bleed into each other.
 */
async function resolveCookiesFlagsFor(url: string): Promise<string[]> {
  const platform = detectPlatform(url)?.platform;
  if (platform === "facebook") return resolveFacebookCookiesFlags();
  if (platform === "youtube") return resolveYtCookiesFlags();
  return [];
}



interface RunResult {

  stdout: string;

  stderr: string;

  code: number | null;

  timedOut: boolean;

  missing: boolean;

}



async function runYtDlp(

  args: string[],

  timeoutMs = 180_000,

): Promise<RunResult> {

  const finalArgs = [...(await resolveCookiesFlagsFor(args[args.length - 1] ?? "")), ...args];

  return new Promise((resolve) => {

    let stdout = "";

    let stderr = "";



    const child = spawn(/* turbopackIgnore: true */ getBin(), finalArgs, {

      stdio: ["ignore", "pipe", "pipe"],

      windowsHide: true,

    });



    const timer = setTimeout(() => {

      child.kill("SIGKILL");

      resolve({ stdout, stderr, code: null, timedOut: true, missing: false });

    }, timeoutMs);



    child.stdout.on("data", (chunk: Buffer) => {

      stdout += chunk.toString();

    });

    child.stderr.on("data", (chunk: Buffer) => {

      stderr += chunk.toString();

    });

    child.on("error", (err: NodeJS.ErrnoException) => {

      clearTimeout(timer);

      resolve({

        stdout,

        stderr,

        code: null,

        timedOut: false,

        missing: err.code === "ENOENT",

      });

    });

    child.on("close", (code) => {

      clearTimeout(timer);

      resolve({ stdout, stderr, code, timedOut: false, missing: false });

    });

  });

}
/**
 * Summarizes yt-dlp stderr for the server log. Download failures carry the full
 * progress output, so only the trailing lines (where the error lives) are kept.
 */
function summarizeStderr(stderr: string): string {
  const lines = stderr
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const tail = lines.slice(-25).join("\n");
  return tail.length > 4000 ? `${tail.slice(-4000)}\n…` : tail;
}

function classifyError(url: string, stderr: string, result: RunResult): YtDlpError {
  if (result.missing) {
    console.error(`[ytdlp:error] ${url} → TOOLS_MISSING (yt-dlp binary not found)`);
    return new YtDlpError("TOOLS_MISSING", "yt-dlp binary not found.");
  }

  if (result.timedOut) {
    console.error(`[ytdlp:error] ${url} → TIMEOUT (process killed)`);
    return new YtDlpError("TIMEOUT", "The request timed out.");
  }

  const { code, reason } = classifyYtDlpError({ stderr, exitCode: result.code });
  console.error(
    "[ytdlp:error]",
    JSON.stringify({
      url,
      code,
      exitCode: result.code,
      stderr: summarizeStderr(stderr),
    }),
  );
  return new YtDlpError(code, reason || "Unknown error");
}

/**
 * Resolves TikTok short links (vm./vt./t/) to their canonical
 * `https://www.tiktok.com/@user/video/ID` URL before handing them to yt-dlp.
 *
 * Short links are the primary source of "This video is unavailable" false
 * alarms: a stale/dead short code, a bot-verification interstitial, or a
 * region/login redirect makes yt-dlp's extractor fail in ways that look like a
 * removed video. Resolving the redirect ourselves gives the extractor the one
 * URL format it is built and tested against. Resolution is best-effort: when it
 * fails or lands on a non-video page we return the original link unchanged so
 * the failure is reported honestly rather than mislabeled.
 */
async function resolveTikTokShortLink(url: string): Promise<string> {
  const isTikTokShort =
    /^https?:\/\/(?:vm|vt)\.tiktok\.com\/[\w.-]+\/?$/i.test(url) ||
    /^https?:\/\/(?:(?:www|m)\.)?tiktok\.com\/t\/[\w.-]+\/?$/i.test(url);
  if (!isTikTokShort) return url;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const res = await fetch(url, {
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "user-agent": PROBE_UA,
          accept: "text/html,application/xhtml+xml",
        },
      });
      const canonical = canonicalizeTikTokFinalUrl(res.url);
      if (canonical && canonical !== url) {
        console.warn(`[ytdlp:resolve] ${url} → ${canonical}`);
        return canonical;
      }
      return url;
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    console.warn(
      `[ytdlp:resolve] could not resolve ${url} (${(err as Error)?.message}); handing the original to yt-dlp`,
    );
    return url;
  }
}
/**

 * Fetches full metadata + format list for a single video (no playlist pages).

 */

export async function getVideoInfo(url: string): Promise<RawVideoInfo> {

  if (process.env.NO_BACKEND === "1") {

    throw new YtDlpError("TOOLS_MISSING", "Backend is disabled in this environment.");

  }

  const input = await resolveTikTokShortLink(url);

  const result = await runYtDlp([

    "--no-warnings",

    "--no-cache-dir",

    "--no-playlist",

    "--skip-download",

    "--dump-single-json",

    "--socket-timeout",

    "20",

    "--",

    input,

  ]);



  if (result.code !== 0) {

    throw classifyError(url, result.stderr, result);

  }



  try {

    const parsed = JSON.parse(result.stdout) as RawVideoInfo;

    if (parsed._type === "playlist") {

      throw new YtDlpError("UNSUPPORTED_PLATFORM", "Playlists are not supported.");

    }

    return parsed;

  } catch (err) {

    if (err instanceof YtDlpError) throw err;

    console.error(
      "[ytdlp:error]",
      JSON.stringify({
        url,
        code: "EXTRACTOR_ERROR",
        note: "could not parse yt-dlp JSON metadata",
        stdoutHead: result.stdout.slice(0, 500),
      }),
    );

    throw new YtDlpError("EXTRACTOR_ERROR", "Could not parse video metadata.");

  }

}



export interface PreparedFile {

  filePath: string;

  ext: string;

  sizeBytes: number;

}



export interface DownloadProgress {

  /** Combined download percentage (0-100), computed from bytes on disk vs the

   * expected total size so it is monotonic and never freezes early. */

  percent?: number;

  /** Human-readable line, e.g. "1.1 MiB/s · ETA 2:30". */

  text?: string;

}



/**

 * Parses a single `--newline` progress line from yt-dlp's stderr into a

 * percentage and a human-readable summary. Returns nothing for non-progress

 * lines (extraction messages, destination headers, etc.).

 */

function parseProgressLine(line: string): DownloadProgress {

  const progress = line.match(/\[download\]\s+(\d+(?:\.\d+)?)%/i);

  if (progress) {

    const percent = parseFloat(progress[1]);

    const speed = line.match(/at\s+([0-9.]+)\s?(K|M)iB\/s/i);

    const eta = line.match(/ETA\s+(\d+(?::\d+){1,2})/i);

    // NOTE: the percentage is deliberately NOT embedded here — the UI renders a

    // single clamped+monotonic percent in BOTH spots, so the headline always

    // matches the subtext. This string is only the speed/ETA detail.

    const parts: string[] = [];

    if (speed) parts.push(`${speed[1]} ${speed[2]}iB/s`);

    if (eta) parts.push(`ETA ${eta[1]}`);

    return { percent, text: parts.join(" \u00b7 ") };

  }

  if (/\[Merger\]|\[ffmpeg\]|Fixing container|ExtractAudio|FixingUp|PostProcess/i.test(line)) {

    return { text: "Merging audio & video\u2026" };

  }

  return {};

}



/**

 * Spawns yt-dlp with `--newline --progress`, stream-parsing progress lines so

 * the caller can surface live download feedback to the UI.

 */

async function runDownload(

  args: string[],

  onProgress: (p: DownloadProgress) => void,

  timeoutMs: number,

  ctx?: { dir?: string; jobId?: string; expectedTotalBytes?: number },

): Promise<RunResult> {

  const finalArgs = [...(await resolveCookiesFlagsFor(args[args.length - 1] ?? "")), ...args];

  return new Promise((resolve) => {

    let stdout = "";

    let stderr = "";



    const child = spawn(/* turbopackIgnore: true */ getBin(), finalArgs, {

      stdio: ["ignore", "pipe", "pipe"],

      windowsHide: true,

    });



    const timer = setTimeout(() => {

      child.kill("SIGKILL");

      resolve({ stdout, stderr, code: null, timedOut: true, missing: false });

    }, timeoutMs);



    // yt-dlp writes `[download] NN% ...` progress lines to stdout and general

    // messages to stderr, so both streams are drained and line-parsed together.

    //

    // Combined progress comes from the byte footprint on disk, not yt-dlp's

    // per-line percentage — per-line pct is unreliable for HLS (fragment

    // estimates balloon to ~72.7MiB while the real video is 33.28MiB and the

    // printed percent hangs at a few % for most of the download). Bytes on disk

    // only ever grow (and the caller's high-water mark absorbs the brief dip

    // while ffmpeg renames intermediates), so this is monotonic by construction

    // and reflects the true combined share of video+audio bytes written.

    //

    // The denominator anchors on the quality option's expected merged size, and

    // swaps to the sum of ACTUAL leg sizes once each leg's real total is known

    // (DASH lines report "of 30.60MiB" actuals up front; HLS reports its actual

    // only on the final "100% of X in …" line), so the bar can't early-freeze

    // at 99% the moment the small audio leg starts.

    const expectedMiB =

      ctx?.expectedTotalBytes != null && ctx.expectedTotalBytes > 0

        ? ctx.expectedTotalBytes / 1024 / 1024

        : 0;

    const legActual = new Map<string, number>(); // leg -> known ACTUAL total (MiB)

    const doneLegs = new Set<string>();          // legs that reached ~100%

    let currentLeg = "media";

    let diskMiB = 0;    // last sampled bytes on disk for this job (MiB)

    let samplingAt = 0; // last disk-sample timestamp (throttle ~1s)

    let lastText = "";



    const push = (text: string) => {

      lastText = text;

      let denominatorMiB = expectedMiB;

      if (denominatorMiB <= 0) {

        // No option-size anchor (e.g. a direct single-file download): use the

        // sum of every leg's best-known full total so progress still tracks the

        // real byte share.

        for (const size of legActual.values()) denominatorMiB += size;

      }

      let doneTotalMiB = 0;

      for (const [leg, size] of legActual) {

        if (doneLegs.has(leg)) doneTotalMiB += size;

      }

      denominatorMiB = Math.max(denominatorMiB, doneTotalMiB);

      const combined =

        denominatorMiB > 0 && diskMiB > 0

          ? Math.min((diskMiB / denominatorMiB) * 100, 100)

          : undefined;

      onProgress(combined != null ? { percent: combined, text } : { text });

    };



    const sampleDisk = async (): Promise<void> => {

      if (!ctx?.dir || !ctx.jobId) return;

      const now = Date.now();

      if (now - samplingAt < 1000) return;

      samplingAt = now;

      try {

        const entries = await fs.readdir(ctx.dir, { withFileTypes: true });

        let total = 0;

        for (const entry of entries) {

          if (!entry.isFile()) continue;

          const base = path.parse(entry.name).name;

          if (base !== ctx.jobId && !base.startsWith(`${ctx.jobId}.`)) continue;

          try {

            const stat = await fs.stat(path.join(ctx.dir, entry.name));

            total += stat.size;

          } catch {

            // renamed between readdir/stat during ffmpeg merge — the high-water

            // mark in the caller hides any transient dip

          }

        }

        diskMiB = Math.max(diskMiB, total / 1024 / 1024);

        push(lastText);

      } catch {

        // jobs dir missing/locked — reuse the last known sample

      }

    };



    const makeLineParser = (collect: (c: string) => void) => {

      let buffer = "";

      return (chunk: Buffer) => {

        const text = chunk.toString();

        collect(text);

        buffer += text;

        let idx: number;

        while ((idx = buffer.indexOf("\n")) >= 0) {

          const line = buffer.slice(0, idx).trim();

          buffer = buffer.slice(idx + 1);

          if (!line) continue;



          const dest = line.match(/\[download\]\s+Destination:\s*(\S+)/i);

          if (dest) {

            currentLeg = path.basename(dest[1]);

            continue;

          }



          const parsed = parseProgressLine(line);

          if (parsed.percent != null) {

            // Size comes in two flavors: "of ~X" (an ESTIMATE, e.g. for HLS

            // fragments) and "of X" (the ACTUAL size, printed by the DASH

            // headers and the final "100% of X in 00:00:NN" line). Estimates

            // can swing wildly (72.7MiB while the real video is 33.28MiB), so

            // only ACTUAL sizes feed the denominator.

            let sizeMiB = 0;

            const sizeMatch = line.match(/of\s+(~?\s*null|~?\s*)([\d.]+)\s?(K|M)iB/i);

            const isEstimate = sizeMatch && sizeMatch[1].trim().startsWith("~");

            sizeMiB = sizeMatch

              ? sizeMatch[3].toUpperCase() === "K"

                ? parseFloat(sizeMatch[2]) / 1024

                : parseFloat(sizeMatch[2])

              : 0;

            // Ignore phantom progress lines (e.g. the HLS manifest probe that

            // yt-dlp reports as "100%" against a ~1KB size). Skipping them

            // prevents the high-water mark from freezing at 99% before the

            // real download even starts.

            if (sizeMiB > 0.001) {

              if (!isEstimate) {

                const prev = legActual.get(currentLeg);

                legActual.set(currentLeg, prev == null || sizeMiB <= prev ? sizeMiB : prev);

              }

              if (parsed.percent >= 99.5) doneLegs.add(currentLeg);

              void sampleDisk();

              push(parsed.text ?? "");

            } else {

              onProgress({ text: parsed.text ?? "" });

            }

          } else if (parsed.text) {

            onProgress(parsed);

          }

        }

      };

    };



    child.stdout.on("data", makeLineParser((c) => (stdout += c)));

    child.stderr.on("data", makeLineParser((c) => (stderr += c)));

    child.on("error", (err: NodeJS.ErrnoException) => {

      clearTimeout(timer);

      resolve({

        stdout,

        stderr,

        code: null,

        timedOut: false,

        missing: err.code === "ENOENT",

      });

    });

    child.on("close", (code) => {

      clearTimeout(timer);

      resolve({ stdout, stderr, code, timedOut: false, missing: false });

    });

  });

}



const PROBE_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36";



/**

 * Spawns ffmpeg and waits for it to exit. Used for the server-side audio→MP3

 * conversion step in audio mode.

 */

function runFfmpeg(

  args: string[],

  timeoutMs = 600_000,

): Promise<RunResult> {

  return new Promise((resolve) => {

    let stdout = "";

    let stderr = "";



    const child = spawn(/* turbopackIgnore: true */ getFfmpegBin(), args, {

      stdio: ["ignore", "pipe", "pipe"],

      windowsHide: true,

    });



    const timer = setTimeout(() => {

      child.kill("SIGKILL");

      resolve({ stdout, stderr, code: null, timedOut: true, missing: false });

    }, timeoutMs);



    child.stdout.on("data", (chunk: Buffer) => {

      stdout += chunk.toString();

    });

    child.stderr.on("data", (chunk: Buffer) => {

      stderr += chunk.toString();

    });

    child.on("error", (err: NodeJS.ErrnoException) => {

      clearTimeout(timer);

      resolve({

        stdout,

        stderr,

        code: null,

        timedOut: false,

        missing: err.code === "ENOENT",

      });

    });

    child.on("close", (code) => {

      clearTimeout(timer);

      resolve({ stdout, stderr, code, timedOut: false, missing: false });

    });

  });

}



/**

 * Encodes the downloaded source audio stream into a CBR MP3 using libmp3lame.

 * CBR makes the output size equal to `kbps × duration ÷ 8` (± one MP3 frame of

 * padding), which is exactly the figure reported on the quality card, so the

 * pre-download size and the real file match within a couple of KB. The source

 * file is removed afterwards.

 */

async function convertToMp3(

  srcPath: string,

  dir: string,

  jobId: string,

  kbps: number,

): Promise<string> {

  if (!hasFfmpeg()) {

    throw new YtDlpError("TOOLS_MISSING", "ffmpeg is required for MP3 output.");

  }

  const outPath = path.join(dir, `${jobId}.mp3`);

  // TikTok (and some other sources) already serve the audio as a native .mp3,
  // so yt-dlp's output template lands on `jobId.mp3` — the same path we would
  // write. Encode through a distinct intermediate path first, then swap it in.
  const samePath = path.resolve(srcPath) === path.resolve(outPath);

  const writePath = samePath

    ? path.join(dir, `${jobId}.enc.part`)

    : outPath;

  const result = await runFfmpeg([

    "-y",

    "-v",

    "error",

    "-i",

    srcPath,

    "-vn",

    "-acodec",

    "libmp3lame",

    "-b:a",

    `${kbps}k`,

    "-ar",

    "44100",

    "-f",

    "mp3",

    writePath,

  ]);

  if (result.missing) {

    throw new YtDlpError("TOOLS_MISSING", "ffmpeg binary not found.");

  }

  if (result.timedOut) {

    throw new YtDlpError("TIMEOUT", "MP3 conversion timed out.");

  }

  if (result.code !== 0) {

    console.error(
      "[ffmpeg:error]",
      JSON.stringify({
        jobId,
        kbps,
        stderr: result.stderr.trim().split(/\r?\n/).slice(-10).join("\n") || "ffmpeg error",
      }),
    );

    throw new YtDlpError("DOWNLOAD_FAILED", "MP3 conversion failed.");

  }

  if (samePath) {

    await fs.unlink(srcPath).catch(() => undefined);

    await fs.rename(writePath, outPath).catch(() => undefined);

  } else {

    await fs.unlink(srcPath).catch(() => undefined);

  }

  return outPath;

}



/**

 * Probes how fast a direct file URL downloads from this machine by fetching

 * the first ~1MB over a bounded window. For HLS manifests it first resolves the

 * playlist to a real media segment URL, so throughput reflects the segmented

 * stream rather than the tiny manifest itself.

 */

async function probeUrlSpeed(url: string): Promise<number> {

  let target = url;

  if (/\.m3u8(\?|$)/i.test(url) || /\/api\/manifest\//i.test(url)) {

    try {

      const res = await fetch(url, { headers: { "user-agent": PROBE_UA } });

      if (!res.ok) return 0;

      const manifest = await res.text();

      const first = manifest

        .split("\n")

        .map((l) => l.trim())

        .find((l) => /^(#|$)/.test(l) !== true && /\.(m4s|ts|mp4|aac)(\?|$)/i.test(l));

      if (first) target = /^https?:/i.test(first) ? first : new URL(first, url).href;

      else return 0;

    } catch {

      return 0;

    }

  }



  const ctrl = new AbortController();

  const timer = setTimeout(() => ctrl.abort(), 8000);

  const started = Date.now();

  let count = 0;

  try {

    const res = await fetch(target, {

      signal: ctrl.signal,

      headers: { range: "bytes=0-1048575", "user-agent": PROBE_UA },

    });

    if (!res.ok || !res.body) return 0;

    const reader = res.body.getReader();

    for (;;) {

      const { done, value } = await reader.read();

      if (done) break;

      count += value.length;

    }

  } catch {

    // aborted (timeout) or network hiccup — whatever was read counts

  }

  clearTimeout(timer);

  const secs = (Date.now() - started) / 1000;

  return secs > 0 ? count / 1048576 / secs : 0;

}



/**

 * Given the merged format expression a quality button produced (e.g.

 * "270/137+ba[ext=m4a]/…"), speed-probes the first two concrete video

 * candidates (often HLS vs DASH copies of the same encode) and reorders the

 * download so the faster stream wins. YouTube's throttling fluctuates heavily

 * minute-to-minute, so this adapts per job instead of trusting a static pick.

 * Returns the original expression unchanged when there is nothing to compare

 * or probing fails.

 */

export async function optimizeFormatExpression(

  url: string,

  formatExpression: string,

): Promise<string> {

  const firstAlt = formatExpression.split("/")[0];

  if (!firstAlt.includes("+")) return formatExpression; // no merge needed



  const [videoPart, ...audioParts] = firstAlt.split("+");

  const ids = videoPart

    .split("/")

    .map((s) => s.trim())

    .filter((s) => /^[A-Za-z0-9_.-]+$/.test(s));

  if (ids.length < 2) return formatExpression;



  const audioPart = audioParts.join("+");

  const result = await runYtDlp([

    "--no-warnings",

    "--no-cache-dir",

    "--no-playlist",

    "--get-url",

    "-f",

    ids.join(","),

    "--socket-timeout",

    "20",

    "--",

    url,

  ]);

  if (result.code !== 0) return formatExpression;



  const urls = result.stdout

    .trim()

    .split("\n")

    .map((l) => l.trim())

    .filter((l) => l.startsWith("http"));

  if (urls.length < 2) return formatExpression;



  const speeds = await Promise.all(urls.map(probeUrlSpeed));

  const winner =

    (speeds[0] ?? 0) >= (speeds[1] ?? 0) ? ids[0] : ids[1];

  if (winner === ids[0]) return formatExpression; // preferred pick already fastest



  const rest = formatExpression.split("/").slice(1).join("/");

  return `${winner}+${audioPart}/${rest}`;

}



/**

 * Extracts the direct download URL(s) for a video without downloading anything.

 * Returns one URL for combined formats, or two URLs (video + audio) for split formats.

 * The URLs are time-limited (YouTube tokens expire in ~6 hours).

 * This enables browser-native downloads at full bandwidth, bypassing server-side throttling.

 */

export async function getDirectUrl(

  url: string,

  formatExpression: string,

): Promise<{ urls: string[]; isCombined: boolean }> {

  if (process.env.NO_BACKEND === "1") {

    throw new YtDlpError("TOOLS_MISSING", "Backend is disabled in this environment.");

  }

  const input = await resolveTikTokShortLink(url);

  const result = await runYtDlp([

    "--no-warnings",

    "--no-cache-dir",

    "--no-playlist",

    "--get-url",

    "-f",

    formatExpression,

    "--socket-timeout",

    "20",

    "--",

    input,

  ]);



  if (result.code !== 0) {

    throw classifyError(url, result.stderr, result);

  }



  const urls = result.stdout

    .trim()

    .split("\n")

    .map((line) => line.trim())

    .filter((line) => line.startsWith("http"));



  // HLS manifests (m3u8) can't be saved by a browser as a video file — only

  // direct file URLs (MP4/WebM/DASH) qualify for a browser-native download.

  const downloadable = urls.filter(

    (u) => !/\.m3u8(\?|$)/i.test(u) && !/\/api\/manifest\//i.test(u),

  );



  if (downloadable.length === 0) {

    return { urls: [], isCombined: false };

  }



  return {

    urls: downloadable,

    isCombined: downloadable.length === 1,

  };

}



export interface PrepareOptions {

  /** When set, the downloaded source audio is re-encoded to this CBR MP3

   * bitrate (128/192/320) and the returned file is the finished `.mp3`. */

  audioKbps?: number;

}



/**

 * Downloads a video to disk using yt-dlp (merging with ffmpeg when needed).

 * In audio mode it downloads the best source audio stream and re-encodes it to

 * a CBR MP3 at the tier bitrate. Returns the resulting file path, extension and

 * size.

 */

export async function prepareDownload(

  url: string,

  dir: string,

  jobId: string,

  formatExpression: string,

  timeoutMs = 900_000,

  onProgress?: (p: DownloadProgress) => void,

  expectedSizeBytes?: number,

  options?: PrepareOptions,

): Promise<PreparedFile> {

  const input = await resolveTikTokShortLink(url);

  const outputTemplate = path.join(dir, `${jobId}.%(ext)s`);

  // Audio mode fetches a single stream and converts it ourselves, so no

  // mp4 remux/merge post-processing is desired.

  const mergeArgs =

    !options?.audioKbps && hasFfmpeg()

      ? ["--merge-output-format", "mp4", "--remux-video", "mp4"]

      : [];



  const expression = await optimizeFormatExpression(input, formatExpression);



  const result = await runDownload(

    [

      "--no-warnings",

      "--no-cache-dir",

      "--no-playlist",

      "--format",

      expression,

      ...mergeArgs,

      "--concurrent-fragments",

      "4",

      "--newline",

      "--progress",

      "--output",

      outputTemplate,

      "--socket-timeout",

      "20",

      "--",

      input,

    ],

    (p) => onProgress?.(p),

    timeoutMs,

    { dir, jobId, expectedTotalBytes: expectedSizeBytes },

  );



  if (result.code !== 0) {

    throw classifyError(url, result.stderr, result);

  }



  const files = await findJobFiles(dir, jobId);

  if (files.length === 0) {

    throw new YtDlpError("DOWNLOAD_FAILED", "No output file was produced.");

  }



  const targetPath = files.sort((a, b) => b.size - a.size)[0].filePath;



  if (options?.audioKbps) {

    onProgress?.({ percent: 90, text: "Converting to MP3\u2026" });

    const mp3Path = await convertToMp3(targetPath, dir, jobId, options.audioKbps);

    for (const f of files) {

      if (f.filePath !== mp3Path) fs.unlink(f.filePath).catch(() => undefined);

    }

    const stat = await fs.stat(mp3Path);

    if (typeof stat.isFile === "function" && !stat.isFile()) {

      throw new YtDlpError("DOWNLOAD_FAILED", "Output is not a regular file.");

    }

    return { filePath: mp3Path, ext: "mp3", sizeBytes: stat.size };

  }



  const ext = path.extname(targetPath).replace(".", "") || "mp4";

  const stat = await fs.stat(targetPath);

  if (typeof stat.isFile === "function" && !stat.isFile()) {

    throw new YtDlpError("DOWNLOAD_FAILED", "Output is not a regular file.");

  }

  return { filePath: targetPath, ext, sizeBytes: stat.size };

}



async function findJobFiles(dir: string, jobId: string) {

  const entries = await fs.readdir(dir, { withFileTypes: true });

  const jobs: Array<{ filePath: string; size: number }> = [];

  for (const entry of entries) {

    const base = path.parse(entry.name).name;

    const done = base === jobId;

    const isPartial = /\.part$|\.ytdl$|\.temp$/.test(entry.name);

    if (!done && !isPartial) continue;

    const filePath = path.join(dir, entry.name);

    let size = 0;

    try {

      const stat = await fs.stat(filePath);

      size = stat.size;

    } catch {

      continue;

    }

    if (done && size > 0) {

      jobs.push({ filePath, size });

    } else {

      // Clean up leftover .part / companion files for this job.

      fs.unlink(filePath).catch(() => undefined);

    }

  }

  return jobs;

}



export async function ensureDir(dir: string): Promise<void> {

  await fs.mkdir(dir, { recursive: true });

} 
