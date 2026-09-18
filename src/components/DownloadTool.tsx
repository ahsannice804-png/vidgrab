"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Platform } from "@/lib/detection";
import { detectPlatform } from "@/lib/detection";
import type { InfoResult, InfoSuccess, JobSnapshot, OutputMode, QualityOption } from "@/lib/types";
import { ERROR_MESSAGES } from "@/lib/errorCodes";
import { TIKTOK_ENABLED, TIKTOK_DISABLED_MESSAGE, PLATFORM_LIST } from "@/lib/features";
import { formatBytes, formatDuration, formatViews } from "@/lib/format";
import { Spinner } from "./Spinner";
import { ProgressCard } from "./ProgressCard";

type Phase = "idle" | "loading" | "ready" | "preparing" | "downloading";

interface DownloadToolProps {
  platform?: Platform;
  variant?: "hero" | "compact";
}

const PLATFORM_HINT: Record<Platform, string> = {
  youtube: "Paste a YouTube link",
  instagram: "Paste an Instagram Reel or post link",
  tiktok: "Paste a TikTok video link",
  facebook: "Paste a Facebook video link",
};

export default function DownloadTool({ platform, variant = "hero" }: DownloadToolProps) {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [info, setInfo] = useState<InfoSuccess | null>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [snapshot, setSnapshot] = useState<JobSnapshot | null>(null);
  const [chosenIndex, setChosenIndex] = useState<number | null>(null);
  const [mode, setMode] = useState<OutputMode>("video");
  const [chosenMode, setChosenMode] = useState<OutputMode>("video");
  const [activeDownload, setActiveDownload] = useState<{ mode: OutputMode; index: number } | null>(
    null,
  );
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tabVideoRef = useRef<HTMLButtonElement | null>(null);
  const tabAudioRef = useRef<HTMLButtonElement | null>(null);
  const pillSlotRef = useRef<{ el: HTMLButtonElement | null; left: number; width: number } | null>(
    null,
  );
  const [tabPill, setTabPill] = useState<{ left: number; width: number; transition: string }>({
    left: 0,
    width: 0,
    transition: "none",
  });

  // Positions the sliding highlight behind the active tab. It animates only
  // when the same buttons are still mounted (i.e. a real tab switch), and snaps
  // on remount/resize so the pill is never caught sliding from a stale spot.
  const positionPill = useCallback(
    (animateOverride?: boolean) => {
      const active = mode === "video" ? tabVideoRef.current : tabAudioRef.current;
      if (!active) return;
      const animate = animateOverride ?? pillSlotRef.current?.el === active;
      pillSlotRef.current = { el: active, left: active.offsetLeft, width: active.offsetWidth };
      setTabPill({
        left: active.offsetLeft,
        width: active.offsetWidth,
        transition: animate
          ? "left 320ms cubic-bezier(0.16, 1, 0.3, 1), width 320ms cubic-bezier(0.16, 1, 0.3, 1)"
          : "none",
      });
    },
    [mode],
  );

  useLayoutEffect(() => {
    positionPill();
  }, [positionPill, phase]);

  useEffect(() => {
    const onResize = () => positionPill(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [positionPill]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function reset() {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    setPhase("idle");
    setInfo(null);
    setError(null);
    setSnapshot(null);
    setChosenIndex(null);
    setChosenMode("video");
    setActiveDownload(null);
    setMode("video");
    setUrl("");
  }

  async function fetchInfo(raw: string) {
    if (!TIKTOK_ENABLED) {
      const detected = detectPlatform(raw);
      if (detected?.platform === "tiktok") {
        setError({ code: "TIKTOK_DISABLED", message: TIKTOK_DISABLED_MESSAGE });
        setPhase("idle");
        return;
      }
    }

    if (platform) {
      const detected = detectPlatform(raw);
      if (detected && detected.platform !== platform) {
        setError({ code: "WRONG_PLATFORM", message: ERROR_MESSAGES.WRONG_PLATFORM });
        setPhase("idle");
        return;
      }
    }

    setError(null);
    setActiveDownload(null);
    setPhase("loading");
    try {
      const res = await fetch("/api/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: raw }),
      });
      const data = (await res.json()) as InfoResult;
      if (!res.ok || !data.ok) {
        const err = data as { code: string; message?: string };
        setError({
          code: err.code,
          message: err.message ?? ERROR_MESSAGES.INTERNAL,
        });
        setPhase("idle");
        return;
      }
      setInfo(data);
      setPhase("ready");
    } catch {
      setError({ code: "INTERNAL", message: ERROR_MESSAGES.INTERNAL });
      setPhase("idle");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const raw = url.trim();
    if (!raw) {
      setError({ code: "INVALID_URL", message: ERROR_MESSAGES.INVALID_URL });
      return;
    }
    void fetchInfo(raw);
  }

  async function startDownload(option: QualityOption, index: number, mode: OutputMode) {
    if (!info) return;
    setError(null);
    setPhase("preparing");
    setSnapshot(null);
    setChosenIndex(index);
    setChosenMode(mode);
    setActiveDownload({ mode, index });

    // Audio (MP3) output needs the server-side conversion pipeline — the raw
    // stream a direct URL would hand the browser is an M4A/Opus source, not the
    // promised MP3, so skip the browser-native fast path for audio entirely.
    if (mode === "audio") {
      await enqueueJob(option, index, mode);
      return;
    }

    // Try direct URL first (browser-native download at full bandwidth) — but only
    // for formats that don't need a server-side merge, and NOT for Instagram:
    // Instagram needs the server pipeline so the user sees the exact same live
    // progress bar (percent, speed, ETA) as YouTube instead of a silent
    // browser download.
    if (!option.needsMerge && option.formatId && info.platform !== "instagram" && info.platform !== "tiktok" && info.platform !== "facebook") {
      try {
        const directRes = await fetch("/api/direct-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: info.video.url,
            platform: info.platform,
            formatId: option.formatId,
            needsMerge: option.needsMerge,
            height: option.height,
            label: option.label,
          }),
        });
        const directData = (await directRes.json()) as
          | { ok: true; urls: string[]; isCombined: boolean }
          | { ok: false; code: string; message?: string };

        if (directRes.ok && directData.ok && directData.isCombined && directData.urls[0]) {
          setPhase("downloading");
          triggerFileDownload(directData.urls[0]);
          setActiveDownload(null);
          return;
        }
      } catch {
        // Direct URL failed: fall back to server-side download
      }
    }

    await enqueueJob(option, index, "video");
  }

  async function enqueueJob(option: QualityOption, index: number, mode: OutputMode) {
    if (!info) return;
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "audio"
            ? {
                url: info.video.url,
                platform: info.platform,
                mode,
                audioIndex: index,
                audioKbps: option.bitrateKbps,
                label: option.label,
                title: info.video.title,
                sizeBytes: option.sizeBytes ?? null,
              }
            : {
                url: info.video.url,
                platform: info.platform,
                optionIndex: info.options.indexOf(option),
                formatId: option.formatId,
                altFormatId: option.altFormatId,
                needsMerge: option.needsMerge,
                height: option.height,
                label: option.label,
                title: info.video.title,
                sizeBytes: option.sizeBytes ?? null,
              },
        ),
      });
      const data = (await res.json()) as
        | { ok: true; jobId: string; token: string }
        | { ok: false; code: string; message?: string };

      if (!res.ok || !data.ok) {
        const err = data as { code: string; message?: string };
        setError({ code: err.code, message: err.message ?? ERROR_MESSAGES.DOWNLOAD_FAILED });
        setPhase("ready");
        setActiveDownload(null);
        return;
      }

      pollJob(data.jobId, data.token);
    } catch {
      setError({ code: "INTERNAL", message: ERROR_MESSAGES.INTERNAL });
      setPhase("ready");
      setActiveDownload(null);
    }
  }

  function pollJob(id: string, token: string) {
    if (pollRef.current) clearInterval(pollRef.current);

    const tick = async () => {
      try {
        const res = await fetch(`/api/job/${id}?token=${encodeURIComponent(token)}`);
        const data = (await res.json()) as { ok: boolean } & JobSnapshot;
        if (!data.ok) return;
        setSnapshot(data);
        if (data.status === "ready") {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setPhase("downloading");
          triggerFileDownload(data.downloadUrl!);
          setActiveDownload(null);
        } else if (data.status === "error") {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setError({ code: data.errorCode ?? "DOWNLOAD_FAILED", message: data.errorMessage ?? ERROR_MESSAGES.DOWNLOAD_FAILED });
          setPhase("ready");
          setActiveDownload(null);
        }
      } catch {
        // transient network issue — keep polling
      }
    };

    void tick();
    pollRef.current = setInterval(tick, 1000);
  }

  function triggerFileDownload(href: string) {
    const a = document.createElement("a");
    a.href = href;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const compact = variant === "compact";

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="group relative w-full"
        role="search"
        aria-label="Video downloader"
      >
        <div
          className={`flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-xl shadow-violet-500/5 transition-shadow focus-within:shadow-violet-500/10 sm:flex-row sm:items-center ${
            compact ? "" : "sm:p-2.5"
          }`}
        >
          <label htmlFor="video-url" className="sr-only">
            {platform ? PLATFORM_HINT[platform] : `Paste a ${PLATFORM_LIST} link`}
          </label>
          <div className="relative flex-1">
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-5 w-5 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <input
              id="video-url"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder={
                platform ? PLATFORM_HINT[platform] : `Paste ${PLATFORM_LIST} link\u2026`
              }
              className="h-13 w-full rounded-xl bg-transparent py-3.5 pl-11 pr-14 text-sm text-foreground placeholder:text-muted focus:outline-none"
              autoComplete="off"
              spellCheck={false}
              disabled={phase === "loading" || phase === "preparing"}
            />
          </div>

          <button
            type="submit"
            disabled={phase === "loading" || phase === "preparing"}
            className="relative flex h-13 min-h-13 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 px-6 text-sm font-semibold text-white shadow-md shadow-violet-600/25 transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {phase === "loading" ? (
              <>
                <Spinner className="h-4 w-4" />
                Processing…
              </>
            ) : phase === "preparing" ? (
              <>
                <Spinner className="h-4 w-4" />
                Preparing…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3v11m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                </svg>
                Download
              </>
            )}
          </button>
        </div>

        {!compact && (
          <p className="mt-3 text-center text-xs text-muted">
            Paste a link from {PLATFORM_LIST}. Free, no sign-up, no watermarks.
          </p>
        )}
      </form>

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300"
        >
          <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 8v4M12 16h.01M10.29 3.86l-8.16 14.12a2 2 0 0 0 1.73 3h16.28a2 2 0 0 0 1.73-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
          <div className="flex-1">
            <p>{error.message}</p>
          </div>
        </div>
      )}

      {phase === "loading" && (
        <div className="mt-6 animate-pulse rounded-2xl border border-border bg-card p-5" aria-live="polite">
          <div className="flex items-center gap-4">
            <div className="h-20 w-32 shrink-0 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <div className="h-10 flex-1 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-10 flex-1 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      )}

      {info && phase !== "loading" && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card transition-all" aria-live="polite">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800 sm:w-56">
              {info.video.thumbnail ? (
                <Image
                  src={info.video.thumbnail}
                  alt={info.video.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 224px"
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                  unoptimized={info.platform === "instagram"}
                />
              ) : (
                <span className="grid h-full place-items-center text-muted">
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M23 14l-5-5-5 5M8.5 9.5a2 2 0 0 1-4 0 2 2 0 0 1 4 0z" />
                  </svg>
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="break-words text-base font-semibold leading-snug">
                {info.video.title}
              </h3>
              <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted">
                {typeof info.video.duration === "number" && (
                  <div className="flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" strokeLinecap="round" />
                    </svg>
                    <dt className="sr-only">Duration</dt>
                    <dd>{formatDuration(info.video.duration)}</dd>
                  </div>
                )}
                {info.video.uploader && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <path d="M4 21v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" />
                        <circle cx="12" cy="7" r="3.5" />
                      </svg>
                      <dt className="sr-only">Uploader</dt>
                      <dd>{info.video.uploader}</dd>
                    </div>
                  </>
                )}
                {typeof info.video.views === "number" && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <dt className="sr-only">Views</dt>
                      <dd>{formatViews(info.video.views)} views</dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>

          <div className="border-t border-border p-4 sm:p-5">
            {phase !== "preparing" && (
              <>
                <div
                  className="relative mb-4 grid grid-cols-2 gap-1 rounded-xl border border-border bg-background p-1"
                  role="tablist"
                  aria-label="Download format"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-1 z-0 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-600/25"
                    style={{
                      left: tabPill.left,
                      width: tabPill.width,
                      transition: tabPill.transition,
                    }}
                  />
                  {([
                    { value: "video" as OutputMode, label: "Video", icon: <FilmIcon /> },
                    { value: "audio" as OutputMode, label: "Audio", icon: <MusicIcon /> },
                  ]).map((tab) => (
                    <button
                      key={tab.value}
                      ref={tab.value === "video" ? tabVideoRef : tabAudioRef}
                      type="button"
                      role="tab"
                      aria-selected={mode === tab.value}
                      onClick={() => setMode(tab.value)}
                      className={[
                        "relative z-10 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500",
                        mode === tab.value ? "text-white" : "text-muted hover:text-foreground",
                        "cursor-pointer",
                      ].join(" ")}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
                  {mode === "audio" ? "Choose audio quality" : "Choose quality"}
                </p>

                <div
                  key={mode}
                  style={{ animation: "mode-panel-in 340ms cubic-bezier(0.16, 1, 0.3, 1) both" }}
                >
                  {mode === "audio" ? (
                    info.audioOptions.length > 0 ? (
                      info.audioOptions.length === 1 ? (
                        <div className="mx-auto w-full max-w-md">
                          <QualityButton
                            key={info.audioOptions[0].label}
                            option={info.audioOptions[0]}
                            mode="audio"
                            selected={chosenMode === "audio" && chosenIndex === 0}
                            disabled={activeDownload?.mode === "audio" && activeDownload.index === 0}
                            onPick={() => void startDownload(info.audioOptions[0], 0, "audio")}
                          />
                        </div>
                      ) : (
                        <div className="mx-auto grid w-full max-w-lg grid-cols-2 gap-3 sm:gap-4">
                          {info.audioOptions.map((option, i) => (
                            <QualityButton
                              key={option.label}
                              option={option}
                              mode="audio"
                              selected={chosenMode === "audio" && chosenIndex === i}
                              disabled={activeDownload?.mode === "audio" && activeDownload.index === i}
                              onPick={() => void startDownload(option, i, "audio")}
                            />
                          ))}
                        </div>
                      )
                    ) : (
                      <p className="text-sm text-muted">
                        No MP3 audio could be extracted from this video.
                      </p>
                    )
                  ) : info.options.length > 0 ? (
                    <div className="mx-auto grid w-full max-w-lg grid-cols-2 gap-3 sm:gap-4">
                      {info.options.map((option, i) => (
                        <QualityButton
                          key={`${option.height}-${option.label}`}
                          option={option}
                          mode="video"
                          selected={chosenMode === "video" && chosenIndex === i}
                          disabled={activeDownload?.mode === "video" && activeDownload.index === i}
                          onPick={() => void startDownload(option, i, "video")}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">
                      No downloadable formats were found for this video.
                    </p>
                  )}
                </div>
              </>
            )}

            {phase === "preparing" && snapshot ? (
              <ProgressCard
                snapshot={snapshot}
                needsMerge={
                  chosenMode === "audio"
                    ? false
                    : (chosenIndex != null && info.options[chosenIndex]?.needsMerge) ?? false
                }
                isAudio={chosenMode === "audio"}
                downloadUrl={snapshot.downloadUrl ?? ""}
                progressPercent={snapshot.progressPercent}
                progressText={snapshot.progressText}
                platform={info.platform}
                videoTitle={info.video.title}
                onRetry={triggerFileDownload}
                onReset={reset}
              />
            ) : phase === "downloading" && snapshot ? (
              <ProgressCard
                snapshot={snapshot}
                needsMerge={
                  chosenMode === "audio"
                    ? false
                    : (chosenIndex != null && info.options[chosenIndex]?.needsMerge) ?? false
                }
                isAudio={chosenMode === "audio"}
                downloadUrl={snapshot.downloadUrl ?? ""}
                progressPercent={snapshot.progressPercent}
                progressText={snapshot.progressText}
                platform={info.platform}
                videoTitle={info.video.title}
                onRetry={triggerFileDownload}
                onReset={reset}
              />
            ) : null}

            <p className="mt-4 text-xs leading-relaxed text-muted">
              {mode === "audio"
                ? "MP3 tiers reflect the highest bitrate the source audio really has \u2014 no inflated sizes."
                : info.platform === "youtube"
                  ? "Higher quality means a larger file and longer prep time."
                  : info.platform === "tiktok"
                    ? "TikTok videos typically have a single best quality."
                    : info.platform === "facebook"
                      ? "Facebook videos show only the resolutions that are really available."
                      : "Instagram media usually has a single best quality."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function QualityButton({
  option,
  mode,
  selected,
  disabled,
  onPick,
}: {
  option: QualityOption;
  mode: OutputMode;
  selected: boolean;
  disabled: boolean;
  onPick: () => void;
}) {
  const size = option.sizeBytes != null ? formatBytes(option.sizeBytes) : "~ size varies";
  const isHd = mode === "video" && option.height >= 720;
  const isAudio = mode === "audio";
  const kbps = option.bitrateKbps;

  const metaPills = isAudio
    ? [
        <span key="kbps" className="rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[11px] font-semibold text-foreground sm:text-xs">
          {kbps ? `${kbps} kbps` : "MP3"}
        </span>,
        <span key="ext" className="rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[11px] font-medium text-foreground/75 sm:text-xs">
          MP3
        </span>,
        <span key="size" className="rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[11px] font-semibold text-foreground sm:text-xs">
          {size}
        </span>,
      ]
    : [
        <span key="ext" className="rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[11px] font-semibold text-foreground sm:text-xs">
          MP4
        </span>,
        <span key="size" className="rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[11px] font-medium text-foreground/75 sm:text-xs">
          {size}
        </span>,
      ];

  return (
    <button
      type="button"
      onClick={onPick}
      disabled={disabled}
      aria-pressed={selected}
      aria-busy={disabled}
      aria-label={`Download ${option.label} ${isAudio ? "audio as MP3" : "video as MP4"}${size !== "~ size varies" ? ` (${size})` : ""}`}
      className={[
        "group relative flex w-full flex-col gap-2.5 overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-200 sm:gap-3 sm:p-5",
        "focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500",
        selected
          ? "cursor-default border-violet-500 bg-violet-500/[0.06] shadow-lg shadow-violet-500/20 ring-2 ring-violet-500/30"
          : disabled
            ? "cursor-not-allowed border-border bg-background opacity-45"
            : "border-border bg-background hover:-translate-y-0.5 hover:cursor-pointer hover:border-violet-500/70 hover:bg-violet-500/5 hover:shadow-lg hover:shadow-violet-500/10 active:scale-[0.98]",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          {isHd && (
            <span className="shrink-0 rounded-md bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              HD
            </span>
          )}
          {isAudio && (
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-md ${
                selected
                  ? "bg-violet-600 text-white"
                  : "bg-violet-600/10 text-violet-600 group-hover:bg-violet-600 group-hover:text-white"
              }`}
            >
              <MusicIcon className="h-3 w-3" />
            </span>
          )}
          <span
            className={`min-w-0 text-[13px] font-bold leading-snug sm:text-sm ${
              selected ? "text-violet-700 dark:text-violet-300" : "text-foreground"
            }`}
          >
            {option.label}
          </span>
        </span>
        {selected && (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 shrink-0 text-violet-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">{metaPills}</div>

      <span className="mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 px-3 py-2.5 text-xs font-semibold text-white shadow-md shadow-violet-600/25 transition-all duration-200 sm:text-sm group-hover:brightness-110">
        {disabled ? (
          <Spinner className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 sm:h-4 sm:w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3v11m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
        )}
        {disabled ? "Downloading\u2026" : selected ? "Selected" : "Download"}
      </span>
    </button>
  );
}

function FilmIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="2.18" />
      <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5" />
    </svg>
  );
}

function MusicIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

