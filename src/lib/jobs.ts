import { randomBytes } from "node:crypto";
import path from "node:path";
import { promises as fs } from "node:fs";
import type { Platform } from "./detection";
import type { ApiErrorCode } from "./errorCodes";
import { ERROR_MESSAGES } from "./errorCodes";
import type { JobSnapshot, OutputMode } from "./types";
import { ensureDir, prepareDownload } from "./ytdlp";

export interface DownloadJob {
  id: string;
  platform: Platform;
  url: string;
  formatExpression: string;
  filename: string;
  token: string;
  status: "queued" | "preparing" | "ready" | "error";
  errorCode?: ApiErrorCode;
  errorMessage?: string;
  createdAt: number;
  finishedAt?: number;
  filePath?: string;
  sizeBytes?: number;
  phase: string;
  progressPercent?: number;
  progressText?: string;
  /** Expected merged/downloaded size in bytes, used as the progress denominator. */
  expectedSizeBytes?: number;
  /** "audio" for MP3 jobs, undefined for video jobs. */
  mode?: OutputMode;
  /** CBR MP3 bitrate for audio jobs (128/192/320). */
  audioKbps?: number;
}

const jobs = new Map<string, DownloadJob>();
const queue: string[] = [];
let active = 0;

// Every file a download touches (source stream, merged video, MP3 output) lives
// under this root. Vercel Serverless Functions only allow writes under `/tmp`
// — the task directory is read-only — so on Vercel we always use
// `/tmp/downloads`, ignoring any DOWNLOAD_DIR override. Locally we keep the
// project tmp dir so downloads don't clutter the OS temp folder.
const DOWNLOAD_DIR =
  process.env.VERCEL === "1"
    ? path.join("/tmp", "downloads")
    : process.env.DOWNLOAD_DIR
      ? path.resolve(process.env.DOWNLOAD_DIR)
      : path.join(process.cwd(), "tmp", "downloads");
const MAX_CONCURRENT = Math.max(1, Math.min(4, parseInt(process.env.MAX_DOWNLOADS ?? "", 10) || 3));
const CLEANUP_MS = 30 * 60 * 1000;
const MAX_AGE_MS = 35 * 60 * 1000;

export { DOWNLOAD_DIR };

function genToken(): string {
  return randomBytes(16).toString("hex");
}

function genId(): string {
  return `dl_${Date.now().toString(36)}_${randomBytes(4).toString("hex")}`;
}

export function createJob(input: {
  platform: Platform;
  url: string;
  formatExpression: string;
  filename: string;
  expectedSizeBytes?: number;
  mode?: OutputMode;
  audioKbps?: number;
}): DownloadJob {
  const id = genId();
  const job: DownloadJob = {
    id,
    platform: input.platform,
    url: input.url,
    formatExpression: input.formatExpression,
    filename: input.filename,
    expectedSizeBytes: input.expectedSizeBytes,
    mode: input.mode,
    audioKbps: input.audioKbps,
    token: genToken(),
    status: "queued",
    createdAt: Date.now(),
    phase: "Waiting in queue\u2026",
  };
  jobs.set(id, job);
  queue.push(id);
  void pump();
  return job;
}

export function getJob(id: string, token: string): JobSnapshot | null {
  const job = jobs.get(id);
  if (!job || job.token !== token) return null;
  const snapshot: JobSnapshot = {
    jobId: job.id,
    status: job.status,
    phase: job.phase,
    errorCode: job.errorCode,
    errorMessage: job.errorMessage,
    filename: job.filename,
    sizeBytes: job.sizeBytes,
    progressPercent: job.progressPercent,
    progressText: job.progressText,
  };
  if (job.status === "ready" && job.filePath && job.sizeBytes) {
    snapshot.downloadUrl = `/api/file/${job.id}?token=${encodeURIComponent(job.token)}`;
    snapshot.filename = job.filename;
  }
  return snapshot;
}

