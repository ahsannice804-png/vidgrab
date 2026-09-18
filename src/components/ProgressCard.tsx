"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { JobSnapshot } from "@/lib/types";
import type { Platform } from "@/lib/detection";
import { formatBytes } from "@/lib/format";

interface ProgressCardProps {
  snapshot: JobSnapshot;
  needsMerge: boolean;
  isAudio?: boolean;
  downloadUrl: string;
  progressPercent?: number;
  progressText?: string;
  platform?: Platform;
  videoTitle?: string;
  onRetry: (url: string) => void;
  onReset: () => void;
}

type StepIndex = 0 | 1 | 2 | 3;

function getStepIndex(
  status: string,
  needsMerge: boolean,
  isAudio: boolean,
  converting: boolean,
): StepIndex {
  if (status === "queued") return 0;
  if (status === "preparing") {
    if (isAudio) return converting ? 2 : 1;
    return needsMerge ? 2 : 1;
  }
  if (status === "ready") return 3;
  return 1;
}

function getStepLabel(idx: StepIndex, isAudio: boolean): string {
  switch (idx) {
    case 0:
      return "Waiting in queue\u2026";
    case 1:
      return isAudio ? "Downloading audio\u2026" : "Preparing your file\u2026";
    case 2:
      return isAudio ? "Converting to MP3\u2026" : "Merging audio & video\u2026";
    case 3:
      return "Almost ready\u2026";
  }
}

function getStepDescription(idx: StepIndex, isAudio: boolean): string {
  switch (idx) {
    case 0:
      return "You\u2019re in line \u2014 this won\u2019t take long.";
    case 1:
      return isAudio
        ? "Pulling the best audio track from the video."
        : "Downloading and processing your video.";
    case 2:
      return isAudio
        ? "Encoding your MP3 at the chosen bitrate."
        : "Pulling together the best video and audio streams.";
    case 3:
      return "Finalizing your download.";
  }
}

/** Live label shown once yt-dlp reports real progress. */
function liveLabel(
  needsMerge: boolean,
  progressText: string,
  isAudio: boolean,
): string {
  if (isAudio) {
    return progressText.startsWith("Converting")
      ? "Converting to MP3\u2026"
      : "Downloading audio\u2026";
  }
  if (needsMerge) {
    return progressText.startsWith("Merging")
      ? "Merging audio & video\u2026"
      : "Downloading video & audio\u2026";
  }
  return "Preparing your file\u2026";
}

/** Where each real backend stage lets the fill rest while it "earns" progress. */
const STAGE_FILL_TARGET: Record<StepIndex, number> = {
  0: 22,
  1: 55,
  2: 80,
  3: 100,
};

