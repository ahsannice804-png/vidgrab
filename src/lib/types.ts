import type { ApiErrorCode } from "./errorCodes";
import type { Platform } from "./detection";

export type OutputMode = "video" | "audio";

export interface QualityOption {
  /** Human label shown on the button, e.g. "1080p HD" or "High · ~192k" */
  label: string;
  /** Vertical resolution in pixels, e.g. 1080. 0 for audio-only options. */
  height: number;
  /** Result kind; drives icons, badges, step labels and pipe output. */
  mode?: OutputMode;
  /** Output file extension of the final downloadable. */
  outputExt?: string;
  /** Estimated output file size in bytes, when known */
  sizeBytes: number | null;
  /** True when video and audio need to be merged server-side (ffmpeg) */
  needsMerge: boolean;
  /** yt-dlp format id to use for direct single-format download */
  formatId?: string;
  /** yt-dlp format id of the audio stream paired with the video (merge builds) */
  audioFormatId?: string;
  /** Selected video format's live bitrate in kbps (vbr/tbr), for diagnostics */
  bitrateKbps?: number;
  /** Same-height alternative video format id (e.g. the DASH sibling of an HLS
   * pick) so the server can speed-probe both streams and download the faster. */
  altFormatId?: string;
}

export interface VideoMeta {
  id: string;
  title: string;
  thumbnail: string | null;
  duration: number | null;
  uploader: string | null;
  views: number | null;
  url: string;
}

export interface InfoSuccess {
  ok: true;
  platform: Platform;
  video: VideoMeta;
  /** Video quality options (video mode) */
  options: QualityOption[];
  /** Audio quality options (audio mode) */
  audioOptions: QualityOption[];
}

export interface InfoError {
  ok: false;
  code: ApiErrorCode;
  message: string;
}

export type InfoResult = InfoSuccess | InfoError;

export type JobStatus = "queued" | "preparing" | "ready" | "error";

export interface JobSnapshot {
  jobId: string;
  status: JobStatus;
  phase: string;
  errorCode?: ApiErrorCode;
  errorMessage?: string;
  downloadUrl?: string;
  filename?: string;
  sizeBytes?: number;
  /** Live download progress (0-100) reported by yt-dlp while the job runs. */
  progressPercent?: number;
  /** Human-readable live status, e.g. "45% · 1.1 MiB/s · ETA 2:30". */
  progressText?: string;
}

export interface DownloadRequest {
  url: string;
  platform?: Platform;
  mode?: OutputMode;
  /** Index into InfoSuccess.options (video) — mutually exclusive with audioIndex */
  optionIndex?: number;
  /** Index into InfoSuccess.audioOptions (audio) — mutually exclusive with optionIndex */
  audioIndex?: number;
  quality?: string;
  formatId?: string;
}

export interface DownloadAccepted {
  ok: true;
  jobId: string;
  token: string;
  status: JobStatus;
}

export interface DownloadError {
  ok: false;
  code: ApiErrorCode;
  message: string;
}

export type DownloadResult = DownloadAccepted | DownloadError;