export async function consumeFile(
  id: string,
  token: string,
): Promise<{ filePath: string; filename: string; sizeBytes: number } | null> {
  const job = jobs.get(id);
  if (!job || job.token !== token || job.status !== "ready" || !job.filePath) return null;
  return { filePath: job.filePath, filename: job.filename, sizeBytes: job.sizeBytes ?? 0 };
}

function markError(job: DownloadJob, code: ApiErrorCode, message: string) {
  job.status = "error";
  job.errorCode = code;
  job.errorMessage = message;
  job.phase = message;
  job.finishedAt = Date.now();
}

async function pump(): Promise<void> {
  while (active < MAX_CONCURRENT && queue.length > 0) {
    const id = queue.shift()!;
    const job = jobs.get(id);
    if (!job || job.status !== "queued") continue;
    active += 1;
    processJob(job).finally(() => {
      active -= 1;
      void pump();
    });
  }
}

async function processJob(job: DownloadJob): Promise<void> {
  const audio = job.mode === "audio";
  job.status = "preparing";
  job.phase = audio ? "Downloading audio\u2026" : "Downloading video\u2026";
  try {
    await ensureDir(DOWNLOAD_DIR);
    const result = await prepareDownload(
      job.url,
      DOWNLOAD_DIR,
      job.id,
      job.formatExpression,
      900_000,
      (p) => {
        if (p.percent != null) {
          // High-water mark: the combined percent we compute is monotonic, but
          // clamp to 99% while merging/converting — only show 100% once the job
          // is truly ready.
          const high = Math.max(job.progressPercent ?? 0, p.percent);
          job.progressPercent = Math.min(high, 99);
        }
        if (p.text) {
          job.progressText = p.text;
          if (p.text.startsWith("Converting")) {
            job.phase = "Converting to MP3\u2026";
          } else if (p.text.startsWith("Merging")) {
            job.phase = "Merging audio & video\u2026";
          }
        }
      },
      job.expectedSizeBytes,
      job.audioKbps ? { audioKbps: job.audioKbps } : undefined,
    );
    job.status = "ready";
    job.phase = "Download ready";
    job.progressPercent = 100;
    job.filePath = result.filePath;
    job.sizeBytes = result.sizeBytes;
    job.filename = `${job.filename}.${result.ext}`;
    job.finishedAt = Date.now();
  } catch (err) {
    const e = err as { code?: ApiErrorCode; message?: string };
    const code = e.code ?? "DOWNLOAD_FAILED";
    // The underlying yt-dlp/ffmpeg failure is logged here so production issues
    // are diagnosable from the deploy logs; the user only ever sees the
    // categorized, accurate message for this failure type.
    console.error(
      "[download:error]",
      JSON.stringify({ jobId: job.id, url: job.url, code, detail: e.message }),
    );
    markError(job, code, ERROR_MESSAGES[code] ?? ERROR_MESSAGES.INTERNAL);
  }
}

function sweep(): void {
  const now = Date.now();
  for (const job of jobs.values()) {
    if (now - job.createdAt > MAX_AGE_MS) {
      jobs.delete(job.id);
      if (job.filePath) fs.unlink(job.filePath).catch(() => undefined);
      const idx = queue.indexOf(job.id);
      if (idx !== -1) queue.splice(idx, 1);
    }
  }
}

setInterval(sweep, CLEANUP_MS).unref();

// On boot, remove leftover partial files from crashed/restarted servers so no
// orphaned `.part` streams linger on disk or confuse future jobs.
void (async () => {
  try {
    const entries = await fs.readdir(DOWNLOAD_DIR, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (/\.part$|\.ytdl$|\.temp$/.test(entry.name)) {
        fs.unlink(path.join(DOWNLOAD_DIR, entry.name)).catch(() => undefined);
      }
    }
  } catch {
    // directory may not exist yet — harmless
  }
})();