const COMPLETE_ICON = (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

/** Hex color + fixed radial offset (dx, dy) + stagger delay for micro-confetti. */
const CONFETTI: Array<{ color: string; dx: number; dy: number; delay: number }> = [
  { color: "#34d399", dx: -34, dy: -30, delay: 0 },
  { color: "#fbbf24", dx: 30, dy: -34, delay: 60 },
  { color: "#f87171", dx: 40, dy: 0, delay: 120 },
  { color: "#818cf8", dx: -22, dy: 34, delay: 40 },
  { color: "#2dd4bf", dx: 24, dy: 36, delay: 100 },
  { color: "#f472b6", dx: -42, dy: 2, delay: 160 },
  { color: "#a78bfa", dx: 0, dy: -44, delay: 200 },
  { color: "#4ade80", dx: 0, dy: 44, delay: 20 },
];

function PlatformPill({ platform }: { platform?: Platform }) {
  const styles: Record<string, string> = {
    youtube: "bg-red-500/12 text-red-700 ring-red-500/25 dark:text-red-300",
    instagram:
      "bg-gradient-to-r from-amber-500/15 via-fuchsia-500/15 to-violet-500/15 text-fuchsia-700 ring-fuchsia-500/25 dark:text-fuchsia-300",
    tiktok:
      "bg-gradient-to-r from-cyan-500/15 to-teal-500/15 text-cyan-700 ring-cyan-500/25 dark:text-cyan-300",
    facebook:
      "bg-blue-500/12 text-blue-700 ring-blue-500/25 dark:text-blue-300",
  };
  const cls = platform ? styles[platform] : styles.instagram;
  const label =
    platform === "youtube"
      ? "▶ YouTube"
      : platform === "tiktok"
        ? "♪ TikTok"
        : platform === "facebook"
          ? "f Facebook"
          : "◉ Instagram";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${cls}`}>
      {label}
    </span>
  );
}

export function ProgressCard({
  snapshot,
  needsMerge,
  isAudio = false,
  downloadUrl,
  progressPercent,
  progressText,
  platform,
  videoTitle,
  onRetry,
  onReset,
}: ProgressCardProps) {
  const isComplete = snapshot.status === "ready";
  const converting = isAudio && (progressText ?? "").startsWith("Converting");
  const currentStep = useMemo(
    () =>
      getStepIndex(
        snapshot.status,
        needsMerge,
        isAudio,
        converting,
      ),
    [snapshot.status, needsMerge, isAudio, converting],
  );
  const [fill, setFill] = useState(5);
  const [showComplete, setShowComplete] = useState(isComplete);
  const [progressGone, setProgressGone] = useState(isComplete);

  // ONE shared percent drives everything below — the heading, the subtext, and
  // the bar. It is monotonic because the SERVER applies the high-water mark
  // (Math.max over the parallel video/audio leg reports in src/lib/jobs.ts),
  // and it is clamped to 99% while still downloading/merging; only the
  // completed state shows a final 100%.
  const hasLiveProgress =
    !isComplete && progressPercent != null && snapshot.status === "preparing";
  const displayFill = hasLiveProgress
    ? Math.min(Math.max(progressPercent ?? 0, 0), 99)
    : Math.min(fill, isComplete ? 100 : 99);
  const pctLabel = displayFill.toFixed(0);

  // Live detail (speed · ETA, or the merge notice) shown alongside the shared
  // percentage when yt-dlp is actively reporting progress.
  const liveVisible = snapshot.status === "preparing" && progressText != null;

  // The bar starts near empty and "earns" its fill: it creeps toward the current
  // stage's ceiling until the backend actually moves to the next phase. SetState
  // only happens inside the interval callback, so it can't cascade renders.
  useEffect(() => {
    if (isComplete || hasLiveProgress) return;
    const target = STAGE_FILL_TARGET[currentStep];
    const interval = setInterval(() => {
      setFill((prev) => {
        const next = prev + (target - prev) * 0.2;
        return next >= target - 0.5 || next < prev + 0.05 ? target : next;
      });
    }, 700);
    return () => clearInterval(interval);
  }, [currentStep, isComplete, hasLiveProgress]);

  // Once the job is ready, quickly whip the fill to 100% before revealing the
  // completion state, so the finish feels earned.
  useEffect(() => {
    if (!isComplete) return;
    const boost = setInterval(() => {
      setFill((prev) => (prev >= 100 ? 100 : Math.min(100, prev + (100 - prev) * 0.45)));
    }, 120);
    const stop = setTimeout(() => clearInterval(boost), 650);
    return () => {
      clearInterval(boost);
      clearTimeout(stop);
    };
  }, [isComplete]);

  useEffect(() => {
    if (!isComplete) return;
    // Timeline for the satisfying finish:
    //   0ms   bar whips to 100% (boost effect above)
    //   700ms success card mounts while the progress block starts fading out
    //   820ms success card pops in with ease-out-back scale
    //   1300ms progress block unmounts (cross-fade complete)
    const showTimer = setTimeout(() => setShowComplete(true), 700);
    const goneTimer = setTimeout(() => setProgressGone(true), 1300);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(goneTimer);
    };
  }, [isComplete]);

  const handleDownload = useCallback(() => {
    if (downloadUrl) {
      onRetry(downloadUrl);
    }
  }, [downloadUrl, onRetry]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/[0.06] via-background to-indigo-500/[0.04] p-4 shadow-lg shadow-violet-500/[0.06] sm:p-5"
      role="status"
      aria-live="polite"
      style={{ animation: "progress-card-in 450ms cubic-bezier(0.16, 1, 0.3, 1) both" }}
    >
      {!isComplete && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          aria-hidden="true"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 0%, rgb(139 92 246) 0%, transparent 60%)",
          }}
        />
      )}

      <div className="relative">
        {!progressGone && (
          <div
            className="w-full"
            style={{
              opacity: showComplete ? 0 : 1,
              transform: showComplete ? "scale(0.98)" : "none",
              transition: showComplete
                ? "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1), transform 500ms cubic-bezier(0.4, 0, 0.2, 1)"
                : undefined,
              pointerEvents: showComplete ? "none" : "auto",
            }}
          >
            <div
              key={
                liveVisible
                  ? `live-${liveLabel(needsMerge, progressText, isAudio)}`
                  : getStepLabel(currentStep, isAudio)
              }
            >
              <p
                className="text-sm font-semibold text-foreground"
                style={{ animation: "progress-text-in 400ms ease-out both" }}
              >
                {liveVisible
                  ? `${liveLabel(needsMerge, progressText!, isAudio)} ${pctLabel}%`
                  : getStepLabel(currentStep, isAudio)}
              </p>
              <p
                className="mt-0.5 text-xs leading-relaxed text-muted"
                style={{ animation: "progress-text-in 400ms ease-out 80ms both" }}
              >
                {liveVisible
                  ? converting
                    ? `${pctLabel}% \u00b7 ${getStepDescription(currentStep, isAudio)}`
                    : `${pctLabel}% \u00b7 ${progressText}`
                  : getStepDescription(currentStep, isAudio)}
              </p>
            </div>

            <div className="mt-3">
              <ProgressBar value={displayFill} />
            </div>
          </div>
        )}

        {isComplete && showComplete && (
          <div
            className="flex flex-col items-center text-center"
            style={{
              animation: "success-card-in 650ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
            }}
          >
            <div className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28" aria-hidden="true">
              <span
                className="absolute inset-3 rounded-full bg-emerald-500/15 blur-xl"
                style={{ animation: "pulse-soft 1.8s cubic-bezier(0.16, 1, 0.3, 1) 820ms both" }}
              />
              <span
                className="absolute inset-3 rounded-full bg-emerald-400/10"
                style={{ animation: "progress-pulse-ring 1.4s ease-out 820ms 1" }}
              />
              {CONFETTI.map((c, i) => (
                <span
                  key={i}
                  className="absolute h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: c.color,
                    // @ts-expect-error CSS custom property for isotropic confetti flight
                    "--dx": `${c[0]}px`,
                    // @ts-expect-error CSS custom property
                    "--dy": `${c[1]}px`,
                    animation: `confetti-fly 950ms ease-out ${c.delay}ms both`,
                  }}
                />
              ))}
              <div
                className="relative z-10 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 sm:h-16 sm:w-16"
                style={{ animation: "progress-check-in 600ms cubic-bezier(0.34, 1.56, 0.64, 1) 820ms both" }}
              >
                {COMPLETE_ICON}
              </div>
            </div>

            <span
              className="mt-1 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-500/25 dark:text-emerald-300"
              style={{ animation: "badge-in 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 900ms both" }}
            >
              <span aria-hidden="true">🎉</span>
              Download Ready!
            </span>

            <div
              className="mt-4 w-full rounded-2xl border border-border/70 bg-white/60 shadow-sm backdrop-blur-md dark:bg-white/[0.04] dark:ring-1 dark:ring-white/10"
              style={{ animation: "pill-in 600ms cubic-bezier(0.16, 1, 0.3, 1) 980ms both" }}
            >
              <p className="truncate px-4 pt-3 text-sm font-semibold text-foreground">
                {videoTitle || snapshot.filename || "Your download"}
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 pb-3 pt-1.5 text-xs text-muted">
                <PlatformPill platform={platform} />
                {snapshot.sizeBytes != null && snapshot.sizeBytes > 0 && (
                  <span className="font-medium text-foreground">{formatBytes(snapshot.sizeBytes)}</span>
                )}
              </div>
            </div>

            <div
              className="mt-5 flex w-full flex-col gap-2.5"
              style={{ animation: "actions-in 600ms cubic-bezier(0.16, 1, 0.3, 1) 1100ms both" }}
            >
              <button
                type="button"
                onClick={handleDownload}
                className="btn-glow btn-ripple relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-600/25 transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-violet-600/40 active:scale-[0.97]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3v11m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                </svg>
                Download File Again
              </button>
              <button
                type="button"
                onClick={onReset}
                className="btn-ripple group relative flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-muted transition-all duration-200 hover:border-violet-500/50 hover:text-foreground active:scale-[0.97]"
              >
                Paste New Link
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className="relative h-2 w-full overflow-hidden rounded-full bg-violet-500/10"
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Download progress"
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-[width] duration-700 ease-in-out"
        style={{ width: `${clamped}%` }}
      />
      <div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          width: `${clamped}%`,
          backgroundImage:
            "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.12) 35%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.12) 65%, transparent 100%)",
          backgroundSize: "220% 100%",
          animation: "progress-shimmer 2.2s ease-in-out infinite",
        }}
      />
    </div>
  );
}