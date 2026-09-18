export function formatDuration(totalSeconds?: number): string {
  if (typeof totalSeconds !== "number" || !Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "";
  }
  const s = Math.floor(totalSeconds % 60);
  const m = Math.floor((totalSeconds / 60) % 60);
  const h = Math.floor(totalSeconds / 3600);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function formatBytes(bytes?: number | null): string {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  const rounded = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[i]}`;
}

export function formatViews(views?: number): string {
  if (typeof views !== "number" || !Number.isFinite(views) || views < 0) return "";
  if (views < 1000) return `${views}`;
  if (views < 1_000_000) return `${Math.floor(views / 1000)}K`;
  return `${(views / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

const ILLEGAL_FILE_CHARS = /[<>:"/\\|?*\u0000-\u001f]/g;

export function sanitizeFilename(input: string, fallback = "video"): string {
  const cleaned = (input || "")
    .replace(ILLEGAL_FILE_CHARS, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return cleaned.length > 0 ? cleaned : fallback;
}

export function parseFileSizeInput(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}